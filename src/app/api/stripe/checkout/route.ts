import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  stripe,
  createZoneStripePrice,
  addZoneToSubscription,
  TRIAL_PERIOD_DAYS,
} from "@/lib/stripe";
import type { PlanKey } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { resolveZoneForProperty } from "@/lib/zones";

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Garantisce che una Zone abbia uno stripePriceId. Se manca (p.es. zona
 * nuova non ancora seedata), lo crea al volo e lo salva su DB.
 */
async function ensureZonePriceId(zone: {
  id: string;
  name: string;
  zoneClass: string;
  monthlyPrice: number;
  stripePriceId: string | null;
}): Promise<string> {
  if (zone.stripePriceId) return zone.stripePriceId;
  const priceId = await createZoneStripePrice(
    zone.name,
    zone.id,
    zone.zoneClass as PlanKey,
    zone.monthlyPrice
  );
  await prisma.zone.update({
    where: { id: zone.id },
    data: { stripePriceId: priceId },
  });
  return priceId;
}

/**
 * POST /api/stripe/checkout
 *
 * Body: { zoneId: string }
 *
 * - Se l'agenzia NON ha ancora una subscription attiva → crea Checkout
 *   Session in modalità subscription (prima zona).
 * - Se l'agenzia HA già stripeSubId → aggiunge un SubscriptionItem alla
 *   subscription esistente (2ª/3ª zona) senza passare da Checkout.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await req.json();
    const { zoneId } = body as { zoneId: string };

    if (!zoneId) {
      return NextResponse.json({ error: "Zona non specificata" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { agency: true },
    });

    if (!user?.agency) {
      return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 });
    }

    const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zone || !zone.isActive) {
      return NextResponse.json({ error: "Zona non disponibile" }, { status: 404 });
    }

    if (zone.monthlyPrice <= 0) {
      return NextResponse.json(
        { error: "Prezzo zona non configurato" },
        { status: 400 }
      );
    }

    // Slot disponibili
    const currentCount = await prisma.territoryAssignment.count({
      where: { zoneId, isActive: true },
    });
    if (currentCount >= zone.maxAgencies) {
      return NextResponse.json(
        { error: "Nessuno slot disponibile per questa zona" },
        { status: 409 }
      );
    }

    // No doppia zona
    const existingTerritory = await prisma.territoryAssignment.findUnique({
      where: { agencyId_zoneId: { agencyId: user.agency.id, zoneId } },
    });
    if (existingTerritory?.isActive) {
      return NextResponse.json(
        { error: "Hai già un territorio attivo in questa zona" },
        { status: 409 }
      );
    }

    // Max 3 zone
    const activeZones = await prisma.territoryAssignment.count({
      where: { agencyId: user.agency.id, isActive: true },
    });
    if (activeZones >= 3) {
      return NextResponse.json(
        { error: "Limite di 3 zone raggiunto" },
        { status: 400 }
      );
    }

    // Restrizione geografica + stessa classe
    const homeZoneId = await resolveZoneForProperty(
      user.agency.city,
      user.agency.province,
      ""
    );
    if (homeZoneId && homeZoneId !== zoneId) {
      const homeZone = await prisma.zone.findUnique({
        where: { id: homeZoneId },
        select: { lat: true, lng: true, zoneClass: true },
      });
      if (homeZone?.zoneClass && zone.zoneClass !== homeZone.zoneClass) {
        return NextResponse.json(
          { error: "Puoi presidiare solo zone della tua stessa classe" },
          { status: 403 }
        );
      }
      if (homeZone?.lat && homeZone?.lng && zone.lat && zone.lng) {
        const radiusByClass: Record<string, number> = {
          PREMIUM: 5,
          URBANA: 8,
          BASE: 15,
        };
        const maxDist = radiusByClass[zone.zoneClass] ?? 10;
        const dist = distanceKm(homeZone.lat, homeZone.lng, zone.lat, zone.lng);
        if (dist > maxDist) {
          return NextResponse.json(
            { error: "Puoi presidiare solo zone nella tua area geografica" },
            { status: 403 }
          );
        }
      }
    }

    const plan = zone.zoneClass as PlanKey;

    // Crea/recupera Stripe customer
    let customerId = user.agency.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.agency.name,
        metadata: { agencyId: user.agency.id },
      });
      customerId = customer.id;
      await prisma.agency.update({
        where: { id: user.agency.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Price ID (seeded o on-the-fly)
    const stripePriceId = await ensureZonePriceId(zone);

    /* ---------------------------------------------------------------- */
    /*  BRANCH A — subscription esistente: aggiungi item                  */
    /* ---------------------------------------------------------------- */
    if (user.agency.stripeSubId) {
      // Verifica che la sub sia realmente ancora attiva su Stripe
      const sub = await stripe.subscriptions.retrieve(user.agency.stripeSubId);
      if (sub.status === "active" || sub.status === "trialing") {
        const itemId = await addZoneToSubscription({
          subscriptionId: sub.id,
          priceId: stripePriceId,
          zoneId: zone.id,
        });

        // Upsert territorio inline (il webhook subscription.updated
        // confermerà idempotentemente).
        await prisma.territoryAssignment.upsert({
          where: { agencyId_zoneId: { agencyId: user.agency.id, zoneId } },
          create: {
            agencyId: user.agency.id,
            zoneId,
            plan,
            monthlyPrice: zone.monthlyPrice,
            stripeItemId: itemId,
            isActive: true,
          },
          update: {
            isActive: true,
            stripeItemId: itemId,
            plan,
            monthlyPrice: zone.monthlyPrice,
          },
        });

        return NextResponse.json({
          ok: true,
          added: true,
          zoneId,
          message: "Zona aggiunta alla tua subscription.",
        });
      }
      // Se la sub esiste ma non è active, procedi con nuova Checkout Session.
    }

    /* ---------------------------------------------------------------- */
    /*  BRANCH B — prima zona: Checkout Session                           */
    /* ---------------------------------------------------------------- */
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia/territori?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia/territori?canceled=true`,
      // Stripe Tax: abilitare su Dashboard prima di passare a live
      // (quando attivo: automatic_tax.enabled=true + customer_update.address=auto)
      tax_id_collection: { enabled: true },
      customer_update: { name: "auto", address: "auto" },
      billing_address_collection: "required",
      custom_fields: [
        {
          key: "codice_destinatario",
          label: { type: "custom", custom: "Codice destinatario SDI (7 caratteri)" },
          type: "text",
          optional: true,
          text: { minimum_length: 6, maximum_length: 7 },
        },
        {
          key: "pec",
          label: { type: "custom", custom: "Indirizzo PEC" },
          type: "text",
          optional: true,
        },
      ],
      subscription_data: {
        ...(TRIAL_PERIOD_DAYS > 0 && { trial_period_days: TRIAL_PERIOD_DAYS }),
        metadata: {
          agencyId: user.agency.id,
          plan,
        },
      },
      metadata: {
        agencyId: user.agency.id,
        plan,
        zoneId,
        monthlyPrice: String(zone.monthlyPrice),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione del pagamento" },
      { status: 500 }
    );
  }
}
