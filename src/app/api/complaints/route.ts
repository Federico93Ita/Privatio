import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/** Escape HTML special characters */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://privatio.it";
    await sendEmail({
      to: email,
      subject: `Reclamo ricevuto — ${referenceNumber}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Sistema di gestione reclami</p>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #0f172a; margin-top: 0;">Ciao ${esc(name)},</h2>
            <p style="color: #475569; line-height: 1.7;">
              Abbiamo ricevuto il tuo reclamo e lo abbiamo preso in carico. Il tuo numero di riferimento è:
            </p>
            <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; color: #1e293b; font-size: 20px; font-weight: bold;">${referenceNumber}</p>
            </div>
            <p style="color: #475569; line-height: 1.7;">
              <strong>Oggetto:</strong> ${esc(subject)}
            </p>
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #0f172a; margin-top: 0; font-size: 16px;">Tempistiche di gestione</h3>
              <ul style="color: #475569; line-height: 1.8; padding-left: 20px; margin: 0;">
                <li><strong>Presa in carico:</strong> entro 48 ore lavorative</li>
                <li><strong>Risposta definitiva:</strong> entro 30 giorni</li>
              </ul>
            </div>
            <p style="color: #475569; line-height: 1.7;">
              Conserva questo numero di riferimento per eventuali comunicazioni future.
              Per aggiornamenti, scrivi a <a href="mailto:reclami@privatio.it" style="color: #2563eb;">reclami@privatio.it</a> citando il codice ${referenceNumber}.
            </p>
          </div>
          <div style="padding: 20px 30px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">
              Privatio — Sistema di gestione reclami ai sensi del Regolamento P2B (UE) 2019/1150, Art. 11<br/>
              <a href="${appUrl}" style="color: #2563eb;">privatio.it</a>
            </p>
          </div>
        </div>
      `,
    });

    // Notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const userTypeLabels: Record<string, string> = {
        venditore: "Venditore",
        agenzia: "Agenzia",
        acquirente: "Acquirente",
      };
      await sendEmail({
        to: adminEmail,
        subject: `Nuovo reclamo P2B: ${referenceNumber} — ${esc(subject)}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #0f172a;">Nuovo reclamo ricevuto</h2>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0;">
              <p style="margin: 0; font-weight: bold;">Riferimento: ${referenceNumber}</p>
            </div>
            <p><strong>Nome:</strong> ${esc(name)}</p>
            <p><strong>Email:</strong> ${esc(email)}</p>
            <p><strong>Tipo utente:</strong> ${userTypeLabels[userType] || userType}</p>
            <p><strong>Oggetto:</strong> ${esc(subject)}</p>
            <p><strong>Descrizione:</strong></p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${esc(description)}</div>
            <p style="color: #64748b; font-size: 13px; margin-top: 20px;">
              Reclamo ai sensi del Regolamento P2B (UE) 2019/1150, Art. 11.
              Risposta richiesta entro 30 giorni.
            </p>
          </div>
        `,
      });
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
