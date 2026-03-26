import { prisma } from "./prisma";

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
 * 4. Fallback: prima zona della provincia
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

  // 4. Fallback: prima zona della provincia per marketScore
  const provinceMatch = await prisma.zone.findFirst({
    where: { isActive: true, province: province.toUpperCase() },
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
