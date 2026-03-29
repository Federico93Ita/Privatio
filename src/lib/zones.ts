import { prisma } from "./prisma";
import { geocodeAddress } from "./geocode";

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
  cap: string
): Promise<string | null> {
  // 1. Match per CAP
  const capMatch = await prisma.zone.findFirst({
    where: { isActive: true, capCodes: { has: cap } },
    select: { id: true },
  });
  if (capMatch) return capMatch.id;

  // 2. Match per città + provincia (case-insensitive)
  const cityNorm = city.trim();
  const cityMatch = await prisma.zone.findFirst({
    where: {
      isActive: true,
      province: province.toUpperCase(),
      city: { equals: cityNorm, mode: "insensitive" },
    },
    select: { id: true },
  });
  if (cityMatch) return cityMatch.id;

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

  const geo = await geocodeAddress("", city, province);
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
