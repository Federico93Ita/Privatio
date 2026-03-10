import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const savedSearchSchema = z.object({
  name: z.string().min(1, "Nome richiesto").max(100),
  filters: z.record(z.string(), z.unknown()),
});

// GET /api/saved-searches — List user's saved searches
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const searches = await prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ searches });
  } catch (error) {
    console.error("SavedSearch GET error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

// POST /api/saved-searches — Create a new saved search
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = savedSearchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Limit to 20 saved searches per user
    const count = await prisma.savedSearch.count({
      where: { userId: session.user.id },
    });
    if (count >= 20) {
      return NextResponse.json(
        { error: "Hai raggiunto il limite massimo di 20 ricerche salvate." },
        { status: 400 }
      );
    }

    const search = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        filters: parsed.data.filters as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ search }, { status: 201 });
  } catch (error) {
    console.error("SavedSearch POST error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

// DELETE /api/saved-searches?id=xxx — Delete a saved search
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id richiesto" }, { status: 400 });
    }

    // Ensure the saved search belongs to the user
    const existing = await prisma.savedSearch.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Non trovato" }, { status: 404 });
    }

    await prisma.savedSearch.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SavedSearch DELETE error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
