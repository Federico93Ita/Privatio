This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Stripe

L'abbonamento mensile delle agenzie è gestito da Stripe (Subscriptions +
Customer Portal + Stripe Tax).

### Seeding dei Products / Prices
Ogni zona (`Zone`) ha 1 `Product` + 1 `Price` ricorrente mensile dedicati.
Dopo aver aggiunto nuove zone al DB:

```bash
# Test mode
STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-seed-products.ts

# Live mode (attenzione!)
STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/stripe-seed-products.ts
```

Lo script è **idempotente**: salta le zone che hanno già `stripePriceId`
valorizzato. Per cambiare il prezzo di una zona: archivia il vecchio Price
su Dashboard Stripe, azzera `Zone.stripePriceId`, rilancia lo script.

### Webhook in locale (Stripe CLI)

```bash
# 1) Login
stripe login

# 2) Forward eventi verso l'app in dev
stripe listen --forward-to localhost:3000/api/stripe/webhook

# La CLI stampa un whsec_... → copialo in .env.local come STRIPE_WEBHOOK_SECRET

# 3) Simula eventi
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
stripe trigger invoice.paid
stripe trigger customer.subscription.deleted
```

### Compliance italiana
- **Stripe Tax**: abilitare su Dashboard, registrazione IVA IT, aliquota 22%.
- **Checkout**: raccoglie P.IVA (tax_id_collection) e codice destinatario SDI / PEC via custom fields.
- **SDI**: Stripe non trasmette a Sistema di Interscambio. Per la fatturazione elettronica conforme usare un provider esterno (es. Fatture in Cloud) via webhook `invoice.finalized`. In assenza di integrazione, la fattura Stripe PDF è di cortesia — informare l'agenzia in onboarding.

### Env vars (Vercel)
**Production** (live):
- `STRIPE_SECRET_KEY=sk_live_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...` (da webhook live)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`

**Preview** (test):
- `STRIPE_SECRET_KEY=sk_test_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...` (da webhook test o dalla CLI)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`

## Chatbot AI
Il chatbot (`/api/chat`) usa Claude Haiku 4.5 via `@anthropic-ai/sdk`.
Richiede `ANTHROPIC_API_KEY` su Vercel (Production + Preview).
Ottieni la chiave da https://console.anthropic.com/settings/keys.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
