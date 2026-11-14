import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "emerald" | "night" | "warning" | "danger";

const toneStyles: Record<Tone, string> = {
  emerald: "bg-secondary text-secondary-foreground",
  night: "bg-night text-night-foreground",
  warning: "bg-warning-soft text-warning-foreground",
  danger: "bg-destructive-soft text-destructive",
};

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
};

export function StatCard({ label, value, hint, icon: Icon, tone = "emerald", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-elevated",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("inline-flex size-10 items-center justify-center rounded-xl", toneStyles[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
