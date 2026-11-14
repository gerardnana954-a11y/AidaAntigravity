import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type FarmRole = Database["public"]["Enums"]["farm_role"];

export const APP_ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrateur",
  supervisor: "Superviseur",
};

export const FARM_ROLE_LABELS: Record<FarmRole, string> = {
  owner: "Propriétaire",
  manager: "Gérant",
  farmer: "Éleveur",
  veterinarian: "Vétérinaire",
  agent: "Agent",
};

export type FarmAccess = { farmId: string; farmName: string | null; role: FarmRole; permissions: string[] };

/** What the server says the signed-in user may do. Never built from browser input. */
export type UserAccess = {
  userId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  appRoles: AppRole[];
  farms: FarmAccess[];
};

export function isAdmin(access: Pick<UserAccess, "appRoles"> | null | undefined): boolean {
  return access?.appRoles.includes("admin") ?? false;
}

/** Distinct, human-readable role labels: global roles first, then farm roles. */
export function roleLabels(access: Pick<UserAccess, "appRoles" | "farms">): string[] {
  const labels = [
    ...access.appRoles.map((r) => APP_ROLE_LABELS[r]),
    ...access.farms.map((f) => FARM_ROLE_LABELS[f.role]),
  ];
  return [...new Set(labels)];
}

export function displayName(access: Pick<UserAccess, "fullName" | "email"> | null | undefined, fallback = "Mon compte") {
  return access?.fullName?.trim() || access?.email || fallback;
}

export function initials(name: string): string {
  const parts = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]).join("") || "?").toUpperCase();
}

/** Only same-app private paths are accepted as post-login destinations. */
export function safeRedirect(target: unknown, fallback = "/app"): string {
  if (typeof target !== "string") return fallback;
  if (!target.startsWith("/app") || target.startsWith("//") || target.includes("\\")) return fallback;
  if (target !== "/app" && !/^\/app[/?#]/.test(target)) return fallback;
  return target;
}

export function farmMembership(access: Pick<UserAccess, "farms"> | null | undefined, farmId: string): FarmAccess | undefined {
  return access?.farms.find((f) => f.farmId === farmId);
}
