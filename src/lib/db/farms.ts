/** Farm services — browser client; Row Level Security enforces every permission. */
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

import { AidaDbError, toAidaError, unwrap } from "./errors";
import type { FarmFormValues, MemberFormValues } from "./forms";
import type { DbFarmRole, DbMembershipStatus } from "./labels";
import type { HerdStatRow } from "./stats";

export type Farm = Tables<"farms">;

export type TeamMember = {
  membershipId: string | null;
  userId: string;
  fullName: string | null;
  role: DbFarmRole;
  status: DbMembershipStatus;
  permissions: string[];
  since: string | null;
};

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new AidaDbError("Votre session a expiré. Reconnectez-vous.", "PGRST301");
  return data.user.id;
}

export async function listFarms(): Promise<Farm[]> {
  return unwrap(await supabase.from("farms").select("*").order("name"));
}

/** Returns null when the farm does not exist or the user may not read it (RLS). */
export async function getFarm(id: string): Promise<Farm | null> {
  const { data, error } = await supabase.from("farms").select("*").eq("id", id).maybeSingle();
  if (error) throw toAidaError(error);
  return data;
}

export async function createFarm(values: FarmFormValues): Promise<Farm> {
  const created_by = await currentUserId();
  const { change_reason: _ignored, ...fields } = values;
  return unwrap(await supabase.from("farms").insert({ ...fields, created_by }).select("*").single());
}

export async function updateFarm(id: string, values: FarmFormValues): Promise<Farm> {
  return unwrap(await supabase.from("farms").update(values).eq("id", id).select("*").single());
}

export async function getHerdStats(farmId?: string): Promise<HerdStatRow[]> {
  const res = await supabase.rpc("herd_stats", farmId ? { _farm_id: farmId } : {});
  return unwrap(res).map((r) => ({ ...r, total: Number(r.total) }));
}

export async function getFarmTeam(farmId: string): Promise<TeamMember[]> {
  const [directory, memberships] = await Promise.all([
    supabase.rpc("farm_member_directory", { _farm_id: farmId }),
    supabase.from("farm_memberships").select("id, user_id, role, status, permissions, created_at").eq("farm_id", farmId),
  ]);
  const dir = unwrap(directory);
  const rows = unwrap(memberships);
  return dir.map((d) => {
    const m = rows.find((r) => r.user_id === d.user_id);
    return {
      membershipId: m?.id ?? null,
      userId: d.user_id,
      fullName: d.full_name,
      role: d.role,
      status: d.status,
      permissions: m?.permissions ?? [],
      since: m?.created_at ?? null,
    };
  });
}

/**
 * Adds (or re-activates) a member once the server has resolved the account id.
 * The insert/update itself runs with the user's token: RLS requires members.manage.
 */
export async function saveMembership(farmId: string, userId: string, values: MemberFormValues, team: TeamMember[]) {
  const existing = team.find((m) => m.userId === userId);
  if (existing?.status === "active") throw new AidaDbError("Cette personne est déjà membre de l'élevage.", "23505");
  if (existing?.membershipId) {
    return updateMembership(existing.membershipId, {
      role: values.role,
      status: "active",
      permissions: values.permissions,
      change_reason: "Réintégration dans l'élevage",
    });
  }
  const invited_by = await currentUserId();
  unwrap(
    await supabase
      .from("farm_memberships")
      .insert({ farm_id: farmId, user_id: userId, role: values.role, status: "active", permissions: values.permissions, invited_by })
      .select("id")
      .single(),
  );
}

export async function updateMembership(
  membershipId: string,
  patch: { role?: DbFarmRole; status?: DbMembershipStatus; permissions?: string[]; change_reason?: string | null },
) {
  const next = { ...patch };
  if (next.role && next.role !== "agent") next.permissions = [];
  unwrap(await supabase.from("farm_memberships").update(next).eq("id", membershipId).select("id").single());
}
