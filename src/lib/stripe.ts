import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/* ------------------------------------------------------------------ */
/*  Fasce zona (sostituiscono i vecchi "piani" agenzia)                */
/* ------------------------------------------------------------------ */

export const PLANS = {
  BASE: {
    name: "Zona Base",
    maxZones: 3,
    priority: 1,
    features: [
      "Comuni < 20k abitanti",
      "Max 3-4 agenzie per zona",
      "Notifica nuovi immobili 24h",
      "Profilo agenzia completo",
      "Dashboard gestione",
    ],
  },
  URBANA: {
    name: "Zona Urbana",
    maxZones: 3,
    priority: 2,
    features: [
      "Comuni 20k-100k o quartieri periferici",
      "Max 4-6 agenzie per zona",
      "Notifica nuovi immobili 8h",
      "Visibilita locale garantita",
      "Statistiche avanzate",
    ],
  },
  PREMIUM: {
    name: "Zona Premium",
    maxZones: 3,
    priority: 3,
    features: [
      "Centri storici e quartieri pregiati",
      "Max 4-7 agenzie per zona",
      "Notifica istantanea immobili",
      "Prima posizione ricerche",
      "Branding premium e supporto",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const PLAN_KEYS: PlanKey[] = ["BASE", "URBANA", "PREMIUM"];

/* ------------------------------------------------------------------ */
/*  Stripe Price per zona                                              */
/* ------------------------------------------------------------------ */

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
/*  Helper: aggiungi una zona a una subscription esistente             */
/* ------------------------------------------------------------------ */

/**
 * Aggiunge un nuovo subscription item (zona) a una subscription esistente.
 * Usato quando un'agenzia compra una 2ª/3ª zona avendo già una subscription attiva.
 * Ritorna l'id del SubscriptionItem creato (da salvare su TerritoryAssignment.stripeItemId).
 */
export async function addZoneToSubscription(params: {
  subscriptionId: string;
  priceId: string;
  zoneId: string;
}): Promise<string> {
  const item = await stripe.subscriptionItems.create({
    subscription: params.subscriptionId,
    price: params.priceId,
    quantity: 1,
    metadata: { zoneId: params.zoneId },
    proration_behavior: "create_prorations",
  });
  return item.id;
}

/* ------------------------------------------------------------------ */
/*  Helper: determina fascia massima dai territori attivi              */
/* ------------------------------------------------------------------ */

export function highestPlan(plans: PlanKey[]): PlanKey {
  if (plans.length === 0) return "BASE";
  const sorted = [...plans].sort(
    (a, b) => PLANS[b].priority - PLANS[a].priority
  );
  return sorted[0];
}
