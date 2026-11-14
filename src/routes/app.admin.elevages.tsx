import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";

import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { SimpleTable } from "@/components/aida/SimpleTable";
import { StatusBadge } from "@/components/aida/StatusBadge";
import { Button } from "@/components/ui/button";
import { DEMO_FARMS, fmt, SPECIES_LABEL } from "@/data/demo";
import { notifyNotConnected } from "@/lib/notify";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/admin/elevages")({
  head: () => pageHead("Gestion des élevages", "Validation et contrôle des exploitations enregistrées sur AÏDA."),
  component: AdminElevagesPage,
});

function AdminElevagesPage() {
  const pending = DEMO_FARMS.filter((f) => f.status === "en_attente");
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Gestion des élevages" description="Valider les nouvelles exploitations et contrôler les effectifs déclarés." demo />

      <SectionCard title="En attente de validation" description={`${pending.length} demandes`} demo bodyClassName="p-0">
        <ul className="divide-y">
          {pending.map((f) => (
            <li key={f.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{f.name}</p>
                <p className="text-sm text-muted-foreground">
                  {f.owner} · {f.city} · {fmt.format(f.headcount)} têtes déclarées
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => notifyNotConnected("Le refus d'un élevage")}>
                  <X /> Refuser
                </Button>
                <Button size="sm" onClick={() => notifyNotConnected("La validation d'un élevage")}>
                  <Check /> Valider
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Tous les élevages" demo bodyClassName="p-0">
        <SimpleTable
          rows={DEMO_FARMS}
          rowKey={(f) => f.id}
          columns={[
            { header: "Identifiant", cell: (f) => <span className="font-semibold">{f.id}</span> },
            { header: "Nom", cell: (f) => f.name },
            { header: "Région", cell: (f) => f.region },
            { header: "Espèces", cell: (f) => f.species.map((s) => SPECIES_LABEL[s]).join(", ") },
            { header: "Effectif", cell: (f) => fmt.format(f.headcount) },
            { header: "Statut", cell: (f) => <StatusBadge status={f.status} /> },
          ]}
        />
      </SectionCard>
    </div>
  );
}
