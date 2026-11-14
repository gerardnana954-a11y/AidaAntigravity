import type { ReactNode } from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

/** Honest banner for modules whose engine is not connected yet. */
export function ModuleNotice({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-info/20 bg-info-soft px-4 py-3.5 text-sm",
        className,
      )}
      role="note"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-info" />
      <div className="space-y-0.5">
        <p className="font-semibold text-foreground">{title}</p>
        {children && <div className="text-muted-foreground">{children}</div>}
      </div>
    </div>
  );
}
