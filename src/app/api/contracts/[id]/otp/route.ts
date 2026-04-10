import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendEmail, otpCodeEmail } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import crypto from "crypto";

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_REQUESTS = 3;
const RATE_LIMIT_WINDOW_MINUTES = 15;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limited = await applyRateLimit(RATE_LIMITS.otp, req);
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
    const template = otpCodeEmail(otpCode);
    await sendEmail({ to: userEmail, ...template });

    return NextResponse.json({ message: "Codice OTP inviato alla tua email" });
  } catch (error) {
    console.error("OTP generation error:", error);
    return NextResponse.json(
      { error: "Errore nell'invio del codice OTP" },
      { status: 500 }
    );
  }
}
