import { z } from "zod";

import { CIV_REGIONS } from "./labels";
import { birthDateFromAge, toIsoDate } from "./age";

export type FormErrors = Record<string, string>;

export function zodErrors(error: z.ZodError): FormErrors {
  const out: FormErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

const optionalText = (max: number, label = "Ce champ") =>
  z
    .string()
    .trim()
    .max(max, `${label} doit faire moins de ${max} caractères.`)
    .transform((v) => (v === "" ? null : v));

const optionalNumber = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
    .refine((v) => v === null || (Number.isFinite(v) && v >= min && v <= max), message);

const optionalPastDate = (message: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Date invalide.")
    .refine((v) => v === "" || v <= toIsoDate(new Date()), message)
    .transform((v) => (v === "" ? null : v));

const speciesEnum = z.enum(["bovine", "ovine", "caprine", "porcine"]);

// ---------- Farm ----------
export const farmFormSchema = z
  .object({
    name: z.string().trim().min(2, "Le nom de l'exploitation est obligatoire (2 caractères minimum).").max(200, "Nom trop long."),
    owner_name: z.string().trim().min(2, "Indiquez le nom du propriétaire.").max(200, "Nom trop long."),
    farm_type: z.string().trim().max(60).transform((v) => (v === "" ? null : v)),
    species: z.array(speciesEnum).min(1, "Choisissez au moins une espèce élevée."),
    region: z
      .string()
      .trim()
      .refine((v) => v === "" || (CIV_REGIONS as readonly string[]).includes(v), "Région inconnue.")
      .transform((v) => (v === "" ? null : v)),
    department: optionalText(120, "Le département"),
    locality: optionalText(120, "Le village ou la commune"),
    address: optionalText(300, "La localisation"),
    latitude: optionalNumber(-90, 90, "Latitude invalide (entre -90 et 90)."),
    longitude: optionalNumber(-180, 180, "Longitude invalide (entre -180 et 180)."),
    description: optionalText(1000, "La description"),
    status: z.enum(["active", "inactive", "archived"]).default("active"),
    change_reason: optionalText(300, "Le motif"),
  })
  .refine((v) => (v.latitude === null) === (v.longitude === null), {
    path: ["latitude"],
    message: "Renseignez la latitude et la longitude, ou aucune des deux.",
  });

export type FarmFormValues = z.output<typeof farmFormSchema>;

// ---------- Animal ----------
export const animalFormSchema = z
  .object({
    farm_id: z.string().uuid("Choisissez l'élevage de rattachement."),
    name: optionalText(120, "Le nom ou numéro"),
    species: z.enum(["bovine", "ovine", "caprine"], { errorMap: () => ({ message: "Choisissez une espèce (bovin, ovin ou caprin)." }) }),
    breed: optionalText(120, "La race"),
    sex: z.enum(["female", "male", "unknown"], { errorMap: () => ({ message: "Choisissez le sexe." }) }),
    birth_mode: z.enum(["date", "estimated", "unknown"]),
    birth_date: z.string().trim(),
    age_years: z.string().trim(),
    age_months: z.string().trim(),
    color: optionalText(120, "La couleur"),
    physical_features: optionalText(500, "Les caractéristiques"),
    weight: optionalNumber(0.1, 4999, "Poids invalide (en kg, entre 0,1 et 4 999)."),
    origin: optionalText(200, "L'origine"),
    acquisition_mode: z
      .enum(["", "born_on_farm", "purchase", "donation", "inheritance", "exchange", "other"])
      .transform((v) => (v === "" ? null : v)),
    entry_date: optionalPastDate("La date d'entrée ne peut pas être dans le futur."),
    status: z.enum(["alive", "sold", "deceased", "missing"]).default("alive"),
    notes: optionalText(2000, "Les observations"),
    change_reason: optionalText(300, "Le motif"),
  })
  .superRefine((v, ctx) => {
    if (v.birth_mode === "date") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.birth_date)) ctx.addIssue({ code: "custom", path: ["birth_date"], message: "Indiquez la date de naissance." });
      else if (v.birth_date > toIsoDate(new Date())) ctx.addIssue({ code: "custom", path: ["birth_date"], message: "La date de naissance ne peut pas être dans le futur." });
      else if (v.entry_date && v.entry_date < v.birth_date) ctx.addIssue({ code: "custom", path: ["entry_date"], message: "La date d'entrée ne peut pas précéder la naissance." });
    }
    if (v.birth_mode === "estimated") {
      const y = v.age_years === "" ? 0 : Number(v.age_years);
      const m = v.age_months === "" ? 0 : Number(v.age_months);
      if (!Number.isInteger(y) || y < 0 || y > 40) ctx.addIssue({ code: "custom", path: ["age_years"], message: "Années : nombre entier entre 0 et 40." });
      else if (!Number.isInteger(m) || m < 0 || m > 11) ctx.addIssue({ code: "custom", path: ["age_years"], message: "Mois : nombre entier entre 0 et 11." });
      else if (y === 0 && m === 0) ctx.addIssue({ code: "custom", path: ["age_years"], message: "Indiquez un âge estimé d'au moins un mois." });
    }
  })
  .transform(({ birth_mode, birth_date, age_years, age_months, ...rest }) => ({
    ...rest,
    birth_date:
      birth_mode === "date"
        ? birth_date
        : birth_mode === "estimated"
          ? birthDateFromAge(Number(age_years || 0), Number(age_months || 0))
          : null,
    birth_date_estimated: birth_mode === "estimated",
  }));

export type AnimalFormValues = z.output<typeof animalFormSchema>;

// ---------- Members ----------
export const memberFormSchema = z
  .object({
    email: z.string().trim().min(1, "Saisissez l'adresse e-mail du membre.").max(255).email("Adresse e-mail invalide."),
    role: z.enum(["owner", "manager", "farmer", "veterinarian", "agent"], { errorMap: () => ({ message: "Choisissez un rôle." }) }),
    permissions: z.array(z.enum(["animals.write", "identifiers.write", "events.write", "health.observe", "movements.declare"])),
  })
  .refine((v) => v.role !== "agent" || v.permissions.length > 0, {
    path: ["permissions"],
    message: "Choisissez au moins une permission pour un agent.",
  })
  .transform((v) => ({ ...v, email: v.email.toLowerCase(), permissions: v.role === "agent" ? v.permissions : [] }));

export type MemberFormValues = z.output<typeof memberFormSchema>;

/** Removes PostgREST filter metacharacters from free-text search. */
export function sanitizeSearch(q: string): string {
  return q.replace(/[,()*%\\:"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}
