/**
 * DONNÉES DE DÉMONSTRATION
 * Toutes les valeurs ci-dessous sont fictives et servent uniquement à illustrer l'interface.
 * Elles seront remplacées par les données réelles une fois le backend connecté.
 * Chaque identifiant est préfixé « DEMO- » pour éviter toute confusion.
 */

export type Species = "bovin" | "ovin" | "caprin" | "porcin";

export const SPECIES_LABEL: Record<Species, string> = {
  bovin: "Bovin",
  ovin: "Ovin",
  caprin: "Caprin",
  porcin: "Porcin",
};

export type DemoAnimal = {
  id: string;
  name: string;
  species: Species;
  breed: string;
  sex: "M" | "F";
  birth: string;
  farmId: string;
  status: "actif" | "en_observation" | "vendu";
  bioId: "non_enrolé" | "en_attente";
};

export type DemoFarm = {
  id: string;
  name: string;
  owner: string;
  region: string;
  city: string;
  species: Species[];
  headcount: number;
  status: "validé" | "en_attente";
};

export type AlertLevel = "élevée" | "moyenne" | "faible";

export type DemoAlert = {
  id: string;
  title: string;
  region: string;
  species: Species;
  level: AlertLevel;
  date: string;
  status: "à_vérifier" | "en_cours" | "clôturée";
};

export const DEMO_STATS = {
  animals: 12480,
  farms: 386,
  reports: 42,
  pendingAlerts: 7,
};

export const DEMO_GROWTH = [
  { month: "Jan", bovin: 4200, ovin: 2100, caprin: 1900, porcin: 800 },
  { month: "Fév", bovin: 4380, ovin: 2240, caprin: 2010, porcin: 840 },
  { month: "Mar", bovin: 4510, ovin: 2380, caprin: 2150, porcin: 880 },
  { month: "Avr", bovin: 4690, ovin: 2460, caprin: 2290, porcin: 910 },
  { month: "Mai", bovin: 4820, ovin: 2590, caprin: 2400, porcin: 960 },
  { month: "Juin", bovin: 5010, ovin: 2700, caprin: 2560, porcin: 1010 },
  { month: "Juil", bovin: 5160, ovin: 2820, caprin: 2680, porcin: 1040 },
  { month: "Août", bovin: 5240, ovin: 2950, caprin: 2810, porcin: 1080 },
  { month: "Sep", bovin: 5390, ovin: 3020, caprin: 2930, porcin: 1110 },
  { month: "Oct", bovin: 5480, ovin: 3110, caprin: 3040, porcin: 850 },
];

export const DEMO_SPECIES_SPLIT = [
  { species: "Bovins", value: 5480, fill: "var(--color-chart-1)" },
  { species: "Ovins", value: 3110, fill: "var(--color-chart-2)" },
  { species: "Caprins", value: 3040, fill: "var(--color-chart-3)" },
  { species: "Porcins", value: 850, fill: "var(--color-chart-4)" },
];

export const DEMO_REGIONS = [
  { region: "Poro", animals: 3120 },
  { region: "Tchologo", animals: 2240 },
  { region: "Gbêkê", animals: 1870 },
  { region: "Bagoué", animals: 1610 },
  { region: "Tonkpi", animals: 1180 },
  { region: "Gontougo", animals: 1040 },
  { region: "Autres", animals: 1420 },
];

