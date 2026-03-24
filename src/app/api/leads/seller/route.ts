import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sellerLeadSchema } from "@/lib/validations";
import { sendEmail, leadReceivedEmail } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/** Escape HTML special characters */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  try {
    const limited = await applyRateLimit(RATE_LIMITS.lead, req);
    if (limited) return limited;

    const body = await req.json();
    const parsed = sellerLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const lead = await prisma.sellerLead.create({
      data: {
        ...parsed.data,
        propertyType: parsed.data.propertyType as any,
      },
    });

    // Email to lead
    const emailContent = leadReceivedEmail(parsed.data.name);
    await sendEmail({ to: parsed.data.email, ...emailContent });

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `Nuovo lead venditore: ${parsed.data.name} — ${parsed.data.city}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Nuovo lead venditore</h2>
            <p><strong>Nome:</strong> ${esc(parsed.data.name)}</p>
            <p><strong>Email:</strong> ${esc(parsed.data.email)}</p>
            <p><strong>Telefono:</strong> ${esc(parsed.data.phone)}</p>
            <p><strong>Città:</strong> ${esc(parsed.data.city)} (${esc(parsed.data.province)})</p>
            ${parsed.data.propertyType ? `<p><strong>Tipo:</strong> ${esc(parsed.data.propertyType)}</p>` : ""}
            ${parsed.data.estimatedValue ? `<p><strong>Valore stimato:</strong> €${parsed.data.estimatedValue.toLocaleString("it-IT")}</p>` : ""}
          </div>
        `,
      });
    }

    return NextResponse.json({ lead: { id: lead.id } }, { status: 201 });
  } catch (error) {
    console.error("Seller lead error:", error);
    return NextResponse.json(
      { error: "Errore durante il salvataggio" },
      { status: 500 }
    );
  }
}
