import { queryOptions, type QueryClient } from "@tanstack/react-query";

import { getAnimal, getAnimalDossier, getPhotoUrl, listAnimals, type AnimalFilters } from "./animals";
import { getFarm, getFarmTeam, getHerdStats, listFarms } from "./farms";

export const farmsQuery = () => queryOptions({ queryKey: ["farms", "list"], queryFn: listFarms });
export const farmQuery = (id: string) => queryOptions({ queryKey: ["farms", "detail", id], queryFn: () => getFarm(id) });
export const farmTeamQuery = (id: string) => queryOptions({ queryKey: ["farms", "team", id], queryFn: () => getFarmTeam(id) });
export const herdStatsQuery = (farmId?: string) =>
  queryOptions({ queryKey: ["herd-stats", farmId ?? "all"], queryFn: () => getHerdStats(farmId) });

export const animalsQuery = (filters: AnimalFilters) =>
  queryOptions({ queryKey: ["animals", "list", filters], queryFn: () => listAnimals(filters) });
export const animalQuery = (id: string) => queryOptions({ queryKey: ["animals", "detail", id], queryFn: () => getAnimal(id) });
export const animalDossierQuery = (id: string) =>
  queryOptions({ queryKey: ["animals", "dossier", id], queryFn: () => getAnimalDossier(id) });
export const photoQuery = (path: string) =>
  queryOptions({ queryKey: ["animal-photo", path], queryFn: () => getPhotoUrl(path), staleTime: 50 * 60_000 });

/** Refreshes every list, detail and statistic after a write. */
export async function refreshRegistry(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["farms"] }),
    queryClient.invalidateQueries({ queryKey: ["animals"] }),
    queryClient.invalidateQueries({ queryKey: ["herd-stats"] }),
    queryClient.invalidateQueries({ queryKey: ["auth", "access"] }),
  ]);
}
