/**
 * Shared constants for zone tiers (fasce).
 * New simplified model: 3 fasce (BASE, URBANA, PREMIUM)
 * No more "agency plans" — the price is on the zone.
 */

export const ZONE_TIER_LABELS: Record<string, string> = {
  BASE: "Zona Base",
  URBANA: "Zona Urbana",
  PREMIUM: "Zona Premium",
};

/** Short labels for badges/tags */
export const ZONE_TIER_SHORT: Record<string, string> = {
  BASE: "Base",
  URBANA: "Urbana",
  PREMIUM: "Premium",
};

export const ZONE_TIER_COLORS: Record<string, string> = {
  BASE: "bg-indigo-50 text-indigo-700",
  URBANA: "bg-cyan-50 text-cyan-700",
  PREMIUM: "bg-rose-50 text-rose-700",
};

/** Map colors for zone circles/polygons */
export const ZONE_MAP_COLORS: Record<string, { fill: string; stroke: string }> = {
  BASE: { fill: "#6366f140", stroke: "#6366f1" },     // indigo
  URBANA: { fill: "#0891b240", stroke: "#0891b2" },    // cyan
  PREMIUM: { fill: "#e9456040", stroke: "#e94560" },   // rose
};

/** Price ranges for display on public page (EUR/mese, allineati a TIER_CONFIG in zone-pricing.ts) */
export const ZONE_PRICE_RANGES: Record<string, { min: number; max: number }> = {
  BASE: { min: 99, max: 249 },
  URBANA: { min: 299, max: 699 },
  PREMIUM: { min: 699, max: 2990 },
};

/** Max agencies per zone tier */
export const ZONE_MAX_AGENCIES: Record<string, { min: number; max: number }> = {
  BASE: { min: 3, max: 4 },
  URBANA: { min: 4, max: 6 },
  PREMIUM: { min: 4, max: 7 },
};

// Legacy aliases for backward compatibility
export const PLAN_LABELS: Record<string, string> = ZONE_TIER_SHORT;
export const ZONE_CLASS_LABELS: Record<string, string> = ZONE_TIER_LABELS;
export const ZONE_CLASS_COLORS: Record<string, string> = ZONE_TIER_COLORS;
