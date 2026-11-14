import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { DemoBadge } from "./DemoBadge";

type SectionCardProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  demo?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

export function SectionCard({
  title,
  description,
  action,
  demo,
  className,
  bodyClassName,
  children,
}: SectionCardProps) {
  return (
    <section
      className={cn("rounded-2xl border bg-card text-card-foreground shadow-soft", className)}
    >
      {(title || action || demo) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
          <div className="space-y-0.5">
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {demo && <DemoBadge />}
            {action}
          </div>
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
