import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buyerLeadSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const parsed = buyerLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        assignment: {
          include: { agency: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Immobile non trovato" },
        { status: 404 }
      );
    }

    const lead = await prisma.buyerLead.create({
      data: {
        ...parsed.data,
        propertyId: property.id,
      },
    });

    // Notify assigned agency
    if (property.assignment?.agency) {
      await sendEmail({
        to: property.assignment.agency.email,
        subject: `Nuova richiesta per: ${property.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Nuova richiesta informazioni</h2>
            <p><strong>Immobile:</strong> ${property.title}</p>
            <p><strong>Nome:</strong> ${parsed.data.name}</p>
            <p><strong>Email:</strong> ${parsed.data.email}</p>
            ${parsed.data.phone ? `<p><strong>Telefono:</strong> ${parsed.data.phone}</p>` : ""}
            ${parsed.data.message ? `<p><strong>Messaggio:</strong> ${parsed.data.message}</p>` : ""}
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia">Gestisci nella dashboard</a>
          </div>
        `,
      });
    }

    // Confirmation to buyer
    await sendEmail({
      to: parsed.data.email,
      subject: "Richiesta inviata — Privatio",
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #0f172a;">Ciao ${parsed.data.name}!</h2>
            <p style="color: #64748b; line-height: 1.6;">
              La tua richiesta per <strong>${property.title}</strong> è stata inviata con successo.
              L'agenzia partner ti contatterà al più presto.
            </p>
            <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                <strong>Commissione acquirente:</strong> 2% - 2.5% sul prezzo di vendita.
                Nessuna sorpresa, massima trasparenza.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ lead: { id: lead.id } }, { status: 201 });
  } catch (error) {
    console.error("Buyer lead error:", error);
    return NextResponse.json(
      { error: "Errore durante l'invio" },
      { status: 500 }
    );
  }
}
