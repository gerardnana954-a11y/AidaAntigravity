import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Plus, User, Warehouse } from "lucide-react";

import { PageHeader } from "@/components/aida/PageHeader";
import { StatusBadge } from "@/components/aida/StatusBadge";
import { Button } from "@/components/ui/button";
import { DEMO_FARMS, fmt, SPECIES_LABEL } from "@/data/demo";
import { notifyNotConnected } from "@/lib/notify";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/elevages")({
  head: () => pageHead("Élevages", "Exploitations, éleveurs et coopératives enregistrés sur AÏDA."),
  component: ElevagesPage,
});

function ElevagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registre"
        title="Élevages"
        description="Les exploitations suivies, leurs effectifs et leur localisation."
        demo
        actions={
          <Button variant="hero" onClick={() => notifyNotConnected("La création d'un élevage")}>
            <Plus /> Nouvel élevage
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DEMO_FARMS.map((f) => (
          <article key={f.id} className="group rounded-2xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Warehouse className="size-5" />
              </span>
              <StatusBadge status={f.status} />
            </div>
            <h2 className="mt-4 text-base font-semibold">{f.name}</h2>
            <p className="text-xs text-muted-foreground">{f.id}</p>
            <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <User className="size-4" /> {f.owner}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4" /> {f.city} · {f.region}
              </p>
            </div>
            <div className="mt-5 flex items-end justify-between border-t pt-4">
              <div className="flex flex-wrap gap-1.5">
                {f.species.map((s) => (
                  <span key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {SPECIES_LABEL[s]}
                  </span>
                ))}
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-bold">{fmt.format(f.headcount)}</p>
                <p className="text-[11px] text-muted-foreground">têtes</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
