import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** "light" for dark surfaces (sidebar, hero). */
  tone?: "default" | "light";
  showTagline?: boolean;
};

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-emerald shadow-glow",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="size-5 text-primary-foreground" fill="none">
        <path
          d="M16 4c5.5 3.2 9 8 9 13.2C25 23 21 27 16 27S7 23 7 17.2C7 12 10.5 7.2 16 4Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M16 11v16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path
          d="M16 17.5c-2.6 0-4.4-1.4-5-3.4M16 21.5c2.6 0 4.4-1.4 5-3.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Logo({ className, tone = "default", showTagline = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-xl font-bold tracking-tight",
            tone === "light" ? "text-night-foreground" : "text-foreground",
          )}
        >
          AÏDA
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 text-[10px] font-medium uppercase tracking-[0.14em]",
              tone === "light" ? "text-night-muted" : "text-muted-foreground",
            )}
          >
            Élevage intelligent
          </span>
        )}
      </span>
    </span>
  );
}
