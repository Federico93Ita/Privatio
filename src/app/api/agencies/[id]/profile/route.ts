import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns the rich profile of an agency.
 * Authorization rules:
 *  - User must be authenticated
 *  - User must have role SELLER
 *  - User must own at least one Property
 *  - The agency must be active in the same zone as one of the user's properties
 *    (i.e. it has an active TerritoryAssignment for that zone)
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: agencyId } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "SELLER") {
    return NextResponse.json({ error: "Accesso riservato ai venditori" }, { status: 403 });
  }

  // Get the seller's properties' zones
  const properties = await prisma.property.findMany({
    where: { sellerId: user.id, zoneId: { not: null } },
    select: { zoneId: true },
  });
  const zoneIds = properties
    .map((p) => p.zoneId)
    .filter((z): z is string => !!z);

  if (zoneIds.length === 0) {
    return NextResponse.json(
      { error: "Devi avere almeno un immobile pubblicato per visualizzare i profili agenzia" },
      { status: 403 }
    );
  }

  // Check the agency has an active territory in one of those zones
  const territory = await prisma.territoryAssignment.findFirst({
    where: {
      agencyId,
      zoneId: { in: zoneIds },
      isActive: true,
    },
  });

  if (!territory) {
    return NextResponse.json(
      { error: "Questa agenzia non opera nella tua zona" },
      { status: 403 }
    );
  }

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: {
      id: true,
      name: true,
      city: true,
      province: true,
      logoUrl: true,
      description: true,
      rating: true,
      reviewCount: true,
      tagline: true,
      coverImageUrl: true,
      videoUrl: true,
      foundedYear: true,
      teamSize: true,
      responseTimeHours: true,
      transactionsCount: true,
      specializations: true,
      languages: true,
      serviceAreas: true,
      gallery: true,
      certifications: true,
      awards: true,
      uniqueSellingPoints: true,
      website: true,
      instagramUrl: true,
      facebookUrl: true,
      linkedinUrl: true,
      whatsappNumber: true,
      profileCompletedAt: true,
      reviews: {
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!agency || !agency.profileCompletedAt) {
    return NextResponse.json({ error: "Profilo agenzia non disponibile" }, { status: 404 });
  }

  return NextResponse.json({ agency });
}
