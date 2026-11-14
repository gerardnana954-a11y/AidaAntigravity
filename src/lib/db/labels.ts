import type { BadgeProps } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type Enums = Database["public"]["Enums"];
export type DbSpecies = Enums["animal_species"];
export type DbSex = Enums["animal_sex"];
export type DbAnimalStatus = Enums["animal_status"];
export type DbFarmStatus = Enums["farm_status"];
export type DbAcquisition = Enums["acquisition_mode"];
export type DbMembershipStatus = Enums["membership_status"];
export type DbFarmRole = Enums["farm_role"];

type Variant = NonNullable<BadgeProps["variant"]>;

export const SPECIES_LABEL: Record<DbSpecies, string> = {
  bovine: "Bovin",
  ovine: "Ovin",
  caprine: "Caprin",
  porcine: "Porcin",
};
export const SPECIES_PLURAL: Record<DbSpecies, string> = {
  bovine: "Bovins",
  ovine: "Ovins",
  caprine: "Caprins",
  porcine: "Porcins",
};
/** Species offered when registering animals in this phase. */
export const ACTIVE_SPECIES: DbSpecies[] = ["bovine", "ovine", "caprine"];

export const SEX_LABEL: Record<DbSex, string> = { female: "Femelle", male: "Mâle", unknown: "Non déterminé" };

export const ANIMAL_STATUS: Record<DbAnimalStatus, { label: string; variant: Variant }> = {
  alive: { label: "Vivant", variant: "success" },
  sold: { label: "Vendu", variant: "muted" },
  deceased: { label: "Décédé", variant: "danger" },
  missing: { label: "Disparu", variant: "warning" },
};

export const FARM_STATUS: Record<DbFarmStatus, { label: string; variant: Variant }> = {
  active: { label: "Actif", variant: "success" },
  inactive: { label: "Inactif", variant: "warning" },
  archived: { label: "Archivé", variant: "muted" },
};

export const MEMBERSHIP_STATUS: Record<DbMembershipStatus, { label: string; variant: Variant }> = {
  active: { label: "Actif", variant: "success" },
  invited: { label: "Invité", variant: "info" },
  suspended: { label: "Suspendu", variant: "warning" },
  revoked: { label: "Accès retiré", variant: "muted" },
};

export const ACQUISITION_LABEL: Record<DbAcquisition, string> = {
  born_on_farm: "Né dans l'élevage",
  purchase: "Achat",
  donation: "Don",
  inheritance: "Héritage",
  exchange: "Échange",
  other: "Autre",
};

export const IDENTIFICATION_LABEL: Record<Enums["identification_status"], string> = {
  unidentified: "Non identifié",
  pending: "Identification en cours",
  identified: "Identifié",
};

export const EVENT_LABEL: Record<Enums["animal_event_type"], string> = {
  birth: "Naissance",
  sale: "Vente",
  transfer: "Transfert",
  reproduction: "Reproduction",
  calving: "Mise bas",
  death: "Décès",
  slaughter: "Abattage",
  other: "Événement",
};

export const FARM_TYPES = [
  { value: "familial", label: "Élevage familial" },
  { value: "commercial", label: "Exploitation commerciale" },
  { value: "cooperative", label: "Coopérative" },
  { value: "pastoral", label: "Élevage pastoral / transhumant" },
  { value: "ranch", label: "Ranch" },
  { value: "other", label: "Autre" },
] as const;

export function farmTypeLabel(value: string | null | undefined) {
  if (!value) return "Non précisé";
  return FARM_TYPES.find((t) => t.value === value)?.label ?? value;
}

/** Common breeds in Côte d'Ivoire, offered as suggestions only (free text allowed). */
export const BREED_SUGGESTIONS: Record<DbSpecies, string[]> = {
  bovine: ["N'Dama", "Baoulé", "Méré", "Zébu Peul", "Zébu Azawak", "Goudali"],
  ovine: ["Djallonké", "Mossi", "Peul sahélien", "Touabire"],
  caprine: ["Chèvre naine de Guinée", "Chèvre du Sahel", "Rousse de Maradi"],
  porcine: ["Porc local", "Large White", "Landrace"],
};

/** Côte d'Ivoire: 31 regions + 2 autonomous districts. */
export const CIV_REGIONS = [
  "District autonome d'Abidjan",
  "District autonome de Yamoussoukro",
  "Agnéby-Tiassa", "Bafing", "Bagoué", "Bélier", "Béré", "Bounkani", "Cavally", "Folon", "Gbêkê", "Gbôklé",
  "Gôh", "Gontougo", "Grands-Ponts", "Guémon", "Hambol", "Haut-Sassandra", "Iffou", "Indénié-Djuablin",
  "Kabadougou", "La Mé", "Lôh-Djiboua", "Marahoué", "Moronou", "Nawa", "N'Zi", "Poro", "San-Pédro",
  "Sud-Comoé", "Tchologo", "Tonkpi", "Worodougou",
] as const;

export const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
export const numberFmt = new Intl.NumberFormat("fr-FR");

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}
