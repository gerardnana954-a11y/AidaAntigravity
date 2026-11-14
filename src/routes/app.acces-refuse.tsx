import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/acces-refuse")({
  head: () => pageHead("Accès refusé", "Cette section d'AÏDA est réservée aux administrateurs autorisés."),
  component: AccesRefusePage,
});

function AccesRefusePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive-soft text-destructive">
        <ShieldOff className="size-7" />
      </span>
      <h1 className="mt-6 text-2xl font-bold">Accès réservé</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        L'administration est réservée aux comptes disposant du rôle Administrateur. Si vous pensez
        devoir y accéder, contactez un administrateur AÏDA.
      </p>
      <Button asChild variant="hero" className="mt-8">
        <Link to="/app">Retour au tableau de bord</Link>
      </Button>
    </div>
  );
}
