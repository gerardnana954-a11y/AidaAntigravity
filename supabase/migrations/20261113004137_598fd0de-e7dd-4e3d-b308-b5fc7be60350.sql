CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- Policies reference functions by OID, so moving them keeps every policy working.
ALTER FUNCTION public.has_role(uuid, public.app_role) SET SCHEMA private;
ALTER FUNCTION public.is_farm_member(uuid) SET SCHEMA private;
ALTER FUNCTION public.has_farm_permission(uuid, text) SET SCHEMA private;
ALTER FUNCTION public.animal_farm_id(uuid) SET SCHEMA private;
ALTER FUNCTION public.can_read_animal(uuid) SET SCHEMA private;

-- Rewrite bodies that referenced the helpers by their old schema
CREATE OR REPLACE FUNCTION private.can_read_animal(_animal_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.is_farm_member(private.animal_farm_id(_animal_id)) OR private.has_role(auth.uid(), 'admin')
$$;

CREATE OR REPLACE FUNCTION public.farm_member_directory(_farm_id uuid)
RETURNS TABLE (user_id uuid, full_name text, avatar_url text, role public.farm_role, status public.membership_status)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.user_id, p.full_name, p.avatar_url, m.role, m.status
  FROM public.farm_memberships m JOIN public.profiles p ON p.id = m.user_id
  WHERE m.farm_id = _farm_id
    AND (private.is_farm_member(_farm_id) OR private.has_role(auth.uid(), 'admin'))
  ORDER BY m.created_at
$$;

CREATE OR REPLACE FUNCTION public.validate_movement_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _farm uuid := private.animal_farm_id(NEW.animal_id);
BEGIN
  NEW.origin_farm_id := coalesce(NEW.origin_farm_id, _farm);
  IF NEW.origin_farm_id IS DISTINCT FROM _farm THEN
    RAISE EXCEPTION 'L''origine d''un mouvement doit être l''élevage actuel de l''animal' USING ERRCODE = '23514';
  END IF;
  IF NEW.movement_date > now() + interval '1 hour' THEN
    RAISE EXCEPTION 'La date du mouvement ne peut pas être dans le futur' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.validate_health_record()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.farm_id IS DISTINCT FROM private.animal_farm_id(NEW.animal_id) THEN
    RAISE EXCEPTION 'L''élevage indiqué ne correspond pas à l''élevage actuel de l''animal' USING ERRCODE = '23514';
  END IF;
  IF NEW.observation_date > now() + interval '1 hour' THEN
    RAISE EXCEPTION 'La date d''observation ne peut pas être dans le futur' USING ERRCODE = '23514';
  END IF;
  IF auth.uid() IS NOT NULL
     AND (NEW.diagnosis IS NOT NULL OR NEW.diagnosis_status IN ('confirmed', 'ruled_out') OR NEW.veterinarian_id IS NOT NULL) THEN
    IF NOT private.has_farm_permission(NEW.farm_id, 'health.diagnose') THEN
      RAISE EXCEPTION 'Seul un vétérinaire de l''élevage peut poser, confirmer ou exclure un diagnostic' USING ERRCODE = '42501';
    END IF;
    IF NEW.veterinarian_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Le vétérinaire indiqué doit être l''auteur du diagnostic' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.validate_health_intervention()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.farm_id IS DISTINCT FROM private.animal_farm_id(NEW.animal_id) THEN
    RAISE EXCEPTION 'L''élevage indiqué ne correspond pas à l''élevage actuel de l''animal' USING ERRCODE = '23514';
  END IF;
  IF NEW.administration_date > now() + interval '1 hour' THEN
    RAISE EXCEPTION 'La date d''administration ne peut pas être dans le futur' USING ERRCODE = '23514';
  END IF;
  IF NEW.next_due_date IS NOT NULL AND NEW.next_due_date < (NEW.administration_date AT TIME ZONE 'UTC')::date THEN
    RAISE EXCEPTION 'Le prochain rappel doit être postérieur à l''administration' USING ERRCODE = '23514';
  END IF;
  IF NEW.veterinarian_id IS NOT NULL AND NOT EXISTS (
       SELECT 1 FROM public.farm_memberships
       WHERE farm_id = NEW.farm_id AND user_id = NEW.veterinarian_id AND role = 'veterinarian' AND status = 'active') THEN
    RAISE EXCEPTION 'Le vétérinaire indiqué n''est pas vétérinaire actif de cet élevage' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.transfer_animal(
  _animal_id uuid,
  _destination_farm_id uuid,
  _reason text,
  _movement_date timestamptz DEFAULT now(),
  _latitude double precision DEFAULT NULL,
  _longitude double precision DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _a public.animals%ROWTYPE;
  _new_owner uuid;
  _movement uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Authentification requise' USING ERRCODE = '42501'; END IF;
  IF char_length(btrim(coalesce(_reason, ''))) = 0 THEN
    RAISE EXCEPTION 'Un motif de transfert est obligatoire' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO _a FROM public.animals WHERE id = _animal_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Animal introuvable' USING ERRCODE = 'P0002'; END IF;
  IF NOT (private.has_farm_permission(_a.farm_id, 'animals.transfer') OR private.has_role(_uid, 'admin')) THEN
    RAISE EXCEPTION 'Vous n''êtes pas autorisé à transférer cet animal' USING ERRCODE = '42501';
  END IF;
  IF _a.status <> 'alive' THEN RAISE EXCEPTION 'Seul un animal vivant peut être transféré' USING ERRCODE = '23514'; END IF;
  IF _destination_farm_id = _a.farm_id THEN
    RAISE EXCEPTION 'L''élevage de destination doit être différent de l''élevage actuel' USING ERRCODE = '22023';
  END IF;
  SELECT user_id INTO _new_owner FROM public.farm_memberships
  WHERE farm_id = _destination_farm_id AND role = 'owner' AND status = 'active'
  ORDER BY created_at LIMIT 1;
  IF _new_owner IS NULL THEN
    RAISE EXCEPTION 'Élevage de destination introuvable ou sans propriétaire actif' USING ERRCODE = 'P0002';
  END IF;

  PERFORM set_config('aida.change_reason', _reason, true);

  INSERT INTO public.animal_movements (animal_id, origin_farm_id, destination_farm_id, movement_date, movement_reason, latitude, longitude, recorded_by)
  VALUES (_animal_id, _a.farm_id, _destination_farm_id, _movement_date, _reason, _latitude, _longitude, _uid)
  RETURNING id INTO _movement;

  UPDATE public.animal_ownerships
     SET end_date = greatest(current_date, start_date), transfer_reason = _reason
   WHERE animal_id = _animal_id AND end_date IS NULL;

  INSERT INTO public.animal_ownerships (animal_id, farm_id, owner_user_id, start_date, transfer_reason, created_by)
  VALUES (_animal_id, _destination_farm_id, _new_owner, current_date, _reason, _uid);

  PERFORM set_config('aida.in_transfer', 'on', true);
  UPDATE public.animals SET farm_id = _destination_farm_id, change_reason = _reason WHERE id = _animal_id;
  PERFORM set_config('aida.in_transfer', 'off', true);

  INSERT INTO public.animal_events (animal_id, event_type, event_date, description, recorded_by)
  VALUES (_animal_id, 'transfer', _movement_date, _reason, _uid);

  PERFORM set_config('aida.change_reason', '', true);
  RETURN _movement;
END $$;

CREATE OR REPLACE FUNCTION public.validate_movement(
  _movement_id uuid,
  _status public.validation_status,
  _note text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _m public.animal_movements%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Authentification requise' USING ERRCODE = '42501'; END IF;
  IF _status = 'pending' THEN RAISE EXCEPTION 'Choisissez « validated » ou « rejected »' USING ERRCODE = '22023'; END IF;
  SELECT * INTO _m FROM public.animal_movements WHERE id = _movement_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mouvement introuvable' USING ERRCODE = 'P0002'; END IF;
  IF _m.validation_status <> 'pending' THEN RAISE EXCEPTION 'Ce mouvement a déjà été traité' USING ERRCODE = '23514'; END IF;
  IF NOT (private.has_farm_permission(coalesce(_m.destination_farm_id, _m.origin_farm_id), 'movements.validate')
          OR private.has_role(_uid, 'admin')) THEN
    RAISE EXCEPTION 'Vous n''êtes pas autorisé à valider ce mouvement' USING ERRCODE = '42501';
  END IF;
  IF _status = 'rejected' AND char_length(btrim(coalesce(_note, ''))) = 0 THEN
    RAISE EXCEPTION 'Un motif est obligatoire pour rejeter un mouvement' USING ERRCODE = '22023';
  END IF;
  PERFORM set_config('aida.change_reason', coalesce(nullif(btrim(_note), ''), 'Validation du mouvement'), true);
  UPDATE public.animal_movements
     SET validation_status = _status, validated_by = _uid, validated_at = now(), validation_note = _note
   WHERE id = _movement_id;
  PERFORM set_config('aida.change_reason', '', true);
END $$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_farm_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_farm_permission(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.animal_farm_id(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.can_read_animal(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_farm_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_farm_permission(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.animal_farm_id(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_read_animal(uuid) TO authenticated, service_role;