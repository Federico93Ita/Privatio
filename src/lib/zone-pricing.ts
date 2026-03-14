import type { ZoneClass } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  Tipi e costanti                                                    */
/* ------------------------------------------------------------------ */

export type PlanKey =
  | "BASE"
  | "PREMIER_LOCAL"
  | "PREMIER_CITY"
  | "PREMIER_PRIME"
  | "PREMIER_ELITE";

/** Range prezzi mensili per piano (centesimi EUR) */
const PRICE_RANGES: Record<PlanKey, { min: number; max: number }> = {
  BASE:           { min: 20000, max: 30000 },    // €200–€300
  PREMIER_LOCAL:  { min: 39000, max: 69000 },    // €390–€690
  PREMIER_CITY:   { min: 69000, max: 110000 },   // €690–€1.100
  PREMIER_PRIME:  { min: 110000, max: 190000 },  // €1.100–€1.900
  PREMIER_ELITE:  { min: 180000, max: 300000 },  // €1.800–€3.000
};

/** Piani disponibili per ogni classe di zona */
const ZONE_CLASS_PLANS: Record<ZoneClass, PlanKey[]> = {
  CLUSTER_LOCAL:   ["BASE", "PREMIER_LOCAL"],
  COMUNE:          ["BASE", "PREMIER_LOCAL", "PREMIER_CITY"],
  MACROQUARTIERE:  ["PREMIER_LOCAL", "PREMIER_CITY", "PREMIER_PRIME"],
  MICROZONA_PRIME: ["PREMIER_PRIME", "PREMIER_ELITE"],
};

/** Slot partner default per classe di zona (max competitor per piano) */
const DEFAULT_SLOTS: Record<ZoneClass, Record<string, number>> = {
  CLUSTER_LOCAL: {
    maxBase: 6, maxLocal: 5, maxCity: 0, maxPrime: 0, maxElite: 0,
  },
  COMUNE: {
    maxBase: 6, maxLocal: 5, maxCity: 4, maxPrime: 0, maxElite: 0,
  },
  MACROQUARTIERE: {
    maxBase: 0, maxLocal: 5, maxCity: 4, maxPrime: 3, maxElite: 0,
  },
  MICROZONA_PRIME: {
    maxBase: 0, maxLocal: 0, maxCity: 0, maxPrime: 3, maxElite: 3,
  },
};

/* ------------------------------------------------------------------ */
/*  Calcolo marketScore                                                */
/* ------------------------------------------------------------------ */

export function calculateMarketScore(population: number, ntn: number): number {
  const popScore = Math.min(population / 50000, 1) * 4;
  const ntnScore = Math.min(ntn / 500, 1) * 4;
  const densityBonus =
    ntn > 0 && population > 0
      ? Math.min((ntn / population) * 1000, 2)
      : 0;
  return Math.round(
    Math.max(1, Math.min(10, popScore + ntnScore + densityBonus))
  );
}

/* ------------------------------------------------------------------ */
/*  Calcolo prezzo singolo                                             */
/* ------------------------------------------------------------------ */

export function calculateZonePrice(plan: PlanKey, marketScore: number): number {
  const range = PRICE_RANGES[plan];
  const factor = (Math.max(1, Math.min(10, marketScore)) - 1) / 9;
  // Arrotonda al centinaio di centesimi (= €1)
  return Math.round((range.min + factor * (range.max - range.min)) / 100) * 100;
}

/* ------------------------------------------------------------------ */
/*  Calcolo completo prezzi + slot per una zona                        */
/* ------------------------------------------------------------------ */

export interface ZonePricing {
  priceBase: number | null;
  priceLocal: number | null;
  priceCity: number | null;
  pricePrime: number | null;
  priceElite: number | null;
  maxBase: number;
  maxLocal: number;
  maxCity: number;
  maxPrime: number;
  maxElite: number;
}

export function calculateZonePricing(
  zoneClass: ZoneClass,
  marketScore: number
): ZonePricing {
  const availablePlans = ZONE_CLASS_PLANS[zoneClass];
  const slots = DEFAULT_SLOTS[zoneClass];

  // Eccezione: MACROQUARTIERE con marketScore basso ammette anche BASE
  const effectivePlans =
    zoneClass === "MACROQUARTIERE" && marketScore < 5
      ? ["BASE", ...availablePlans]
      : availablePlans;

  const price = (plan: PlanKey) =>
    effectivePlans.includes(plan)
      ? calculateZonePrice(plan, marketScore)
      : null;

  const effectiveSlots = { ...slots };
  if (zoneClass === "MACROQUARTIERE" && marketScore < 5) {
    effectiveSlots.maxBase = 1;
  }

  return {
    priceBase: price("BASE"),
    priceLocal: price("PREMIER_LOCAL"),
    priceCity: price("PREMIER_CITY"),
    pricePrime: price("PREMIER_PRIME"),
    priceElite: price("PREMIER_ELITE"),
    maxBase: effectiveSlots.maxBase ?? 0,
    maxLocal: effectiveSlots.maxLocal ?? 0,
    maxCity: effectiveSlots.maxCity ?? 0,
    maxPrime: effectiveSlots.maxPrime ?? 0,
    maxElite: effectiveSlots.maxElite ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Classificazione automatica zona da popolazione                     */
/* ------------------------------------------------------------------ */

export function classifyZone(population: number): ZoneClass {
  if (population < 5000) return "CLUSTER_LOCAL";
  if (population < 50000) return "COMUNE";
  if (population < 250000) return "MACROQUARTIERE";
  return "MICROZONA_PRIME";
}

/* ------------------------------------------------------------------ */
/*  Export costanti per uso esterno                                     */
/* ------------------------------------------------------------------ */

export { PRICE_RANGES, ZONE_CLASS_PLANS, DEFAULT_SLOTS };
