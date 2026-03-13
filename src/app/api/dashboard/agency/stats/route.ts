import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/dashboard/agency/stats
 * Lightweight endpoint returning only agency profile + computed stats.
 * Used by fatturazione, messaggi, and impostazioni pages that don't need
 * the full assignments/properties payload.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { agencyId: true },
    });

    if (!user?.agencyId) {
      return NextResponse.json({ error: "Non sei associato a un'agenzia" }, { status: 403 });
    }

    const agency = await prisma.agency.findUnique({
      where: { id: user.agencyId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        province: true,
        description: true,
        coverageRadius: true,
        plan: true,
        isActive: true,
        rating: true,
        stripeCustomerId: true,
        agents: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 });
    }

    // Compute stats with lightweight aggregate queries
    const [activeCount, completedCount, pendingVisitsCount] = await Promise.all([
      prisma.propertyAssignment.count({
        where: { agencyId: user.agencyId, status: "ACTIVE" },
      }),
      prisma.propertyAssignment.count({
        where: { agencyId: user.agencyId, status: "COMPLETED" },
      }),
      prisma.visit.count({
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          property: {
            assignment: { agencyId: user.agencyId },
          },
        },
      }),
    ]);

    const stats = {
      totalProperties: agency._count.assignments,
      activeProperties: activeCount,
      completedSales: completedCount,
      pendingVisits: pendingVisitsCount,
    };

    return NextResponse.json({ agency, stats });
  } catch (error) {
    console.error("Agency stats error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento" },
      { status: 500 }
    );
  }
}
