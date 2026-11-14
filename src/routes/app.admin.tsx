import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { accessQueryOptions } from "@/lib/auth/access-query";
import { isAdmin } from "@/lib/auth/roles";

export const Route = createFileRoute("/app/admin")({
  beforeLoad: async ({ context }) => {
    // Always ask the server (staleTime 0): a revoked admin loses access on the next visit.
    const access = await context.queryClient
      .fetchQuery({ ...accessQueryOptions(context.user.id), staleTime: 0 })
      .catch(() => null);
    if (!isAdmin(access)) throw redirect({ to: "/app/acces-refuse", replace: true });
  },
  component: Outlet,
});
