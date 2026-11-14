-- ===== Phase 3 : élevages & animaux =====
CREATE TYPE public.farm_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE public.acquisition_mode AS ENUM ('born_on_farm', 'purchase', 'donation', 'inheritance', 'exchange', 'other');

CREATE SEQUENCE public.farm_code_seq START 1;
REVOKE ALL ON SEQUENCE public.farm_code_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SEQUENCE public.farm_code_seq TO authenticated, service_role;

ALTER TABLE public.farms
  ADD COLUMN farm_code text NOT NULL UNIQUE DEFAULT ('ELV-CI-' || lpad(nextval('public.farm_code_seq')::text, 6, '0')),
  ADD COLUMN owner_name text CHECK (owner_name IS NULL OR char_length(btrim(owner_name)) BETWEEN 2 AND 200),
  ADD COLUMN species public.animal_species[] NOT NULL DEFAULT '{}',
  ADD COLUMN status public.farm_status NOT NULL DEFAULT 'active';
CREATE INDEX farms_status_idx ON public.farms (status);

ALTER TABLE public.animals
  ADD COLUMN origin text,
  ADD COLUMN acquisition_mode public.acquisition_mode,
  ADD COLUMN entry_date date,
  ADD COLUMN birth_date_estimated boolean NOT NULL DEFAULT false,
  ADD COLUMN physical_features text,
  ADD COLUMN notes text;
CREATE INDEX animals_breed_idx ON public.animals (breed);

-- Farm code is permanent
CREATE OR REPLACE FUNCTION public.guard_farm_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.farm_code <> OLD.farm_code THEN
    RAISE EXCEPTION 'L''identifiant d''un élevage est permanent' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER farms_guard BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.guard_farm_update();

-- Animal validation (adds entry date + archived-farm checks)
CREATE OR REPLACE FUNCTION public.validate_animal()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.birth_date IS NOT NULL AND NEW.birth_date > current_date THEN
    RAISE EXCEPTION 'La date de naissance ne peut pas être dans le futur' USING ERRCODE = '23514';
  END IF;
  IF NEW.entry_date IS NOT NULL AND NEW.entry_date > current_date THEN
    RAISE EXCEPTION 'La date d''entrée dans l''élevage ne peut pas être dans le futur' USING ERRCODE = '23514';
  END IF;
  IF NEW.entry_date IS NOT NULL AND NEW.birth_date IS NOT NULL AND NOT NEW.birth_date_estimated
     AND NEW.entry_date < NEW.birth_date THEN
    RAISE EXCEPTION 'La date d''entrée ne peut pas précéder la date de naissance' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF EXISTS (SELECT 1 FROM public.farms WHERE id = NEW.farm_id AND status = 'archived') THEN
      RAISE EXCEPTION 'Impossible d''ajouter un animal à un élevage archivé' USING ERRCODE = '23514';
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.animal_code <> OLD.animal_code THEN
      RAISE EXCEPTION 'Le code AÏDA d''un animal est permanent' USING ERRCODE = '42501';
    END IF;
    IF NEW.farm_id <> OLD.farm_id AND coalesce(current_setting('aida.in_transfer', true), '') <> 'on' THEN
      RAISE EXCEPTION 'Utilisez transfer_animal() pour changer un animal d''élevage' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- Status change => append-only event in the animal history
CREATE OR REPLACE FUNCTION public.log_animal_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _type public.animal_event_type; _label text;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  _type := CASE NEW.status WHEN 'sold' THEN 'sale'::public.animal_event_type
                           WHEN 'deceased' THEN 'death'::public.animal_event_type
                           ELSE 'other'::public.animal_event_type END;
  _label := CASE NEW.status WHEN 'alive' THEN 'vivant' WHEN 'sold' THEN 'vendu'
                            WHEN 'deceased' THEN 'décédé' WHEN 'missing' THEN 'disparu' END;
  INSERT INTO public.animal_events (animal_id, event_type, event_date, description, recorded_by)
  VALUES (NEW.id, _type, now(),
          'Statut changé en « ' || _label || ' »' || coalesce(' — ' || nullif(btrim(NEW.change_reason), ''), ''),
          coalesce(auth.uid(), NEW.updated_by, NEW.created_by));
  RETURN NEW;
