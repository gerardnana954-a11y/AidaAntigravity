import { createFileRoute } from "@tanstack/react-router";
import { Camera, CheckCircle2, Fingerprint, ScanFace, ShieldCheck, Upload } from "lucide-react";

import { ModuleNotice } from "@/components/aida/ModuleNotice";
import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { StatusBadge } from "@/components/aida/StatusBadge";
import { Button } from "@/components/ui/button";
import { DEMO_ANIMALS, SPECIES_LABEL } from "@/data/demo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/bio-id")({
  head: () => pageHead("BIO-ID", "BIO-ID : le module d'identification biométrique des animaux d'élevage sur AÏDA."),
  component: BioIdPage,
});

const STEPS = [
  { icon: Camera, title: "Capture", text: "Photo du mufle ou de la face de l'animal, prise sur le terrain." },
  { icon: ScanFace, title: "Contrôle qualité", text: "Vérification de la netteté et du cadrage avant envoi." },
  { icon: Fingerprint, title: "Enrôlement", text: "Création de l'empreinte unique reliée à la fiche de l'animal." },
  { icon: ShieldCheck, title: "Vérification", text: "Comparaison lors d'un contrôle, d'une vente ou d'un mouvement." },
];

function BioIdPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="BIO-ID"
        title="Identification biométrique"
        description="Donner à chaque animal une identité unique, sans boucle perdue ni marquage douloureux."
      />

      <ModuleNotice title="Module en préparation">
        Aucune reconnaissance biométrique n'est effectuée pour le moment. Les captures et les
        résultats apparaîtront ici lorsque le moteur d'identification sera connecté.
      </ModuleNotice>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Nouvelle capture" description="Sélectionnez une photo de l'animal">
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/40 px-6 py-14 text-center bg-dots">
            <span className="inline-flex size-16 items-center justify-center rounded-3xl bg-card shadow-soft">
              <Fingerprint className="size-8 text-primary" />
            </span>
            <p className="mt-5 font-semibold">Zone de capture</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              La capture photo sera activée avec le moteur BIO-ID.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button disabled variant="hero">
                <Camera /> Prendre une photo
              </Button>
              <Button disabled variant="outline">
                <Upload /> Importer
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Le parcours BIO-ID">
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <s.icon className="size-5" />
                  <span className="absolute -right-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-night text-[10px] font-bold text-night-foreground">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>

      <SectionCard title="Statut d'enrôlement" description="Aucun animal n'est encore enrôlé" demo bodyClassName="p-0">
        <ul className="divide-y">
          {DEMO_ANIMALS.slice(0, 5).map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">{a.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {SPECIES_LABEL[a.species]} · {a.breed}
                  </p>
                </div>
              </div>
              <StatusBadge status={a.bioId} />
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
