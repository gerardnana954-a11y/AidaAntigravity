import { Link } from "@tanstack/react-router";

import { MOBILE_TABS } from "@/config/navigation";

/** Thumb-friendly bottom navigation shown below the lg breakpoint. */
export function MobileTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
      aria-label="Navigation mobile"
    >
      <ul className="grid grid-cols-4">
        {MOBILE_TABS.map((tab) => (
          <li key={tab.to}>
            <Link
              to={tab.to}
              activeOptions={{ exact: tab.to === "/app" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              <tab.icon className="size-5" />
              <span className="max-w-full truncate px-1">{tab.label === "Alertes sanitaires" ? "Alertes" : tab.label === "Tableau de bord" ? "Accueil" : tab.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
