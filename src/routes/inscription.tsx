import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Loader2, MailCheck, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthShell, FieldError, FormAlert } from "@/components/aida/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage, fieldErrors, signupSchema, type FieldErrors } from "@/lib/auth/validation";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/inscription")({
  head: () =>
    pageHead("Créer un compte", "Créez votre compte AÏDA pour gérer l'identification, la traçabilité et la santé de vos animaux."),
  component: InscriptionPage,
});

const FIELDS = [
  { name: "fullName", label: "Nom complet", type: "text", autoComplete: "name", placeholder: "Awa Koné" },
  { name: "email", label: "Adresse e-mail", type: "email", autoComplete: "email", placeholder: "nom@exemple.ci" },
  { name: "phone", label: "Numéro de téléphone", type: "tel", autoComplete: "tel", placeholder: "+225 07 00 00 00 00" },
  { name: "password", label: "Mot de passe", type: "password", autoComplete: "new-password", placeholder: "8 caractères minimum" },
  { name: "confirmPassword", label: "Confirmation du mot de passe", type: "password", autoComplete: "new-password", placeholder: "••••••••" },
] as const;

function InscriptionPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse(Object.fromEntries(FIELDS.map((f) => [f.name, form.get(f.name) ?? ""])));
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { fullName, email, phone, password } = parsed.data;
    try {
      // Only profile fields go in metadata; the database trigger creates the profile and
      // never reads a role from it. Privileged roles are granted by an administrator only.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: `${window.location.origin}/connexion`,
        },
      });
      if (error) {
        setFormError(authErrorMessage(error));
        return;
      }
      if (data.user && data.user.identities?.length === 0) {
        setFormError(authErrorMessage({ code: "user_already_exists" }));
        return;
      }
      if (data.session) {
        await router.navigate({ to: "/app", replace: true });
        return;
      }
      setSentTo(email);
    } catch (err) {
      setFormError(authErrorMessage(err as Error));
    } finally {
      setSubmitting(false);
    }
  }

  if (sentTo) {
    return (
      <AuthShell title="Compte créé" subtitle="Plus qu'une étape pour activer votre accès.">
        <div className="mt-6 rounded-2xl border bg-secondary/60 p-5" role="status">
          <MailCheck className="size-6 text-primary" />
          <p className="mt-3 font-semibold">Confirmez votre adresse e-mail</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Un lien de confirmation a été envoyé à <span className="font-semibold text-foreground">{sentTo}</span>.
            Ouvrez-le pour activer votre compte, puis connectez-vous.
          </p>
        </div>
        <Button asChild variant="hero" className="mt-6 h-11 w-full">
          <Link to="/connexion">Aller à la connexion</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Créer un compte" subtitle="Rejoignez AÏDA en quelques secondes.">
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        {formError && <FormAlert>{formError}</FormAlert>}
        <fieldset disabled={submitting} className="space-y-4">
          {FIELDS.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name}>{f.label}</Label>
              <Input
                id={f.name}
                name={f.name}
                type={f.type}
                autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                className="h-11"
                aria-invalid={Boolean(errors[f.name])}
                aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
              />
              <FieldError id={`${f.name}-error`} message={errors[f.name]} />
            </div>
          ))}
          <Button type="submit" variant="hero" className="h-11 w-full">
            {submitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
            {submitting ? "Création du compte…" : "Créer mon compte"}
          </Button>
        </fieldset>
        <p className="text-xs text-muted-foreground">
          Les rôles (propriétaire, vétérinaire, administrateur…) sont attribués ensuite par un
          responsable d'élevage ou un administrateur.
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link to="/connexion" className="font-semibold text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
