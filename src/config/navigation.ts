import {

  BarChart3,
  Bell,
  Bot,
  Building2,
  FileBadge2,
  Fingerprint,
  HeartPulse,
  LayoutDashboard,
  type LucideIcon,
  PawPrint,
  ScrollText,
  Settings,
  ShieldCheck,
  Route as RouteIcon,
  Satellite,
  Users,
  Warehouse,
} from "lucide-react";

import type { FileRouteTypes } from "@/routeTree.gen";

export type NavItem = {
  to: FileRouteTypes["to"];
  label: string;
  icon: LucideIcon;
  /** Short module tagline shown in headers and the mobile menu. */
  description: string;
};

export type NavGroup = {
  id: "principal" | "registre" | "surveillance" | "outils" | "admin";
  label: string;
  items: NavItem[];
  /** Shown only to users the server reports as administrators (pages are also guarded). */
  adminOnly?: boolean;
};

/** Single source of truth for app navigation (sidebar, mobile menu, top bar titles). */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "principal",
    label: "Vue d'ensemble",
    items: [
      {
        to: "/app",
        label: "Tableau de bord",
        icon: LayoutDashboard,
        description: "Synthèse de l'activité du cheptel",
      },
    ],
  },
  {
    id: "registre",
    label: "Identification",
    items: [
      {
        to: "/app/bio-id",
        label: "BIO-ID",
        icon: Fingerprint,
        description: "Identification biométrique des animaux",
      },
      { to: "/app/animaux", label: "Animaux", icon: PawPrint, description: "Registre du cheptel" },
      {
        to: "/app/elevages",
        label: "Élevages",
        icon: Warehouse,
        description: "Exploitations et éleveurs",
      },
      {
        to: "/app/passeports",
        label: "Passeports",
        icon: FileBadge2,
        description: "Passeports numériques des animaux",
      },
    ],
  },
  {
    id: "surveillance",
    label: "Traçabilité & santé",
    items: [
      {
        to: "/app/trace",
        label: "TRACE",
        icon: RouteIcon,
        description: "Mouvements et historique des animaux",
      },
      {
        to: "/app/health-ai",
        label: "HEALTH AI",
        icon: HeartPulse,
        description: "Intelligence sanitaire",
      },
      {
        to: "/app/alertes",
        label: "Alertes sanitaires",
        icon: Bell,
        description: "Signalements et vérifications",
      },
      {
        to: "/app/sat-track",
        label: "SAT-TRACK",
        icon: Satellite,
        description: "Cartographie et suivi territorial",
      },
    ],
  },
  {
    id: "outils",
    label: "Outils",
    items: [
      {
        to: "/app/assistant",
        label: "Assistant AÏDA",
        icon: Bot,
        description: "Votre assistant d'élevage",
      },
      {
        to: "/app/parametres",
        label: "Paramètres",
        icon: Settings,
        description: "Compte et préférences",
      },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    adminOnly: true,
    items: [
      {
        to: "/app/admin/utilisateurs",
        label: "Utilisateurs",
        icon: Users,
        description: "Comptes, rôles et accès",
      },
      {
        to: "/app/admin/elevages",
        label: "Gestion des élevages",
        icon: Building2,
        description: "Validation et suivi des exploitations",
      },
      {
        to: "/app/admin/animaux",
        label: "Gestion des animaux",
        icon: PawPrint,
        description: "Contrôle du registre national",
      },
      {
        to: "/app/admin/surveillance",
        label: "Surveillance sanitaire",
        icon: ShieldCheck,
        description: "Pilotage des signalements",
      },
      {
        to: "/app/admin/statistiques",
        label: "Statistiques",
        icon: BarChart3,
        description: "Indicateurs du cheptel",
      },
      {
        to: "/app/admin/journal",
        label: "Journal des activités",
        icon: ScrollText,
        description: "Historique des actions",
      },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const MOBILE_TAB_PATHS: NavItem["to"][] = ["/app", "/app/animaux", "/app/bio-id", "/app/alertes"];

/** Bottom tab bar on mobile: the most frequent modules. */
export const MOBILE_TABS: NavItem[] = MOBILE_TAB_PATHS.map((to) =>
  ALL_NAV_ITEMS.find((i) => i.to === to),
).filter((i): i is NavItem => i !== undefined);

export function findNavItem(pathname: string): NavItem | undefined {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return (
    ALL_NAV_ITEMS.find((i) => i.to === clean) ??
    [...ALL_NAV_ITEMS]
      .filter((i) => i.to !== "/app")
      .sort((a, b) => b.to.length - a.to.length)
      .find((i) => clean.startsWith(i.to))
  );
}

