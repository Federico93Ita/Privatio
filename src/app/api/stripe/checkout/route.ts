import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, PLANS, createZoneStripePrice } from "@/lib/stripe";
import type { PlanKey } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/stripe/checkout
 *
 * Crea una sessione Stripe Checkout per acquistare il primo territorio.
 * Body: { plan: PlanKey, zoneId: string }
 *
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
    const { plan, zoneId } = body as { plan: PlanKey; zoneId: string };

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "Piano non valido" }, { status: 400 });
    }

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

    // Verifica prezzo disponibile per il piano
    const priceField = `price${plan === "BASE" ? "Base" : plan === "PREMIER_LOCAL" ? "Local" : plan === "PREMIER_CITY" ? "City" : plan === "PREMIER_PRIME" ? "Prime" : "Elite"}` as keyof typeof zone;
    const zonePrice = zone[priceField] as number | null;

    if (zonePrice == null) {
      return NextResponse.json(
        { error: "Questo piano non è disponibile per questa zona" },
        { status: 400 }
      );
    }

    // Verifica slot disponibili
    const maxField = `max${plan === "BASE" ? "Base" : plan === "PREMIER_LOCAL" ? "Local" : plan === "PREMIER_CITY" ? "City" : plan === "PREMIER_PRIME" ? "Prime" : "Elite"}` as keyof typeof zone;
    const maxSlots = zone[maxField] as number;
    const currentCount = await prisma.territoryAssignment.count({
      where: { zoneId, plan, isActive: true },
    });

    if (currentCount >= maxSlots) {
      return NextResponse.json(
        { error: "Nessuno slot disponibile per questo piano in questa zona" },
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

    // Verifica limiti zone del piano
    const activeZones = await prisma.territoryAssignment.count({
      where: { agencyId: user.agency.id, isActive: true },
    });
    if (activeZones >= PLANS[plan].maxZones) {
      return NextResponse.json(
        { error: `Il piano ${PLANS[plan].name} consente massimo ${PLANS[plan].maxZones} zone` },
        { status: 400 }
      );
    }

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
      zonePrice
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
        monthlyPrice: String(zonePrice),
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
