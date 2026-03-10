import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { visitSchema } from "@/lib/validations";
import { sendEmail, visitScheduledEmail } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const parsed = visitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        seller: true,
        assignment: { include: { agency: true } },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Immobile non trovato" },
        { status: 404 }
      );
    }

    const visit = await prisma.visit.create({
      data: {
        ...parsed.data,
        scheduledAt: new Date(parsed.data.scheduledAt),
        propertyId: property.id,
      },
    });

    const dateFormatted = formatDateTime(parsed.data.scheduledAt);

    // Notify seller
    const sellerEmail = visitScheduledEmail(
      property.seller.name || "Venditore",
      property.title,
      dateFormatted
    );
    await sendEmail({ to: property.seller.email, ...sellerEmail });

    // Notify agency
    if (property.assignment?.agency) {
      await sendEmail({
        to: property.assignment.agency.email,
        subject: `Visita prenotata per ${property.title} — ${dateFormatted}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Nuova visita prenotata</h2>
            <p><strong>Immobile:</strong> ${property.title}</p>
            <p><strong>Data:</strong> ${dateFormatted}</p>
            <p><strong>Acquirente:</strong> ${parsed.data.buyerName}</p>
            <p><strong>Email:</strong> ${parsed.data.buyerEmail}</p>
            <p><strong>Telefono:</strong> ${parsed.data.buyerPhone}</p>
          </div>
        `,
      });
    }

    // Confirmation to buyer
    await sendEmail({
      to: parsed.data.buyerEmail,
      subject: `Visita confermata per ${dateFormatted} — Privatio`,
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #0a1f44;">Ciao ${parsed.data.buyerName}!</h2>
            <p style="color: #64748b;">La tua visita è stata prenotata con successo.</p>
            <div style="background: #f0f9ff; border-left: 4px solid #0e8ff1; padding: 16px; margin: 20px 0;">
              <p style="margin: 0;"><strong>${property.title}</strong></p>
              <p style="margin: 4px 0 0; color: #0e8ff1; font-size: 18px; font-weight: bold;">${dateFormatted}</p>
            </div>
            <p style="color: #64748b;">L'agenzia ti contatterà per confermare i dettagli.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ visit: { id: visit.id } }, { status: 201 });
  } catch (error) {
    console.error("Visit booking error:", error);
    return NextResponse.json(
      { error: "Errore durante la prenotazione" },
      { status: 500 }
    );
  }
}
