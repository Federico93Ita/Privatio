import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import crypto from "crypto";

/** Escape HTML special characters */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_REQUESTS = 3;
const RATE_LIMIT_WINDOW_MINUTES = 15;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limited = applyRateLimit(RATE_LIMITS.otp, req);
    if (limited) return limited;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id } = await params;

    // Find the contract
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            seller: { select: { id: true, email: true, name: true } },
            assignment: { include: { agency: { select: { email: true, name: true } } } },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contratto non trovato" }, { status: 404 });
    }

    // Determine who is requesting the OTP
    const userId = (session.user as { id: string }).id;
    const userEmail = session.user.email!;
    const isSeller = contract.property.sellerId === userId;

    if (!isSeller) {
      // Could be agency — for now only seller can sign via this flow
      return NextResponse.json(
        { error: "Non autorizzato a firmare questo contratto" },
        { status: 403 }
      );
    }

    // Rate limiting: check recent OTP requests for this contract
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
    );
    const recentTokens = await prisma.verificationToken.count({
      where: {
        identifier: `contract-otp:${id}:${userId}`,
        expires: { gte: windowStart },
      },
    });

    if (recentTokens >= MAX_OTP_REQUESTS) {
      return NextResponse.json(
        {
          error: `Troppi tentativi. Riprova tra ${RATE_LIMIT_WINDOW_MINUTES} minuti.`,
        },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Store OTP using VerificationToken model
    // Delete any existing OTPs for this contract/user first
    await prisma.verificationToken.deleteMany({
      where: { identifier: `contract-otp:${id}:${userId}` },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: `contract-otp:${id}:${userId}`,
        token: otpCode,
        expires: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    });

    // Send OTP via email
    const userName = contract.property.seller.name || "Venditore";
    await sendEmail({
      to: userEmail,
      subject: "Codice OTP per firma contratto — Privatio",
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #0f172a; margin-top: 0;">Codice OTP per firma contratto</h2>
            <p style="color: #64748b;">Ciao ${esc(userName)},</p>
            <p style="color: #64748b;">Hai richiesto un codice OTP per firmare il contratto di esclusiva per il tuo immobile.</p>
            <div style="background: #f8fafc; border: 2px solid #2563eb; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
              <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px;">Il tuo codice OTP:</p>
              <p style="color: #0f172a; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0;">${otpCode}</p>
            </div>
            <p style="color: #ef4444; font-size: 14px;">Questo codice scade tra ${OTP_EXPIRY_MINUTES} minuti.</p>
            <p style="color: #64748b; font-size: 14px;">Se non hai richiesto questo codice, ignora questa email.</p>
          </div>
          <div style="background: #f8fafc; padding: 20px 30px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; Privatio — La piattaforma per vendere casa senza commissioni</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: "Codice OTP inviato alla tua email" });
  } catch (error) {
    console.error("OTP generation error:", error);
    return NextResponse.json(
      { error: "Errore nell'invio del codice OTP" },
      { status: 500 }
    );
  }
}
