import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { SimpleTable } from "@/components/aida/SimpleTable";
import { StatusBadge } from "@/components/aida/StatusBadge";
import { DEMO_ANIMALS, DEMO_SPECIES_SPLIT, farmName, fmt, SPECIES_LABEL } from "@/data/demo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/admin/animaux")({
  head: () => pageHead("Gestion des animaux", "Contrôle du registre national des animaux d'élevage sur AÏDA."),
  component: AdminAnimauxPage,
});

function AdminAnimauxPage() {
  const total = DEMO_SPECIES_SPLIT.reduce((s, x) => s + x.value, 0);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Gestion des animaux" description="Contrôler la qualité du registre et repérer les fiches incomplètes." demo />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {DEMO_SPECIES_SPLIT.map((s) => (
          <div key={s.species} className="rounded-2xl border bg-card p-5 shadow-soft">
            <p className="text-sm text-muted-foreground">{s.species}</p>
            <p className="mt-2 font-display text-2xl font-bold">{fmt.format(s.value)}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${(s.value / total) * 100}%`, background: s.fill }} />
            </div>
          </div>
        ))}
      </div>

      <SectionCard title="Registre" demo bodyClassName="p-0">
        <SimpleTable
          rows={DEMO_ANIMALS}
          rowKey={(a) => a.id}
          columns={[
            { header: "Identifiant", cell: (a) => <span className="font-semibold">{a.id}</span> },
            { header: "Espèce", cell: (a) => SPECIES_LABEL[a.species] },
            { header: "Race", cell: (a) => a.breed },
            { header: "Élevage", cell: (a) => farmName(a.farmId) },
            { header: "BIO-ID", cell: (a) => <StatusBadge status={a.bioId} /> },
            { header: "Statut", cell: (a) => <StatusBadge status={a.status} /> },
          ]}
        />
      </SectionCard>
    </div>
  );
}
