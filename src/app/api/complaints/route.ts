import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail, complaintConfirmationEmail, adminComplaintEmail } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const complaintSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri").max(100),
  email: z.string().email("Inserisci un indirizzo email valido"),
  userType: z.enum(["venditore", "agenzia", "acquirente"]),
  subject: z.string().min(5, "L'oggetto deve avere almeno 5 caratteri").max(200),
  description: z
    .string()
    .min(20, "La descrizione deve avere almeno 20 caratteri")
    .max(5000),
  privacyConsent: z.literal(true),
});

function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `REC-${year}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const limited = await applyRateLimit(RATE_LIMITS.lead, req);
    if (limited) return limited;

    const body = await req.json();
    const parsed = complaintSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, userType, subject, description } = parsed.data;
    const referenceNumber = generateReferenceNumber();

    await prisma.complaint.create({
      data: {
        referenceNumber,
        name,
        email,
        userType,
        subject,
        description,
      },
    });

    // Confirmation email to complainant
    const confirmTemplate = complaintConfirmationEmail(name, referenceNumber);
    await sendEmail({ to: email, ...confirmTemplate });

    // Notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminTemplate = adminComplaintEmail(name, email, referenceNumber, subject, description);
      await sendEmail({ to: adminEmail, ...adminTemplate });
    }

    return NextResponse.json(
      { success: true, referenceNumber },
      { status: 201 }
    );
  } catch (error) {
    console.error("Complaint submission error:", error);
    return NextResponse.json(
      { error: "Errore durante l'invio del reclamo. Riprova più tardi." },
      { status: 500 }
    );
  }
}
