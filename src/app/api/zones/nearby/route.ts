import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveZoneForProperty } from "@/lib/zones";

/**
 * GET /api/zones/nearby?city=Moncalieri&province=TO
 *
 * Restituisce le zone acquistabili da un'agenzia con sede nel comune indicato:
 * la zona "home" del comune + zone entro 5 km E della stessa classe (BASE/URBANA/PREMIUM).
 *
 * Risposta: { homeZoneId: string | null, zones: FormattedZone[] }
 */

const MAX_DISTANCE_KM = 10;

function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city")?.trim() ?? "";
  const province = searchParams.get("province")?.trim().toUpperCase() ?? "";

  if (!city || city.length < 2 || !province || province.length !== 2) {
    return NextResponse.json({ homeZoneId: null, zones: [] });
  }

  // 1. Risolvi la zona "home" del comune
  const homeZoneId = await resolveZoneForProperty(city, province, "");

  if (!homeZoneId) {
    return NextResponse.json({ homeZoneId: null, zones: [] });
  }

  const homeZone = await prisma.zone.findUnique({
    where: { id: homeZoneId },
    select: { lat: true, lng: true, zoneClass: true },
  });

  if (!homeZone?.lat || !homeZone?.lng) {
    return NextResponse.json({ homeZoneId: null, zones: [] });
  }

  // 2. Fetcha tutte le zone attive della stessa provincia
  const allZones = await prisma.zone.findMany({
    where: { isActive: true, province },
    include: {
      territories: {
        where: { isActive: true },
        select: { id: true },
      },
    },
    orderBy: [{ zoneClass: "asc" }, { name: "asc" }],
  });

  // 3. Filtra per distanza (5km) E stessa classe della zona home
  const nearbyZones = allZones.filter((z) => {
    if (!z.lat || !z.lng) return false;
    if (z.id === homeZoneId) return true;
    // Deve essere stessa zoneClass E entro il raggio
    if (z.zoneClass !== homeZone!.zoneClass) return false;
    return distanceKm(homeZone.lat!, homeZone.lng!, z.lat, z.lng) <= MAX_DISTANCE_KM;
  });

  // 4. Formatta risposta
  return NextResponse.json({
    homeZoneId,
    zones: nearbyZones.map((z) => ({
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
      plan: z.zoneClass,
      price: z.monthlyPrice,
      slots: { taken: z.territories.length, max: z.maxAgencies },
      adjacentZoneIds: z.adjacentZoneIds,
      isHome: z.id === homeZoneId,
    })),
  });
}
