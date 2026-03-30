import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { verifyTwoFactorToken } from "@/lib/two-factor";

/**
 * POST /api/auth/two-factor/verify — Verify a TOTP code and enable 2FA
 * Body: { code: "123456" }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { code } = await req.json();

  if (!code || typeof code !== "string" || code.length !== 6) {
    return NextResponse.json({ error: "Codice a 6 cifre richiesto" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user?.twoFactorSecret) {
    return NextResponse.json(
      { error: "Nessun setup 2FA in corso. Avvia prima il setup." },
      { status: 400 }
    );
  }

  const isValid = verifyTwoFactorToken(code, user.twoFactorSecret);

  if (!isValid) {
    return NextResponse.json({ error: "Codice non valido. Riprova." }, { status: 400 });
  }

  // Enable 2FA
  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: true },
  });

  return NextResponse.json({ ok: true, message: "2FA attivato con successo" });
}
