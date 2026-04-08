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

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      console.error("Seller dashboard: session.user.id is missing", JSON.stringify(session.user));
      return NextResponse.json({ error: "Sessione non valida" }, { status: 401 });
    }

    // Include block reused for both queries
    const propertyInclude = {
      photos: { orderBy: { order: "asc" as const }, take: 1 },
      assignment: {
        include: {
          agency: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              logoUrl: true,
              rating: true,
              tagline: true,
              specializations: true,
              uniqueSellingPoints: true,
              responseTimeHours: true,
              profileCompletedAt: true,
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
        orderBy: { scheduledAt: "desc" as const },
      },
      leads: {
        orderBy: { createdAt: "desc" as const },
        take: 5,
      },
      _count: {
        select: { leads: true, visits: true },
      },
    };

    // Prefer a property with an active agency assignment (most advanced in pipeline)
    let property = await prisma.property.findFirst({
      where: {
        sellerId: userId,
        assignment: { isNot: null },
      },
      orderBy: { createdAt: "desc" },
      include: propertyInclude,
    });

    // Fallback: most recent property regardless of assignment
    if (!property) {
      property = await prisma.property.findFirst({
        where: { sellerId: userId },
        orderBy: { createdAt: "desc" },
        include: propertyInclude,
      });
    }

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
        date: lead.createdAt ? formatDateTime(lead.createdAt) : "",
        message: lead.message ?? "Richiesta informazioni",
      })),
      upcomingVisits: property.visits
        .filter((v) => v.status === "PENDING" || v.status === "CONFIRMED")
        .slice(0, 5)
        .map((visit) => ({
          id: visit.id,
          date: visit.scheduledAt ? formatDateTime(visit.scheduledAt) : "",
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
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack?.slice(0, 500) : undefined;
    console.error("Seller dashboard error msg:", msg);
    if (stack) console.error("Seller dashboard stack:", stack);
    return NextResponse.json(
      { error: "Errore nel caricamento dashboard", detail: msg },
      { status: 500 }
    );
  }
}
