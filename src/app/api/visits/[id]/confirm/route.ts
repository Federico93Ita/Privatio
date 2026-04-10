import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendEmail, visitStatusUpdateEmail } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body; // "CONFIRMED" or "CANCELLED"

    if (!["CONFIRMED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Stato non valido" }, { status: 400 });
    }

    // Verify the user owns this visit (is seller or assigned agency)
    const visit = await prisma.visit.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            seller: true,
            assignment: true,
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json({ error: "Visita non trovata" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, agencyId: true },
    });

    const isSeller = visit.property.sellerId === user?.id;
    const isAssignedAgency =
      user?.agencyId && visit.property.assignment?.agencyId === user.agencyId;

    if (!isSeller && !isAssignedAgency) {
      return NextResponse.json(
        { error: "Non hai i permessi per gestire questa visita" },
        { status: 403 }
      );
    }

    // Update visit status
    const updatedVisit = await prisma.visit.update({
      where: { id },
      data: { status },
      include: {
        property: { include: { seller: true } },
      },
    });

    // Notify buyer
    const dateFormatted = formatDateTime(updatedVisit.scheduledAt);
    const template = visitStatusUpdateEmail(
      updatedVisit.buyerName,
      updatedVisit.property.title,
      dateFormatted,
      status === "CONFIRMED" ? "confirmed" : "cancelled"
    );
    await sendEmail({ to: updatedVisit.buyerEmail, ...template });

    return NextResponse.json({ visit: updatedVisit });
  } catch (error) {
    console.error("Visit confirm error:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento" },
      { status: 500 }
    );
  }
}
