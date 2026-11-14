-- =========================================================
-- AÏDA — schéma initial (v1)
-- =========================================================

-- ---------- Types ----------
CREATE TYPE public.app_role AS ENUM ('admin', 'supervisor');
CREATE TYPE public.farm_role AS ENUM ('owner', 'manager', 'farmer', 'veterinarian', 'agent');
CREATE TYPE public.membership_status AS ENUM ('active', 'invited', 'suspended', 'revoked');
CREATE TYPE public.animal_species AS ENUM ('bovine', 'ovine', 'caprine', 'porcine');
CREATE TYPE public.animal_sex AS ENUM ('male', 'female', 'unknown');
CREATE TYPE public.animal_status AS ENUM ('alive', 'deceased', 'sold', 'missing');
CREATE TYPE public.identification_status AS ENUM ('unidentified', 'pending', 'identified');
CREATE TYPE public.identifier_type AS ENUM ('qr', 'rfid', 'biometric');
CREATE TYPE public.identifier_status AS ENUM ('active', 'inactive', 'lost', 'revoked');
CREATE TYPE public.validation_status AS ENUM ('pending', 'validated', 'rejected');
CREATE TYPE public.animal_event_type AS ENUM ('birth', 'sale', 'transfer', 'reproduction', 'calving', 'death', 'slaughter', 'other');
CREATE TYPE public.diagnosis_status AS ENUM ('suspected', 'confirmed', 'ruled_out', 'pending');
CREATE TYPE public.intervention_type AS ENUM ('vaccination', 'treatment', 'examination', 'deworming', 'other');
CREATE TYPE public.audit_action AS ENUM ('insert', 'update', 'delete');

CREATE SEQUENCE public.animal_code_seq START 1;

-- ---------- Tables ----------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 200),
  description text,
  farm_type text,
  country text NOT NULL DEFAULT 'CI' CHECK (char_length(country) = 2),
  region text,
  department text,
  locality text,
  address text,
  latitude double precision CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision CHECK (longitude BETWEEN -180 AND 180),
  created_by uuid NOT NULL DEFAULT auth.uid(),
  updated_by uuid,
  change_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.farm_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.farm_role NOT NULL,
  status public.membership_status NOT NULL DEFAULT 'active',
  permissions text[] NOT NULL DEFAULT '{}',
  invited_by uuid DEFAULT auth.uid(),
  updated_by uuid,
  change_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (farm_id, user_id),
  CONSTRAINT permissions_only_for_agents CHECK (role = 'agent' OR permissions = '{}'),
  CONSTRAINT permissions_catalog CHECK (permissions <@ ARRAY['animals.write','identifiers.write','events.write','health.observe','movements.declare']::text[])
);

CREATE TABLE public.animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_code text NOT NULL UNIQUE DEFAULT ('AIDA-CI-' || lpad(nextval('public.animal_code_seq')::text, 8, '0')),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
  name text,
  species public.animal_species NOT NULL,
  breed text,
  sex public.animal_sex NOT NULL DEFAULT 'unknown',
  birth_date date,
  weight numeric(7,2) CHECK (weight > 0 AND weight < 5000),
  color text,
  photo_url text,
  status public.animal_status NOT NULL DEFAULT 'alive',
  identification_status public.identification_status NOT NULL DEFAULT 'unidentified',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  updated_by uuid,
  change_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.animal_identifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE RESTRICT,
  identifier_type public.identifier_type NOT NULL,
  identifier_value text,
  biometric_type text,
  biometric_reference text,
  is_primary boolean NOT NULL DEFAULT false,
  status public.identifier_status NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  updated_by uuid,
  change_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT identifier_value_required CHECK (identifier_type = 'biometric' OR identifier_value IS NOT NULL),
  CONSTRAINT biometric_type_consistency CHECK ((identifier_type = 'biometric') = (biometric_type IS NOT NULL))
);

