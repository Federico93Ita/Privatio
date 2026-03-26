import type { ZoneClass } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  Nuovo modello di pricing: 3 fasce, formula basata su dati mercato  */
/* ------------------------------------------------------------------ */

interface ZonePricingResult {
  zoneClass: ZoneClass;
  monthlyPrice: number;   // centesimi EUR
  maxAgencies: number;
  label: string;
}

/**
 * Calcola prezzo e max agenzie per una zona.
 *
 * Formula: prezzoBase × (1 + factorPop × 0.3 + factorNTN × 0.4 + factorPrezzo × 0.3)
 *
 * - prezzoBase: 24900 (BASE), 49900 (URBANA), 99900 (PREMIUM) centesimi
 * - factor*: normalizzato 0-1 all'interno della fascia
 */
export function calculateZonePrice(
  zoneClass: ZoneClass,
  population: number,
  ntn: number = 0,
  avgPricePerSqm: number = 0
): ZonePricingResult {
  const config: Record<ZoneClass, {
    basePrice: number;
    maxPrice: number;
    baseAgencies: number;
    maxAgencies: number;
    popNorm: number;
    ntnNorm: number;
    priceNorm: number;
    label: string;
  }> = {
    BASE: {
      basePrice: 24900,
      maxPrice: 49900,
      baseAgencies: 3,
      maxAgencies: 4,
      popNorm: 20000,
      ntnNorm: 100,
      priceNorm: 2000,
      label: "Zona Base",
    },
    URBANA: {
      basePrice: 49900,
      maxPrice: 99900,
      baseAgencies: 4,
      maxAgencies: 6,
      popNorm: 100000,
      ntnNorm: 500,
      priceNorm: 3000,
      label: "Zona Urbana",
    },
    PREMIUM: {
      basePrice: 99900,
      maxPrice: 260000,
      baseAgencies: 4,
      maxAgencies: 7,
      popNorm: 200000,
      ntnNorm: 2000,
      priceNorm: 5000,
      label: "Zona Premium",
    },
  };

  const c = config[zoneClass];
  if (!c) return { zoneClass: "BASE", monthlyPrice: 24900, maxAgencies: 3, label: "Zona Base" };

  const factorPop = Math.min(population / c.popNorm, 1);
  const factorNTN = Math.min(ntn / c.ntnNorm, 1);
  const factorPrice = avgPricePerSqm > 0 ? Math.min(avgPricePerSqm / c.priceNorm, 1) : 0.5;

  const multiplier = 1 + factorPop * 0.3 + factorNTN * 0.4 + factorPrice * 0.3;
  const rawPrice = Math.round(c.basePrice * multiplier);
  const monthlyPrice = Math.min(rawPrice, c.maxPrice);

  // Max agencies scales with population within tier
  const agencyRange = c.maxAgencies - c.baseAgencies;
  const maxAgencies = c.baseAgencies + Math.round(factorPop * agencyRange);

  return { zoneClass, monthlyPrice, maxAgencies, label: c.label };
}

/* ------------------------------------------------------------------ */
/*  Classificazione zona per popolazione                               */
/* ------------------------------------------------------------------ */

export function classifyZone(population: number): ZoneClass {
  if (population < 20000) return "BASE";
  if (population < 100000) return "URBANA";
  return "PREMIUM";
}

/* ------------------------------------------------------------------ */
/*  Market score (invariato)                                           */
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
