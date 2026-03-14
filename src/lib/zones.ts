import { prisma } from "./prisma";

/**
 * Risolve la zona per un immobile basandosi su CAP, città e provincia.
 *
 * Ordine di priorità:
 * 1. Match esatto per CAP (il CAP dell'immobile è in zone.capCodes)
 * 2. Match per città + provincia
 * 3. Match per comune nel cluster (municipalities contiene la città)
 * 4. Nessuna zona trovata
 *
 * Tra match multipli, preferisce la zona più specifica:
 * MICROZONA_PRIME > MACROQUARTIERE > COMUNE > CLUSTER_LOCAL
 */
export async function resolveZoneForProperty(
  city: string,
  province: string,
  cap: string
): Promise<string | null> {
  const ZONE_CLASS_PRIORITY = {
    MICROZONA_PRIME: 4,
    MACROQUARTIERE: 3,
    COMUNE: 2,
    CLUSTER_LOCAL: 1,
  } as const;

  // 1. Match per CAP
  const capMatches = await prisma.zone.findMany({
    where: {
      isActive: true,
      capCodes: { has: cap },
    },
    select: { id: true, zoneClass: true },
  });

  if (capMatches.length > 0) {
    capMatches.sort(
      (a, b) =>
        (ZONE_CLASS_PRIORITY[b.zoneClass] || 0) -
        (ZONE_CLASS_PRIORITY[a.zoneClass] || 0)
    );
    return capMatches[0].id;
  }

  // 2. Match per città + provincia (case-insensitive)
  const cityNorm = city.trim();
  const cityMatches = await prisma.zone.findMany({
    where: {
      isActive: true,
      province: province.toUpperCase(),
      city: { equals: cityNorm, mode: "insensitive" },
    },
    select: { id: true, zoneClass: true },
  });

  if (cityMatches.length > 0) {
    cityMatches.sort(
      (a, b) =>
        (ZONE_CLASS_PRIORITY[b.zoneClass] || 0) -
        (ZONE_CLASS_PRIORITY[a.zoneClass] || 0)
    );
    return cityMatches[0].id;
  }

  // 3. Match per municipalities (cluster)
  const clusterMatches = await prisma.zone.findMany({
    where: {
      isActive: true,
      province: province.toUpperCase(),
      municipalities: { has: cityNorm },
    },
    select: { id: true, zoneClass: true },
  });

  if (clusterMatches.length > 0) {
    return clusterMatches[0].id;
  }

  // 4. Fallback: match solo per provincia (primo COMUNE disponibile)
  const provinceMatch = await prisma.zone.findFirst({
    where: {
      isActive: true,
      province: province.toUpperCase(),
      zoneClass: "COMUNE",
    },
    select: { id: true },
    orderBy: { marketScore: "desc" },
  });

  return provinceMatch?.id || null;
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
