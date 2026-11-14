import { FlaskConical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Marks any block that renders fictitious data. Always show it next to demo content. */
export function DemoBadge({ className, label = "Données de démonstration" }: { className?: string; label?: string }) {
  return (
    <Badge variant="demo" className={cn("whitespace-nowrap", className)}>
      <FlaskConical className="size-3" />
      {label}
    </Badge>
  );
}
