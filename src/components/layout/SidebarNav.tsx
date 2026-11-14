import { Link } from "@tanstack/react-router";

import { NAV_GROUPS } from "@/config/navigation";
import { useAccess } from "@/hooks/use-access";
import { isAdmin } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

/** Grouped navigation list, shared by the desktop sidebar and the mobile drawer. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  // Hiding links is cosmetic; the admin pages themselves are guarded by a server check.
  const { data: access } = useAccess();
  const groups = NAV_GROUPS.filter((g) => !g.adminOnly || isAdmin(access));
  return (
    <nav className="space-y-6" aria-label="Navigation principale">
      {groups.map((group) => (
        <div key={group.id}>
          <p
            className={cn(
              "mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em]",
              group.id === "admin" ? "text-sidebar-primary" : "text-night-muted",
            )}
          >
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  activeOptions={{ exact: item.to === "/app" }}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeProps={{
                    className:
                      "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_var(--color-sidebar-primary)]",
                  }}
                >
                  <item.icon className="size-4 shrink-0 opacity-80 group-hover:opacity-100" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
