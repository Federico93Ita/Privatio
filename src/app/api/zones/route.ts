import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  GET /api/zones — browse zone disponibili (pubblico/agenzia)        */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const province = searchParams.get("province");
  const region = searchParams.get("region");
  const city = searchParams.get("city");
  const adjacentTo = searchParams.get("adjacentTo");

  // Zone adiacenti a una zona specifica
  if (adjacentTo) {
    const zone = await prisma.zone.findUnique({
      where: { id: adjacentTo },
      select: { adjacentZoneIds: true },
    });
    if (!zone) {
      return NextResponse.json({ error: "Zona non trovata" }, { status: 404 });
    }
    if (zone.adjacentZoneIds.length === 0) {
      return NextResponse.json([]);
    }
    const adjacent = await prisma.zone.findMany({
      where: { id: { in: zone.adjacentZoneIds }, isActive: true },
      include: { territories: { where: { isActive: true }, select: { id: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(adjacent.map(formatZone));
  }

  if (!province && !region) {
    // Restituisci lista province/regioni disponibili
    const zones = await prisma.zone.findMany({
      where: { isActive: true },
      select: { province: true, region: true },
      distinct: ["province"],
      orderBy: { region: "asc" },
    });

    const regions = new Map<string, string[]>();
    for (const z of zones) {
      const list = regions.get(z.region) || [];
      list.push(z.province);
      regions.set(z.region, list);
    }

    return NextResponse.json({ regions: Object.fromEntries(regions) });
  }

  const where: Record<string, unknown> = { isActive: true };
  if (province) where.province = province;
  if (region) where.region = region;
  if (city) where.city = city;

  const zones = await prisma.zone.findMany({
    where,
    include: {
      territories: {
        where: { isActive: true },
        select: { id: true },
      },
    },
    orderBy: [{ zoneClass: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(zones.map(formatZone));
}

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function formatZone(z: {
  id: string;
  name: string;
  slug: string;
  zoneClass: string;
  region: string;
  province: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  boundary: unknown | null;
  municipalities: string[];
  marketScore: number;
  population: number;
  monthlyPrice: number;
  maxAgencies: number;
  adjacentZoneIds: string[];
  territories: { id: string }[];
}) {
  return {
    id: z.id,
    name: z.name,
    slug: z.slug,
    zoneClass: z.zoneClass,
    region: z.region,
    province: z.province,
    city: z.city,
    lat: z.lat,
    lng: z.lng,
    boundary: z.boundary,
    municipalities: z.municipalities,
    marketScore: z.marketScore,
    population: z.population,
    // Simplified pricing: one price per zone
    plan: z.zoneClass,
    price: z.monthlyPrice,
    slots: { taken: z.territories.length, max: z.maxAgencies },
    adjacentZoneIds: z.adjacentZoneIds,
  };
}
