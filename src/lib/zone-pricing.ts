import type { ZoneClass } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  Tipi                                                               */
/* ------------------------------------------------------------------ */

export type PlanKey =
  | "BASE"
  | "PREMIER_LOCAL"
  | "PREMIER_CITY"
  | "PREMIER_PRIME"
  | "PREMIER_ELITE";

/* ------------------------------------------------------------------ */
/*  Prezzi fissi per tipo di zona (centesimi EUR)                      */
/* ------------------------------------------------------------------ */

interface FixedPricing {
  plan: PlanKey;
  price: number;    // centesimi
  maxSlots: number;
  label: string;    // descrizione tipo zona
}

/**
 * Determina piano, prezzo fisso e slot per una zona
 * in base alla classe, popolazione e market score.
 */
export function getFixedZonePrice(
  zoneClass: ZoneClass,
  population: number,
  marketScore: number
): FixedPricing {
  switch (zoneClass) {
    case "CLUSTER_LOCAL":
      return { plan: "BASE", price: 30000, maxSlots: 3, label: "Cluster rurale" };

    case "COMUNE":
      if (population < 20000) {
        return { plan: "BASE", price: 40000, maxSlots: 4, label: "Comune < 20k" };
      }
      return { plan: "PREMIER_LOCAL", price: 65000, maxSlots: 5, label: "Comune 20k-80k" };

    case "MACROQUARTIERE":
      if (marketScore <= 5) {
        return { plan: "PREMIER_LOCAL", price: 85000, maxSlots: 5, label: "Macroquartiere periferia" };
      }
      return { plan: "PREMIER_CITY", price: 110000, maxSlots: 6, label: "Macroquartiere centro" };

    case "MICROZONA_PRIME":
      if (marketScore <= 5) {
        return { plan: "PREMIER_CITY", price: 150000, maxSlots: 6, label: "Microzona OMI B" };
      }
      if (marketScore <= 8) {
        return { plan: "PREMIER_PRIME", price: 220000, maxSlots: 6, label: "Microzona OMI A" };
      }
      return { plan: "PREMIER_PRIME", price: 320000, maxSlots: 6, label: "OMI premium" };

    default:
      return { plan: "BASE", price: 30000, maxSlots: 3, label: "Altro" };
  }
}

/* ------------------------------------------------------------------ */
/*  Calcolo marketScore (invariato)                                    */
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

/**
 * Calcola pricing per una zona. Con il nuovo modello a prezzi fissi,
 * ogni zona ha UN SOLO piano attivo con un prezzo fisso.
 */
export function calculateZonePricing(
  zoneClass: ZoneClass | string,
  marketScore: number,
  population: number = 0
): ZonePricing {
  const fixed = getFixedZonePrice(zoneClass as ZoneClass, population, marketScore);

  return {
    priceBase: fixed.plan === "BASE" ? fixed.price : null,
    priceLocal: fixed.plan === "PREMIER_LOCAL" ? fixed.price : null,
    priceCity: fixed.plan === "PREMIER_CITY" ? fixed.price : null,
    pricePrime: fixed.plan === "PREMIER_PRIME" ? fixed.price : null,
    priceElite: null, // Non più usato
    maxBase: fixed.plan === "BASE" ? fixed.maxSlots : 0,
    maxLocal: fixed.plan === "PREMIER_LOCAL" ? fixed.maxSlots : 0,
    maxCity: fixed.plan === "PREMIER_CITY" ? fixed.maxSlots : 0,
    maxPrime: fixed.plan === "PREMIER_PRIME" ? fixed.maxSlots : 0,
    maxElite: 0, // Non più usato
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
/*  Legacy exports per compatibilità                                   */
/* ------------------------------------------------------------------ */

/** @deprecated Use getFixedZonePrice instead */
export function calculateZonePrice(plan: PlanKey, marketScore: number): number {
  // Fallback per compatibilità con codice esistente
  const prices: Record<PlanKey, number> = {
    BASE: 30000,
    PREMIER_LOCAL: 65000,
    PREMIER_CITY: 110000,
    PREMIER_PRIME: 220000,
    PREMIER_ELITE: 320000,
  };
  return prices[plan] || 30000;
}

// Legacy exports
const PRICE_RANGES: Record<PlanKey, { min: number; max: number }> = {
  BASE: { min: 30000, max: 40000 },
  PREMIER_LOCAL: { min: 65000, max: 85000 },
  PREMIER_CITY: { min: 110000, max: 150000 },
  PREMIER_PRIME: { min: 220000, max: 320000 },
  PREMIER_ELITE: { min: 320000, max: 320000 },
};

const ZONE_CLASS_PLANS: Record<ZoneClass, PlanKey[]> = {
  CLUSTER_LOCAL: ["BASE"],
  COMUNE: ["BASE", "PREMIER_LOCAL"],
  MACROQUARTIERE: ["PREMIER_LOCAL", "PREMIER_CITY"],
  MICROZONA_PRIME: ["PREMIER_CITY", "PREMIER_PRIME"],
};

const DEFAULT_SLOTS: Record<ZoneClass, Record<string, number>> = {
  CLUSTER_LOCAL: { maxBase: 3, maxLocal: 0, maxCity: 0, maxPrime: 0, maxElite: 0 },
  COMUNE: { maxBase: 4, maxLocal: 5, maxCity: 0, maxPrime: 0, maxElite: 0 },
  MACROQUARTIERE: { maxBase: 0, maxLocal: 5, maxCity: 6, maxPrime: 0, maxElite: 0 },
  MICROZONA_PRIME: { maxBase: 0, maxLocal: 0, maxCity: 6, maxPrime: 6, maxElite: 0 },
};

export { PRICE_RANGES, ZONE_CLASS_PLANS, DEFAULT_SLOTS };
