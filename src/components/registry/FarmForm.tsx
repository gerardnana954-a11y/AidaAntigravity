import { Link } from "@tanstack/react-router";
import { Loader2, LocateFixed, Save } from "lucide-react";
import { useState, type FormEvent } from "react";

import { FormAlert } from "@/components/aida/AuthShell";
import { Field, FormSection, NativeSelect } from "@/components/aida/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Farm } from "@/lib/db/farms";
import { farmFormSchema, zodErrors, type FarmFormValues, type FormErrors } from "@/lib/db/forms";
import { ACTIVE_SPECIES, CIV_REGIONS, FARM_STATUS, FARM_TYPES, SPECIES_PLURAL, type DbFarmStatus } from "@/lib/db/labels";

type Props = {
  initial?: Farm;
  defaultOwnerName?: string;
  onSubmit: (values: FarmFormValues) => Promise<void>;
  cancelTo: { to: "/app/elevages" } | { to: "/app/elevages/$farmId"; params: { farmId: string } };
};

export function FarmForm({ initial, defaultOwnerName, onSubmit, cancelTo }: Props) {
  const editing = Boolean(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lat, setLat] = useState(initial?.latitude?.toString() ?? "");
  const [lng, setLng] = useState(initial?.longitude?.toString() ?? "");
  const [locating, setLocating] = useState(false);

  function locate() {
    if (!("geolocation" in navigator)) {
      setErrors((e) => ({ ...e, latitude: "La géolocalisation n'est pas disponible sur cet appareil." }));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setErrors((e) => ({ ...e, latitude: "Position refusée ou indisponible. Saisissez-la à la main." }));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.currentTarget);
    const raw = {
      ...Object.fromEntries(
        ["name", "owner_name", "farm_type", "region", "department", "locality", "address", "latitude", "longitude", "description", "status", "change_reason"].map(
          (k) => [k, String(form.get(k) ?? "")],
        ),
      ),
      species: form.getAll("species").map(String),
      status: String(form.get("status") ?? "active"),
    };
    const parsed = farmFormSchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(zodErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "L'enregistrement a échoué.");
    } finally {
      setSubmitting(false);
    }
  }

  const err = (k: string) => errors[k];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && <FormAlert>{formError}</FormAlert>}
      <fieldset disabled={submitting} className="space-y-5">
        <FormSection title="Exploitation" description="Les champs marqués * sont obligatoires.">
          <Field label="Nom de l'exploitation" htmlFor="name" error={err("name")} required className="sm:col-span-2">
            <Input id="name" name="name" defaultValue={initial?.name ?? ""} className="h-11" placeholder="Ex. Ferme Koné de Sinématiali" aria-invalid={Boolean(err("name"))} />
          </Field>
          <Field label="Nom du propriétaire" htmlFor="owner_name" error={err("owner_name")} required>
            <Input id="owner_name" name="owner_name" defaultValue={initial?.owner_name ?? defaultOwnerName ?? ""} className="h-11" aria-invalid={Boolean(err("owner_name"))} />
          </Field>
          <Field label="Type d'élevage" htmlFor="farm_type" error={err("farm_type")}>
            <NativeSelect id="farm_type" name="farm_type" defaultValue={initial?.farm_type ?? ""}>
              <option value="">Non précisé</option>
              {FARM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <fieldset className="space-y-2 sm:col-span-2" aria-describedby={err("species") ? "species-error" : undefined}>
            <legend className="text-sm font-medium">
              Espèces élevées<span className="ml-0.5 text-destructive">*</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {ACTIVE_SPECIES.map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:checked]:text-secondary-foreground">
                  <input type="checkbox" name="species" value={s} defaultChecked={initial?.species.includes(s) ?? false} className="accent-primary" />
                  {SPECIES_PLURAL[s]}
                </label>
              ))}
            </div>
            {err("species") && (
              <p id="species-error" className="text-xs font-medium text-destructive">
                {err("species")}
              </p>
            )}
          </fieldset>
          <Field label="Description" htmlFor="description" error={err("description")} className="sm:col-span-2">
            <Textarea id="description" name="description" defaultValue={initial?.description ?? ""} rows={3} placeholder="Activité, effectif habituel, particularités…" />
          </Field>
        </FormSection>

        <FormSection title="Localisation">
          <Field label="Région" htmlFor="region" error={err("region")}>
            <NativeSelect id="region" name="region" defaultValue={initial?.region ?? ""}>
              <option value="">Choisir une région</option>
              {CIV_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Département" htmlFor="department" error={err("department")}>
            <Input id="department" name="department" defaultValue={initial?.department ?? ""} className="h-11" placeholder="Ex. Korhogo" />
          </Field>
          <Field label="Village ou commune" htmlFor="locality" error={err("locality")}>
            <Input id="locality" name="locality" defaultValue={initial?.locality ?? ""} className="h-11" placeholder="Ex. Sinématiali" />
          </Field>
          <Field label="Localisation précise" htmlFor="address" error={err("address")} hint="Lieu-dit, quartier, repère…">
            <Input id="address" name="address" defaultValue={initial?.address ?? ""} className="h-11" />
          </Field>
          <Field label="Latitude" htmlFor="latitude" error={err("latitude")} hint="Facultatif">
            <Input id="latitude" name="latitude" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} className="h-11" placeholder="9.583" />
          </Field>
          <Field label="Longitude" htmlFor="longitude" error={err("longitude")} hint="Facultatif">
            <Input id="longitude" name="longitude" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} className="h-11" placeholder="-5.633" />
          </Field>
          <div className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={locate} disabled={locating}>
              {locating ? <Loader2 className="animate-spin" /> : <LocateFixed />} Utiliser ma position actuelle
            </Button>
          </div>
        </FormSection>

        {editing && (
          <FormSection title="Statut" description="Un élevage archivé reste consultable avec tout son historique, mais n'accepte plus de nouveaux animaux.">
            <Field label="Statut de l'exploitation" htmlFor="status">
              <NativeSelect id="status" name="status" defaultValue={initial?.status ?? "active"}>
                {(Object.keys(FARM_STATUS) as DbFarmStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {FARM_STATUS[s].label}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Motif de la modification" htmlFor="change_reason" error={err("change_reason")} hint="Conservé dans le journal des modifications.">
              <Input id="change_reason" name="change_reason" className="h-11" />
            </Field>
          </FormSection>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" className="h-11">
            <Link {...cancelTo}>Annuler</Link>
          </Button>
          <Button type="submit" variant="hero" className="h-11">
            {submitting ? <Loader2 className="animate-spin" /> : <Save />}
            {submitting ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Créer l'élevage"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
