import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

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

/** Escape HTML special characters */
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  try {
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
    const adminResult = await sendEmail({
      to: process.env.CONTACT_EMAIL || "info@privatio.it",
      subject: `[Contatto] ${subjectLabels[subject]} — da ${name}`,
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nuovo messaggio dal sito</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 100px;">Nome:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${esc(name)}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${esc(email)}" style="color: #0e8ff1;">${esc(email)}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Oggetto:</td><td style="padding: 8px 0; color: #1e293b;">${esc(subjectLabels[subject])}</td></tr>
            </table>
            <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #0e8ff1;">
              <p style="color: #1e293b; line-height: 1.6; margin: 0; white-space: pre-wrap;">${esc(message)}</p>
            </div>
          </div>
        </div>
      `,
    });

    // Send confirmation to the user
    await sendEmail({
      to: email,
      subject: "Abbiamo ricevuto il tuo messaggio — Privatio",
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">La prima piattaforma pensata per chi vende</p>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #0a1f44;">Ciao ${esc(name)}!</h2>
            <p style="color: #64748b; line-height: 1.6;">
              Abbiamo ricevuto il tuo messaggio e ti risponderemo il prima possibile,
              generalmente entro 24 ore lavorative.
            </p>
            <p style="color: #64748b; line-height: 1.6;">
              Nel frattempo, puoi esplorare la nostra piattaforma:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://privatio.it"}/come-funziona"
                 style="background: #0e8ff1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Scopri come funziona
              </a>
            </div>
          </div>
          <div style="padding: 20px 30px; background: #f8fafc; text-align: center;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">
              Privatio — Vendi casa. Zero commissioni.<br/>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://privatio.it"}" style="color: #0e8ff1;">privatio.it</a>
            </p>
          </div>
        </div>
      `,
    });

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
