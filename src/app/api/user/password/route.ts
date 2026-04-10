import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password attuale richiesta"),
  newPassword: z.string().min(8, "La nuova password deve avere almeno 8 caratteri"),
});

export async function PUT(req: NextRequest) {
  try {
    const limited = await applyRateLimit(RATE_LIMITS.auth, req);
    if (limited) return limited;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Account registrato tramite Google. Usa il login Google." },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Password attuale non corretta" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password aggiornata con successo" });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Errore nel cambio password" }, { status: 500 });
  }
}
