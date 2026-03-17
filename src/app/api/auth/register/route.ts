import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { sendEmail, emailVerificationEmail, esc } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const VERIFY_TOKEN_EXPIRY_HOURS = 24;

export async function POST(req: NextRequest) {
  try {
    const limited = applyRateLimit(RATE_LIMITS.register, req);
    if (limited) return limited;

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, password, role, accettaTermini, accettaPrivacy, accettaMarketing, termsVersion } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email già registrata" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Extract IP for consent tracking
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";

    const now = new Date();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || "SELLER",
        ...(accettaTermini && { termsAcceptedAt: now }),
        ...(accettaPrivacy && { privacyAcceptedAt: now }),
        marketingConsent: accettaMarketing || false,
        termsVersion: termsVersion || null,
        termsAcceptedIp: accettaTermini ? ip : null,
      },
    });

    // Generate email verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + VERIFY_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: `email-verify:${email}`,
        token,
        expires,
      },
    });

    // Send verification email
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/grazie/verifica-email?token=${token}&email=${encodeURIComponent(email)}`;
    const emailContent = emailVerificationEmail(name, verifyUrl);
    await sendEmail({ to: email, ...emailContent });

    // Notify admin of new user registration
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://privatio.vercel.app";
      const roleLabel = (role || "SELLER") === "SELLER" ? "Venditore" : "Acquirente";
      try {
        await sendEmail({
          to: adminEmail,
          subject: `Nuova registrazione: ${esc(name)} (${roleLabel})`,
          html: `
            <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0f172a; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Nuova Registrazione Utente</h1>
              </div>
              <div style="padding: 30px; background: white;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #6b7280;">Nome</td><td style="padding: 8px 0; font-weight: 600;">${esc(name)}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0; font-weight: 600;">${esc(email)}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280;">Telefono</td><td style="padding: 8px 0; font-weight: 600;">${phone ? esc(phone) : "Non fornito"}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280;">Tipo</td><td style="padding: 8px 0; font-weight: 600;">${roleLabel}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280;">Data</td><td style="padding: 8px 0; font-weight: 600;">${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}</td></tr>
                </table>
                <a href="${appUrl}/admin" style="display: inline-block; margin-top: 20px; background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 500;">Pannello Admin</a>
              </div>
            </div>
          `,
        });
      } catch (err) {
        console.error("Failed to send admin notification for new user:", err);
      }
    }

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Errore durante la registrazione" },
      { status: 500 }
    );
  }
}
