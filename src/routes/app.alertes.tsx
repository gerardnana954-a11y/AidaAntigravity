import { createFileRoute } from "@tanstack/react-router";
import { BellRing, CalendarDays, MapPin, Plus } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/aida/EmptyState";
import { PageHeader } from "@/components/aida/PageHeader";
import { StatusBadge } from "@/components/aida/StatusBadge";
import { Button } from "@/components/ui/button";
import { DEMO_ALERTS, SPECIES_LABEL, type DemoAlert } from "@/data/demo";
import { notifyNotConnected } from "@/lib/notify";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/alertes")({
  head: () => pageHead("Alertes sanitaires", "Signalements sanitaires et vérifications vétérinaires des élevages sur AÏDA."),
  component: AlertesPage,
});

const TABS: { value: DemoAlert["status"] | "toutes"; label: string }[] = [
  { value: "toutes", label: "Toutes" },
  { value: "à_vérifier", label: "À vérifier" },
  { value: "en_cours", label: "En cours" },
  { value: "clôturée", label: "Clôturées" },
];

const LEVEL_BAR: Record<DemoAlert["level"], string> = {
  élevée: "bg-destructive",
  moyenne: "bg-warning",
  faible: "bg-muted-foreground/40",
};

function AlertesPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("toutes");
  const list = DEMO_ALERTS.filter((a) => tab === "toutes" || a.status === tab);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Surveillance"
        title="Alertes sanitaires"
        description="Les signalements remontés du terrain et leur suivi par les vétérinaires."
        demo
        actions={
          <Button variant="hero" onClick={() => notifyNotConnected("Le signalement d'un cas")}>
            <Plus /> Nouveau signalement
          </Button>
        }
      />

      <div className="flex gap-1.5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              tab === t.value ? "bg-night text-night-foreground" : "bg-card text-muted-foreground shadow-soft hover:bg-secondary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={BellRing} title="Aucune alerte dans cette catégorie" />
      ) : (
        <ul className="space-y-3">
          {list.map((a) => (
            <li key={a.id} className="relative overflow-hidden rounded-2xl border bg-card p-5 pl-6 shadow-soft">
              <span className={cn("absolute inset-y-0 left-0 w-1.5", LEVEL_BAR[a.level])} />
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={a.level} />
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" /> {a.region}
                    </span>
                    <span>{SPECIES_LABEL[a.species]}</span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" /> {new Date(a.date).toLocaleDateString("fr-FR")}
                    </span>
                    <span>{a.id}</span>
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => notifyNotConnected("Le suivi de l'alerte")}>
                  Consulter
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
