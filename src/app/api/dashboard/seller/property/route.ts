import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET — fetch seller's property details (read-only view)
// Il venditore non può modificare l'immobile: dopo il mandato è l'agenzia a gestire tutto.
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
        assignment: {
          include: {
            agency: { select: { id: true, name: true, phone: true } },
          },
        },
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
