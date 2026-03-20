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

    return NextResponse.json({
      regions: Object.fromEntries(regions),
    });
  }

  const where: any = { isActive: true };
  if (province) where.province = province;
  if (region) where.region = region;
  if (city) where.city = city;

  const zones = await prisma.zone.findMany({
    where,
    include: {
      territories: {
        where: { isActive: true },
        select: { plan: true },
      },
    },
    orderBy: [{ zoneClass: "asc" }, { name: "asc" }],
  });

  const result = zones.map((z) => {
    const totalTaken = z.territories.length;

    // Determine the active plan and price for this zone (fixed pricing model)
    const activePlan =
      z.priceBase != null ? "BASE" :
      z.priceLocal != null ? "PREMIER_LOCAL" :
      z.priceCity != null ? "PREMIER_CITY" :
      z.pricePrime != null ? "PREMIER_PRIME" :
      z.priceElite != null ? "PREMIER_ELITE" : null;

    const price =
      z.priceBase ?? z.priceLocal ?? z.priceCity ?? z.pricePrime ?? z.priceElite ?? 0;

    const maxSlots =
      z.maxBase || z.maxLocal || z.maxCity || z.maxPrime || z.maxElite || 0;

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
      municipalities: z.municipalities,
      marketScore: z.marketScore,
      population: z.population,
      // Fixed pricing: one plan, one price per zone
      plan: activePlan,
      price,
      slots: { taken: totalTaken, max: maxSlots },
      // Legacy: keep full prices/slots for backward compatibility
      prices: {
        ...(z.priceBase != null && { BASE: z.priceBase }),
        ...(z.priceLocal != null && { PREMIER_LOCAL: z.priceLocal }),
        ...(z.priceCity != null && { PREMIER_CITY: z.priceCity }),
        ...(z.pricePrime != null && { PREMIER_PRIME: z.pricePrime }),
        ...(z.priceElite != null && { PREMIER_ELITE: z.priceElite }),
      },
      // Legacy slots
      slots_legacy: {
        ...(z.maxBase > 0 && { BASE: { taken: z.territories.filter((t) => t.plan === "BASE").length, max: z.maxBase } }),
        ...(z.maxLocal > 0 && { PREMIER_LOCAL: { taken: z.territories.filter((t) => t.plan === "PREMIER_LOCAL").length, max: z.maxLocal } }),
        ...(z.maxCity > 0 && { PREMIER_CITY: { taken: z.territories.filter((t) => t.plan === "PREMIER_CITY").length, max: z.maxCity } }),
        ...(z.maxPrime > 0 && { PREMIER_PRIME: { taken: z.territories.filter((t) => t.plan === "PREMIER_PRIME").length, max: z.maxPrime } }),
      },
    };
  });

  return NextResponse.json(result);
}
