import { createFileRoute } from "@tanstack/react-router";
import { Download, FileBadge2, QrCode, Share2 } from "lucide-react";
import { useState } from "react";

import { DemoBadge } from "@/components/aida/DemoBadge";
import { LogoMark } from "@/components/aida/Logo";
import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { StatusBadge } from "@/components/aida/StatusBadge";
import { Button } from "@/components/ui/button";
import { DEMO_ANIMALS, farmName, SPECIES_LABEL } from "@/data/demo";
import { notifyNotConnected } from "@/lib/notify";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/passeports")({
  head: () => pageHead("Passeports numériques", "Passeports numériques des animaux d'élevage : identité, élevage, mouvements et suivi sanitaire."),
  component: PasseportsPage,
});

function PasseportsPage() {
  const [selectedId, setSelectedId] = useState(DEMO_ANIMALS[0].id);
  const animal = DEMO_ANIMALS.find((a) => a.id === selectedId) ?? DEMO_ANIMALS[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Identification"
        title="Passeports numériques"
        description="Le document d'identité de l'animal, consultable lors des contrôles, ventes et mouvements."
        demo
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <SectionCard title="Animaux" bodyClassName="p-2">
          <ul className="max-h-[480px] space-y-1 overflow-y-auto">
            {DEMO_ANIMALS.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => setSelectedId(a.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    a.id === selectedId ? "bg-secondary" : "hover:bg-muted",
                  )}
                >
                  <FileBadge2 className={cn("size-4", a.id === selectedId ? "text-primary" : "text-muted-foreground")} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{a.id}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {SPECIES_LABEL[a.species]} · {a.breed}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="space-y-4">
          <article className="relative overflow-hidden rounded-3xl bg-gradient-night p-6 text-night-foreground shadow-elevated md:p-8">
            <div className="absolute inset-0 bg-dots-night" aria-hidden />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <LogoMark />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-glow">Passeport numérique</p>
                    <p className="text-xs text-night-muted">Pays pilote : Côte d'Ivoire</p>
                  </div>
                </div>
                <DemoBadge label="Exemple de démonstration" />
              </div>

              <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-display text-3xl font-bold md:text-4xl">{animal.id}</p>
                  <p className="mt-1 text-night-muted">{animal.name}</p>
                  <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
                    {[
                      ["Espèce", SPECIES_LABEL[animal.species]],
                      ["Race", animal.breed],
                      ["Sexe", animal.sex === "F" ? "Femelle" : "Mâle"],
                      ["Naissance", new Date(animal.birth).toLocaleDateString("fr-FR")],
                      ["Élevage", farmName(animal.farmId)],
                      ["BIO-ID", "Non enrôlé"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs text-night-muted">{k}</dt>
                        <dd className="mt-0.5 font-semibold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="flex size-36 flex-col items-center justify-center rounded-2xl border border-dashed border-night-foreground/25 text-center text-night-muted">
                  <QrCode className="size-10" />
                  <span className="mt-2 px-3 text-[11px]">Code de vérification à venir</span>
                </div>
              </div>
            </div>
          </article>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={animal.status} />
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => notifyNotConnected("Le partage du passeport")}>
                <Share2 /> Partager
              </Button>
              <Button variant="night" onClick={() => notifyNotConnected("Le téléchargement du passeport")}>
                <Download /> Télécharger
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
