import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { ChevronDown, Loader2, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccess } from "@/hooks/use-access";
import { displayName, initials, roleLabels } from "@/lib/auth/roles";
import { signOutUser } from "@/lib/auth/sign-out";

export function UserMenu() {
  const { user, data: access, isPending, isError } = useAccess();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const name = displayName(access ?? { fullName: (user.user_metadata?.["full_name"] as string | undefined) ?? null, email: user.email ?? null });
  const roles = access ? roleLabels(access) : [];

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOutUser(queryClient);
      await router.navigate({ to: "/connexion", replace: true });
      toast.success("Vous êtes déconnecté.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-1.5 sm:px-2" aria-label="Menu du profil">
          <span className="flex size-8 items-center justify-center rounded-full bg-gradient-emerald text-xs font-bold text-primary-foreground">
            {initials(name)}
          </span>
          <span className="hidden max-w-36 truncate text-sm font-semibold md:inline">
            {isPending ? <Skeleton className="h-4 w-24" /> : name}
          </span>
          <ChevronDown className="hidden size-4 text-muted-foreground md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="space-y-1 font-normal">
          <p className="truncate font-semibold text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{access?.email ?? user.email}</p>
          <div className="flex flex-wrap gap-1 pt-1.5">
            {isPending && <Skeleton className="h-5 w-20" />}
            {isError && <span className="text-xs text-destructive">Rôles indisponibles pour le moment.</span>}
            {access && roles.length === 0 && (
              <span className="text-xs text-muted-foreground">Aucun rôle attribué pour l'instant.</span>
            )}
            {roles.map((r) => (
              <span key={r} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                {r}
              </span>
            ))}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/app/parametres">
            <Settings /> Paramètres du compte
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            void handleSignOut();
          }}
          disabled={signingOut}
          className="text-destructive focus:text-destructive"
        >
          {signingOut ? <Loader2 className="animate-spin" /> : <LogOut />} Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
