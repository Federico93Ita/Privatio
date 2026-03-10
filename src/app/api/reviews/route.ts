import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const reviewSchema = z.object({
  agencyId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// GET /api/reviews?agencyId=xxx — List reviews for an agency
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get("agencyId");

    if (!agencyId) {
      return NextResponse.json({ error: "agencyId richiesto" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { agencyId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

// POST /api/reviews — Create a review (only sellers who completed a sale with the agency)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    const { agencyId, rating, comment } = parsed.data;

    // Verify the user had a completed sale with this agency
    const completedAssignment = await prisma.propertyAssignment.findFirst({
      where: {
        agencyId,
        status: "COMPLETED",
        property: { sellerId: session.user.id },
      },
    });

    if (!completedAssignment) {
      return NextResponse.json(
        { error: "Puoi recensire solo agenzie con cui hai completato una vendita" },
        { status: 403 }
      );
    }

    // Create review (unique constraint prevents duplicates)
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        agencyId,
        rating,
        comment,
      },
    });

    // Update agency aggregate rating
    const aggregate = await prisma.review.aggregate({
      where: { agencyId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.agency.update({
      where: { id: agencyId },
      data: {
        rating: aggregate._avg.rating || 0,
        reviewCount: aggregate._count.rating,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Hai già recensito questa agenzia" },
        { status: 409 }
      );
    }
    console.error("Review POST error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
