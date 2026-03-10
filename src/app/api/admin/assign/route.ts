import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { assignAgencyToProperty } from "@/lib/matchmaking";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const body = await req.json();
    const { propertyId, agencyId } = body;

    if (agencyId) {
      // Manual assignment
      const assignment = await prisma.propertyAssignment.create({
        data: {
          propertyId,
          agencyId,
          status: "ACTIVE",
        },
      });
      return NextResponse.json({ assignment });
    } else {
      // Auto-match
      const assignment = await assignAgencyToProperty(propertyId);
      if (!assignment) {
        return NextResponse.json(
          { error: "Nessuna agenzia disponibile nella zona" },
          { status: 404 }
        );
      }
      return NextResponse.json({ assignment });
    }
  } catch (error) {
    console.error("Admin assign error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
