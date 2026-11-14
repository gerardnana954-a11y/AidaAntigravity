import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const input = z.object({ farmId: z.string().uuid(), email: z.string().trim().toLowerCase().email().max(255) });

/**
 * Resolves the account id behind an e-mail so a farm owner can add that person.
 * Only farm owners (members.manage) and administrators may look accounts up; the
 * membership itself is then written with the caller's token, so RLS still decides.
 */
export const findAccountForMembership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { farmId: string; email: string }) => input.parse(data))
  .handler(async ({ data, context }): Promise<{ userId: string }> => {
    const { supabase, userId } = context;
    const [own, roles] = await Promise.all([
      supabase.from("farm_memberships").select("role").eq("farm_id", data.farmId).eq("user_id", userId).eq("status", "active").maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const allowed = own.data?.role === "owner" || (roles.data ?? []).some((r) => r.role === "admin");
    if (!allowed) throw new Error("Vous n'êtes pas autorisé à gérer les membres de cet élevage.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error } = await supabaseAdmin.from("profiles").select("id").eq("email", data.email).limit(1).maybeSingle();
    if (error) {
      console.error("[findAccountForMembership]", error.message);
      throw new Error("La recherche du compte a échoué. Réessayez.");
    }
    if (!profile) throw new Error("Aucun compte AÏDA n'utilise cette adresse e-mail. La personne doit d'abord créer son compte.");
    return { userId: profile.id };
  });
