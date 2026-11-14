import { useQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";

import { accessQueryOptions } from "@/lib/auth/access-query";

/** Signed-in user (validated by the /app guard) plus server-provided profile and roles. */
export function useAccess() {
  const { user } = useRouteContext({ from: "/app" });
  const query = useQuery(accessQueryOptions(user.id));
  return { user, ...query };
}