END $$;
CREATE TRIGGER animals_status_event AFTER UPDATE OF status ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.log_animal_status_change();

-- Herd statistics (SECURITY INVOKER: RLS on animals applies)
CREATE OR REPLACE FUNCTION public.herd_stats(_farm_id uuid DEFAULT NULL)
RETURNS TABLE (farm_id uuid, species public.animal_species, sex public.animal_sex, status public.animal_status, breed text, total bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT a.farm_id, a.species, a.sex, a.status, a.breed, count(*)::bigint
  FROM public.animals a
  WHERE _farm_id IS NULL OR a.farm_id = _farm_id
  GROUP BY a.farm_id, a.species, a.sex, a.status, a.breed
$$;

-- Add an existing AÏDA account to a farm (members.manage or admin only)
CREATE OR REPLACE FUNCTION public.add_farm_member(
  _farm_id uuid,
  _email text,
  _role public.farm_role,
  _permissions text[] DEFAULT '{}'
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _target uuid; _existing public.farm_memberships%ROWTYPE; _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Authentification requise' USING ERRCODE = '42501'; END IF;
  IF NOT (private.has_farm_permission(_farm_id, 'members.manage') OR private.has_role(_uid, 'admin')) THEN
    RAISE EXCEPTION 'Vous n''êtes pas autorisé à gérer les membres de cet élevage' USING ERRCODE = '42501';
  END IF;
  IF char_length(btrim(coalesce(_email, ''))) = 0 THEN
    RAISE EXCEPTION 'Une adresse e-mail est obligatoire' USING ERRCODE = '22023';
  END IF;
  SELECT id INTO _target FROM public.profiles WHERE lower(email) = lower(btrim(_email)) LIMIT 1;
  IF _target IS NULL THEN
    RAISE EXCEPTION 'Aucun compte AÏDA n''utilise cette adresse e-mail' USING ERRCODE = 'P0002';
  END IF;
  SELECT * INTO _existing FROM public.farm_memberships WHERE farm_id = _farm_id AND user_id = _target;
  IF FOUND THEN
    IF _existing.status = 'active' THEN
      RAISE EXCEPTION 'Cette personne est déjà membre de l''élevage' USING ERRCODE = '23505';
    END IF;
    PERFORM set_config('aida.change_reason', 'Réintégration dans l''élevage', true);
    UPDATE public.farm_memberships
       SET role = _role, status = 'active',
           permissions = CASE WHEN _role = 'agent' THEN coalesce(_permissions, '{}') ELSE '{}' END
     WHERE id = _existing.id;
    PERFORM set_config('aida.change_reason', '', true);
    RETURN _existing.id;
  END IF;
  INSERT INTO public.farm_memberships (farm_id, user_id, role, status, permissions, invited_by)
  VALUES (_farm_id, _target, _role, 'active',
          CASE WHEN _role = 'agent' THEN coalesce(_permissions, '{}') ELSE '{}' END, _uid)
  RETURNING id INTO _id;
  RETURN _id;
END $$;

REVOKE ALL ON FUNCTION public.herd_stats(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.herd_stats(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.add_farm_member(uuid, text, public.farm_role, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_farm_member(uuid, text, public.farm_role, text[]) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.guard_farm_update() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_animal_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_animal() FROM PUBLIC, anon, authenticated;

-- ===== Photos des animaux (bucket privé animal-photos, chemin : <animal_id>/<fichier>) =====
CREATE POLICY "Members read animal photos" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'animal-photos'
    AND CASE WHEN (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
             THEN private.can_read_animal(((storage.foldername(name))[1])::uuid)
             ELSE false END
  );
CREATE POLICY "Authorized members upload animal photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'animal-photos'
    AND CASE WHEN (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
             THEN private.has_farm_permission(private.animal_farm_id(((storage.foldername(name))[1])::uuid), 'animals.write')
             ELSE false END
  );