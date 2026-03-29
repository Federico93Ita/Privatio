import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS, createZoneStripePrice, highestPlan } from "@/lib/stripe";
import type { PlanKey } from "@/lib/stripe";
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
          monthlyPrice: true,
          maxAgencies: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    plan: user.agency.plan,
    maxZones: 3, // max zones per agency in new model
    territories,
  });
}

/* ------------------------------------------------------------------ */
/*  POST /api/dashboard/agency/territories — aggiungi zona             */
/*  Body: { zoneId: string }                                           */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json();
  const { zoneId } = body as { zoneId: string };

  if (!zoneId) {
    return NextResponse.json({ error: "ID zona mancante" }, { status: 400 });
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

  if (zone.monthlyPrice <= 0) {
    return NextResponse.json({ error: "Prezzo zona non configurato" }, { status: 400 });
  }

  // Verifica restrizione geografica: entro 5km E stessa classe (BASE/URBANA/PREMIUM)
  const homeZoneId = await resolveZoneForProperty(agency.city, agency.province, "");
  if (homeZoneId && homeZoneId !== zoneId) {
    const homeZone = await prisma.zone.findUnique({
      where: { id: homeZoneId },
      select: { lat: true, lng: true, zoneClass: true },
    });
    // Blocca se classe diversa
    if (homeZone?.zoneClass && zone.zoneClass !== homeZone.zoneClass) {
      return NextResponse.json(
        { error: "Puoi presidiare solo zone della tua stessa classe" },
        { status: 403 }
      );
    }
    // Blocca se distanza > 5km
    if (homeZone?.lat && homeZone?.lng && zone.lat && zone.lng) {
      const dist = distanceKm(homeZone.lat, homeZone.lng, zone.lat, zone.lng);
      if (dist > 10) {
        return NextResponse.json(
          { error: "Puoi presidiare solo zone nella tua area geografica" },
          { status: 403 }
        );
      }
    }
  }

  // Verifica slot
  const currentCount = await prisma.territoryAssignment.count({
    where: { zoneId, isActive: true },
  });
  if (currentCount >= zone.maxAgencies) {
    return NextResponse.json({ error: "Nessuno slot disponibile" }, { status: 409 });
  }

  // Verifica zona non già assegnata
  const existing = await prisma.territoryAssignment.findUnique({
    where: { agencyId_zoneId: { agencyId: agency.id, zoneId } },
  });
  if (existing?.isActive) {
    return NextResponse.json({ error: "Zona già attiva" }, { status: 409 });
  }

  // Verifica limiti zone (max 3)
  const activeCount = await prisma.territoryAssignment.count({
    where: { agencyId: agency.id, isActive: true },
  });
  if (activeCount >= 3) {
    return NextResponse.json(
      { error: "Limite di 3 zone raggiunto" },
      { status: 400 }
    );
  }

  // Plan = zona's zoneClass
  const plan = zone.zoneClass as PlanKey;

  // Crea Stripe Price e aggiungi line item alla subscription
  const stripePriceId = await createZoneStripePrice(
    zone.name,
    zone.id,
    plan,
    zone.monthlyPrice
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
      monthlyPrice: zone.monthlyPrice,
      isActive: true,
      stripeItemId: subItem.id,
    },
    create: {
      agencyId: agency.id,
      zoneId,
      plan,
      monthlyPrice: zone.monthlyPrice,
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
