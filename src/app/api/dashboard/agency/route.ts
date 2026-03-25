import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
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

    // Pagination for assignments
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const agency = await prisma.agency.findUnique({
      where: { id: user.agencyId },
      include: {
        assignments: {
          include: {
            property: {
              include: {
                photos: { orderBy: { order: "asc" }, take: 1 },
                seller: { select: { id: true, name: true, email: true, phone: true } },
                contract: true,
                visits: {
                  where: { status: { in: ["PENDING", "CONFIRMED"] } },
                  orderBy: { scheduledAt: "asc" },
                },
                leads: {
                  orderBy: { createdAt: "desc" },
                  take: 5,
                },
                _count: {
                  select: { leads: true, visits: true },
                },
              },
            },
          },
          orderBy: { assignedAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        },
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

    // Stats
    const activeAssignments = agency.assignments.filter((a) => a.status === "ACTIVE");
    const completedAssignments = agency.assignments.filter((a) => a.status === "COMPLETED");

    // Pipeline counts by property status
    const pipeline: Record<string, number> = {};
    for (const a of agency.assignments) {
      const s = a.property.status;
      pipeline[s] = (pipeline[s] || 0) + 1;
    }

    // Advanced stats (for City+ plans)
    let avgDaysToSell: number | null = null;
    let conversionRate: number | null = null;

    if (completedAssignments.length > 0) {
      const totalDays = completedAssignments.reduce((acc, a) => {
        const days = Math.floor(
          (Date.now() - new Date(a.assignedAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return acc + days;
      }, 0);
      avgDaysToSell = Math.round(totalDays / completedAssignments.length);
    }

    if (agency.assignments.length > 0) {
      conversionRate = Math.round(
        (completedAssignments.length / agency.assignments.length) * 100
      );
    }

    const totalLeads = agency.assignments.reduce(
      (acc, a) => acc + (a.property._count?.leads || 0),
      0
    );
    const totalVisits = agency.assignments.reduce(
      (acc, a) => acc + (a.property._count?.visits || 0),
      0
    );

    const stats = {
      totalProperties: agency.assignments.length,
      activeProperties: activeAssignments.length,
      completedSales: completedAssignments.length,
      pendingVisits: agency.assignments.reduce(
        (acc, a) => acc + a.property.visits.length,
        0
      ),
      pipeline,
      avgDaysToSell,
      conversionRate,
      totalLeads,
      totalVisits,
    };

    const totalAssignments = agency._count?.assignments || 0;
    return NextResponse.json({
      agency,
      stats,
      pagination: {
        page,
        limit,
        total: totalAssignments,
        totalPages: Math.ceil(totalAssignments / limit),
      },
    });
  } catch (error) {
    console.error("Agency dashboard error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dashboard" },
      { status: 500 }
    );
  }
}
