import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, welcomeEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json(
        { error: "Parametri mancanti" },
        { status: 400 }
      );
    }

    // Find and validate token
    const storedToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: `email-verify:${email}`,
        token,
        expires: { gte: new Date() },
      },
    });

    if (!storedToken) {
      return NextResponse.json(
        { error: "Link non valido o scaduto." },
        { status: 400 }
      );
    }

    // Delete used token
    await prisma.verificationToken.deleteMany({
      where: { identifier: `email-verify:${email}` },
    });

    // Mark user as verified
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Send welcome email after successful verification
    if (user.name && user.email) {
      try {
        const emailContent = welcomeEmail(user.name);
        await sendEmail({ to: user.email, ...emailContent });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
    }

    return NextResponse.json({ message: "Email verificata con successo!" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
