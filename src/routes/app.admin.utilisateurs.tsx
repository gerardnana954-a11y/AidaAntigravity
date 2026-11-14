import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Stethoscope, Tractor, UserPlus, Users } from "lucide-react";

import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { SimpleTable } from "@/components/aida/SimpleTable";
import { StatCard } from "@/components/aida/StatCard";
import { StatusBadge } from "@/components/aida/StatusBadge";
import { Button } from "@/components/ui/button";
import { DEMO_USERS } from "@/data/demo";
import { notifyNotConnected } from "@/lib/notify";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/admin/utilisateurs")({
  head: () => pageHead("Gestion des utilisateurs", "Administration des comptes, rôles et accès de la plateforme AÏDA."),
  component: UtilisateursPage,
});

function UtilisateursPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Gestion des utilisateurs"
        description="Comptes, rôles et périmètres d'accès."
        demo
        actions={
          <Button variant="hero" onClick={() => notifyNotConnected("L'invitation d'un utilisateur")}>
            <UserPlus /> Inviter
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard label="Utilisateurs" value="5" icon={Users} />
        <StatCard label="Administrateurs" value="1" icon={ShieldCheck} tone="night" />
        <StatCard label="Vétérinaires" value="1" icon={Stethoscope} tone="warning" />
        <StatCard label="Éleveurs" value="2" icon={Tractor} />
      </div>
      <SectionCard title="Comptes" demo bodyClassName="p-0">
        <SimpleTable
          rows={DEMO_USERS}
          rowKey={(u) => u.id}
          columns={[
            { header: "Nom", cell: (u) => <span className="font-semibold">{u.name}</span> },
            { header: "E-mail", cell: (u) => <span className="text-muted-foreground">{u.email}</span> },
            { header: "Rôle", cell: (u) => u.role },
            { header: "Région", cell: (u) => u.region },
            { header: "Statut", cell: (u) => <StatusBadge status={u.status} /> },
          ]}
        />
      </SectionCard>
    </div>
  );
}
