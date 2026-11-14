import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { LogoMark } from "@/components/aida/Logo";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  // The session lives in browser storage, so the guard can only run in the browser.
  ssr: false,
  beforeLoad: async ({ location }) => {
    // getUser() re-validates the token with Supabase Auth instead of trusting local storage.
    const { data, error } = await supabase.auth.getUser();
    if (data.user) return { user: data.user };

    const { data: local } = await supabase.auth.getSession();
    const expired = Boolean(local.session) || (error != null && error.name !== "AuthSessionMissingError");
    if (local.session) await supabase.auth.signOut({ scope: "local" });
    throw redirect({
      to: "/connexion",
      search: { redirect: location.href, ...(expired ? { raison: "session-expiree" as const } : {}) },
      replace: true,
    });
  },
  pendingMs: 150,
  pendingComponent: AppLoading,
  component: AppLayout,
});

function AppLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background" role="status">
      <LogoMark className="size-12" />
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Vérification de votre session…
      </p>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-64">
        <AppTopbar />
        <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 md:px-8 md:pt-8 lg:pb-12">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
