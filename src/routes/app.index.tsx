import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Fingerprint, HeartPulse, PawPrint, Plus, Warehouse } from "lucide-react";

import { CivMap, MapLegend } from "@/components/aida/CivMap";
import { GrowthChart } from "@/components/aida/GrowthChart";
import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { StatCard } from "@/components/aida/StatCard";
import { StatusBadge } from "@/components/aida/StatusBadge";
import { Button } from "@/components/ui/button";
import { DEMO_ACTIVITY, DEMO_ALERTS, DEMO_MAP_POINTS, DEMO_STATS, fmt } from "@/data/demo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/")({
  head: () => pageHead("Tableau de bord", "Vue d'ensemble du cheptel, des élevages et des alertes sanitaires sur AÏDA."),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tableau de bord"
        title="Bonjour, bienvenue sur AÏDA"
        description="Synthèse de l'activité du cheptel en Côte d'Ivoire."
        demo
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/alertes">
                <HeartPulse /> Signaler
              </Link>
            </Button>
            <Button asChild variant="hero">
              <Link to="/app/animaux">
                <Plus /> Enregistrer un animal
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard label="Animaux enregistrés" value={fmt.format(DEMO_STATS.animals)} hint="4 espèces suivies" icon={PawPrint} tone="emerald" />
        <StatCard label="Élevages" value={fmt.format(DEMO_STATS.farms)} hint="Exploitations recensées" icon={Warehouse} tone="night" />
        <StatCard label="Signalements sanitaires" value={fmt.format(DEMO_STATS.reports)} hint="30 derniers jours" icon={HeartPulse} tone="warning" />
        <StatCard label="Alertes à vérifier" value={fmt.format(DEMO_STATS.pendingAlerts)} hint="En attente d'un vétérinaire" icon={AlertTriangle} tone="danger" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Évolution du cheptel" description="Animaux enregistrés par espèce" demo className="xl:col-span-2">
          <GrowthChart />
        </SectionCard>

        <SectionCard
          title="Aperçu cartographique"
          demo
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/sat-track">
                Ouvrir <ArrowRight />
              </Link>
            </Button>
          }
        >
          <div className="rounded-xl bg-muted/50 p-3">
            <CivMap points={DEMO_MAP_POINTS} showCities={false} className="mx-auto max-h-64" />
          </div>
          <div className="mt-4">
            <MapLegend />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Activités récentes" demo className="xl:col-span-2" bodyClassName="p-0">
          <ul className="divide-y">
            {DEMO_ACTIVITY.map((a, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-4">
                <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm font-bold text-secondary-foreground">
                  {a.who.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{a.who}</span> {a.action}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{a.target}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{a.when}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Alertes à traiter"
          demo
          bodyClassName="p-0"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/alertes">Tout voir</Link>
            </Button>
          }
        >
          <ul className="divide-y">
            {DEMO_ALERTS.filter((a) => a.status !== "clôturée").slice(0, 4).map((a) => (
              <li key={a.id} className="space-y-1.5 px-5 py-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">{a.region}</span>
                  <StatusBadge status={a.level} />
                </div>
                <p className="text-sm font-medium">{a.title}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="flex flex-col items-start gap-4 rounded-2xl bg-gradient-night p-6 text-night-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-night-foreground/10">
            <Fingerprint className="size-6 text-primary-glow" />
          </span>
          <div>
            <p className="font-semibold">BIO-ID en préparation</p>
            <p className="text-sm text-night-muted">L'identification biométrique sera activée dans une prochaine étape.</p>
          </div>
        </div>
        <Button asChild variant="hero">
          <Link to="/app/bio-id">Découvrir BIO-ID</Link>
        </Button>
      </div>
    </div>
  );
}
