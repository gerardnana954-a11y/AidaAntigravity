import type { QueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

let manualSignOut = false;

/** True once after a sign-out the user asked for (vs. an expired session). */
export function consumeManualSignOut(): boolean {
  const value = manualSignOut;
  manualSignOut = false;
  return value;
}

export async function signOutUser(queryClient: QueryClient) {
  manualSignOut = true;
  await queryClient.cancelQueries();
  queryClient.clear();
  const { error } = await supabase.auth.signOut();
  if (error) {
    // The server call failed; still drop the local session so the device is signed out.
    await supabase.auth.signOut({ scope: "local" });
  }
}
