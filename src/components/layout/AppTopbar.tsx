import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import { useState } from "react";

import { DemoBadge } from "@/components/aida/DemoBadge";
import { Logo, LogoMark } from "@/components/aida/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { findNavItem, NAV_GROUPS } from "@/config/navigation";
import { SidebarNav } from "./SidebarNav";
import { UserMenu } from "./UserMenu";

export function AppTopbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = findNavItem(pathname);
  const group = NAV_GROUPS.find((g) => g.items.some((i) => i.to === current?.to));
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-lg">
      <div className="flex h-16 items-center gap-3 px-4 md:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" />
        </Button>
        <Link to="/app" className="lg:hidden" aria-label="Tableau de bord">
          <LogoMark className="size-8" />
        </Link>

        <div className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
          <span className="text-muted-foreground">{group?.label ?? "AÏDA"}</span>
          <ChevronRight className="size-3.5 text-muted-foreground" />
          <span className="truncate font-semibold text-foreground">{current?.label ?? "Tableau de bord"}</span>
        </div>
        <span className="truncate text-sm font-semibold md:hidden">{current?.label ?? "AÏDA"}</span>

        <div className="ml-auto flex items-center gap-2">
          <label className="relative hidden xl:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Rechercher un animal, un élevage…"
              className="h-9 w-72 rounded-lg border bg-card pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
              aria-label="Rechercher"
            />
          </label>
          <DemoBadge className="hidden sm:inline-flex" label="Mode démonstration" />
          <Button asChild variant="ghost" size="icon" aria-label="Alertes sanitaires">
            <Link to="/app/alertes">
              <Bell className="size-5" />
            </Link>
          </Button>
          <UserMenu />
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-none bg-gradient-night p-0 text-night-foreground">
          <SheetTitle className="sr-only">Menu AÏDA</SheetTitle>
          <div className="flex h-16 items-center px-5">
            <Logo tone="light" showTagline />
          </div>
          <div className="h-[calc(100dvh-4rem)] overflow-y-auto px-3 pb-8">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
