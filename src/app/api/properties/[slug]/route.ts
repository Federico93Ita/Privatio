import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Whitelist of fields a seller can update
const sellerUpdateSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().optional(),
  price: z.number().min(1000).optional(),
  surface: z.number().min(1).optional(),
  rooms: z.number().min(1).optional(),
  bathrooms: z.number().min(1).optional(),
  floor: z.number().optional(),
  totalFloors: z.number().optional(),
  hasGarage: z.boolean().optional(),
  hasGarden: z.boolean().optional(),
  hasBalcony: z.boolean().optional(),
  hasElevator: z.boolean().optional(),
  energyClass: z.string().optional(),
  yearBuilt: z.number().optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  province: z.string().min(2).optional(),
  cap: z.string().min(5).optional(),
});

// Admin can update everything
const adminUpdateSchema = sellerUpdateSchema.extend({
  status: z
    .enum([
      "DRAFT",
      "PENDING_REVIEW",
      "PUBLISHED",
      "UNDER_CONTRACT",
      "SOLD",
      "WITHDRAWN",
    ])
    .optional(),
  type: z
    .enum([
      "APPARTAMENTO",
      "VILLA",
      "CASA_INDIPENDENTE",
      "ATTICO",
      "MANSARDA",
      "LOFT",
      "TERRENO",
      "NEGOZIO",
      "UFFICIO",
    ])
    .optional(),
  condition: z.string().nullable().optional(),
  heatingType: z.string().nullable().optional(),
  condominiumFees: z.number().nullable().optional(),
  extraCosts: z.string().nullable().optional(),
  hasParkingSpace: z.boolean().optional(),
  hasCellar: z.boolean().optional(),
  hasTerrace: z.boolean().optional(),
  hasPool: z.boolean().optional(),
  hasAirConditioning: z.boolean().optional(),
  isFurnished: z.boolean().optional(),
  hasConcierge: z.boolean().optional(),
  hasAlarm: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// GET /api/properties/[slug] — Public property detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        photos: { orderBy: { order: "asc" } },
        seller: { select: { name: true } },
        assignment: {
          include: {
            agency: {
              select: { name: true, phone: true, logoUrl: true, rating: true },
            },
          },
        },
      },
    });

    const publicStatuses = ["PUBLISHED", "UNDER_CONTRACT", "SOLD"];
    if (!property || !publicStatuses.includes(property.status)) {
      return NextResponse.json(
        { error: "Immobile non trovato" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.property.update({
      where: { id: property.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Property detail error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento" },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[slug] — Update property (owner or admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json();

    const property = await prisma.property.findUnique({ where: { slug } });
    if (!property) {
      return NextResponse.json(
        { error: "Immobile non trovato" },
        { status: 404 }
      );
    }

    const userRole = (session.user as { role: string }).role;
    const userId = (session.user as { id: string }).id;
    const isAdmin = userRole === "ADMIN";
    const isOwner = property.sellerId === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    // Validate with role-appropriate schema
    const schema = isAdmin ? adminUpdateSchema : sellerUpdateSchema;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Sellers cannot change status of published properties
    if (!isAdmin && property.status === "PUBLISHED") {
      const { price, description, ...rest } = parsed.data;
      // Only allow price and description edits on published properties
      const allowedKeys = Object.keys({ price, description }).filter(
        (k) => ({ price, description } as Record<string, unknown>)[k] !== undefined
      );
      if (Object.keys(rest).length > 0) {
        return NextResponse.json(
          { error: "Non puoi modificare questi campi dopo la pubblicazione" },
          { status: 403 }
        );
      }
    }

    // Convert publishedAt string to Date if present
    const updateData: any = { ...parsed.data };
    if (updateData.publishedAt !== undefined) {
      updateData.publishedAt = updateData.publishedAt ? new Date(updateData.publishedAt) : null;
    }

    const updated = await prisma.property.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json({ property: updated });
  } catch (error) {
    console.error("Property update error:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento" },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[slug] — Admin only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const { slug } = await params;
    const property = await prisma.property.findUnique({ where: { slug } });
    if (!property) {
      return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
    }

    // Delete all related records in a transaction
    await prisma.$transaction([
      prisma.buyerLead.deleteMany({ where: { propertyId: property.id } }),
      prisma.visit.deleteMany({ where: { propertyId: property.id } }),
      prisma.favorite.deleteMany({ where: { propertyId: property.id } }),
      prisma.document.deleteMany({ where: { propertyId: property.id } }),
      prisma.propertyPhoto.deleteMany({ where: { propertyId: property.id } }),
      prisma.contract.deleteMany({ where: { propertyId: property.id } }),
      prisma.propertyAssignment.deleteMany({ where: { propertyId: property.id } }),
      prisma.property.delete({ where: { id: property.id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Property delete error:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione" },
      { status: 500 }
    );
  }
}
