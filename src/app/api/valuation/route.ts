import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * GET /api/valuation?city=Torino&province=TO&type=APPARTAMENTO
 *
 * Returns market valuation data based on OMI (Osservatorio Mercato Immobiliare)
 * zone data stored in the Zone table. Falls back to provincial averages when
 * no exact city match is found.
 */
export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(RATE_LIMITS.apiRead, req);
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const province = searchParams.get("province");

  if (!city) {
    return NextResponse.json({ error: "city required" }, { status: 400 });
  }

  try {
    const cityLower = city.toLowerCase();

    // Step 1: Find zone by exact city match or municipality inclusion
    let zone = await prisma.zone.findFirst({
      where: {
        isActive: true,
        avgPricePerSqm: { not: null },
        OR: [
          { city: { equals: city, mode: "insensitive" } },
          { name: { equals: city, mode: "insensitive" } },
        ],
      },
      select: { name: true, avgPricePerSqm: true, zoneClass: true, province: true },
    });

    // Step 2: Check municipalities array
    if (!zone) {
      const allZones = await prisma.zone.findMany({
        where: {
          isActive: true,
          avgPricePerSqm: { not: null },
          ...(province ? { province: province.toUpperCase() } : {}),
        },
        select: { name: true, avgPricePerSqm: true, zoneClass: true, province: true, municipalities: true },
      });

      zone = allZones.find((z) =>
        z.municipalities.some((m) => m.toLowerCase() === cityLower)
      ) ?? null;
    }

    // Step 3: Fallback to provincial average
    let isProvincial = false;
    if (!zone && province) {
      const provincialZones = await prisma.zone.findMany({
        where: {
          isActive: true,
          province: province.toUpperCase(),
          avgPricePerSqm: { not: null },
        },
        select: { avgPricePerSqm: true, zoneClass: true, province: true, name: true },
      });

      if (provincialZones.length > 0) {
        const prices = provincialZones.map((z) => z.avgPricePerSqm!);
        const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
        zone = {
          name: `Provincia di ${province.toUpperCase()}`,
          avgPricePerSqm: avg,
          zoneClass: provincialZones[0].zoneClass,
          province: province.toUpperCase(),
        };
        isProvincial = true;
      }
    }

    if (!zone || !zone.avgPricePerSqm) {
      return NextResponse.json(
        { available: false, message: "Dati di mercato non disponibili per questa zona" },
        { headers: { "Cache-Control": "public, s-maxage=3600" } }
      );
    }

    const avg = zone.avgPricePerSqm;
    const minPricePerSqm = Math.round(avg * 0.8);
    const maxPricePerSqm = Math.round(avg * 1.2);

    return NextResponse.json(
      {
        available: true,
        avgPricePerSqm: Math.round(avg),
        minPricePerSqm,
        maxPricePerSqm,
        zoneName: zone.name,
        isProvincial,
        source: "omi",
      },
      {
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800" },
      }
    );
  } catch (error) {
    console.error("Valuation error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
