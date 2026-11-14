import { CIV_CITIES, CIV_PATH, CIV_VIEWBOX } from "@/lib/geo-civ";
import { cn } from "@/lib/utils";

export type MapPoint = { city: string; kind: "élevage" | "alerte"; label: string };

type CivMapProps = {
  points?: MapPoint[];
  showCities?: boolean;
  className?: string;
};

/** Simplified Côte d'Ivoire map. Points are positioned on city anchors only. */
export function CivMap({ points = [], showCities = true, className }: CivMapProps) {
  return (
    <svg viewBox={CIV_VIEWBOX} className={cn("h-auto w-full overflow-visible", className)} role="img" aria-label="Carte de la Côte d'Ivoire">
      <defs>
        <linearGradient id="civ-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-secondary)" />
          <stop offset="100%" stopColor="var(--color-card)" />
        </linearGradient>
        <pattern id="civ-dots" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--color-primary)" opacity="0.18" />
        </pattern>
      </defs>
      <path d={CIV_PATH} fill="url(#civ-fill)" stroke="var(--color-primary)" strokeOpacity="0.45" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={CIV_PATH} fill="url(#civ-dots)" />

      {showCities &&
        Object.entries(CIV_CITIES).map(([name, [x, y]]) => (
          <g key={name}>
            <circle cx={x} cy={y} r="2" fill="var(--color-muted-foreground)" opacity="0.6" />
            <text
              x={x > 330 || name === "Korhogo" ? x - 6 : x + 6}
              y={y + 3}
              textAnchor={x > 330 || name === "Korhogo" ? "end" : "start"}
              fontSize="10" fill="var(--color-muted-foreground)" fontFamily="var(--font-sans)">
              {name}
            </text>
          </g>
        ))}

      {points.map((p, i) => {
        const pos = CIV_CITIES[p.city];
        if (!pos) return null;
        const offset = p.kind === "alerte" ? 7 : 0;
        const x = pos[0] - offset;
        const y = pos[1] - offset;
        const color = p.kind === "alerte" ? "var(--color-destructive)" : "var(--color-primary)";
        return (
          <g key={`${p.label}-${i}`}>
            <title>{p.label}</title>
            <circle cx={x} cy={y} r="7" fill={color} opacity="0.35" className="animate-pulse-ring" />
            <circle cx={x} cy={y} r="5.5" fill={color} stroke="var(--color-card)" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-primary" /> Élevage
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-destructive" /> Alerte sanitaire
      </span>
    </div>
  );
}
