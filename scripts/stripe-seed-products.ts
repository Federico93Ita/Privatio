/**
 * Stripe Products & Prices seeder.
 *
 * Crea (in modo idempotente) 1 Product + 1 Price ricorrente mensile EUR
 * per ogni Zone attiva del DB, e salva stripeProductId / stripePriceId
 * sul record Zone.
 *
 * Usage:
 *   # test mode
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-seed-products.ts
 *
 *   # live mode (attenzione!)
 *   STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/stripe-seed-products.ts
 *
 * Idempotenza:
 *  - Se una Zone ha già stripePriceId: salta.
 *  - Sicuro da rilanciare dopo aggiunta di nuove zone.
 *
 * Per ricreare un Price dopo un cambio di monthlyPrice:
 *  1) Archiviare il Price esistente su Stripe Dashboard.
 *  2) Azzerare Zone.stripePriceId nel DB (UPDATE ... SET stripePriceId = NULL).
 *  3) Rilanciare lo script.
 */

import "dotenv/config";
import { PrismaClient, ZoneClass } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const ZONE_CLASS_LABEL: Record<ZoneClass, string> = {
  BASE: "Zona Base",
  URBANA: "Zona Urbana",
  PREMIUM: "Zona Premium",
};

async function main(): Promise<void> {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY mancante nell'env.");
  }

  const mode = process.env.STRIPE_SECRET_KEY.startsWith("sk_live_")
    ? "LIVE"
    : "TEST";
  console.log(`\n🔷 Stripe seeding (${mode} mode)\n`);

  const zones = await prisma.zone.findMany({
    where: { isActive: true },
    orderBy: [{ province: "asc" }, { name: "asc" }],
  });

  console.log(`Trovate ${zones.length} zone attive.`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const zone of zones) {
    if (zone.stripePriceId) {
      skipped++;
      continue;
    }
    if (zone.monthlyPrice <= 0) {
      console.warn(
        `  ⚠️  Salto "${zone.name}" (${zone.id}): monthlyPrice=${zone.monthlyPrice}`
      );
      failed++;
      continue;
    }

    try {
      // 1) Product
      const product = await stripe.products.create({
        name: `Privatio — ${ZONE_CLASS_LABEL[zone.zoneClass]} — ${zone.name}`,
        description: `Abbonamento mensile per la zona ${zone.name} (${zone.province}).`,
        metadata: {
          zoneId: zone.id,
          zoneSlug: zone.slug,
          zoneClass: zone.zoneClass,
          province: zone.province,
          region: zone.region,
        },
      });

      // 2) Price (recurring monthly)
      const price = await stripe.prices.create({
        currency: "eur",
        unit_amount: zone.monthlyPrice,
        recurring: { interval: "month" },
        product: product.id,
        tax_behavior: "exclusive",
        metadata: {
          zoneId: zone.id,
          zoneClass: zone.zoneClass,
        },
      });

      // 3) Salva su DB
      await prisma.zone.update({
        where: { id: zone.id },
        data: {
          stripeProductId: product.id,
          stripePriceId: price.id,
        },
      });

      created++;
      console.log(
        `  ✅ ${zone.name.padEnd(40)} ${(zone.monthlyPrice / 100)
          .toFixed(2)
          .padStart(8)} €  →  ${price.id}`
      );
    } catch (err) {
      failed++;
      console.error(`  ❌ ${zone.name}:`, (err as Error).message);
    }
  }

  console.log(
    `\n📊 Done. created=${created} skipped=${skipped} failed=${failed}\n`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
