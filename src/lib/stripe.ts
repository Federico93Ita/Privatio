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
      "Max 6 competitor/zona",
      "Notifica nuovi immobili 24h",
      "Profilo agenzia",
      "Dashboard base",
    ],
  },
  PREMIER_LOCAL: {
    name: "Premier Local",
    maxZones: 2,
    priority: 2,
    features: [
      "2 aree operative",
      "Max 5 competitor/zona",
      "Notifica 8h",
      "Priorità su Base",
      "Dashboard avanzata",
    ],
  },
  PREMIER_CITY: {
    name: "Premier City",
    maxZones: 3,
    priority: 3,
    features: [
      "3 aree operative",
      "Max 4 competitor/zona",
      "Notifica 2h",
      "Alta visibilità venditore",
      "Statistiche avanzate",
    ],
  },
  PREMIER_PRIME: {
    name: "Premier Prime",
    maxZones: 3,
    priority: 4,
    features: [
      "3 aree operative",
      "Max 3 competitor/zona",
      "Notifica 30 min",
      "Accesso zone top",
      "Supporto prioritario",
    ],
  },
  PREMIER_ELITE: {
    name: "Premier Elite",
    maxZones: 4,
    priority: 5,
    features: [
      "4 aree operative",
      "Max 3 competitor/zona",
      "Notifica istantanea",
      "Prima posizione con venditore",
      "Branding premium",
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
