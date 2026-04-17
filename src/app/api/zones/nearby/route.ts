import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveZoneForProperty } from "@/lib/zones";
import { getZoneRadius, distanceKm } from "@/lib/zone-radius";
import { pointInPolygon, polygonArea } from "@/lib/point-in-polygon";

/**
 * GET /api/zones/nearby?city=Moncalieri&province=TO&lat=45.07&lng=7.70
 *
 * Restituisce le zone acquistabili da un'agenzia con sede nel comune indicato:
 * la zona "home" del comune + zone entro raggio operativo (qualsiasi classe —
 * la classe determina solo il prezzo mensile, non la possibilità di acquisto).
 *
 * Modalità:
 * 1. Con lat/lng: usa le coordinate fornite dal client (geocoding lato client)
 *    per trovare la zona più vicina. Preferito.
 * 2. Senza lat/lng: fallback a geocoding server-side via resolveZoneForProperty.
 *
 * Risposta: { homeZoneId: string | null, zones: FormattedZone[] }
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city")?.trim() ?? "";
  const province = searchParams.get("province")?.trim().toUpperCase() ?? "";
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  if (!city || city.length < 2 || !province || province.length !== 2) {
    return NextResponse.json({ homeZoneId: null, zones: [] });
  }

  let homeZoneId: string | null = null;

  if (latParam && lngParam) {
    // ─── Coordinate fornite dal client (geocoding lato client) ───
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ homeZoneId: null, zones: [] });
    }

    // Trova tutte le zone attive della città nella provincia (con boundary per point-in-polygon)
    const cityZones = await prisma.zone.findMany({
      where: {
        isActive: true,
        province,
        city: { equals: city, mode: "insensitive" },
      },
      select: { id: true, lat: true, lng: true, boundary: true },
    });

    // Se nessuna zona per la città specifica, cerca nel cluster municipalities
    let candidates = cityZones;
    if (candidates.length === 0) {
      candidates = await prisma.zone.findMany({
        where: {
          isActive: true,
          province,
          municipalities: { has: city.trim() },
        },
        select: { id: true, lat: true, lng: true, boundary: true },
      });
    }
    // Ultimo fallback: tutte le zone della provincia
    if (candidates.length === 0) {
      candidates = await prisma.zone.findMany({
        where: { isActive: true, province },
        select: { id: true, lat: true, lng: true, boundary: true },
      });
    }

    // 1. Prova point-in-polygon: se più candidate contengono il punto,
    //    preferisci quella con area più piccola (microzona più specifica).
    const pipMatches = candidates
      .filter((z) => z.boundary && pointInPolygon(lat, lng, z.boundary))
      .map((z) => ({ z, area: polygonArea(z.boundary) }))
      .sort((a, b) => a.area - b.area);
    if (pipMatches.length > 0) {
      homeZoneId = pipMatches[0].z.id;
    }

    // 2. Fallback: zona più vicina per distanza centroide
    if (!homeZoneId) {
      let closest: { id: string; dist: number } | null = null;
      for (const z of candidates) {
        if (!z.lat || !z.lng) continue;
        const d = distanceKm(lat, lng, z.lat, z.lng);
        if (!closest || d < closest.dist) {
          closest = { id: z.id, dist: d };
        }
      }
      homeZoneId = closest?.id ?? null;
    }
  } else {
    // ─── Fallback: geocoding server-side (per compatibilità) ───
    const address = searchParams.get("address")?.trim() ?? "";
    homeZoneId = await resolveZoneForProperty(city, province, "", address);
  }

  if (!homeZoneId) {
    return NextResponse.json({ homeZoneId: null, zones: [], needsAddress: true });
  }

  const homeZoneObj = await prisma.zone.findUnique({
    where: { id: homeZoneId },
    select: {
      lat: true,
      lng: true,
      zoneClass: true,
      city: true,
      population: true,
    },
  });
  const homeZone = homeZoneObj;

  if (!homeZone?.lat || !homeZone?.lng) {
    return NextResponse.json({ homeZoneId: null, zones: [] });
  }

  // Fetcha tutte le zone attive della stessa provincia
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

  // Filtra: entro raggio operativo (qualsiasi classe — la classe determina solo il prezzo)
  const maxDist = getZoneRadius(homeZone);

  const nearbyZones = allZones.filter((z) => {
    if (!z.lat || !z.lng) return false;
    if (z.id === homeZoneId) return true;
    // Entro raggio operativo (vale per TUTTE le zone, qualsiasi classe)
    return distanceKm(homeZone.lat!, homeZone.lng!, z.lat, z.lng) <= maxDist;
  });

  // Formatta risposta
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
