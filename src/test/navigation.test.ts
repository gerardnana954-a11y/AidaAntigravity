import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { ALL_NAV_ITEMS, MOBILE_TABS } from "@/config/navigation";
import { routeTree } from "@/routeTree.gen";

describe("Navigation AÏDA", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it.each(["/", "/connexion", "/inscription", "/app/acces-refuse", ...ALL_NAV_ITEMS.map((i) => i.to)])("la page %s existe", (path) => {
    const last = router.matchRoutes(path).at(-1);
    expect(last?.routeId).not.toBe(rootRouteId);
  });

  it("couvre les 11 modules de l'application et les 6 écrans d'administration", () => {
    expect(ALL_NAV_ITEMS.filter((i) => !i.to.startsWith("/app/admin"))).toHaveLength(11);
    expect(ALL_NAV_ITEMS.filter((i) => i.to.startsWith("/app/admin"))).toHaveLength(6);
  });

  it("propose 4 onglets sur mobile", () => {
    expect(MOBILE_TABS).toHaveLength(4);
  });
});