export const DEMO_FARMS: DemoFarm[] = [
  {
    id: "DEMO-EL-001",
    name: "Ferme Sinématiali (démo)",
    owner: "Éleveur démo A",
    region: "Poro",
    city: "Korhogo",
    species: ["bovin", "ovin"],
    headcount: 214,
    status: "validé",
  },
  {
    id: "DEMO-EL-002",
    name: "Parc de Ferkessédougou (démo)",
    owner: "Coopérative démo B",
    region: "Tchologo",
    city: "Ferkessédougou",
    species: ["bovin", "caprin"],
    headcount: 168,
    status: "validé",
  },
  {
    id: "DEMO-EL-003",
    name: "Bergerie de Bouaké (démo)",
    owner: "Éleveur démo C",
    region: "Gbêkê",
    city: "Bouaké",
    species: ["ovin", "caprin"],
    headcount: 92,
    status: "en_attente",
  },
  {
    id: "DEMO-EL-004",
    name: "Porcherie d'Azaguié (démo)",
    owner: "Éleveur démo D",
    region: "Agnéby-Tiassa",
    city: "Azaguié",
    species: ["porcin"],
    headcount: 140,
    status: "validé",
  },
  {
    id: "DEMO-EL-005",
    name: "Élevage de Man (démo)",
    owner: "Groupement démo E",
    region: "Tonkpi",
    city: "Man",
    species: ["bovin", "caprin"],
    headcount: 76,
    status: "en_attente",
  },
  {
    id: "DEMO-EL-006",
    name: "Ranch d'Odienné (démo)",
    owner: "Éleveur démo F",
    region: "Kabadougou",
    city: "Odienné",
    species: ["bovin"],
    headcount: 188,
    status: "validé",
  },
];

export const DEMO_ANIMALS: [DemoAnimal, ...DemoAnimal[]] = [
  { id: "DEMO-BV-0001", name: "Animal démo 1", species: "bovin", breed: "Zébu Peul", sex: "F", birth: "2022-03-14", farmId: "DEMO-EL-001", status: "actif", bioId: "non_enrolé" },
  { id: "DEMO-BV-0002", name: "Animal démo 2", species: "bovin", breed: "N'Dama", sex: "M", birth: "2021-11-02", farmId: "DEMO-EL-002", status: "en_observation", bioId: "en_attente" },
  { id: "DEMO-OV-0003", name: "Animal démo 3", species: "ovin", breed: "Djallonké", sex: "F", birth: "2023-06-21", farmId: "DEMO-EL-003", status: "actif", bioId: "non_enrolé" },
  { id: "DEMO-CP-0004", name: "Animal démo 4", species: "caprin", breed: "Chèvre naine d'Afrique de l'Ouest", sex: "F", birth: "2023-01-09", farmId: "DEMO-EL-002", status: "actif", bioId: "non_enrolé" },
  { id: "DEMO-PC-0005", name: "Animal démo 5", species: "porcin", breed: "Large White", sex: "M", birth: "2024-02-18", farmId: "DEMO-EL-004", status: "vendu", bioId: "non_enrolé" },
  { id: "DEMO-BV-0006", name: "Animal démo 6", species: "bovin", breed: "Baoulé", sex: "F", birth: "2020-08-30", farmId: "DEMO-EL-005", status: "actif", bioId: "en_attente" },
  { id: "DEMO-OV-0007", name: "Animal démo 7", species: "ovin", breed: "Sahélien", sex: "M", birth: "2022-12-05", farmId: "DEMO-EL-001", status: "actif", bioId: "non_enrolé" },
  { id: "DEMO-CP-0008", name: "Animal démo 8", species: "caprin", breed: "Chèvre du Sahel", sex: "M", birth: "2023-09-12", farmId: "DEMO-EL-005", status: "en_observation", bioId: "non_enrolé" },
];

export const DEMO_ALERTS: DemoAlert[] = [
  { id: "DEMO-AL-101", title: "Toux et fièvre signalées sur plusieurs bovins", region: "Poro", species: "bovin", level: "élevée", date: "2026-11-10", status: "à_vérifier" },
  { id: "DEMO-AL-102", title: "Baisse d'appétit dans une bergerie", region: "Gbêkê", species: "ovin", level: "moyenne", date: "2026-11-09", status: "en_cours" },
  { id: "DEMO-AL-103", title: "Lésions cutanées observées", region: "Tchologo", species: "caprin", level: "moyenne", date: "2026-11-07", status: "à_vérifier" },
  { id: "DEMO-AL-104", title: "Mortalité inhabituelle signalée", region: "Agnéby-Tiassa", species: "porcin", level: "élevée", date: "2026-11-05", status: "en_cours" },
  { id: "DEMO-AL-105", title: "Boiterie isolée", region: "Tonkpi", species: "bovin", level: "faible", date: "2026-11-02", status: "clôturée" },
];

