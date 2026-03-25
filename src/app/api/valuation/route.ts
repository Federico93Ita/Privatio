import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * GET /api/valuation?city=Torino&type=APPARTAMENTO
 *
 * Returns average, min, and max price per sqm for published properties
 * in the given city and type. Used for the property valuation widget.
 */
export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(RATE_LIMITS.apiRead, req);
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const type = searchParams.get("type");

  if (!city) {
    return NextResponse.json({ error: "city required" }, { status: 400 });
  }

  try {
    const properties = await prisma.property.findMany({
      where: {
        city: { equals: city, mode: "insensitive" },
        status: "PUBLISHED",
        surface: { gt: 0 },
        ...(type ? { type: type as never } : {}),
      },
      select: { price: true, surface: true },
    });

    if (properties.length < 2) {
      return NextResponse.json({ count: properties.length }, {
        headers: { "Cache-Control": "public, s-maxage=3600" },
      });
    }

    const pricesPerSqm = properties.map((p) => Math.round(p.price / p.surface));
    const sorted = pricesPerSqm.sort((a, b) => a - b);

    // Remove outliers (bottom and top 10%)
    const trimStart = Math.floor(sorted.length * 0.1);
    const trimEnd = Math.ceil(sorted.length * 0.9);
    const trimmed = sorted.slice(trimStart, trimEnd);
    const effective = trimmed.length > 0 ? trimmed : sorted;

    const avg = Math.round(effective.reduce((a, b) => a + b, 0) / effective.length);

    return NextResponse.json(
      {
        avgPricePerSqm: avg,
        minPricePerSqm: effective[0],
        maxPricePerSqm: effective[effective.length - 1],
        count: properties.length,
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
