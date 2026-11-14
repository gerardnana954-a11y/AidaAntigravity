import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import { Logo } from "@/components/aida/Logo";
import { SidebarNav } from "./SidebarNav";

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-gradient-night lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link to="/" aria-label="Accueil AÏDA">
          <Logo tone="light" showTagline />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav />
      </div>
      <div className="m-3 rounded-xl border border-sidebar-border bg-night-soft/60 p-3.5 bg-dots-night">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-sidebar-accent-foreground">
          <MapPin className="size-3.5 text-sidebar-primary" /> Pays pilote
        </p>
        <p className="mt-1 text-sm text-sidebar-foreground">Côte d'Ivoire</p>
        <p className="mt-0.5 text-[11px] text-night-muted">Bovins · Ovins · Caprins · Porcins</p>
      </div>
    </aside>
  );
}
