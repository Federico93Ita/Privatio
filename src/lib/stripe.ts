import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const PLANS = {
  BASE: {
    priceId: process.env.STRIPE_PRICE_BASE!,
    name: "Piano Base",
    price: 4900, // cents
    maxProperties: 5,
    features: [
      "Fino a 5 immobili attivi",
      "Dashboard gestione",
      "Notifiche email",
      "Supporto base",
    ],
  },
  PRO: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    name: "Piano Pro",
    price: 9900, // cents
    maxProperties: null, // unlimited
    features: [
      "Immobili illimitati",
      "Dashboard avanzata",
      "Priorità assegnazione",
      "Supporto prioritario",
      "Statistiche avanzate",
      "Badge Premium",
    ],
  },
} as const;
