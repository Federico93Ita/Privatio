import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La password deve avere almeno 8 caratteri" },
        { status: 400 }
      );
    }

    // Find and validate token
    const storedToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: `password-reset:${email}`,
        token,
        expires: { gte: new Date() },
      },
    });

    if (!storedToken) {
      return NextResponse.json(
        { error: "Link non valido o scaduto. Richiedi un nuovo link." },
        { status: 400 }
      );
    }

    // Delete used token
    await prisma.verificationToken.deleteMany({
      where: { identifier: `password-reset:${email}` },
    });

    // Update password
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password reimpostata con successo" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
