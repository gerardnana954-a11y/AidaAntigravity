import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import heroImage from "@/assets/hero-elevage.jpg";
import { Logo } from "@/components/aida/Logo";
import { Button } from "@/components/ui/button";

/** Two-column frame shared by the sign-in and sign-up pages. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-night lg:block">
        <img src={heroImage} alt="" width={1600} height={1104} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative flex h-full flex-col justify-between p-10 text-night-foreground">
          <Link to="/">
            <Logo tone="light" showTagline />
          </Link>
          <blockquote className="max-w-md">
            <p className="font-display text-3xl font-bold leading-tight">L'intelligence au service de l'élevage africain.</p>
            <p className="mt-3 text-sm text-night-foreground/75">
              Identification, traçabilité et surveillance sanitaire, réunies sur une seule plateforme.
            </p>
          </blockquote>
        </div>
      </div>

      <div className="flex flex-col px-5 py-8 md:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="lg:hidden">
            <Logo />
          </Link>
          <Button asChild variant="ghost" size="sm" className="ml-auto">
            <Link to="/">
              <ArrowLeft /> Accueil
            </Link>
          </Button>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive-soft px-4 py-3 text-sm text-destructive">
      {children}
    </div>
  );
}
