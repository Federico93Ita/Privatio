import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/* ------------------------------------------------------------------ */
/*  Piani                                                              */
/* ------------------------------------------------------------------ */

export const PLANS = {
  BASE: {
    name: "Base",
    maxZones: 1,
    priority: 1,
    features: [
      "1 area operativa",
      "Profilo agenzia",
      "Visibilità standard",
      "Dashboard gestione",
    ],
  },
  PREMIER_LOCAL: {
    name: "Premier Local",
    maxZones: 3,
    priority: 2,
    features: [
      "Fino a 3 aree",
      "Priorità su Base",
      "Meno competitor in zona",
      "Dashboard avanzata",
    ],
  },
  PREMIER_CITY: {
    name: "Premier City",
    maxZones: 5,
    priority: 3,
    features: [
      "Fino a 5 aree",
      "Visibilità superiore",
      "Max 2 competitor in zona",
      "Statistiche avanzate",
    ],
  },
  PREMIER_PRIME: {
    name: "Premier Prime",
    maxZones: 8,
    priority: 4,
    features: [
      "Fino a 8 aree",
      "Accesso zone top",
      "Presenza molto forte",
      "Max 2 partner in area",
      "Supporto prioritario",
    ],
  },
  PREMIER_ELITE: {
    name: "Premier Elite",
    maxZones: 12,
    priority: 5,
    features: [
      "Fino a 12 aree",
      "Zone ultra-selezionate",
      "Massimo prestigio",
      "Max 2 partner",
      "Branding premium",
      "Supporto dedicato",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const PLAN_KEYS: PlanKey[] = [
  "BASE",
  "PREMIER_LOCAL",
  "PREMIER_CITY",
  "PREMIER_PRIME",
  "PREMIER_ELITE",
];

/* ------------------------------------------------------------------ */
/*  Stripe Price per zona — crea on-the-fly                            */
/* ------------------------------------------------------------------ */

/**
 * Crea un Stripe Price ricorrente mensile per una combinazione zona+piano.
 * Ritorna il priceId.
 */
export async function createZoneStripePrice(
  zoneName: string,
  zoneId: string,
  plan: PlanKey,
  amountCents: number
): Promise<string> {
  const price = await stripe.prices.create({
    currency: "eur",
    unit_amount: amountCents,
    recurring: { interval: "month" },
    product_data: {
      name: `${PLANS[plan].name} — ${zoneName}`,
      metadata: { zoneId, plan },
    },
  });
  return price.id;
}

/* ------------------------------------------------------------------ */
/*  Helper: determina piano massimo dai territori attivi               */
/* ------------------------------------------------------------------ */

export function highestPlan(plans: PlanKey[]): PlanKey {
  if (plans.length === 0) return "BASE";
  const sorted = [...plans].sort(
    (a, b) => PLANS[b].priority - PLANS[a].priority
  );
  return sorted[0];
}
