import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// GET — fetch seller's property details for editing
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        photos: { orderBy: { order: "asc" } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Nessun immobile trovato" }, { status: 404 });
    }

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Seller property GET error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

// PUT — update seller's property
const updateSchema = z.object({
  price: z.number().int().positive().optional(),
  description: z.string().max(5000).optional(),
  rooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  surface: z.number().int().positive().optional(),
  floor: z.number().int().optional().nullable(),
  totalFloors: z.number().int().optional().nullable(),
  hasGarage: z.boolean().optional(),
  hasGarden: z.boolean().optional(),
  hasBalcony: z.boolean().optional(),
  hasElevator: z.boolean().optional(),
  hasParkingSpace: z.boolean().optional(),
  hasCellar: z.boolean().optional(),
  hasTerrace: z.boolean().optional(),
  hasPool: z.boolean().optional(),
  hasAirConditioning: z.boolean().optional(),
  isFurnished: z.boolean().optional(),
  hasConcierge: z.boolean().optional(),
  hasAlarm: z.boolean().optional(),
  energyClass: z.string().optional().nullable(),
  condominiumFees: z.number().int().min(0).optional().nullable(),
  extraCosts: z.string().max(2000).optional().nullable(),
  condition: z.string().optional().nullable(),
  heatingType: z.string().optional().nullable(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!property) {
      return NextResponse.json({ error: "Nessun immobile trovato" }, { status: 404 });
    }

    // Restrict edits after certain statuses
    if (property.status === "SOLD" || property.status === "WITHDRAWN") {
      return NextResponse.json(
        { error: "Non è possibile modificare un immobile venduto o ritirato" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
    }

    // After publication, only allow price and description changes
    const isPublished = ["PUBLISHED", "UNDER_CONTRACT"].includes(property.status);
    let updateData = parsed.data;
    if (isPublished) {
      updateData = {
        price: parsed.data.price,
        description: parsed.data.description,
      };
    }

    const updated = await prisma.property.update({
      where: { id: property.id },
      data: updateData,
      include: {
        photos: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({ property: updated });
  } catch (error) {
    console.error("Seller property PUT error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
