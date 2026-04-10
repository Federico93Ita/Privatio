import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sellerLeadSchema } from "@/lib/validations";
import { sendEmail, leadReceivedEmail, adminNewLeadEmail } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

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
      const details = `${parsed.data.city} (${parsed.data.province})${parsed.data.propertyType ? ` — ${parsed.data.propertyType}` : ""}${parsed.data.estimatedValue ? ` — €${parsed.data.estimatedValue.toLocaleString("it-IT")}` : ""}`;
      const adminTemplate = adminNewLeadEmail("venditore", parsed.data.name, parsed.data.email, details);
      await sendEmail({ to: adminEmail, ...adminTemplate });
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
