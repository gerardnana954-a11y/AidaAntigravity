import { createFileRoute } from "@tanstack/react-router";

import { ModuleNotice } from "@/components/aida/ModuleNotice";
import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { notifyNotConnected } from "@/lib/notify";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/parametres")({
  head: () => pageHead("Paramètres", "Profil, préférences et notifications de votre compte AÏDA."),
  component: ParametresPage,
});

function ParametresPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Compte" title="Paramètres" description="Profil, préférences régionales et notifications." />

      <ModuleNotice title="Enregistrement bientôt disponible">
        Votre compte est connecté. La modification des paramètres depuis cette page arrivera prochainement.
      </ModuleNotice>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Profil">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" placeholder="Votre prénom" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" placeholder="Votre nom" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tel">Téléphone</Label>
              <Input id="tel" placeholder="+225 …" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="region">Région</Label>
              <Input id="region" placeholder="Ex. Poro" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Préférences">
          <dl className="space-y-4 text-sm">
            {[
              ["Langue", "Français"],
              ["Pays", "Côte d'Ivoire"],
              ["Fuseau horaire", "Abidjan (UTC+0)"],
              ["Unités", "Système métrique"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b pb-3 last:border-none last:pb-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Notifications" className="lg:col-span-2">
          <ul className="grid gap-4 md:grid-cols-3">
            {[
              ["Alertes sanitaires de ma région", true],
              ["Mouvements de mes animaux", true],
              ["Résumé hebdomadaire", false],
            ].map(([label, on]) => (
              <li key={String(label)} className="flex items-center justify-between gap-3 rounded-xl border bg-background p-4">
                <span className="text-sm font-medium">{label}</span>
                <Switch defaultChecked={Boolean(on)} aria-label={String(label)} />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="flex justify-end">
        <Button variant="hero" onClick={() => notifyNotConnected("L'enregistrement des paramètres")}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
