import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          select: {
            id: true,
            slug: true,
            title: true,
            city: true,
            province: true,
            price: true,
            surface: true,
            rooms: true,
            status: true,
            photos: {
              take: 1,
              orderBy: { order: "asc" },
            },
            _count: {
              select: { favorites: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Errore GET /api/favorites:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { propertyId } = await request.json();

    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId richiesto" },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        propertyId,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Già nei preferiti" },
        { status: 409 }
      );
    }
    console.error("Errore POST /api/favorites:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId richiesto" },
        { status: 400 }
      );
    }

    await prisma.favorite.deleteMany({
      where: {
        userId,
        propertyId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore DELETE /api/favorites:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
