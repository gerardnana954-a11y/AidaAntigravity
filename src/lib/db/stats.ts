import type { DbAnimalStatus, DbSex, DbSpecies } from "./labels";

export type HerdStatRow = {
  farm_id: string;
  species: DbSpecies;
  sex: DbSex;
  status: DbAnimalStatus;
  breed: string | null;
  total: number;
};

export type HerdSummary = {
  /** Every registered animal, whatever its status. */
  registered: number;
  /** Animals currently alive (the actual headcount). */
  alive: number;
  bySpecies: Record<DbSpecies, number>;
  bySex: Record<DbSex, number>;
  byStatus: Record<DbAnimalStatus, number>;
  /** Alive headcount per farm. */
  aliveByFarm: Record<string, number>;
  breeds: string[];
};

/** Aggregates herd_stats() rows. Species and sex counts only include living animals. */
export function summarizeHerd(rows: HerdStatRow[], farmId?: string): HerdSummary {
  const s: HerdSummary = {
    registered: 0,
    alive: 0,
    bySpecies: { bovine: 0, ovine: 0, caprine: 0, porcine: 0 },
    bySex: { female: 0, male: 0, unknown: 0 },
    byStatus: { alive: 0, sold: 0, deceased: 0, missing: 0 },
    aliveByFarm: {},
    breeds: [],
  };
  const breeds = new Set<string>();
  for (const r of rows) {
    if (farmId && r.farm_id !== farmId) continue;
    const n = Number(r.total) || 0;
    s.registered += n;
    s.byStatus[r.status] += n;
    if (r.breed?.trim()) breeds.add(r.breed.trim());
    if (r.status !== "alive") continue;
    s.alive += n;
    s.bySpecies[r.species] += n;
    s.bySex[r.sex] += n;
    s.aliveByFarm[r.farm_id] = (s.aliveByFarm[r.farm_id] ?? 0) + n;
  }
  s.breeds = [...breeds].sort((a, b) => a.localeCompare(b, "fr"));
  return s;
}
