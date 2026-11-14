/** Animal services — browser client; Row Level Security enforces every permission. */
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

import { AidaDbError, toAidaError, unwrap } from "./errors";
import { sanitizeSearch, type AnimalFormValues } from "./forms";
import type { DbAnimalStatus, DbSex, DbSpecies } from "./labels";

/** Never select biometric_reference: it is not readable from the app. */
export const IDENTIFIER_COLUMNS =
  "id, animal_id, identifier_type, identifier_value, biometric_type, is_primary, status, created_at, updated_at";

export const PHOTO_BUCKET = "animal-photos";
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const LIST_LIMIT = 500;

export type AnimalFilters = {
  q?: string | undefined;
  species?: DbSpecies | undefined;
  sex?: DbSex | undefined;
  status?: DbAnimalStatus | undefined;
  breed?: string | undefined;
  farm?: string | undefined;
};

const LIST_COLUMNS =
  "id, animal_code, name, species, breed, sex, birth_date, birth_date_estimated, status, farm_id, created_at, farms(name, farm_code)";

export async function listAnimals(filters: AnimalFilters) {
  let query = supabase.from("animals").select(LIST_COLUMNS).order("created_at", { ascending: false }).limit(LIST_LIMIT);
  if (filters.farm) query = query.eq("farm_id", filters.farm);
  if (filters.species) query = query.eq("species", filters.species);
  if (filters.sex) query = query.eq("sex", filters.sex);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.breed) query = query.eq("breed", filters.breed);
  const q = sanitizeSearch(filters.q ?? "");
  if (q) {
    // Also match QR / RFID values the user may read on a tag.
    const ids = unwrap(await supabase.from("animal_identifiers").select("animal_id").ilike("identifier_value", `%${q}%`).limit(50));
    const idClause = ids.length ? `,id.in.(${[...new Set(ids.map((i) => i.animal_id))].join(",")})` : "";
    query = query.or(`animal_code.ilike."%${q}%",name.ilike."%${q}%"${idClause}`);
  }
  return unwrap(await query);
}

export type AnimalListItem = Awaited<ReturnType<typeof listAnimals>>[number];

const DETAIL_COLUMNS = "*, farms(id, name, farm_code, owner_name, region, department, locality, status)";

/** Returns null when the animal does not exist or the user may not read it (RLS). */
export async function getAnimal(id: string) {
  const { data, error } = await supabase.from("animals").select(DETAIL_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw toAidaError(error);
  return data;
}

export type AnimalDetail = NonNullable<Awaited<ReturnType<typeof getAnimal>>>;

export async function getAnimalDossier(animalId: string) {
  const count = (table: "health_records" | "health_interventions") =>
    supabase.from(table).select("id", { count: "exact", head: true }).eq("animal_id", animalId);
  const [identifiers, ownerships, movements, events, health, interventions] = await Promise.all([
    supabase.from("animal_identifiers").select(IDENTIFIER_COLUMNS).eq("animal_id", animalId),
    supabase.from("animal_ownerships").select("*, farms(name, farm_code)").eq("animal_id", animalId).order("start_date", { ascending: false }),
    supabase.from("animal_movements").select("*").eq("animal_id", animalId).order("movement_date", { ascending: false }),
    supabase.from("animal_events").select("*").eq("animal_id", animalId).order("event_date", { ascending: false }),
    count("health_records"),
    count("health_interventions"),
  ]);
  for (const r of [health, interventions]) if (r.error) throw toAidaError(r.error);
  return {
    identifiers: unwrap(identifiers),
    ownerships: unwrap(ownerships),
    movements: unwrap(movements),
    events: unwrap(events),
    healthRecords: health.count ?? 0,
    interventions: interventions.count ?? 0,
  };
}

export type AnimalDossier = Awaited<ReturnType<typeof getAnimalDossier>>;

export async function createAnimal(values: AnimalFormValues): Promise<Pick<Tables<"animals">, "id" | "animal_code">> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new AidaDbError("Votre session a expiré. Reconnectez-vous.", "PGRST301");
  const { change_reason: _ignored, ...fields } = values;
  return unwrap(await supabase.from("animals").insert({ ...fields, created_by: auth.user.id }).select("id, animal_code").single());
}

/** The farm cannot be changed here: moving an animal goes through transferAnimal(). */
export async function updateAnimal(id: string, values: AnimalFormValues) {
  const { farm_id: _farm, ...fields } = values;
  unwrap(await supabase.from("animals").update(fields).eq("id", id).select("id").single());
}

export function validatePhoto(file: File): string | null {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return "Format accepté : JPEG, PNG ou WebP.";
  if (file.size > PHOTO_MAX_BYTES) return "La photo doit faire moins de 5 Mo.";
  return null;
}

/** Photos are immutable files: a new photo is a new file, the previous one is kept. */
export async function uploadAnimalPhoto(animalId: string, file: File) {
  const invalid = validatePhoto(file);
  if (invalid) throw new AidaDbError(invalid, "22023");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${animalId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new AidaDbError("La photo n'a pas pu être envoyée. Vérifiez vos droits sur cet élevage.", "42501", error);
  unwrap(await supabase.from("animals").update({ photo_url: path, change_reason: "Photo mise à jour" }).eq("id", animalId).select("id").single());
  return path;
}

export async function getPhotoUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, 60 * 60);
  if (error || !data) throw new AidaDbError("Photo indisponible.", null, error);
  return data.signedUrl;
}

/** Atomic: movement + ownership history + farm change + transfer event, or nothing. */
export async function transferAnimal(animalId: string, destinationFarmId: string, reason: string) {
  return unwrap(await supabase.rpc("transfer_animal", { _animal_id: animalId, _destination_farm_id: destinationFarmId, _reason: reason }));
}
