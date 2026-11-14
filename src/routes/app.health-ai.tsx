import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, ClipboardList, HeartPulse, Stethoscope } from "lucide-react";
import { useState } from "react";

import { ModuleNotice } from "@/components/aida/ModuleNotice";
import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/health-ai")({
  head: () => pageHead("HEALTH AI", "HEALTH AI : l'intelligence sanitaire d'AÏDA pour la détection précoce des maladies animales."),
  component: HealthAiPage,
});

const SPECIES = ["Bovin", "Ovin", "Caprin", "Porcin"];
const SYMPTOMS = ["Fièvre", "Toux", "Diarrhée", "Perte d'appétit", "Boiterie", "Lésions cutanées", "Écoulement nasal", "Avortement"];

function HealthAiPage() {
  const [species, setSpecies] = useState("Bovin");
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const toggle = (s: string) => setSymptoms((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HEALTH AI"
        title="Intelligence sanitaire"
        description="Décrire ce que l'on observe, orienter vers un vétérinaire, repérer les foyers plus tôt."
      />

      <ModuleNotice title="Moteur d'analyse non connecté">
        HEALTH AI ne produit encore aucune analyse ni aucun diagnostic. Le formulaire ci-dessous
        prépare la saisie des observations. En cas de doute, contactez un vétérinaire.
      </ModuleNotice>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Observation clinique" description="Préparez la description d'un cas">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Espèce</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpecies(s)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                      species === s ? "border-primary bg-secondary text-secondary-foreground" : "bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Signes observés</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SYMPTOMS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    aria-pressed={symptoms.includes(s)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      symptoms.includes(s) ? "border-primary bg-secondary text-secondary-foreground" : "bg-card hover:bg-muted",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes complémentaires</Label>
              <Textarea id="notes" rows={4} placeholder="Nombre d'animaux concernés, depuis quand, conditions…" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="hero" disabled>
                <Brain /> Lancer l'analyse
              </Button>
              <span className="text-xs text-muted-foreground">Disponible lorsque le moteur sera connecté.</span>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Comment fonctionnera HEALTH AI">
            <ul className="space-y-4 text-sm">
              {[
                { icon: ClipboardList, t: "Saisie structurée des signes observés sur le terrain." },
                { icon: Brain, t: "Aide à l'orientation, jamais un diagnostic définitif." },
                { icon: Stethoscope, t: "Validation systématique par un vétérinaire." },
                { icon: HeartPulse, t: "Détection de regroupements de cas par zone." },
              ].map(({ icon: Icon, t }) => (
                <li key={t} className="flex gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
          <div className="rounded-2xl bg-gradient-emerald p-5 text-primary-foreground shadow-glow">
            <p className="font-semibold">Une situation urgente ?</p>
            <p className="mt-1 text-sm text-primary-foreground/80">Créez un signalement pour alerter les services vétérinaires.</p>
            <Button asChild variant="night" className="mt-4">
              <Link to="/app/alertes">Voir les alertes sanitaires</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