CREATE TABLE public.animal_ownerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE RESTRICT,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
  owner_user_id uuid,
  start_date date NOT NULL DEFAULT current_date,
  end_date date,
  transfer_reason text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ownership_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE public.animal_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE RESTRICT,
  origin_farm_id uuid REFERENCES public.farms(id) ON DELETE RESTRICT,
  destination_farm_id uuid REFERENCES public.farms(id) ON DELETE RESTRICT,
  movement_date timestamptz NOT NULL DEFAULT now(),
  movement_reason text,
  latitude double precision CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision CHECK (longitude BETWEEN -180 AND 180),
  recorded_by uuid NOT NULL DEFAULT auth.uid(),
  validation_status public.validation_status NOT NULL DEFAULT 'pending',
  validated_by uuid,
  validated_at timestamptz,
  validation_note text,
  corrects_id uuid REFERENCES public.animal_movements(id) ON DELETE RESTRICT,
  correction_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT movement_correction_reason CHECK (corrects_id IS NULL OR char_length(btrim(coalesce(correction_reason, ''))) > 0)
);

CREATE TABLE public.animal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE RESTRICT,
  event_type public.animal_event_type NOT NULL,
  event_date timestamptz NOT NULL DEFAULT now(),
  description text,
  location text,
  recorded_by uuid NOT NULL DEFAULT auth.uid(),
  evidence_url text,
  corrects_id uuid REFERENCES public.animal_events(id) ON DELETE RESTRICT,
  correction_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_correction_reason CHECK (corrects_id IS NULL OR char_length(btrim(coalesce(correction_reason, ''))) > 0)
);

CREATE TABLE public.health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE RESTRICT,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
  observation_date timestamptz NOT NULL DEFAULT now(),
  symptoms text[] NOT NULL DEFAULT '{}',
  temperature numeric(4,1) CHECK (temperature BETWEEN 30 AND 45),
  appetite_status text CHECK (appetite_status IN ('normal', 'reduced', 'absent')),
  activity_status text CHECK (activity_status IN ('normal', 'reduced', 'lethargic', 'agitated')),
  respiratory_observation text,
  suspected_condition text,
  diagnosis text,
  diagnosis_status public.diagnosis_status NOT NULL DEFAULT 'pending',
  veterinarian_id uuid,
  notes text,
  recorded_by uuid NOT NULL DEFAULT auth.uid(),
  corrects_id uuid REFERENCES public.health_records(id) ON DELETE RESTRICT,
  correction_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT health_record_correction_reason CHECK (corrects_id IS NULL OR char_length(btrim(coalesce(correction_reason, ''))) > 0)
);

CREATE TABLE public.health_interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL REFERENCES public.animals(id) ON DELETE RESTRICT,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
  intervention_type public.intervention_type NOT NULL,
  product_name text,
  dosage text,
  administration_date timestamptz NOT NULL DEFAULT now(),
  next_due_date date,
  administered_by uuid,
  veterinarian_id uuid,
  notes text,
  recorded_by uuid NOT NULL DEFAULT auth.uid(),
  corrects_id uuid REFERENCES public.health_interventions(id) ON DELETE RESTRICT,
  correction_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT intervention_correction_reason CHECK (corrects_id IS NULL OR char_length(btrim(coalesce(correction_reason, ''))) > 0)
);

CREATE TABLE public.audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name text NOT NULL,
  record_id uuid,
  action public.audit_action NOT NULL,
  actor_id uuid,
  reason text,
  old_data jsonb,
  new_data jsonb,
  changed_fields text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- Index ----------
