import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, ArrowRight, Plus, Store, Tent, Truck } from "lucide-react";

import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { StatCard } from "@/components/aida/StatCard";
import { Button } from "@/components/ui/button";
import { DEMO_MOVEMENTS, SPECIES_LABEL } from "@/data/demo";
import { notifyNotConnected } from "@/lib/notify";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/trace")({
  head: () => pageHead("TRACE", "TRACE : suivi des mouvements, ventes et transferts des animaux d'élevage."),
  component: TracePage,
});

function TracePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="TRACE"
        title="Traçabilité des mouvements"
        description="Chaque déplacement d'animal, de l'élevage au marché, enregistré et consultable."
        demo
        actions={
          <Button variant="hero" onClick={() => notifyNotConnected("La déclaration d'un mouvement")}>
            <Plus /> Déclarer un mouvement
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        <StatCard label="Mouvements ce mois" value="47" icon={ArrowLeftRight} />
        <StatCard label="Ventes au marché" value="18" icon={Store} tone="night" />
        <StatCard label="Transhumances" value="6" icon={Tent} tone="warning" />
      </div>

      <SectionCard title="Derniers mouvements" demo>
        <ol className="relative space-y-6 border-l-2 border-dashed border-border pl-6">
          {DEMO_MOVEMENTS.map((m) => (
            <li key={m.id} className="relative">
              <span className="absolute -left-[33px] top-0.5 inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-card">
                <Truck className="size-3" />
              </span>
              <div className="flex flex-col gap-2 rounded-xl border bg-background p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    {m.from} <ArrowRight className="size-4 text-primary" /> {m.to}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {m.count} {SPECIES_LABEL[m.species].toLowerCase()}s · {m.reason}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground md:text-right">
                  <p>{new Date(m.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
                  <p className="text-xs">{m.id}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </SectionCard>
    </div>
  );
}
