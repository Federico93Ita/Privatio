import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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
        },
        agents: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 });
    }

    // Stats
    const stats = {
      totalProperties: agency.assignments.length,
      activeProperties: agency.assignments.filter((a) => a.status === "ACTIVE").length,
      completedSales: agency.assignments.filter((a) => a.status === "COMPLETED").length,
      pendingVisits: agency.assignments.reduce(
        (acc, a) => acc + a.property.visits.length,
        0
      ),
    };

    return NextResponse.json({ agency, stats });
  } catch (error) {
    console.error("Agency dashboard error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dashboard" },
      { status: 500 }
    );
  }
}
