import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

/** Maps a PropertyStatus enum to the stage key expected by the frontend ProgressBar */
function toStageKey(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "inserted",
    PENDING_REVIEW: "review",
    PUBLISHED: "published",
    UNDER_CONTRACT: "negotiation",
    SOLD: "sold",
    WITHDRAWN: "inserted",
  };
  return map[status] ?? "inserted";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Fetch the seller's most recent (or active) property
    const property = await prisma.property.findFirst({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        photos: { orderBy: { order: "asc" }, take: 1 },
        assignment: {
          include: {
            agency: {
              select: {
                name: true,
                phone: true,
                email: true,
                logoUrl: true,
                rating: true,
                agents: {
                  select: { id: true, name: true },
                  take: 1,
                },
              },
            },
          },
        },
        contract: true,
        visits: {
          orderBy: { scheduledAt: "desc" },
        },
        leads: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: { leads: true, visits: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json({
        property: null,
        stats: { views: 0, infoRequests: 0, scheduledVisits: 0, daysOnline: 0 },
        agency: null,
        recentLeads: [],
        upcomingVisits: [],
      });
    }

    // Calculate days online
    const daysOnline = property.publishedAt
      ? Math.floor(
          (Date.now() - new Date(property.publishedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    return NextResponse.json({
      property: {
        id: property.id,
        title: property.title,
        address: `${property.address}, ${property.city}`,
        currentStage: toStageKey(property.status),
        status: property.status,
        slug: property.slug,
      },
      stats: {
        views: property.viewCount,
        infoRequests: property._count.leads,
        scheduledVisits: property._count.visits,
        daysOnline,
      },
      agency: property.assignment?.agency ?? null,
      recentLeads: property.leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        date: formatDateTime(lead.createdAt),
        message: lead.message ?? "Richiesta informazioni",
      })),
      upcomingVisits: property.visits
        .filter((v) => v.status === "PENDING" || v.status === "CONFIRMED")
        .slice(0, 5)
        .map((visit) => ({
          id: visit.id,
          date: formatDateTime(visit.scheduledAt),
          buyerName: visit.buyerName,
          status: visit.status.toLowerCase() as "pending" | "confirmed",
        })),
      allVisits: property.visits.map((visit) => ({
        id: visit.id,
        buyerName: visit.buyerName,
        buyerEmail: visit.buyerEmail,
        buyerPhone: visit.buyerPhone,
        scheduledAt: visit.scheduledAt,
        status: visit.status,
        notes: visit.notes,
      })),
    });
  } catch (error) {
    console.error("Seller dashboard error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dashboard" },
      { status: 500 }
    );
  }
}
