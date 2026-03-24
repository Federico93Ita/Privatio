import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import crypto from "crypto";

const TOKEN_EXPIRY_HOURS = 1;

/** Escape HTML special characters */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  try {
    const limited = await applyRateLimit(RATE_LIMITS.passwordReset, req);
    if (limited) return limited;

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email richiesta" }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.password) {
      // Generate a secure token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      // Delete existing tokens for this user
      await prisma.verificationToken.deleteMany({
        where: { identifier: `password-reset:${email}` },
      });

      // Store token
      await prisma.verificationToken.create({
        data: {
          identifier: `password-reset:${email}`,
          token,
          expires,
        },
      });

      // Send reset email
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      await sendEmail({
        to: email,
        subject: "Reimposta la tua password — Privatio",
        html: `
          <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #0f172a; margin-top: 0;">Reimposta la tua password</h2>
              <p style="color: #64748b;">Ciao ${esc(user.name || "")},</p>
              <p style="color: #64748b;">Hai richiesto di reimpostare la password del tuo account Privatio.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                  Reimposta Password
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px;">Questo link scade tra ${TOKEN_EXPIRY_HOURS} ora.</p>
              <p style="color: #64748b; font-size: 14px;">Se non hai richiesto questa operazione, ignora questa email.</p>
            </div>
            <div style="background: #f8fafc; padding: 20px 30px; text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; Privatio — La piattaforma per vendere casa senza commissioni</p>
            </div>
          </div>
        `,
      });
    }

    // Always return success (prevent email enumeration)
    return NextResponse.json({
      message: "Se l'email e registrata, riceverai un link per reimpostare la password.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
