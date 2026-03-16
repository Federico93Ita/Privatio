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
    const confirmResult = await sendEmail({
      to: parsed.data.email,
      subject: "Richiesta ricevuta — Privatio Partner",
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Network Agenzie Partner</p>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #0f172a;">Ciao ${parsed.data.contactName}!</h2>
            <p style="color: #64748b; line-height: 1.6;">
              Grazie per l'interesse nel diventare agenzia partner Privatio.
              Abbiamo ricevuto la richiesta di <strong>${parsed.data.agencyName}</strong>
              e ti contatteremo al più presto per procedere con l'attivazione.
            </p>
          </div>
        </div>
      `,
    });
    if (!confirmResult.success) {
      console.error("Failed to send agency confirmation email:", confirmResult.error);
    }

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://privatio.vercel.app";

      // Build zone preferences section for admin email
      const zones = parsed.data.preferredZones;
      let zonesHtml = "";
      if (zones && zones.length > 0) {
        const zoneRows = zones
          .map(
            (z) =>
              `<li style="margin-bottom: 4px;"><strong>${z.zoneName}</strong> (${z.zoneClass}) — ${z.plan.replace(/_/g, " ")} a €${(z.priceMonthly / 100).toLocaleString("it-IT")}/mese</li>`
          )
          .join("");
        zonesHtml = `
          <div style="margin-top: 16px; padding: 12px; background: #f0f4ff; border-radius: 8px;">
            <p style="margin: 0 0 8px; font-weight: 600;">Zone di interesse (${zones.length}):</p>
            <ul style="margin: 0; padding-left: 20px;">${zoneRows}</ul>
          </div>
        `;
      }

      const adminResult = await sendEmail({
        to: adminEmail,
        subject: `Nuovo lead agenzia: ${parsed.data.agencyName} — ${parsed.data.city}${zones && zones.length > 0 ? ` (${zones.length} zone)` : ""}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Nuovo lead agenzia</h2>
            <p><strong>Agenzia:</strong> ${parsed.data.agencyName}</p>
            <p><strong>Contatto:</strong> ${parsed.data.contactName}</p>
            <p><strong>Email:</strong> ${parsed.data.email}</p>
            <p><strong>Telefono:</strong> ${parsed.data.phone}</p>
            ${parsed.data.address ? `<p><strong>Indirizzo sede:</strong> ${parsed.data.address}</p>` : ""}
            <p><strong>Città:</strong> ${parsed.data.city} (${parsed.data.province})</p>
            ${parsed.data.agentCount ? `<p><strong>Agenti:</strong> ${parsed.data.agentCount}</p>` : ""}
            ${parsed.data.message ? `<p><strong>Messaggio:</strong> ${parsed.data.message}</p>` : ""}
            ${zonesHtml}
            <p style="margin-top: 20px;">
              <a href="${appUrl}/admin?tab=leads" style="display: inline-block; padding: 10px 20px; background: #0f172a; color: white; text-decoration: none; border-radius: 6px;">Gestisci Lead</a>
            </p>
          </div>
        `,
      });
      if (!adminResult.success) {
        console.error("Failed to send admin notification email:", adminResult.error);
      }
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
