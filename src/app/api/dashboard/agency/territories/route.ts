import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS, createZoneStripePrice, highestPlan } from "@/lib/stripe";
import type { PlanKey } from "@/lib/stripe";

/* ------------------------------------------------------------------ */
/*  Helper: campo prezzo per piano                                     */
/* ------------------------------------------------------------------ */

function priceFieldForPlan(plan: PlanKey): string {
  const map: Record<PlanKey, string> = {
    BASE: "priceBase",
    PREMIER_LOCAL: "priceLocal",
    PREMIER_CITY: "priceCity",
    PREMIER_PRIME: "pricePrime",
    PREMIER_ELITE: "priceElite",
  };
  return map[plan];
}

function maxFieldForPlan(plan: PlanKey): string {
  const map: Record<PlanKey, string> = {
    BASE: "maxBase",
    PREMIER_LOCAL: "maxLocal",
    PREMIER_CITY: "maxCity",
    PREMIER_PRIME: "maxPrime",
    PREMIER_ELITE: "maxElite",
  };
  return map[plan];
}

/* ------------------------------------------------------------------ */
/*  GET /api/dashboard/agency/territories                              */
/* ------------------------------------------------------------------ */

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { agency: true },
  });

  if (!user?.agency) {
    return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 });
  }

  const territories = await prisma.territoryAssignment.findMany({
    where: { agencyId: user.agency.id },
    include: {
      zone: {
        select: {
          id: true,
          name: true,
          slug: true,
          zoneClass: true,
          region: true,
          province: true,
          city: true,
          marketScore: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    plan: user.agency.plan,
    maxZones: PLANS[user.agency.plan as PlanKey]?.maxZones || 1,
    territories,
  });
}

/* ------------------------------------------------------------------ */
/*  POST /api/dashboard/agency/territories — aggiungi zona              */
/*  Body: { plan: PlanKey, zoneId: string }                            */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json();
  const { plan, zoneId } = body as { plan: PlanKey; zoneId: string };

  if (!plan || !PLANS[plan] || !zoneId) {
    return NextResponse.json({ error: "Parametri non validi" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { agency: true },
  });

  if (!user?.agency) {
    return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 });
  }

  const agency = user.agency;

  // Se non ha subscription attiva, usa il checkout flow
  if (!agency.stripeSubId || !agency.isActive) {
    return NextResponse.json(
      { error: "redirect_to_checkout", message: "Usa il checkout per il primo territorio" },
      { status: 400 }
    );
  }

  // Verifica zona
  const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
  if (!zone || !zone.isActive) {
    return NextResponse.json({ error: "Zona non disponibile" }, { status: 404 });
  }

  // Verifica prezzo
  const zonePrice = zone[priceFieldForPlan(plan) as keyof typeof zone] as number | null;
  if (zonePrice == null) {
    return NextResponse.json(
      { error: "Piano non disponibile per questa zona" },
      { status: 400 }
    );
  }

  // Verifica slot
  const maxSlots = zone[maxFieldForPlan(plan) as keyof typeof zone] as number;
  const currentCount = await prisma.territoryAssignment.count({
    where: { zoneId, plan, isActive: true },
  });
  if (currentCount >= maxSlots) {
    return NextResponse.json({ error: "Nessuno slot disponibile" }, { status: 409 });
  }

  // Verifica zona non già assegnata
  const existing = await prisma.territoryAssignment.findUnique({
    where: { agencyId_zoneId: { agencyId: agency.id, zoneId } },
  });
  if (existing?.isActive) {
    return NextResponse.json({ error: "Zona già attiva" }, { status: 409 });
  }

  // Verifica limiti zone piano
  const activeCount = await prisma.territoryAssignment.count({
    where: { agencyId: agency.id, isActive: true },
  });
  if (activeCount >= PLANS[plan].maxZones) {
    return NextResponse.json(
      { error: `Limite zone raggiunto per il piano ${PLANS[plan].name}` },
      { status: 400 }
    );
  }

  // Crea Stripe Price e aggiungi line item alla subscription
  const stripePriceId = await createZoneStripePrice(
    zone.name,
    zone.id,
    plan,
    zonePrice
  );

  const subItem = await stripe.subscriptionItems.create({
    subscription: agency.stripeSubId,
    price: stripePriceId,
    quantity: 1,
  });

  // Crea o riattiva TerritoryAssignment
  const territory = await prisma.territoryAssignment.upsert({
    where: { agencyId_zoneId: { agencyId: agency.id, zoneId } },
    update: {
      plan,
      monthlyPrice: zonePrice,
      isActive: true,
      stripeItemId: subItem.id,
    },
    create: {
      agencyId: agency.id,
      zoneId,
      plan,
      monthlyPrice: zonePrice,
      isActive: true,
      stripeItemId: subItem.id,
    },
  });

  // Aggiorna piano massimo agenzia
  const allTerritories = await prisma.territoryAssignment.findMany({
    where: { agencyId: agency.id, isActive: true },
    select: { plan: true },
  });
  const topPlan = highestPlan(allTerritories.map((t) => t.plan as PlanKey));

  await prisma.agency.update({
    where: { id: agency.id },
    data: { plan: topPlan },
  });

  return NextResponse.json(territory, { status: 201 });
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/dashboard/agency/territories — rilascia zona            */
/*  Body: { territoryId: string }                                      */
/* ------------------------------------------------------------------ */

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json();
  const { territoryId } = body as { territoryId: string };

  if (!territoryId) {
    return NextResponse.json({ error: "ID territorio mancante" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { agency: true },
  });

  if (!user?.agency) {
    return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 });
  }

  const territory = await prisma.territoryAssignment.findFirst({
    where: { id: territoryId, agencyId: user.agency.id, isActive: true },
  });

  if (!territory) {
    return NextResponse.json({ error: "Territorio non trovato" }, { status: 404 });
  }

  // Rimuovi line item da Stripe
  if (territory.stripeItemId) {
    try {
      await stripe.subscriptionItems.del(territory.stripeItemId, {
        proration_behavior: "create_prorations",
      });
    } catch (err) {
      console.error("Errore rimozione Stripe item:", err);
    }
  }

  // Disattiva territorio
  await prisma.territoryAssignment.update({
    where: { id: territory.id },
    data: { isActive: false, stripeItemId: null },
  });

  // Aggiorna piano massimo agenzia
  const remaining = await prisma.territoryAssignment.findMany({
    where: { agencyId: user.agency.id, isActive: true },
    select: { plan: true },
  });
  const topPlan = highestPlan(remaining.map((t) => t.plan as PlanKey));

  await prisma.agency.update({
    where: { id: user.agency.id },
    data: { plan: topPlan },
  });

  return NextResponse.json({ ok: true });
}
