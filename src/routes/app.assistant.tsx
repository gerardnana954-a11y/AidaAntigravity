import { createFileRoute } from "@tanstack/react-router";
import { Bot, Send, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";

import { LogoMark } from "@/components/aida/Logo";
import { PageHeader } from "@/components/aida/PageHeader";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/assistant")({
  head: () => pageHead("Assistant AÏDA", "L'assistant AÏDA répond aux questions des éleveurs et des agents de terrain."),
  component: AssistantPage,
});

type Message = { role: "user" | "system"; text: string };

const SUGGESTIONS = [
  "Comment enregistrer un nouvel animal ?",
  "Quels signes doivent m'alerter chez un bovin ?",
  "Comment déclarer un mouvement vers un marché ?",
];

function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: t },
      { role: "system", text: "L'assistant AÏDA n'est pas encore connecté. Votre question n'a pas été traitée." },
    ]);
    setDraft("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(draft);
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Outils" title="Assistant AÏDA" description="Posez vos questions sur l'élevage, la santé animale et l'utilisation de la plateforme." />

      <div className="flex min-h-[520px] flex-col overflow-hidden rounded-3xl border bg-card shadow-soft">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 md:p-8">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-lg flex-col items-center py-10 text-center">
              <LogoMark className="size-14 rounded-2xl" />
              <h2 className="mt-5 text-xl font-bold">Comment puis-je vous aider ?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                L'assistant sera bientôt connecté. Voici le type de questions auxquelles il répondra.
              </p>
              <div className="mt-6 grid w-full gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-secondary"
                  >
                    <Sparkles className="size-4 shrink-0 text-primary" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
                {m.role === "system" && (
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Bot className="size-4 text-muted-foreground" />
                  </span>
                )}
                <p
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                    m.role === "user" ? "bg-night text-night-foreground" : "border border-dashed bg-muted/50 italic text-muted-foreground",
                  )}
                >
                  {m.text}
                </p>
              </div>
            ))
          )}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2 border-t bg-background p-3 md:p-4">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Écrivez votre question…"
            className="h-11 flex-1 rounded-xl border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            aria-label="Votre question"
          />
          <Button type="submit" variant="hero" size="icon" className="size-11" aria-label="Envoyer" disabled={!draft.trim()}>
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}
