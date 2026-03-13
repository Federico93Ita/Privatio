import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
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
    const statusText = status === "CONFIRMED" ? "confermata" : "annullata";

    await sendEmail({
      to: updatedVisit.buyerEmail,
      subject: `Visita ${statusText} — ${dateFormatted}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Privatio</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #0f172a;">Visita ${statusText}</h2>
            <p style="color: #6b7280; line-height: 1.6;">La visita per <strong>${updatedVisit.property.title}</strong> del <strong>${dateFormatted}</strong> è stata ${statusText}.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ visit: updatedVisit });
  } catch (error) {
    console.error("Visit confirm error:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento" },
      { status: 500 }
    );
  }
}
