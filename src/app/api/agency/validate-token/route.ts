import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/agency/validate-token?token=xxx
 * Validates an agency approval token and returns the lead data for pre-filling.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: "Token mancante o non valido" },
        { status: 400 }
      );
    }

    const lead = await prisma.agencyLead.findFirst({
      where: { approvalToken: token, status: "APPROVED" },
      select: {
        id: true,
        agencyName: true,
        contactName: true,
        email: true,
        phone: true,
        city: true,
        province: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Token non valido, scaduto o già utilizzato" },
        { status: 404 }
      );
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Validate token error:", error);
    return NextResponse.json(
      { error: "Errore durante la validazione" },
      { status: 500 }
    );
  }
}
