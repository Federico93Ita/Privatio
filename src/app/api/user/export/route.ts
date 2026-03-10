import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/user/export — Export all personal data (GDPR Art. 20 - Data Portability)
 * Returns a JSON file with all user data.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        // Properties (if seller)
        properties: {
          select: {
            id: true,
            title: true,
            type: true,
            address: true,
            city: true,
            province: true,
            price: true,
            surface: true,
            rooms: true,
            bathrooms: true,
            floor: true,
            totalFloors: true,
            description: true,
            status: true,
            energyClass: true,
            hasGarage: true,
            hasGarden: true,
            hasBalcony: true,
            hasElevator: true,
            createdAt: true,
            updatedAt: true,
            publishedAt: true,
          },
        },
        // Messages sent
        sentMessages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            read: true,
          },
          orderBy: { createdAt: "desc" },
        },
        // Documents uploaded
        uploadedDocuments: {
          select: {
            id: true,
            name: true,
            category: true,
            size: true,
            mimeType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      platform: "Privatio",
      note: "Questo file contiene tutti i dati personali associati al tuo account su Privatio, ai sensi dell'Art. 20 GDPR.",
      user,
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="privatio-dati-personali-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Errore durante l'esportazione dei dati" },
      { status: 500 }
    );
  }
}
