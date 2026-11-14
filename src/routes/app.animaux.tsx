import { createFileRoute } from "@tanstack/react-router";
import { PawPrint, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/aida/EmptyState";
import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { StatusBadge } from "@/components/aida/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEMO_ANIMALS, farmName, SPECIES_LABEL, type Species } from "@/data/demo";
import { notifyNotConnected } from "@/lib/notify";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/animaux")({
  head: () => pageHead("Animaux", "Registre des bovins, ovins, caprins et porcins enregistrés sur AÏDA."),
  component: AnimauxPage,
});

const FILTERS: { value: Species | "tous"; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "bovin", label: "Bovins" },
  { value: "ovin", label: "Ovins" },
  { value: "caprin", label: "Caprins" },
  { value: "porcin", label: "Porcins" },
];

function AnimauxPage() {
  const [species, setSpecies] = useState<Species | "tous">("tous");
  const [q, setQ] = useState("");

  const rows = useMemo(
    () =>
      DEMO_ANIMALS.filter((a) => species === "tous" || a.species === species).filter((a) =>
        `${a.id} ${a.breed} ${farmName(a.farmId)}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [species, q],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registre"
        title="Animaux"
        description="Toutes les fiches du cheptel, par espèce et par élevage."
        demo
        actions={
          <Button variant="hero" onClick={() => notifyNotConnected("L'enregistrement d'un animal")}>
            <Plus /> Nouvel animal
          </Button>
        }
      />

      <SectionCard bodyClassName="p-0">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-1.5 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setSpecies(f.value)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                  species === f.value ? "bg-night text-night-foreground" : "bg-muted text-muted-foreground hover:bg-secondary",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <label className="relative md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Identifiant, race, élevage…" className="pl-9" aria-label="Rechercher un animal" />
          </label>
        </div>

        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={PawPrint} title="Aucun animal trouvé" description="Modifiez votre recherche ou vos filtres." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Identifiant</TableHead>
                  <TableHead>Espèce</TableHead>
                  <TableHead>Race</TableHead>
                  <TableHead>Sexe</TableHead>
                  <TableHead>Élevage</TableHead>
                  <TableHead className="pr-5">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-5 font-semibold">{a.id}</TableCell>
                    <TableCell>{SPECIES_LABEL[a.species]}</TableCell>
                    <TableCell className="whitespace-nowrap">{a.breed}</TableCell>
                    <TableCell>{a.sex === "F" ? "Femelle" : "Mâle"}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{farmName(a.farmId)}</TableCell>
                    <TableCell className="pr-5">
                      <StatusBadge status={a.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
