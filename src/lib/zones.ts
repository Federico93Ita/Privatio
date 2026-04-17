import { prisma } from "./prisma";
import { geocodeAddress } from "./geocode";
import { pointInPolygon, polygonArea } from "./point-in-polygon";

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Risolve la zona per un immobile basandosi su CAP, città e provincia.
 *
 * Con il nuovo modello, ogni comune è in ESATTAMENTE una zona.
 * Non ci sono più sovrapposizioni tra classi diverse.
 *
 * Ordine di priorità:
 * 1. Match esatto per CAP
 * 2. Match per città + provincia
 * 3. Match per comune nel cluster (municipalities)
 * 4. Fallback: geocodifica il comune e trova la zona più vicina
 */
export async function resolveZoneForProperty(
  city: string,
  province: string,
  cap: string,
  address: string = ""
): Promise<string | null> {
  // 1. Match per CAP (solo se univoco — se più zone condividono lo stesso CAP,
  //    cadere nel matching per città + point-in-polygon)
  if (cap) {
    const capMatches = await prisma.zone.findMany({
      where: { isActive: true, capCodes: { has: cap } },
      select: { id: true },
    });
    if (capMatches.length === 1) return capMatches[0].id;
    // Se >1, non restituiamo subito — usiamo city+province matching con PIP
  }

  // 2. Match per città + provincia (case-insensitive)
  //    Se ci sono più zone con lo stesso city (sotto-zone di grandi città),
  //    usa geocoding per trovare la più vicina
  const cityNorm = city.trim();
  const cityMatches = await prisma.zone.findMany({
    where: {
      isActive: true,
      province: province.toUpperCase(),
      city: { equals: cityNorm, mode: "insensitive" },
    },
    select: { id: true, lat: true, lng: true, name: true, boundary: true },
  });
  if (cityMatches.length === 1) return cityMatches[0].id;
  if (cityMatches.length > 1) {
    // Più sotto-zone: geocodifica indirizzo completo
    const geo = await geocodeAddress(address, city, province);
    if (geo.ok) {
      // 1. Prova point-in-polygon: se più zone contengono il punto (boundary
      //    sovrapposti), preferisci quella con area più piccola = microzona
      //    più specifica.
      const pipMatches = cityMatches
        .filter((z) => z.boundary && pointInPolygon(geo.lat, geo.lng, z.boundary))
        .map((z) => ({ z, area: polygonArea(z.boundary) }))
        .sort((a, b) => a.area - b.area);
      if (pipMatches.length > 0) return pipMatches[0].z.id;

      // 2. Fallback: zona più vicina per distanza centroide
      let closest: { id: string; dist: number } | null = null;
      for (const z of cityMatches) {
        if (!z.lat || !z.lng) continue;
        const d = distanceKm(geo.lat, geo.lng, z.lat, z.lng);
        if (!closest || d < closest.dist) {
          closest = { id: z.id, dist: d };
        }
      }
      if (closest) return closest.id;
    }
    // Senza indirizzo non possiamo determinare la zona corretta
    if (!address.trim()) return null;
    // Geocoding fallito con indirizzo valido: fallback a nearest-centroid
    console.warn(
      `[zones] Server-side geocoding failed for "${address}, ${city}, ${province}". ` +
      `Falling back to nearest centroid.`
    );
    // Usa nearest-centroid come fallback (i centroidi sono calcolati dai boundary reali)
    let closest: { id: string; dist: number } | null = null;
    for (const z of cityMatches) {
      if (!z.lat || !z.lng) continue;
      // Usa il centroide della città come approssimazione
      const geo2 = await geocodeAddress("", city, province);
      if (geo2.ok) {
        const d = distanceKm(geo2.lat, geo2.lng, z.lat, z.lng);
        if (!closest || d < closest.dist) {
          closest = { id: z.id, dist: d };
        }
      }
    }
    return closest?.id ?? cityMatches[0].id;
  }

  // 3. Match per municipalities (cluster)
  const clusterMatch = await prisma.zone.findFirst({
    where: {
      isActive: true,
      province: province.toUpperCase(),
      municipalities: { has: cityNorm },
    },
    select: { id: true },
  });
  if (clusterMatch) return clusterMatch.id;

  // 4. Fallback: geocodifica il comune e trova la zona più vicina per distanza
  const allProvZones = await prisma.zone.findMany({
    where: { isActive: true, province: province.toUpperCase() },
    select: { id: true, lat: true, lng: true },
  });

  if (allProvZones.length === 0) return null;

  const geo = await geocodeAddress(address, city, province);
  if (geo.ok) {
    let closest: { id: string; dist: number } | null = null;
    for (const z of allProvZones) {
      if (!z.lat || !z.lng) continue;
      const d = distanceKm(geo.lat, geo.lng, z.lat, z.lng);
      if (!closest || d < closest.dist) {
        closest = { id: z.id, dist: d };
      }
    }
    if (closest) return closest.id;
  }

  // Ultimo fallback: prima zona della provincia
  return allProvZones[0]?.id || null;
}

/**
 * Auto-assegna la zona a un immobile se non già assegnata.
 */
export async function autoAssignZoneToProperty(propertyId: string): Promise<string | null> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, zoneId: true, city: true, province: true, cap: true },
  });

  if (!property) return null;
  if (property.zoneId) return property.zoneId;

  const zoneId = await resolveZoneForProperty(
    property.city,
    property.province,
    property.cap
  );

  if (zoneId) {
    await prisma.property.update({
      where: { id: propertyId },
      data: { zoneId },
    });
  }

  return zoneId;
}
