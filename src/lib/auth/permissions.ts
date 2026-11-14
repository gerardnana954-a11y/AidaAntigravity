import type { FarmAccess } from "./roles";

/**
 * Mirror of private.has_farm_permission() — used ONLY to show or hide buttons.
 * The database (RLS + triggers) remains the authority for every write.
 */
export type FarmPermission =
  | "farm.manage"
  | "members.manage"
  | "animals.write"
  | "animals.transfer"
  | "identifiers.write"
  | "events.write"
  | "health.observe"
  | "health.diagnose"
  | "health.intervene"
  | "movements.declare"
  | "movements.validate";

export const AGENT_PERMISSIONS = [
  { value: "animals.write", label: "Enregistrer et modifier les animaux" },
  { value: "identifiers.write", label: "Gérer les identifiants QR / RFID" },
  { value: "events.write", label: "Enregistrer des événements" },
  { value: "health.observe", label: "Saisir des observations sanitaires" },
  { value: "movements.declare", label: "Déclarer des mouvements" },
] as const;

export type AgentPermission = (typeof AGENT_PERMISSIONS)[number]["value"];

const FARMER: FarmPermission[] = ["animals.write", "identifiers.write", "events.write", "health.observe", "movements.declare"];
const VET: FarmPermission[] = ["health.observe", "health.diagnose", "health.intervene", "events.write", "movements.validate"];

export function farmCan(membership: Pick<FarmAccess, "role" | "permissions"> | null | undefined, permission: FarmPermission): boolean {
  if (!membership) return false;
  switch (membership.role) {
    case "owner":
      return permission !== "health.diagnose";
    case "manager":
      return permission !== "health.diagnose" && permission !== "members.manage";
    case "farmer":
      return FARMER.includes(permission);
    case "veterinarian":
      return VET.includes(permission);
    case "agent":
      return membership.permissions.includes(permission);
  }
}
