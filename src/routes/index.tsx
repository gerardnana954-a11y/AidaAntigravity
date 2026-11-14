import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Bot,
  FileBadge2,
  Fingerprint,
  HeartPulse,
  MapPin,
  PawPrint,
  Route as RouteIcon,
  Satellite,
  ShieldCheck,
  Warehouse,
} from "lucide-react";

import heroImage from "@/assets/hero-elevage.jpg";
import { CivMap } from "@/components/aida/CivMap";
import { DemoBadge } from "@/components/aida/DemoBadge";
import { Logo, LogoMark } from "@/components/aida/Logo";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "AÏDA",
      "AÏDA modernise l'identification, la traçabilité et la surveillance sanitaire des bovins, ovins, caprins et porcins en Afrique. Pays pilote : Côte d'Ivoire.",
    ),
  component: Landing,
});

const PILLARS = [
  {
    icon: Fingerprint,
    code: "BIO-ID",
    title: "Identification",
    text: "Une identité unique et durable pour chaque animal, reliée à son élevage et à son propriétaire.",
  },
  {
    icon: RouteIcon,
    code: "TRACE",
    title: "Traçabilité",
    text: "Naissances, mouvements, ventes et transferts : l'historique complet, du pâturage au marché.",
  },
  {
    icon: HeartPulse,
    code: "HEALTH AI",
    title: "Intelligence sanitaire",
    text: "Signalements, vérifications vétérinaires et alertes pour réagir plus tôt face aux maladies.",
  },
];

const FEATURES = [
  { icon: PawPrint, title: "Registre des animaux", text: "Fiche complète par animal : espèce, race, âge, statut." },
  { icon: Warehouse, title: "Gestion des élevages", text: "Exploitations, éleveurs, coopératives et effectifs." },
  { icon: FileBadge2, title: "Passeports numériques", text: "Un document vérifiable qui accompagne l'animal." },
  { icon: Bell, title: "Alertes sanitaires", text: "Signaler, vérifier et suivre chaque cas suspect." },
  { icon: Satellite, title: "SAT-TRACK", text: "Vue cartographique des élevages et des zones à surveiller." },
  { icon: Bot, title: "Assistant AÏDA", text: "Des réponses claires aux questions du quotidien." },
  { icon: ShieldCheck, title: "Administration", text: "Rôles, validations et journal des activités." },
  { icon: MapPin, title: "Pensé pour le terrain", text: "Mobile d'abord, lisible en plein soleil, en français." },
];

