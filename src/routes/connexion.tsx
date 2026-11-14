import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { AuthShell, FieldError, FormAlert } from "@/components/aida/AuthShell";
import { ModuleNotice } from "@/components/aida/ModuleNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { safeRedirect } from "@/lib/auth/roles";
import { authErrorMessage, fieldErrors, loginSchema, type FieldErrors } from "@/lib/auth/validation";
import { pageHead } from "@/lib/seo";

type ConnexionSearch = { redirect?: string | undefined; raison?: "session-expiree" | undefined };

export const Route = createFileRoute("/connexion")({
  validateSearch: (search: Record<string, unknown>): ConnexionSearch => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
    raison: search["raison"] === "session-expiree" ? "session-expiree" : undefined,
  }),
  head: () =>
    pageHead("Connexion", "Connectez-vous à votre espace AÏDA : éleveurs, agents de terrain, vétérinaires et administrateurs."),
  component: ConnexionPage,
});

function ConnexionPage() {
  const search = Route.useSearch();
  const router = useRouter();
  const target = safeRedirect(search.redirect);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  // Already signed in (or just back from the confirmation e-mail link): go straight in.
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) void router.navigate({ href: target, replace: true });
      else setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [router, target]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        setFormError(authErrorMessage(error));
        return;
      }
      await router.navigate({ href: target, replace: true });
    } catch (err) {
      setFormError(authErrorMessage(err as Error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Connexion" subtitle="Accédez à votre espace AÏDA.">
      {search.raison === "session-expiree" && (
        <ModuleNotice title="Session expirée" className="mt-6">
          Pour votre sécurité, vous avez été déconnecté. Reconnectez-vous pour continuer.
        </ModuleNotice>
      )}

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        {formError && <FormAlert>{formError}</FormAlert>}
        <fieldset disabled={submitting || checking} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="nom@exemple.ci"
              className="h-11"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            <FieldError id="email-error" message={errors.email} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <FieldError id="password-error" message={errors.password} />
          </div>
          <Button type="submit" variant="hero" className="h-11 w-full">
            {submitting ? <Loader2 className="animate-spin" /> : <Lock />}
            {submitting ? "Connexion…" : "Se connecter"}
          </Button>
        </fieldset>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link to="/inscription" className="font-semibold text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthShell>
  );
}
