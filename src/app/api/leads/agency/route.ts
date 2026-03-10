import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { agencyLeadSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = agencyLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const lead = await prisma.agencyLead.create({
      data: parsed.data,
    });

    // Confirmation email to agency
    await sendEmail({
      to: parsed.data.email,
      subject: "Richiesta ricevuta — Privatio Partner",
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Network Agenzie Partner</p>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #0a1f44;">Ciao ${parsed.data.contactName}!</h2>
            <p style="color: #64748b; line-height: 1.6;">
              Grazie per l'interesse nel diventare agenzia partner Privatio.
              Abbiamo ricevuto la richiesta di <strong>${parsed.data.agencyName}</strong>
              e ti contatteremo al più presto per procedere con l'attivazione.
            </p>
          </div>
        </div>
      `,
    });

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `Nuovo lead agenzia: ${parsed.data.agencyName} — ${parsed.data.city}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Nuovo lead agenzia</h2>
            <p><strong>Agenzia:</strong> ${parsed.data.agencyName}</p>
            <p><strong>Contatto:</strong> ${parsed.data.contactName}</p>
            <p><strong>Email:</strong> ${parsed.data.email}</p>
            <p><strong>Telefono:</strong> ${parsed.data.phone}</p>
            <p><strong>Città:</strong> ${parsed.data.city} (${parsed.data.province})</p>
            ${parsed.data.agentCount ? `<p><strong>Agenti:</strong> ${parsed.data.agentCount}</p>` : ""}
            ${parsed.data.message ? `<p><strong>Messaggio:</strong> ${parsed.data.message}</p>` : ""}
          </div>
        `,
      });
    }

    return NextResponse.json({ lead: { id: lead.id } }, { status: 201 });
  } catch (error) {
    console.error("Agency lead error:", error);
    return NextResponse.json(
      { error: "Errore durante il salvataggio" },
      { status: 500 }
    );
  }
}
