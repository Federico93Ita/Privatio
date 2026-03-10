import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const agencies = await prisma.agency.findMany({
      include: {
        _count: { select: { assignments: true, agents: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ agencies });
  } catch (error) {
    console.error("Admin agencies error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
