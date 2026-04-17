import type { ZoneClass } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  Pricing Proposta B                                                 */
/*                                                                     */
/*  monthlyPrice = basePrice(popComune)                                */
/*               × moltFascia(fascia)                                  */
/*               × boostPrezzo(€/m²)                                   */
/*               × boostNTN(ntn)                                       */
/*                                                                     */
/*  Questo modello differenzia Milano Centro (C, pop 1.4M, €10k/m²)    */
/*  da Asti Centro (B, pop 75k, €2k/m²) senza appiattire la PREMIUM    */
/*  avg a €577 come faceva la vecchia formula.                         */
/* ------------------------------------------------------------------ */

export type OmiFascia = "R" | "E" | "D" | "B" | "C" | null | undefined;

export interface ZonePricingInput {
  zoneClass: ZoneClass;
  fascia?: OmiFascia;
  /** Popolazione del COMUNE (non della microzona) */
  populationComune: number;
  /** Numero transazioni normalizzate (compravendite anno) */
  ntn?: number;
  /** Quotazione media OMI €/m² */
  avgPricePerSqm?: number;
}

export interface ZonePricingResult {
  zoneClass: ZoneClass;
  monthlyPrice: number; // centesimi EUR
  maxAgencies: number;
  label: string;
}

/* ------------------------------------------------------------------ */
/*  1. basePrice per popolazione comune (scala a tratti)               */
/*     EUR output                                                      */
/* ------------------------------------------------------------------ */
function basePriceFromPopulation(popComune: number): number {
  const points: Array<[number, number]> = [
    [0, 80],
    [10_000, 150],
    [50_000, 300],
    [100_000, 450],
    [500_000, 800],
    [1_000_000, 1200],
  ];
  if (popComune <= points[0][0]) return points[0][1];
  for (let i = 0; i < points.length - 1; i++) {
    const [p1, v1] = points[i];
    const [p2, v2] = points[i + 1];
    if (popComune >= p1 && popComune <= p2) {
      const t = (popComune - p1) / (p2 - p1);
      return v1 + t * (v2 - v1);
    }
  }
  return points[points.length - 1][1];
}

/* ------------------------------------------------------------------ */
/*  2. Moltiplicatore fascia OMI                                       */
/* ------------------------------------------------------------------ */
function moltFascia(fascia: OmiFascia): number {
  switch (fascia) {
    case "R":
      return 0.6;
    case "E":
      return 0.85;
    case "D":
      return 1.0;
    case "B":
      return 1.25;
    case "C":
      return 1.5;
    default:
      return 1.0; // zone non-OMI
  }
}

/* ------------------------------------------------------------------ */
/*  3. Boost quotazione €/m² (range 0,8×–1,2×)                         */
/* ------------------------------------------------------------------ */
function boostPrezzo(avgPricePerSqm: number): number {
  if (!avgPricePerSqm || avgPricePerSqm <= 0) return 1.0; // neutro se sconosciuto
  return 0.8 + Math.min(avgPricePerSqm / 10_000, 1) * 0.4;
}

/* ------------------------------------------------------------------ */
/*  4. Boost NTN (range 0,95×–1,10×)                                   */
/* ------------------------------------------------------------------ */
function boostNTN(ntn: number): number {
  if (!ntn || ntn <= 0) return 1.0;
  return 0.95 + Math.min(ntn / 500, 1) * 0.15;
}

/* ------------------------------------------------------------------ */
/*  Cap per zoneClass                                                  */
/* ------------------------------------------------------------------ */
const TIER_CONFIG: Record<ZoneClass, {
  minPrice: number; // EUR
  maxPrice: number; // EUR
  baseAgencies: number;
  maxAgencies: number;
  label: string;
}> = {
  BASE: { minPrice: 70, maxPrice: 199, baseAgencies: 2, maxAgencies: 4, label: "Zona Base" },
  URBANA: { minPrice: 200, maxPrice: 599, baseAgencies: 3, maxAgencies: 6, label: "Zona Urbana" },
  PREMIUM: { minPrice: 500, maxPrice: 2600, baseAgencies: 4, maxAgencies: 7, label: "Zona Premium" },
};

/* ------------------------------------------------------------------ */
/*  API principale                                                     */
/* ------------------------------------------------------------------ */
export function calculateZonePriceV2(input: ZonePricingInput): ZonePricingResult {
  const { zoneClass, fascia, populationComune, ntn = 0, avgPricePerSqm = 0 } = input;
  const cfg = TIER_CONFIG[zoneClass] ?? TIER_CONFIG.BASE;

  const base = basePriceFromPopulation(populationComune);
  const mF = moltFascia(fascia);
  const bP = boostPrezzo(avgPricePerSqm);
  const bN = boostNTN(ntn);

  const rawEur = base * mF * bP * bN;
  const clampedEur = Math.max(cfg.minPrice, Math.min(rawEur, cfg.maxPrice));
  const monthlyPrice = Math.round(clampedEur * 100); // centesimi

  // Max agenzie scala con popolazione del comune
  const popFactor = Math.min(populationComune / 500_000, 1);
  const maxAgencies =
    cfg.baseAgencies + Math.round(popFactor * (cfg.maxAgencies - cfg.baseAgencies));

  return { zoneClass, monthlyPrice, maxAgencies, label: cfg.label };
}

/* ------------------------------------------------------------------ */
/*  Compat wrapper — firma posizionale legacy.                          */
/*  Le callsite legacy passano la popolazione COMUNE come secondo arg. */
/*  Le callsite nuove dovrebbero migrare a calculateZonePriceV2.       */
/* ------------------------------------------------------------------ */
export function calculateZonePrice(
  zoneClass: ZoneClass,
  populationComune: number,
  ntn: number = 0,
  avgPricePerSqm: number = 0,
  fascia?: OmiFascia
): ZonePricingResult {
  return calculateZonePriceV2({
    zoneClass,
    fascia,
    populationComune,
    ntn,
    avgPricePerSqm,
  });
}

/* ------------------------------------------------------------------ */
/*  Classificazione zona                                               */
/*                                                                     */
/*  Se è disponibile la fascia OMI, usala (coerente con immobiliare.it)*/
/*  Altrimenti fallback su popolazione del comune.                     */
/* ------------------------------------------------------------------ */
export function classifyZoneByFascia(fascia: OmiFascia, populationComune: number): ZoneClass {
  if (fascia === "C" || fascia === "B") return "PREMIUM";
  if (fascia === "D" || fascia === "E") return "URBANA";
  if (fascia === "R") return "BASE";
  return classifyZone(populationComune);
}

export function classifyZone(populationComune: number): ZoneClass {
  if (populationComune < 20_000) return "BASE";
  if (populationComune < 100_000) return "URBANA";
  return "PREMIUM";
}

/* ------------------------------------------------------------------ */
/*  Market score (invariato)                                           */
/* ------------------------------------------------------------------ */
export function calculateMarketScore(population: number, ntn: number): number {
  const popScore = Math.min(population / 50_000, 1) * 4;
  const ntnScore = Math.min(ntn / 500, 1) * 4;
  const densityBonus =
    ntn > 0 && population > 0
      ? Math.min((ntn / population) * 1000, 2)
      : 0;
  return Math.round(
    Math.max(1, Math.min(10, popScore + ntnScore + densityBonus))
  );
}
