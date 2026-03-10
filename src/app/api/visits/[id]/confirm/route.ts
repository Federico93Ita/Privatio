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

    const visit = await prisma.visit.update({
      where: { id },
      data: { status },
      include: {
        property: { include: { seller: true } },
      },
    });

    // Notify buyer
    const dateFormatted = formatDateTime(visit.scheduledAt);
    const statusText = status === "CONFIRMED" ? "confermata" : "annullata";

    await sendEmail({
      to: visit.buyerEmail,
      subject: `Visita ${statusText} — ${dateFormatted}`,
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Privatio</h1>
          </div>
          <div style="padding: 30px;">
            <h2>Visita ${statusText}</h2>
            <p>La visita per <strong>${visit.property.title}</strong> del <strong>${dateFormatted}</strong> è stata ${statusText}.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ visit });
  } catch (error) {
    console.error("Visit confirm error:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento" },
      { status: 500 }
    );
  }
}
