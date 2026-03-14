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
    const activeByPlan = {
      BASE: z.territories.filter((t) => t.plan === "BASE").length,
      PREMIER_LOCAL: z.territories.filter((t) => t.plan === "PREMIER_LOCAL").length,
      PREMIER_CITY: z.territories.filter((t) => t.plan === "PREMIER_CITY").length,
      PREMIER_PRIME: z.territories.filter((t) => t.plan === "PREMIER_PRIME").length,
      PREMIER_ELITE: z.territories.filter((t) => t.plan === "PREMIER_ELITE").length,
    };

    return {
      id: z.id,
      name: z.name,
      slug: z.slug,
      zoneClass: z.zoneClass,
      region: z.region,
      province: z.province,
      city: z.city,
      municipalities: z.municipalities,
      marketScore: z.marketScore,
      population: z.population,
      // Prezzi (solo quelli disponibili)
      prices: {
        ...(z.priceBase != null && { BASE: z.priceBase }),
        ...(z.priceLocal != null && { PREMIER_LOCAL: z.priceLocal }),
        ...(z.priceCity != null && { PREMIER_CITY: z.priceCity }),
        ...(z.pricePrime != null && { PREMIER_PRIME: z.pricePrime }),
        ...(z.priceElite != null && { PREMIER_ELITE: z.priceElite }),
      },
      // Slot: disponibili / massimi
      slots: {
        ...(z.maxBase > 0 && { BASE: { taken: activeByPlan.BASE, max: z.maxBase } }),
        ...(z.maxLocal > 0 && { PREMIER_LOCAL: { taken: activeByPlan.PREMIER_LOCAL, max: z.maxLocal } }),
        ...(z.maxCity > 0 && { PREMIER_CITY: { taken: activeByPlan.PREMIER_CITY, max: z.maxCity } }),
        ...(z.maxPrime > 0 && { PREMIER_PRIME: { taken: activeByPlan.PREMIER_PRIME, max: z.maxPrime } }),
        ...(z.maxElite > 0 && { PREMIER_ELITE: { taken: activeByPlan.PREMIER_ELITE, max: z.maxElite } }),
      },
    };
  });

  return NextResponse.json(result);
}
