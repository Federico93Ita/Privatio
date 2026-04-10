import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, passwordResetEmail } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import crypto from "crypto";

const TOKEN_EXPIRY_HOURS = 1;

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
      const template = passwordResetEmail(user.name || "", resetUrl);
      await sendEmail({ to: email, ...template });
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
