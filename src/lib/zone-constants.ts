/**
 * Shared constants for zone classes and agency plans.
 * Used by territory dashboard, zone preference selector, and admin panel.
 */

export const PLAN_LABELS: Record<string, string> = {
  BASE: "Base",
  PREMIER_LOCAL: "Locale",
  PREMIER_CITY: "City",
  PREMIER_PRIME: "Prime",
  PREMIER_ELITE: "Elite", // legacy, non più usato
};

export const ZONE_CLASS_LABELS: Record<string, string> = {
  CLUSTER_LOCAL: "Cluster Rurale",
  COMUNE: "Comune",
  MACROQUARTIERE: "Quartiere",
  MICROZONA_PRIME: "Microzona",
};

export const ZONE_CLASS_COLORS: Record<string, string> = {
  CLUSTER_LOCAL: "bg-gray-100 text-gray-700",
  COMUNE: "bg-blue-50 text-blue-700",
  MACROQUARTIERE: "bg-purple-50 text-purple-700",
  MICROZONA_PRIME: "bg-amber-50 text-amber-700",
};

/** Maps zone class to available plans */
export const ZONE_CLASS_PLANS: Record<string, string[]> = {
  CLUSTER_LOCAL: ["BASE"],
  COMUNE: ["BASE", "PREMIER_LOCAL"],
  MACROQUARTIERE: ["PREMIER_LOCAL", "PREMIER_CITY"],
  MICROZONA_PRIME: ["PREMIER_CITY", "PREMIER_PRIME"],
};

/** Price field keys per plan in zone data */
export const PLAN_PRICE_KEYS: Record<string, string> = {
  BASE: "priceBase",
  PREMIER_LOCAL: "priceLocal",
  PREMIER_CITY: "priceCity",
  PREMIER_PRIME: "pricePrime",
  PREMIER_ELITE: "priceElite",
};

/** Max slot field keys per plan */
export const PLAN_MAX_KEYS: Record<string, string> = {
  BASE: "maxBase",
  PREMIER_LOCAL: "maxLocal",
  PREMIER_CITY: "maxCity",
  PREMIER_PRIME: "maxPrime",
  PREMIER_ELITE: "maxElite",
};
