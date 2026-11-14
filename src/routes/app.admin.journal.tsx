import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { SimpleTable } from "@/components/aida/SimpleTable";
import { Badge } from "@/components/ui/badge";
import { DEMO_LOG } from "@/data/demo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/admin/journal")({
  head: () => pageHead("Journal des activités", "Historique horodaté des actions effectuées sur la plateforme AÏDA."),
  component: JournalPage,
});

function JournalPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Journal des activités" description="Chaque action importante est horodatée et attribuée à son auteur." demo />
      <SectionCard title="Dernières actions" demo bodyClassName="p-0">
        <SimpleTable
          rows={DEMO_LOG}
          rowKey={(l) => l.at + l.object}
          columns={[
            { header: "Date et heure", cell: (l) => <span className="font-mono text-xs text-muted-foreground">{l.at}</span> },
            { header: "Auteur", cell: (l) => <span className="font-semibold">{l.who}</span> },
            { header: "Action", cell: (l) => <Badge variant="success">{l.action}</Badge> },
            { header: "Objet", cell: (l) => l.object },
          ]}
        />
      </SectionCard>
    </div>
  );
}
