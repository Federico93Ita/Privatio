import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, PLANS, createZoneStripePrice } from "@/lib/stripe";
import type { PlanKey } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { resolveZoneForProperty } from "@/lib/zones";

/**
 * POST /api/stripe/checkout
 *
 * Crea una sessione Stripe Checkout per acquistare il primo territorio.
 * Body: { zoneId: string }
 *
 * Il piano viene determinato dalla zoneClass della zona.
 * Se l'agenzia ha già una subscription attiva, usa l'API territori
 * per aggiungere line items (non questo endpoint).
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

    // Verifica zona
    const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zone || !zone.isActive) {
      return NextResponse.json({ error: "Zona non disponibile" }, { status: 404 });
    }

    // Verifica prezzo configurato
    if (zone.monthlyPrice <= 0) {
      return NextResponse.json(
        { error: "Prezzo zona non configurato" },
        { status: 400 }
      );
    }

    // Verifica slot disponibili
    const currentCount = await prisma.territoryAssignment.count({
      where: { zoneId, isActive: true },
    });

    if (currentCount >= zone.maxAgencies) {
      return NextResponse.json(
        { error: "Nessuno slot disponibile per questa zona" },
        { status: 409 }
      );
    }

    // Verifica che l'agenzia non abbia già questa zona
    const existingTerritory = await prisma.territoryAssignment.findUnique({
      where: { agencyId_zoneId: { agencyId: user.agency.id, zoneId } },
    });
    if (existingTerritory?.isActive) {
      return NextResponse.json(
        { error: "Hai già un territorio attivo in questa zona" },
        { status: 409 }
      );
    }

    // Verifica limiti zone (max 3)
    const activeZones = await prisma.territoryAssignment.count({
      where: { agencyId: user.agency.id, isActive: true },
    });
    if (activeZones >= 3) {
      return NextResponse.json(
        { error: "Limite di 3 zone raggiunto" },
        { status: 400 }
      );
    }

    // Verifica restrizione geografica: l'agenzia può presidiare solo la propria zona e quelle adiacenti
    const homeZoneId = await resolveZoneForProperty(user.agency.city, user.agency.province, "");
    if (homeZoneId) {
      const homeZone = await prisma.zone.findUnique({
        where: { id: homeZoneId },
        select: { adjacentZoneIds: true },
      });
      const allowed = [homeZoneId, ...(homeZone?.adjacentZoneIds ?? [])];
      if (!allowed.includes(zoneId)) {
        return NextResponse.json(
          { error: "Puoi presidiare solo zone nella tua area geografica" },
          { status: 403 }
        );
      }
    }

    // Plan = zona's zoneClass
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

    // Crea Stripe Price per questa zona
    const stripePriceId = await createZoneStripePrice(
      zone.name,
      zone.id,
      plan,
      zone.monthlyPrice
    );

    // Crea checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia/territori?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia/territori?canceled=true`,
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