const ACRONYM = [
  { letter: "A", word: "Assistant" },
  { letter: "I", word: "Intelligent pour l'Identification" },
  { letter: "D", word: "la Détection" },
  { letter: "A", word: "et l'Analyse de l'élevage" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link to="/" aria-label="AÏDA">
            <Logo tone="light" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-night-foreground/80 md:flex">
            <a href="#piliers" className="transition-colors hover:text-night-foreground">Piliers</a>
            <a href="#fonctionnalites" className="transition-colors hover:text-night-foreground">Fonctionnalités</a>
            <a href="#pilote" className="transition-colors hover:text-night-foreground">Côte d'Ivoire</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="glass" size="sm" className="hidden sm:inline-flex">
              <Link to="/connexion">Connexion</Link>
            </Button>
            <Button asChild variant="hero" size="sm">
              <Link to="/inscription">Commencer</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-night">
        <img
          src={heroImage}
          alt="Troupeau de zébus et de chèvres au pâturage dans la savane ivoirienne"
          width={1600}
          height={1104}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-32 md:px-8 md:pb-28 md:pt-40 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="animate-rise max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-night-foreground/20 bg-night-foreground/10 px-3 py-1 text-xs font-semibold text-night-foreground backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-primary-glow" />
              Pays pilote : Côte d'Ivoire
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] text-night-foreground sm:text-5xl md:text-6xl">
              L'intelligence au service de l'élevage africain.
            </h1>
            <p className="mt-6 max-w-xl text-base text-night-foreground/80 md:text-lg">
              AÏDA réunit l'identification, la traçabilité et la surveillance sanitaire des bovins,
              ovins, caprins et porcins sur une seule plateforme, pensée pour le terrain.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/inscription">
                  Commencer <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/connexion">Connexion</Link>
              </Button>
            </div>
          </div>

          {/* Passport preview card */}
          <div className="hidden animate-rise justify-self-end [animation-delay:150ms] lg:block">
            <div className="w-80 rounded-3xl border border-night-foreground/15 bg-night/70 p-5 text-night-foreground shadow-elevated backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-glow">
                  Passeport numérique
                </span>
                <DemoBadge label="Exemple" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-night-foreground/10">
                  <PawPrint className="size-6 text-primary-glow" />
                </span>
                <div>
                  <p className="font-display text-lg font-bold">DEMO-BV-0001</p>
                  <p className="text-xs text-night-muted">Bovin · Zébu Peul · Femelle</p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
                {[
                  ["Élevage", "Korhogo"],
                  ["Statut", "Actif"],
                  ["Dernier mouvement", "—"],
                  ["Suivi sanitaire", "—"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-night-foreground/5 p-2.5">
                    <dt className="text-night-muted">{k}</dt>
                    <dd className="mt-0.5 font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Acronym */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-px px-5 md:grid-cols-4 md:px-8">
          {ACRONYM.map((a, i) => (
            <div key={i} className="flex items-baseline gap-3 py-6 md:py-8">
              <span className="font-display text-4xl font-extrabold text-primary">{a.letter}</span>
              <span className="text-sm font-medium text-muted-foreground">{a.word}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section id="piliers" className="mx-auto max-w-7xl scroll-mt-8 px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Trois piliers</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Connaître chaque animal, suivre chaque mouvement, protéger chaque troupeau.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <article
              key={p.code}
              className="group relative overflow-hidden rounded-3xl border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
            >
              <span className="absolute right-6 top-6 font-display text-6xl font-extrabold text-secondary transition-colors group-hover:text-primary/15">
                0{i + 1}
              </span>
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-emerald text-primary-foreground shadow-glow">
                <p.icon className="size-6" />
              </span>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-primary">{p.code}</p>
              <h3 className="mt-1 text-xl font-bold">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="scroll-mt-8 bg-gradient-night text-night-foreground">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-glow">Fonctionnalités</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">Une plateforme complète, des modules clairs.</h2>
            </div>
            <Button asChild variant="hero" size="lg">
              <Link to="/app">
                Explorer la plateforme <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-sidebar-border bg-sidebar-border sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-night p-6 transition-colors hover:bg-night-soft">
                <f.icon className="size-6 text-primary-glow" />
                <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-night-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilot */}
      <section id="pilote" className="mx-auto grid max-w-7xl scroll-mt-8 items-center gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Pays pilote</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Déployé d'abord en Côte d'Ivoire.</h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Du Poro au Tonkpi, AÏDA accompagne éleveurs, agents de terrain et vétérinaires avec un
            outil commun, conçu pour les réalités locales.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Bovins", "Ovins", "Caprins", "Porcins"].map((s) => (
              <span key={s} className="rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-secondary-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="relative rounded-3xl border bg-card p-6 shadow-soft bg-dots">
          <CivMap className="mx-auto max-w-md" />
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-emerald p-8 text-primary-foreground shadow-glow md:flex-row md:items-center md:p-12">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Prêt à découvrir AÏDA ?</h2>
            <p className="mt-2 text-primary-foreground/80">Parcourez les modules avec des données de démonstration.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="night" size="xl">
              <Link to="/inscription">Commencer</Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/connexion">Connexion</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground md:flex-row md:px-8">
          <span className="inline-flex items-center gap-2">
            <LogoMark className="size-7" />
            <span className="font-display font-bold text-foreground">AÏDA</span>
          </span>
          <p>L'intelligence au service de l'élevage africain.</p>
          <p>© {new Date().getFullYear()} AÏDA</p>
        </div>
      </footer>
    </div>
  );
}
