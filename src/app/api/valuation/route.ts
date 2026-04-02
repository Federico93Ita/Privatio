import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * Province → Region mapping for fallback when province has no zone data.
 * Covers all Italian provinces.
 */
const PROVINCE_TO_REGION: Record<string, string> = {
  // Piemonte
  TO: "Piemonte", VC: "Piemonte", NO: "Piemonte", CN: "Piemonte", AT: "Piemonte", AL: "Piemonte", BI: "Piemonte", VB: "Piemonte",
  // Valle d'Aosta
  AO: "Valle d'Aosta",
  // Lombardia
  MI: "Lombardia", VA: "Lombardia", CO: "Lombardia", SO: "Lombardia", BG: "Lombardia", BS: "Lombardia", PV: "Lombardia", CR: "Lombardia",
  MN: "Lombardia", LC: "Lombardia", LO: "Lombardia", MB: "Lombardia",
  // Trentino-Alto Adige
  BZ: "Trentino-Alto Adige", TN: "Trentino-Alto Adige",
  // Veneto
  VR: "Veneto", VI: "Veneto", BL: "Veneto", TV: "Veneto", VE: "Veneto", PD: "Veneto", RO: "Veneto",
  // Friuli-Venezia Giulia
  UD: "Friuli-Venezia Giulia", GO: "Friuli-Venezia Giulia", TS: "Friuli-Venezia Giulia", PN: "Friuli-Venezia Giulia",
  // Liguria
  IM: "Liguria", SV: "Liguria", GE: "Liguria", SP: "Liguria",
  // Emilia-Romagna
  PC: "Emilia-Romagna", PR: "Emilia-Romagna", RE: "Emilia-Romagna", MO: "Emilia-Romagna", BO: "Emilia-Romagna",
  FE: "Emilia-Romagna", RA: "Emilia-Romagna", FC: "Emilia-Romagna", RN: "Emilia-Romagna",
  // Toscana
  MS: "Toscana", LU: "Toscana", PT: "Toscana", FI: "Toscana", LI: "Toscana", PI: "Toscana", AR: "Toscana", SI: "Toscana", GR: "Toscana", PO: "Toscana",
  // Umbria
  PG: "Umbria", TR: "Umbria",
  // Marche
  PU: "Marche", AN: "Marche", MC: "Marche", AP: "Marche", FM: "Marche",
  // Lazio
  VT: "Lazio", RI: "Lazio", RM: "Lazio", LT: "Lazio", FR: "Lazio",
  // Abruzzo
  AQ: "Abruzzo", TE: "Abruzzo", PE: "Abruzzo", CH: "Abruzzo",
  // Molise
  CB: "Molise", IS: "Molise",
  // Campania
  CE: "Campania", BN: "Campania", NA: "Campania", AV: "Campania", SA: "Campania",
  // Puglia
  FG: "Puglia", BA: "Puglia", TA: "Puglia", BR: "Puglia", LE: "Puglia", BT: "Puglia",
  // Basilicata
  PZ: "Basilicata", MT: "Basilicata",
  // Calabria
  CS: "Calabria", CZ: "Calabria", KR: "Calabria", VV: "Calabria", RC: "Calabria",
  // Sicilia
  TP: "Sicilia", PA: "Sicilia", ME: "Sicilia", AG: "Sicilia", CL: "Sicilia", EN: "Sicilia", CT: "Sicilia", RG: "Sicilia", SR: "Sicilia",
  // Sardegna
  SS: "Sardegna", NU: "Sardegna", CA: "Sardegna", OR: "Sardegna", SU: "Sardegna",
};

/**
 * GET /api/valuation?city=Torino&province=TO&type=APPARTAMENTO
 *
 * Returns market valuation data based on OMI (Osservatorio Mercato Immobiliare)
 * zone data stored in the Zone table.
 *
 * Fallback chain:
 * 1. Exact city/name match
 * 2. Municipality inclusion
 * 3. Provincial average
 * 4. Regional average (same region via province→region mapping)
 * 5. National average (all zones)
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

    // Step 1: Find zone by exact city match
    let zone = await prisma.zone.findFirst({
      where: {
        isActive: true,
        avgPricePerSqm: { not: null },
        OR: [
          { city: { equals: city, mode: "insensitive" } },
          { name: { equals: city, mode: "insensitive" } },
        ],
      },
      select: { name: true, avgPricePerSqm: true, zoneClass: true, province: true, region: true },
    });

    // Step 2: Check municipalities array
    if (!zone) {
      const allZones = await prisma.zone.findMany({
        where: {
          isActive: true,
          avgPricePerSqm: { not: null },
          ...(province ? { province: province.toUpperCase() } : {}),
        },
        select: { name: true, avgPricePerSqm: true, zoneClass: true, province: true, region: true, municipalities: true },
      });

      zone = allZones.find((z) =>
        z.municipalities.some((m) => m.toLowerCase() === cityLower)
      ) ?? null;
    }

    if (zone?.avgPricePerSqm) {
      return jsonResponse(zone.avgPricePerSqm, zone.name, false, "city");
    }

    // Step 3: Provincial average
    if (province) {
      const result = await getAverageForFilter({ province: province.toUpperCase() });
      if (result) {
        return jsonResponse(result.avg, `Provincia di ${province.toUpperCase()}`, true, "province");
      }
    }

    // Step 4: Regional average
    const regionName = province ? PROVINCE_TO_REGION[province.toUpperCase()] : null;
    if (regionName) {
      const result = await getAverageForFilter({ region: regionName });
      if (result) {
        return jsonResponse(result.avg, regionName, true, "region");
      }
    }

    // Step 5: National average (last resort)
    const result = await getAverageForFilter({});
    if (result) {
      return jsonResponse(result.avg, "Media nazionale", true, "national");
    }

    return NextResponse.json(
      { available: false, message: "Dati di mercato non disponibili" },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  } catch (error) {
    console.error("Valuation error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

async function getAverageForFilter(filter: Record<string, string>): Promise<{ avg: number } | null> {
  const zones = await prisma.zone.findMany({
    where: {
      isActive: true,
      avgPricePerSqm: { not: null },
      ...filter,
    },
    select: { avgPricePerSqm: true },
  });

  if (zones.length === 0) return null;

  const prices = zones.map((z) => z.avgPricePerSqm!);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  return { avg };
}

function jsonResponse(avg: number, zoneName: string, isProvincial: boolean, scope: string) {
  return NextResponse.json(
    {
      available: true,
      avgPricePerSqm: Math.round(avg),
      minPricePerSqm: Math.round(avg * 0.8),
      maxPricePerSqm: Math.round(avg * 1.2),
      zoneName,
      isProvincial,
      scope,
      source: "omi",
    },
    {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800" },
    }
  );
}
