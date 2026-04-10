import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/properties/:id/agencies
 *
 * Restituisce le agenzie attive nella zona dell'immobile.
 * Solo il venditore proprietario può chiamare questo endpoint.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { slug } = await params;

    // Verify property belongs to this seller
    const property = await prisma.property.findUnique({
      where: { slug },
      select: { sellerId: true, zoneId: true, status: true },
    });

    if (!property || property.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
    }

    if (!property.zoneId) {
      return NextResponse.json({ agencies: [], message: "Zona non ancora assegnata" });
    }

    // Find agencies with active territory in this zone
    const territories = await prisma.territoryAssignment.findMany({
      where: {
        zoneId: property.zoneId,
        isActive: true,
        agency: {
          isActive: true,
          billingStatus: "ACTIVE",
        },
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            rating: true,
            tagline: true,
            specializations: true,
            uniqueSellingPoints: true,
            responseTimeHours: true,
            city: true,
            phone: true,
            profileCompletedAt: true,
            _count: {
              select: {
                assignments: {
                  where: { status: "ACTIVE" },
                },
              },
            },
          },
        },
      },
    });

    const agencies = territories.map((t) => ({
      id: t.agency.id,
      name: t.agency.name,
      slug: t.agency.slug,
      logoUrl: t.agency.logoUrl,
      rating: t.agency.rating,
      tagline: t.agency.tagline,
      specializations: t.agency.specializations,
      uniqueSellingPoints: t.agency.uniqueSellingPoints,
      responseTimeHours: t.agency.responseTimeHours,
      city: t.agency.city,
      phone: t.agency.phone,
      plan: t.plan,
      activeProperties: t.agency._count.assignments,
      profileCompleted: !!t.agency.profileCompletedAt,
    }));

    // Sort: higher plan → fewer properties → higher rating
    const planOrder = { PREMIUM: 3, URBANA: 2, BASE: 1 };
    agencies.sort((a, b) => {
      const planDiff = (planOrder[b.plan] || 0) - (planOrder[a.plan] || 0);
      if (planDiff !== 0) return planDiff;
      const loadDiff = a.activeProperties - b.activeProperties;
      if (loadDiff !== 0) return loadDiff;
      return (b.rating || 0) - (a.rating || 0);
    });

    return NextResponse.json({ agencies });
  } catch (error) {
    console.error("Property agencies error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
