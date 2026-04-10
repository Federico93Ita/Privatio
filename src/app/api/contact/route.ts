import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail, contactConfirmationEmail, adminContactEmail } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(2, "Nome troppo corto").max(100),
  email: z.string().email("Email non valida"),
  subject: z.enum(["vendita", "acquisto", "agenzia", "altro"]),
  message: z.string().min(10, "Messaggio troppo corto").max(2000),
});

const subjectLabels: Record<string, string> = {
  vendita: "Voglio vendere casa",
  acquisto: "Cerco un immobile",
  agenzia: "Partnership agenzia",
  altro: "Altro",
};

export async function POST(req: NextRequest) {
  try {
    const limited = await applyRateLimit(RATE_LIMITS.lead, req);
    if (limited) return limited;

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    // Send notification to Privatio team
    const adminTemplate = adminContactEmail(name, email, subjectLabels[subject], message);
    const adminResult = await sendEmail({
      to: process.env.CONTACT_EMAIL || "info@privatio.it",
      ...adminTemplate,
    });

    // Send confirmation to the user
    const confirmTemplate = contactConfirmationEmail(name);
    await sendEmail({ to: email, ...confirmTemplate });

    if (!adminResult.success) {
      return NextResponse.json(
        { error: "Errore nell'invio del messaggio. Riprova più tardi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
