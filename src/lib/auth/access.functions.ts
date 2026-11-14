import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { FarmAccess, UserAccess } from "./roles";

/**
 * Reads the caller's profile and roles on the server, with the caller's own token
 * (RLS applies). Roles come only from user_roles / farm_memberships, never from the browser.
 */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<UserAccess> => {
    const { supabase, userId } = context;
    const [profile, roles, memberships] = await Promise.all([
      supabase.from("profiles").select("full_name, email, phone").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("farm_memberships")
        .select("farm_id, role, permissions, farms(name)")
        .eq("user_id", userId)
        .eq("status", "active"),
    ]);
    const failed = profile.error ?? roles.error ?? memberships.error;
    if (failed) {
      console.error("[getMyAccess]", failed.message);
      throw new Error("Impossible de charger vos droits d'accès.");
    }
    const farms: FarmAccess[] = (memberships.data ?? []).map((m) => ({
      farmId: m.farm_id,
      farmName: m.farms?.name ?? null,
      role: m.role,
      permissions: m.permissions ?? [],
    }));
    return {
      userId,
      fullName: profile.data?.full_name ?? null,
      email: profile.data?.email ?? null,
      phone: profile.data?.phone ?? null,
      appRoles: (roles.data ?? []).map((r) => r.role),
      farms,
    };
  });