CREATE INDEX farm_memberships_user_idx ON public.farm_memberships (user_id);
CREATE INDEX farms_region_idx ON public.farms (region);
CREATE INDEX animals_farm_idx ON public.animals (farm_id);
CREATE INDEX animals_species_status_idx ON public.animals (species, status);
CREATE INDEX animal_identifiers_animal_idx ON public.animal_identifiers (animal_id);
CREATE UNIQUE INDEX animal_identifiers_value_uniq ON public.animal_identifiers (identifier_type, identifier_value) WHERE identifier_value IS NOT NULL;
CREATE UNIQUE INDEX animal_identifiers_one_primary ON public.animal_identifiers (animal_id) WHERE is_primary AND status = 'active';
CREATE INDEX animal_ownerships_animal_idx ON public.animal_ownerships (animal_id, start_date DESC);
CREATE INDEX animal_ownerships_farm_idx ON public.animal_ownerships (farm_id);
CREATE UNIQUE INDEX animal_ownerships_one_open ON public.animal_ownerships (animal_id) WHERE end_date IS NULL;
CREATE INDEX animal_movements_animal_idx ON public.animal_movements (animal_id, movement_date DESC);
CREATE INDEX animal_movements_origin_idx ON public.animal_movements (origin_farm_id);
CREATE INDEX animal_movements_destination_idx ON public.animal_movements (destination_farm_id);
CREATE INDEX animal_movements_pending_idx ON public.animal_movements (validation_status) WHERE validation_status = 'pending';
CREATE INDEX animal_movements_corrects_idx ON public.animal_movements (corrects_id) WHERE corrects_id IS NOT NULL;
CREATE INDEX animal_events_animal_idx ON public.animal_events (animal_id, event_date DESC);
CREATE INDEX animal_events_corrects_idx ON public.animal_events (corrects_id) WHERE corrects_id IS NOT NULL;
CREATE INDEX health_records_animal_idx ON public.health_records (animal_id, observation_date DESC);
CREATE INDEX health_records_farm_idx ON public.health_records (farm_id, diagnosis_status);
CREATE INDEX health_records_corrects_idx ON public.health_records (corrects_id) WHERE corrects_id IS NOT NULL;
CREATE INDEX health_interventions_animal_idx ON public.health_interventions (animal_id, administration_date DESC);
CREATE INDEX health_interventions_farm_idx ON public.health_interventions (farm_id);
CREATE INDEX health_interventions_due_idx ON public.health_interventions (next_due_date) WHERE next_due_date IS NOT NULL;
CREATE INDEX health_interventions_corrects_idx ON public.health_interventions (corrects_id) WHERE corrects_id IS NOT NULL;
CREATE INDEX audit_log_record_idx ON public.audit_log (table_name, record_id);
CREATE INDEX audit_log_actor_idx ON public.audit_log (actor_id);
CREATE INDEX audit_log_created_idx ON public.audit_log (created_at DESC);

-- ---------- Grants (no anon access anywhere) ----------
REVOKE ALL ON public.profiles, public.user_roles, public.farms, public.farm_memberships, public.animals,
  public.animal_identifiers, public.animal_ownerships, public.animal_movements, public.animal_events,
  public.health_records, public.health_interventions, public.audit_log FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.animal_code_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SEQUENCE public.animal_code_seq TO authenticated, service_role;

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.farms TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.farm_memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.animals TO authenticated;
-- biometric_reference is never readable or writable from the app (service_role only)
GRANT SELECT (id, animal_id, identifier_type, identifier_value, biometric_type, is_primary, status, created_by, updated_by, change_reason, created_at, updated_at) ON public.animal_identifiers TO authenticated;
GRANT INSERT (animal_id, identifier_type, identifier_value, is_primary, status, change_reason) ON public.animal_identifiers TO authenticated;
GRANT UPDATE (is_primary, status, change_reason) ON public.animal_identifiers TO authenticated;
GRANT SELECT ON public.animal_ownerships TO authenticated;
GRANT SELECT, INSERT ON public.animal_movements TO authenticated;
GRANT SELECT, INSERT ON public.animal_events TO authenticated;
GRANT SELECT, INSERT ON public.health_records TO authenticated;
GRANT SELECT, INSERT ON public.health_interventions TO authenticated;
GRANT SELECT ON public.audit_log TO authenticated;

GRANT ALL ON public.profiles, public.user_roles, public.farms, public.farm_memberships, public.animals,
  public.animal_identifiers, public.animal_ownerships, public.animal_movements, public.animal_events,
  public.health_records, public.health_interventions, public.audit_log TO service_role;

-- ---------- RLS on ----------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_ownerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ---------- Security-definer helpers (no recursion in policies) ----------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_farm_member(_farm_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.farm_memberships
    WHERE farm_id = _farm_id AND user_id = auth.uid() AND status = 'active'
  )
$$;

