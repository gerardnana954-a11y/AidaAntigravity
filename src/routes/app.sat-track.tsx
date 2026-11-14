import { createFileRoute } from "@tanstack/react-router";
import { Layers, Satellite } from "lucide-react";
import { useState } from "react";

import { CivMap, MapLegend } from "@/components/aida/CivMap";
import { ModuleNotice } from "@/components/aida/ModuleNotice";
import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { Switch } from "@/components/ui/switch";
import { DEMO_MAP_POINTS } from "@/data/demo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/sat-track")({
  head: () => pageHead("SAT-TRACK", "SAT-TRACK : cartographie des élevages et des zones de vigilance sanitaire en Côte d'Ivoire."),
  component: SatTrackPage,
});

function SatTrackPage() {
  const [layers, setLayers] = useState({ élevage: true, alerte: true, villes: true });
  const points = DEMO_MAP_POINTS.filter((p) => layers[p.kind]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SAT-TRACK"
        title="Cartographie et suivi territorial"
        description="Visualiser où se trouvent les élevages et où se concentrent les signalements."
        demo
      />

      <ModuleNotice title="Imagerie satellite non connectée">
        La carte affiche un fond simplifié. Les couches satellites et le suivi GPS seront ajoutés
        dans une prochaine étape.
      </ModuleNotice>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <SectionCard bodyClassName="p-3 md:p-6" demo title="Côte d'Ivoire">
          <div className="rounded-2xl bg-muted/40 p-4 bg-dots">
            <CivMap points={points} showCities={layers.villes} className="mx-auto max-h-[560px]" />
          </div>
          <div className="mt-4">
            <MapLegend />
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Couches" action={<Layers className="size-4 text-muted-foreground" />}>
            <ul className="space-y-4">
              {(
                [
                  ["élevage", "Élevages"],
                  ["alerte", "Alertes sanitaires"],
                  ["villes", "Villes repères"],
                ] as const
              ).map(([key, label]) => (
                <li key={key} className="flex items-center justify-between">
                  <label htmlFor={`layer-${key}`} className="text-sm font-medium">
                    {label}
                  </label>
                  <Switch
                    id={`layer-${key}`}
                    checked={layers[key]}
                    onCheckedChange={(v) => setLayers((l) => ({ ...l, [key]: v }))}
                  />
                </li>
              ))}
              <li className="flex items-center justify-between opacity-50">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Satellite className="size-4" /> Imagerie satellite
                </span>
                <Switch disabled />
              </li>
            </ul>
          </SectionCard>

          <SectionCard title="Points affichés" demo bodyClassName="p-0">
            <ul className="divide-y text-sm">
              {points.map((p, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3">
                  <span className={p.kind === "alerte" ? "size-2 rounded-full bg-destructive" : "size-2 rounded-full bg-primary"} />
                  <span className="flex-1 truncate">{p.label}</span>
                  <span className="text-xs text-muted-foreground">{p.city}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
