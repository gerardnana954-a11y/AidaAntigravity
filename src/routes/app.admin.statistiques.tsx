import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { GrowthChart } from "@/components/aida/GrowthChart";
import { PageHeader } from "@/components/aida/PageHeader";
import { SectionCard } from "@/components/aida/SectionCard";
import { DEMO_REGIONS, DEMO_SPECIES_SPLIT, fmt } from "@/data/demo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/admin/statistiques")({
  head: () => pageHead("Statistiques", "Indicateurs clés du cheptel et des élevages suivis par AÏDA."),
  component: StatistiquesPage,
});

const tooltipStyle = { borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 };
const tick = { fontSize: 12, fill: "var(--color-muted-foreground)" };

function StatistiquesPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Statistiques" description="Indicateurs du cheptel par espèce, par région et dans le temps." demo />

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Répartition par espèce" demo>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DEMO_SPECIES_SPLIT} dataKey="value" nameKey="species" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                  {DEMO_SPECIES_SPLIT.map((s) => (
                    <Cell key={s.species} fill={s.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt.format(v)} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {DEMO_SPECIES_SPLIT.map((s) => (
              <li key={s.species} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: s.fill }} />
                <span className="text-muted-foreground">{s.species}</span>
                <span className="ml-auto font-semibold">{fmt.format(s.value)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Animaux par région" demo className="xl:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_REGIONS} margin={{ left: -12, right: 4 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="region" tickLine={false} axisLine={false} tick={tick} />
                <YAxis tickLine={false} axisLine={false} tick={tick} tickFormatter={(v) => fmt.format(v)} />
                <Tooltip formatter={(v: number) => [fmt.format(v), "Animaux"]} contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="animals" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Évolution mensuelle" demo>
        <GrowthChart height={300} />
      </SectionCard>
    </div>
  );
}