-- Permission catalog: farm.manage, members.manage, animals.write, animals.transfer,
-- identifiers.write, events.write, health.observe, health.diagnose, health.intervene,
-- movements.declare, movements.validate
CREATE OR REPLACE FUNCTION public.has_farm_permission(_farm_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.farm_memberships m
    WHERE m.farm_id = _farm_id AND m.user_id = auth.uid() AND m.status = 'active'
      AND (
        (m.role = 'owner' AND _permission <> 'health.diagnose')
        OR (m.role = 'manager' AND _permission NOT IN ('health.diagnose', 'members.manage'))
        OR (m.role = 'farmer' AND _permission IN ('animals.write', 'identifiers.write', 'events.write', 'health.observe', 'movements.declare'))
        OR (m.role = 'veterinarian' AND _permission IN ('health.observe', 'health.diagnose', 'health.intervene', 'events.write', 'movements.validate'))
        OR (m.role = 'agent' AND _permission = ANY (m.permissions))
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.animal_farm_id(_animal_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT farm_id FROM public.animals WHERE id = _animal_id
$$;

CREATE OR REPLACE FUNCTION public.can_read_animal(_animal_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_farm_member(public.animal_farm_id(_animal_id)) OR public.has_role(auth.uid(), 'admin')
$$;

-- Team directory without exposing phone/email of other members
CREATE OR REPLACE FUNCTION public.farm_member_directory(_farm_id uuid)
RETURNS TABLE (user_id uuid, full_name text, avatar_url text, role public.farm_role, status public.membership_status)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.user_id, p.full_name, p.avatar_url, m.role, m.status
  FROM public.farm_memberships m JOIN public.profiles p ON p.id = m.user_id
  WHERE m.farm_id = _farm_id
    AND (public.is_farm_member(_farm_id) OR public.has_role(auth.uid(), 'admin'))
  ORDER BY m.created_at
$$;

-- ---------- Policies ----------
CREATE POLICY "Own profile or admin can read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Own roles or admin can read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members, creator or admin read farms" ON public.farms FOR SELECT TO authenticated
  USING (public.is_farm_member(id) OR created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users create their farm" ON public.farms FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Owner, manager or admin update farm" ON public.farms FOR UPDATE TO authenticated
  USING (public.has_farm_permission(id, 'farm.manage') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_farm_permission(id, 'farm.manage') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members read farm team" ON public.farm_memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_farm_member(farm_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner or admin add members" ON public.farm_memberships FOR INSERT TO authenticated
  WITH CHECK (public.has_farm_permission(farm_id, 'members.manage') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner or admin update members" ON public.farm_memberships FOR UPDATE TO authenticated
  USING (public.has_farm_permission(farm_id, 'members.manage') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_farm_permission(farm_id, 'members.manage') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members or admin read animals" ON public.animals FOR SELECT TO authenticated
  USING (public.is_farm_member(farm_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authorized members register animals" ON public.animals FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND public.has_farm_permission(farm_id, 'animals.write'));
CREATE POLICY "Authorized members update animals" ON public.animals FOR UPDATE TO authenticated
  USING (public.has_farm_permission(farm_id, 'animals.write'))
  WITH CHECK (public.has_farm_permission(farm_id, 'animals.write'));

CREATE POLICY "Members read identifiers, biometric rows restricted" ON public.animal_identifiers FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (public.is_farm_member(public.animal_farm_id(animal_id))
        AND (identifier_type <> 'biometric' OR public.has_farm_permission(public.animal_farm_id(animal_id), 'identifiers.write')))
  );
CREATE POLICY "Authorized members add QR/RFID identifiers" ON public.animal_identifiers FOR INSERT TO authenticated
  WITH CHECK (identifier_type <> 'biometric' AND public.has_farm_permission(public.animal_farm_id(animal_id), 'identifiers.write'));
CREATE POLICY "Authorized members update identifiers" ON public.animal_identifiers FOR UPDATE TO authenticated
  USING (public.has_farm_permission(public.animal_farm_id(animal_id), 'identifiers.write'))
  WITH CHECK (public.has_farm_permission(public.animal_farm_id(animal_id), 'identifiers.write'));

CREATE POLICY "Members, past owners or admin read ownership history" ON public.animal_ownerships FOR SELECT TO authenticated
  USING (public.can_read_animal(animal_id) OR public.is_farm_member(farm_id) OR owner_user_id = auth.uid());

CREATE POLICY "Members of involved farms read movements" ON public.animal_movements FOR SELECT TO authenticated
  USING (public.can_read_animal(animal_id) OR public.is_farm_member(origin_farm_id) OR public.is_farm_member(destination_farm_id));
CREATE POLICY "Authorized members declare movements" ON public.animal_movements FOR INSERT TO authenticated
  WITH CHECK (
    recorded_by = auth.uid() AND validation_status = 'pending' AND validated_by IS NULL AND validated_at IS NULL
    AND public.has_farm_permission(public.animal_farm_id(animal_id), 'movements.declare')
  );

CREATE POLICY "Members or admin read events" ON public.animal_events FOR SELECT TO authenticated
  USING (public.can_read_animal(animal_id));
CREATE POLICY "Authorized members record events" ON public.animal_events FOR INSERT TO authenticated
  WITH CHECK (recorded_by = auth.uid() AND public.has_farm_permission(public.animal_farm_id(animal_id), 'events.write'));

CREATE POLICY "Members or admin read health records" ON public.health_records FOR SELECT TO authenticated
  USING (public.is_farm_member(farm_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authorized members record observations" ON public.health_records FOR INSERT TO authenticated
  WITH CHECK (recorded_by = auth.uid() AND public.has_farm_permission(farm_id, 'health.observe'));

CREATE POLICY "Members or admin read interventions" ON public.health_interventions FOR SELECT TO authenticated
  USING (public.is_farm_member(farm_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Vets, owners and managers record interventions" ON public.health_interventions FOR INSERT TO authenticated
  WITH CHECK (recorded_by = auth.uid() AND public.has_farm_permission(farm_id, 'health.intervene'));

CREATE POLICY "Admins read audit log" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------- Trigger functions ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.created_at := OLD.created_at;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.set_updated_meta()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.created_at := OLD.created_at;
  NEW.updated_at := now();
  NEW.updated_by := coalesce(auth.uid(), NEW.updated_by);
  IF to_jsonb(NEW) ? 'created_by' THEN
    NEW := jsonb_populate_record(NEW, jsonb_build_object('created_by', to_jsonb(OLD)->'created_by'));
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.prevent_delete()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Suppression interdite sur % : l''historique AÏDA doit être conservé', TG_TABLE_NAME USING ERRCODE = '42501';
END $$;

CREATE OR REPLACE FUNCTION public.prevent_history_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Les entrées de % ne sont pas modifiables : enregistrez une correction (corrects_id + correction_reason)', TG_TABLE_NAME USING ERRCODE = '42501';
END $$;

CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _old jsonb; _new jsonb; _changed text[]; _reason text; _row jsonb;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN _old := to_jsonb(OLD); END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN _new := to_jsonb(NEW); END IF;
  IF TG_OP = 'UPDATE' THEN
    SELECT array_agg(k ORDER BY k) INTO _changed
    FROM jsonb_object_keys(_new) AS k
    WHERE (_new -> k) IS DISTINCT FROM (_old -> k) AND k NOT IN ('updated_at', 'updated_by');
    IF _changed IS NULL THEN RETURN NEW; END IF;
  END IF;
  _row := coalesce(_new, _old);
  _reason := nullif(current_setting('aida.change_reason', true), '');
  IF _reason IS NULL AND (TG_OP <> 'UPDATE' OR (_new -> 'change_reason') IS DISTINCT FROM (_old -> 'change_reason')) THEN
    _reason := _row ->> 'change_reason';
  END IF;
  _reason := coalesce(_reason, _row ->> 'correction_reason');
  INSERT INTO public.audit_log (table_name, record_id, action, actor_id, reason, old_data, new_data, changed_fields)
  VALUES (TG_TABLE_NAME, (_row ->> 'id')::uuid, lower(TG_OP)::public.audit_action, auth.uid(), _reason,
          _old - 'biometric_reference', _new - 'biometric_reference', _changed);
  RETURN coalesce(NEW, OLD);
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email, avatar_url)
  VALUES (
    NEW.id,
    nullif(NEW.raw_user_meta_data ->> 'full_name', ''),
    coalesce(nullif(NEW.phone, ''), nullif(NEW.raw_user_meta_data ->> 'phone', '')),
    NEW.email,
    nullif(NEW.raw_user_meta_data ->> 'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_farm()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.farm_memberships (farm_id, user_id, role, status, invited_by)
  VALUES (NEW.id, NEW.created_by, 'owner', 'active', NEW.created_by);
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.guard_membership()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.farm_id <> OLD.farm_id OR NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'Une adhésion ne peut pas changer d''élevage ni d''utilisateur' USING ERRCODE = '42501';
  END IF;
  IF OLD.role = 'owner' AND OLD.status = 'active' AND (NEW.role <> 'owner' OR NEW.status <> 'active')
     AND NOT EXISTS (SELECT 1 FROM public.farm_memberships
                     WHERE farm_id = OLD.farm_id AND role = 'owner' AND status = 'active' AND id <> OLD.id) THEN
    RAISE EXCEPTION 'Un élevage doit conserver au moins un propriétaire actif' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.validate_animal()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.birth_date IS NOT NULL AND NEW.birth_date > current_date THEN
    RAISE EXCEPTION 'La date de naissance ne peut pas être dans le futur' USING ERRCODE = '23514';
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

CREATE OR REPLACE FUNCTION public.handle_new_animal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid;
BEGIN
  SELECT user_id INTO _owner FROM public.farm_memberships
  WHERE farm_id = NEW.farm_id AND role = 'owner' AND status = 'active'
  ORDER BY created_at LIMIT 1;
  INSERT INTO public.animal_ownerships (animal_id, farm_id, owner_user_id, start_date, transfer_reason, created_by)
  VALUES (NEW.id, NEW.farm_id, coalesce(_owner, NEW.created_by), current_date, 'Enregistrement initial', NEW.created_by);
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_identifier()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.identifier_type IN ('qr', 'rfid') THEN
    UPDATE public.animals SET identification_status = 'identified'
    WHERE id = NEW.animal_id AND identification_status <> 'identified';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.guard_ownership_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF OLD.end_date IS NOT NULL
     OR (to_jsonb(NEW) - ARRAY['end_date', 'transfer_reason']) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['end_date', 'transfer_reason']) THEN
    RAISE EXCEPTION 'L''historique des propriétaires ne peut pas être réécrit' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.guard_movement_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _f text[] := ARRAY['validation_status', 'validated_by', 'validated_at', 'validation_note'];
BEGIN
  IF OLD.validation_status <> 'pending' OR (to_jsonb(NEW) - _f) IS DISTINCT FROM (to_jsonb(OLD) - _f) THEN
    RAISE EXCEPTION 'Un mouvement enregistré ne peut pas être modifié : enregistrez une correction' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.check_correction_link()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _animal uuid;
BEGIN
  IF NEW.corrects_id IS NOT NULL THEN
    EXECUTE format('SELECT animal_id FROM %I.%I WHERE id = $1', TG_TABLE_SCHEMA, TG_TABLE_NAME)
      INTO _animal USING NEW.corrects_id;
    IF _animal IS DISTINCT FROM NEW.animal_id THEN
      RAISE EXCEPTION 'Une correction doit viser une entrée du même animal' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.validate_movement_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _farm uuid := public.animal_farm_id(NEW.animal_id);
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

CREATE OR REPLACE FUNCTION public.validate_event_insert()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.event_date > now() + interval '1 hour' THEN
    RAISE EXCEPTION 'La date de l''événement ne peut pas être dans le futur' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.validate_health_record()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.farm_id IS DISTINCT FROM public.animal_farm_id(NEW.animal_id) THEN
    RAISE EXCEPTION 'L''élevage indiqué ne correspond pas à l''élevage actuel de l''animal' USING ERRCODE = '23514';
  END IF;
  IF NEW.observation_date > now() + interval '1 hour' THEN
    RAISE EXCEPTION 'La date d''observation ne peut pas être dans le futur' USING ERRCODE = '23514';
  END IF;
  IF auth.uid() IS NOT NULL
     AND (NEW.diagnosis IS NOT NULL OR NEW.diagnosis_status IN ('confirmed', 'ruled_out') OR NEW.veterinarian_id IS NOT NULL) THEN
    IF NOT public.has_farm_permission(NEW.farm_id, 'health.diagnose') THEN
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
  IF NEW.farm_id IS DISTINCT FROM public.animal_farm_id(NEW.animal_id) THEN
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

-- ---------- Triggers ----------
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER farms_updated_meta BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.set_updated_meta();
CREATE TRIGGER farm_memberships_updated_meta BEFORE UPDATE ON public.farm_memberships FOR EACH ROW EXECUTE FUNCTION public.set_updated_meta();
CREATE TRIGGER animals_updated_meta BEFORE UPDATE ON public.animals FOR EACH ROW EXECUTE FUNCTION public.set_updated_meta();
CREATE TRIGGER animal_identifiers_updated_meta BEFORE UPDATE ON public.animal_identifiers FOR EACH ROW EXECUTE FUNCTION public.set_updated_meta();

CREATE TRIGGER farms_after_insert AFTER INSERT ON public.farms FOR EACH ROW EXECUTE FUNCTION public.handle_new_farm();
CREATE TRIGGER farm_memberships_guard BEFORE UPDATE ON public.farm_memberships FOR EACH ROW EXECUTE FUNCTION public.guard_membership();
CREATE TRIGGER animals_validate BEFORE INSERT OR UPDATE ON public.animals FOR EACH ROW EXECUTE FUNCTION public.validate_animal();
CREATE TRIGGER animals_after_insert AFTER INSERT ON public.animals FOR EACH ROW EXECUTE FUNCTION public.handle_new_animal();
CREATE TRIGGER animal_identifiers_after_insert AFTER INSERT ON public.animal_identifiers FOR EACH ROW EXECUTE FUNCTION public.handle_new_identifier();
CREATE TRIGGER animal_ownerships_guard BEFORE UPDATE ON public.animal_ownerships FOR EACH ROW EXECUTE FUNCTION public.guard_ownership_update();
CREATE TRIGGER animal_movements_guard BEFORE UPDATE ON public.animal_movements FOR EACH ROW EXECUTE FUNCTION public.guard_movement_update();
CREATE TRIGGER animal_movements_validate BEFORE INSERT ON public.animal_movements FOR EACH ROW EXECUTE FUNCTION public.validate_movement_insert();
CREATE TRIGGER animal_events_validate BEFORE INSERT ON public.animal_events FOR EACH ROW EXECUTE FUNCTION public.validate_event_insert();
CREATE TRIGGER health_records_validate BEFORE INSERT ON public.health_records FOR EACH ROW EXECUTE FUNCTION public.validate_health_record();
CREATE TRIGGER health_interventions_validate BEFORE INSERT ON public.health_interventions FOR EACH ROW EXECUTE FUNCTION public.validate_health_intervention();

CREATE TRIGGER animal_movements_correction BEFORE INSERT ON public.animal_movements FOR EACH ROW EXECUTE FUNCTION public.check_correction_link();
CREATE TRIGGER animal_events_correction BEFORE INSERT ON public.animal_events FOR EACH ROW EXECUTE FUNCTION public.check_correction_link();
CREATE TRIGGER health_records_correction BEFORE INSERT ON public.health_records FOR EACH ROW EXECUTE FUNCTION public.check_correction_link();
CREATE TRIGGER health_interventions_correction BEFORE INSERT ON public.health_interventions FOR EACH ROW EXECUTE FUNCTION public.check_correction_link();

CREATE TRIGGER animal_events_immutable BEFORE UPDATE ON public.animal_events FOR EACH ROW EXECUTE FUNCTION public.prevent_history_update();
CREATE TRIGGER health_records_immutable BEFORE UPDATE ON public.health_records FOR EACH ROW EXECUTE FUNCTION public.prevent_history_update();
CREATE TRIGGER health_interventions_immutable BEFORE UPDATE ON public.health_interventions FOR EACH ROW EXECUTE FUNCTION public.prevent_history_update();
CREATE TRIGGER audit_log_immutable BEFORE UPDATE ON public.audit_log FOR EACH ROW EXECUTE FUNCTION public.prevent_history_update();

CREATE TRIGGER animals_no_delete BEFORE DELETE ON public.animals FOR EACH ROW EXECUTE FUNCTION public.prevent_delete();
CREATE TRIGGER animal_identifiers_no_delete BEFORE DELETE ON public.animal_identifiers FOR EACH ROW EXECUTE FUNCTION public.prevent_delete();
CREATE TRIGGER animal_ownerships_no_delete BEFORE DELETE ON public.animal_ownerships FOR EACH ROW EXECUTE FUNCTION public.prevent_delete();
CREATE TRIGGER animal_movements_no_delete BEFORE DELETE ON public.animal_movements FOR EACH ROW EXECUTE FUNCTION public.prevent_delete();
CREATE TRIGGER animal_events_no_delete BEFORE DELETE ON public.animal_events FOR EACH ROW EXECUTE FUNCTION public.prevent_delete();
CREATE TRIGGER health_records_no_delete BEFORE DELETE ON public.health_records FOR EACH ROW EXECUTE FUNCTION public.prevent_delete();
CREATE TRIGGER health_interventions_no_delete BEFORE DELETE ON public.health_interventions FOR EACH ROW EXECUTE FUNCTION public.prevent_delete();
CREATE TRIGGER audit_log_no_delete BEFORE DELETE ON public.audit_log FOR EACH ROW EXECUTE FUNCTION public.prevent_delete();

-- Audit (zz_ prefix: runs after the business triggers)
CREATE TRIGGER zz_audit AFTER INSERT OR UPDATE OR DELETE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER zz_audit AFTER INSERT OR UPDATE OR DELETE ON public.farm_memberships FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER zz_audit AFTER INSERT OR UPDATE OR DELETE ON public.animals FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER zz_audit AFTER INSERT OR UPDATE OR DELETE ON public.animal_identifiers FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER zz_audit AFTER INSERT OR UPDATE OR DELETE ON public.animal_ownerships FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER zz_audit AFTER INSERT OR UPDATE OR DELETE ON public.animal_movements FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER zz_audit AFTER INSERT OR UPDATE OR DELETE ON public.animal_events FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER zz_audit AFTER INSERT OR UPDATE OR DELETE ON public.health_records FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER zz_audit AFTER INSERT OR UPDATE OR DELETE ON public.health_interventions FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER zz_audit AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

-- ---------- Transactional operations ----------
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
  IF NOT (public.has_farm_permission(_a.farm_id, 'animals.transfer') OR public.has_role(_uid, 'admin')) THEN
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
  IF NOT (public.has_farm_permission(coalesce(_m.destination_farm_id, _m.origin_farm_id), 'movements.validate')
          OR public.has_role(_uid, 'admin')) THEN
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

-- ---------- Function privileges (least privilege) ----------
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_farm_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_farm_permission(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.animal_farm_id(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_read_animal(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.farm_member_directory(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.transfer_animal(uuid, uuid, text, timestamptz, double precision, double precision) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_movement(uuid, public.validation_status, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_farm_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_farm_permission(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.animal_farm_id(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_read_animal(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.farm_member_directory(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.transfer_animal(uuid, uuid, text, timestamptz, double precision, double precision) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.validate_movement(uuid, public.validation_status, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_meta() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_delete() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_history_update() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.audit_row_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_farm() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_membership() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_animal() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_animal() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_identifier() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_ownership_update() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_movement_update() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_correction_link() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_movement_insert() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_event_insert() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_health_record() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_health_intervention() FROM PUBLIC, anon, authenticated;

-- Backfill profiles for any pre-existing auth users (none today)
INSERT INTO public.profiles (id, email) SELECT id, email FROM auth.users ON CONFLICT (id) DO NOTHING;