export const DEMO_ACTIVITY = [
  { who: "Agent démo", action: "a enregistré 12 nouveaux animaux", target: "Ferme Sinématiali (démo)", when: "Il y a 2 h" },
  { who: "Vétérinaire démo", action: "a ouvert une vérification", target: "DEMO-AL-101", when: "Il y a 5 h" },
  { who: "Éleveur démo C", action: "a demandé la validation de son élevage", target: "Bergerie de Bouaké (démo)", when: "Hier" },
  { who: "Agent démo", action: "a déclaré un mouvement de 8 bovins", target: "Korhogo → Bouaké", when: "Hier" },
  { who: "Administrateur démo", action: "a créé un compte vétérinaire", target: "Région Tchologo", when: "Il y a 2 j" },
];

/** Map markers expressed with city keys from src/lib/geo-civ.ts. */
export const DEMO_MAP_POINTS: { city: string; kind: "élevage" | "alerte"; label: string }[] = [
  { city: "Korhogo", kind: "élevage", label: "Ferme Sinématiali (démo)" },
  { city: "Ferkessédougou", kind: "élevage", label: "Parc de Ferkessédougou (démo)" },
  { city: "Bouaké", kind: "élevage", label: "Bergerie de Bouaké (démo)" },
  { city: "Man", kind: "élevage", label: "Élevage de Man (démo)" },
  { city: "Odienné", kind: "élevage", label: "Ranch d'Odienné (démo)" },
  { city: "Abidjan", kind: "élevage", label: "Porcherie d'Azaguié (démo)" },
  { city: "Korhogo", kind: "alerte", label: "DEMO-AL-101" },
  { city: "Bondoukou", kind: "alerte", label: "DEMO-AL-103" },
];

export const DEMO_MOVEMENTS = [
  { id: "DEMO-MV-01", from: "Korhogo", to: "Bouaké", count: 8, species: "bovin" as Species, date: "2026-11-11", reason: "Vente au marché" },
  { id: "DEMO-MV-02", from: "Ferkessédougou", to: "Korhogo", count: 15, species: "ovin" as Species, date: "2026-11-08", reason: "Transhumance" },
  { id: "DEMO-MV-03", from: "Man", to: "Daloa", count: 4, species: "caprin" as Species, date: "2026-11-04", reason: "Transfert d'élevage" },
  { id: "DEMO-MV-04", from: "Bouaké", to: "Abidjan", count: 20, species: "bovin" as Species, date: "2026-10-29", reason: "Abattoir" },
];

export const DEMO_USERS = [
  { id: "DEMO-US-01", name: "Administrateur démo", email: "admin@demo.aida", role: "Administrateur", region: "National", status: "actif" },
  { id: "DEMO-US-02", name: "Vétérinaire démo", email: "veto@demo.aida", role: "Vétérinaire", region: "Poro", status: "actif" },
  { id: "DEMO-US-03", name: "Agent démo", email: "agent@demo.aida", role: "Agent de terrain", region: "Gbêkê", status: "actif" },
  { id: "DEMO-US-04", name: "Éleveur démo C", email: "eleveur@demo.aida", role: "Éleveur", region: "Gbêkê", status: "invité" },
  { id: "DEMO-US-05", name: "Coopérative démo B", email: "coop@demo.aida", role: "Éleveur", region: "Tchologo", status: "suspendu" },
];

export const DEMO_LOG = [
  { at: "2026-11-12 18:42", who: "Agent démo", action: "Création", object: "Animal DEMO-BV-0001" },
  { at: "2026-11-12 16:10", who: "Vétérinaire démo", action: "Mise à jour", object: "Alerte DEMO-AL-102" },
  { at: "2026-11-12 11:05", who: "Administrateur démo", action: "Validation", object: "Élevage DEMO-EL-002" },
  { at: "2026-11-11 17:30", who: "Agent démo", action: "Déclaration", object: "Mouvement DEMO-MV-01" },
  { at: "2026-11-11 09:14", who: "Administrateur démo", action: "Invitation", object: "Utilisateur DEMO-US-04" },
  { at: "2026-11-10 15:51", who: "Vétérinaire démo", action: "Ouverture", object: "Alerte DEMO-AL-101" },
];

export function farmName(id: string) {
  return DEMO_FARMS.find((f) => f.id === id)?.name ?? id;
}

export const fmt = new Intl.NumberFormat("fr-FR");
