import type { ReactNode } from "react";

import { DemoBadge } from "./DemoBadge";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  demo?: boolean;
};

export function PageHeader({ eyebrow, title, description, actions, demo }: PageHeaderProps) {
  return (
    <header className="flex animate-rise flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {eyebrow && (
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</span>
          )}
          {demo && <DemoBadge />}
        </div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
        {description && <p className="text-sm text-muted-foreground md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
