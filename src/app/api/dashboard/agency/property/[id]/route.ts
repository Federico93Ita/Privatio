import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { agencyId: true },
    });

    if (!user?.agencyId) {
      return NextResponse.json({ error: "Non sei associato a un'agenzia" }, { status: 403 });
    }

    // Verify property is assigned to this agency
    const assignment = await prisma.propertyAssignment.findFirst({
      where: {
        propertyId: id,
        agencyId: user.agencyId,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { order: "asc" } },
        seller: { select: { id: true, name: true, email: true, phone: true } },
        contract: true,
        visits: { orderBy: { scheduledAt: "desc" } },
        leads: { orderBy: { createdAt: "desc" } },
        assignment: true,
        _count: { select: { leads: true, visits: true } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
    }

    return NextResponse.json({ property, assignment });
  } catch (error) {
    console.error("Agency property detail error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

// Update property status (agency) with transition validation
const statusUpdateSchema = z.object({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "UNDER_CONTRACT", "SOLD", "WITHDRAWN"]),
});

/** Allowed status transitions — key is "from", value is array of allowed "to" states */
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PENDING_REVIEW", "WITHDRAWN"],
  PENDING_REVIEW: ["PUBLISHED", "WITHDRAWN"],
  PUBLISHED: ["UNDER_CONTRACT", "WITHDRAWN"],
  UNDER_CONTRACT: ["SOLD", "PUBLISHED", "WITHDRAWN"],
  // SOLD and WITHDRAWN are terminal states
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { agencyId: true },
    });

    if (!user?.agencyId) {
      return NextResponse.json({ error: "Non sei associato a un'agenzia" }, { status: 403 });
    }

    // Verify ownership
    const assignment = await prisma.propertyAssignment.findFirst({
      where: { propertyId: id, agencyId: user.agencyId },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = statusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    // Validate status transition
    const currentProperty = await prisma.property.findUnique({
      where: { id },
      select: { status: true, publishedAt: true },
    });

    if (!currentProperty) {
      return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
    }

    const allowedNext = VALID_TRANSITIONS[currentProperty.status];
    if (!allowedNext || !allowedNext.includes(parsed.data.status)) {
      return NextResponse.json(
        {
          error: `Transizione non valida: ${currentProperty.status} → ${parsed.data.status}`,
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status: parsed.data.status };

    // Set publishedAt when publishing for the first time
    if (parsed.data.status === "PUBLISHED" && !currentProperty.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ property: updated });
  } catch (error) {
    console.error("Agency property update error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
