import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMarketScore, calculateZonePrice } from "@/lib/zone-pricing";
import type { ZoneClass } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/zones/[id] — dettaglio zona con agenzie assegnate   */
/* ------------------------------------------------------------------ */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { id } = await params;

  const zone = await prisma.zone.findUnique({
    where: { id },
    include: {
      territories: {
        include: {
          agency: { select: { id: true, name: true, email: true, phone: true, city: true } },
        },
      },
      _count: { select: { properties: true } },
    },
  });

  if (!zone) {
    return NextResponse.json({ error: "Zona non trovata" }, { status: 404 });
  }

  return NextResponse.json(zone);
}

/* ------------------------------------------------------------------ */
/*  PUT /api/admin/zones/[id] — modifica zona                          */
/* ------------------------------------------------------------------ */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.zone.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Zona non trovata" }, { status: 404 });
  }

  const population = body.population ?? existing.population;
  const ntn = body.ntn ?? existing.ntn;
  const zoneClass = (body.zoneClass ?? existing.zoneClass) as ZoneClass;

  let pricingUpdate = {};
  if (body.recalculatePricing) {
    const score = calculateMarketScore(population, ntn);
    const pricing = calculateZonePrice(zoneClass, population, ntn, body.avgPricePerSqm ?? existing.avgPricePerSqm ?? 0);
    pricingUpdate = {
      marketScore: score,
      monthlyPrice: pricing.monthlyPrice,
      maxAgencies: pricing.maxAgencies,
    };
  }

  const zone = await prisma.zone.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.city !== undefined && { city: body.city }),
      ...(body.capCodes && { capCodes: body.capCodes }),
      ...(body.municipalities && { municipalities: body.municipalities }),
      ...(body.population !== undefined && { population }),
      ...(body.ntn !== undefined && { ntn }),
      ...(body.zoneClass && { zoneClass }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.avgPricePerSqm !== undefined && { avgPricePerSqm: body.avgPricePerSqm }),
      ...(body.adjacentZoneIds && { adjacentZoneIds: body.adjacentZoneIds }),
      // Override prezzi manuali
      ...(body.monthlyPrice !== undefined && { monthlyPrice: body.monthlyPrice }),
      ...(body.maxAgencies !== undefined && { maxAgencies: body.maxAgencies }),
      ...pricingUpdate,
    },
  });

  return NextResponse.json(zone);
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/admin/zones/[id] — soft delete                         */
/* ------------------------------------------------------------------ */

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { id } = await params;

  const zone = await prisma.zone.findUnique({
    where: { id },
    include: { territories: { where: { isActive: true } } },
  });

  if (!zone) {
    return NextResponse.json({ error: "Zona non trovata" }, { status: 404 });
  }

  if (zone.territories.length > 0) {
    return NextResponse.json(
      { error: "Impossibile eliminare: ci sono partner attivi in questa zona" },
      { status: 409 }
    );
  }

  await prisma.zone.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
