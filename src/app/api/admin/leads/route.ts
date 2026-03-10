import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/leads — List all seller and agency leads (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    const userRole = (session.user as { role: string }).role;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const [sellerLeads, agencyLeads] = await Promise.all([
      prisma.sellerLead.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.agencyLead.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    return NextResponse.json({ sellerLeads, agencyLeads });
  } catch (error) {
    console.error("Admin leads error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei lead" },
      { status: 500 }
    );
  }
}
