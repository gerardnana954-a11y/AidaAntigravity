import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock, Siren } from "lucide-react";

import { CivMap, MapLegend } from "@/components/aida/CivMap";
import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { SimpleTable } from "@/components/aida/SimpleTable";
import { StatCard } from "@/components/aida/StatCard";
import { StatusBadge } from "@/components/aida/StatusBadge";
import { DEMO_ALERTS, DEMO_MAP_POINTS, SPECIES_LABEL } from "@/data/demo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/admin/surveillance")({
  head: () => pageHead("Surveillance sanitaire", "Pilotage national des signalements et vérifications sanitaires sur AÏDA."),
  component: SurveillancePage,
});

function SurveillancePage() {
  const count = (s: string) => DEMO_ALERTS.filter((a) => a.status === s).length;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Surveillance sanitaire" description="Vue de pilotage des signalements, par niveau de priorité et par région." demo />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard label="Priorité élevée" value={String(DEMO_ALERTS.filter((a) => a.level === "élevée").length)} icon={Siren} tone="danger" />
        <StatCard label="À vérifier" value={String(count("à_vérifier"))} icon={AlertTriangle} tone="warning" />
        <StatCard label="En cours" value={String(count("en_cours"))} icon={Clock} tone="night" />
        <StatCard label="Clôturées" value={String(count("clôturée"))} icon={CheckCircle2} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title="Signalements" demo bodyClassName="p-0">
          <SimpleTable
            rows={DEMO_ALERTS}
            rowKey={(a) => a.id}
            columns={[
              { header: "Référence", cell: (a) => <span className="font-semibold">{a.id}</span> },
              { header: "Signalement", cell: (a) => a.title },
              { header: "Région", cell: (a) => a.region },
              { header: "Espèce", cell: (a) => SPECIES_LABEL[a.species] },
              { header: "Priorité", cell: (a) => <StatusBadge status={a.level} /> },
              { header: "Statut", cell: (a) => <StatusBadge status={a.status} /> },
            ]}
          />
        </SectionCard>
        <SectionCard title="Zones concernées" demo>
          <CivMap points={DEMO_MAP_POINTS.filter((p) => p.kind === "alerte")} showCities={false} className="mx-auto max-h-72" />
          <div className="mt-4">
            <MapLegend />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
