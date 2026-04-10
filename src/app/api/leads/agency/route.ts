import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { agencyLeadSchema } from "@/lib/validations";
import { sendEmail, agencyLeadConfirmationEmail, adminNewLeadEmail } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = await applyRateLimit(RATE_LIMITS.lead, req);
    if (limited) return limited;

    const body = await req.json();
    const parsed = agencyLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Prevent duplicate submissions
    const existingLead = await prisma.agencyLead.findFirst({
      where: { email: parsed.data.email, status: { not: "LOST" } },
    });
    if (existingLead) {
      return NextResponse.json(
        { error: "Esiste già una richiesta per questa email. Ti contatteremo al più presto." },
        { status: 409 }
      );
    }

    const lead = await prisma.agencyLead.create({
      data: parsed.data,
    });

    // Confirmation email to agency
    const confirmTemplate = agencyLeadConfirmationEmail(parsed.data.contactName);
    const confirmResult = await sendEmail({ to: parsed.data.email, ...confirmTemplate });
    if (!confirmResult.success) {
      console.error("Failed to send agency confirmation email:", confirmResult.error);
    }

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://privatio.it";

      // Build zone preferences section for admin email
      const zones = parsed.data.preferredZones;
      let zonesHtml = "";
      if (zones && zones.length > 0) {
        const zoneRows = zones
          .map(
            (z) =>
              `<li style="margin-bottom: 4px;"><strong>${z.zoneName}</strong> (${z.zoneClass})${z.plan ? ` — ${z.plan.replace(/_/g, " ")}` : ""}${z.priceMonthly ? ` a €${(z.priceMonthly / 100).toLocaleString("it-IT")}/mese` : ""}</li>`
          )
          .join("");
        zonesHtml = `
          <div style="margin-top: 16px; padding: 12px; background: #f0f4ff; border-radius: 8px;">
            <p style="margin: 0 0 8px; font-weight: 600;">Zone di interesse (${zones.length}):</p>
            <ul style="margin: 0; padding-left: 20px;">${zoneRows}</ul>
          </div>
        `;
      }

      const details = `${parsed.data.city} (${parsed.data.province})${parsed.data.agentCount ? ` — ${parsed.data.agentCount} agenti` : ""}${zones && zones.length > 0 ? ` — ${zones.length} zone` : ""}`;
      const adminTemplate = adminNewLeadEmail("agenzia", parsed.data.agencyName, parsed.data.email, details);
      const adminResult = await sendEmail({ to: adminEmail, ...adminTemplate });
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
