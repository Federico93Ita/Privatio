import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMarketScore, calculateZonePricing } from "@/lib/zone-pricing";
import type { ZoneClass } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/zones — lista tutte le zone con assignment count    */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const province = searchParams.get("province");
  const region = searchParams.get("region");
  const zoneClass = searchParams.get("zoneClass") as ZoneClass | null;

  const where: any = {};
  if (province) where.province = province;
  if (region) where.region = region;
  if (zoneClass) where.zoneClass = zoneClass;

  const zones = await prisma.zone.findMany({
    where,
    include: {
      territories: {
        where: { isActive: true },
        select: {
          id: true,
          plan: true,
          agency: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ province: "asc" }, { name: "asc" }],
  });

  const result = zones.map((z) => ({
    ...z,
    activePartners: z.territories.length,
    partnersByPlan: {
      BASE: z.territories.filter((t) => t.plan === "BASE").length,
      PREMIER_LOCAL: z.territories.filter((t) => t.plan === "PREMIER_LOCAL").length,
      PREMIER_CITY: z.territories.filter((t) => t.plan === "PREMIER_CITY").length,
      PREMIER_PRIME: z.territories.filter((t) => t.plan === "PREMIER_PRIME").length,
      PREMIER_ELITE: z.territories.filter((t) => t.plan === "PREMIER_ELITE").length,
    },
  }));

  return NextResponse.json(result);
}

/* ------------------------------------------------------------------ */
/*  POST /api/admin/zones — crea nuova zona                            */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const body = await req.json();
  const {
    name,
    slug,
    zoneClass,
    region,
    province,
    city,
    capCodes,
    municipalities,
    population,
    ntn,
  } = body;

  if (!name || !slug || !zoneClass || !region || !province) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  // Controlla slug unico
  const existing = await prisma.zone.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug già in uso" }, { status: 409 });
  }

  const pop = population || 0;
  const transactions = ntn || 0;
  const score = calculateMarketScore(pop, transactions);
  const pricing = calculateZonePricing(zoneClass as ZoneClass, score);

  const zone = await prisma.zone.create({
    data: {
      name,
      slug,
      zoneClass,
      region,
      province,
      city: city || null,
      capCodes: capCodes || [],
      municipalities: municipalities || [],
      population: pop,
      ntn: transactions,
      marketScore: score,
      ...pricing,
    },
  });

  return NextResponse.json(zone, { status: 201 });
}
