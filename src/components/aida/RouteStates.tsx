import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { AlertTriangle, Loader2, SearchX } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

/** Loader error inside the app shell: retry re-runs the loaders. */
export function RouteError({ error }: ErrorComponentProps) {
  const router = useRouter();
  const message = error instanceof Error ? error.message : "Le chargement a échoué.";
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-destructive/25 bg-destructive-soft p-6 text-center">
      <AlertTriangle className="mx-auto size-7 text-destructive" />
      <p className="mt-3 font-semibold text-foreground">Impossible de charger ces données</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button className="mt-5" onClick={() => void router.invalidate()}>
        Réessayer
      </Button>
    </div>
  );
}

export function RouteNotFound({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-dashed bg-muted/40 p-8 text-center">
      <SearchX className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}

export function FarmNotFound() {
  return (
    <RouteNotFound
      title="Élevage introuvable"
      description="Cet élevage n'existe pas ou vous n'en êtes pas membre."
      action={
        <Button asChild variant="outline">
          <Link to="/app/elevages">Retour aux élevages</Link>
        </Button>
      }
    />
  );
}

export function AnimalNotFound() {
  return (
    <RouteNotFound
      title="Animal introuvable"
      description="Cette fiche n'existe pas ou appartient à un élevage auquel vous n'avez pas accès."
      action={
        <Button asChild variant="outline">
          <Link to="/app/animaux">Retour aux animaux</Link>
        </Button>
      }
    />
  );
}

export function RoutePending({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground" role="status">
      <Loader2 className="size-4 animate-spin" /> {label}
    </div>
  );
}
