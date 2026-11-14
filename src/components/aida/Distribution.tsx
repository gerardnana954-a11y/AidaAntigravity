import { numberFmt } from "@/lib/db/labels";

/** Horizontal bars for a small categorical breakdown (real counts only). */
export function Distribution({ items, emptyLabel = "Aucune donnée" }: { items: { label: string; value: number }[]; emptyLabel?: string }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  return (
    <ul className="space-y-3">
      {items.map((i) => {
        const pct = Math.round((i.value / total) * 100);
        return (
          <li key={i.label}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{i.label}</span>
              <span className="text-muted-foreground">
                {numberFmt.format(i.value)} · {pct} %
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
