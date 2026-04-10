import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { verifyTwoFactorToken } from "@/lib/two-factor";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/auth/two-factor/disable — Disable 2FA (requires current TOTP code)
 * Body: { code: "123456" }
 */
export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(RATE_LIMITS.otp, req);
  if (limited) return limited;

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

  if (!user?.twoFactorEnabled || !user?.twoFactorSecret) {
    return NextResponse.json({ error: "2FA non è attivo" }, { status: 400 });
  }

  const isValid = verifyTwoFactorToken(code, user.twoFactorSecret);

  if (!isValid) {
    return NextResponse.json({ error: "Codice non valido" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  return NextResponse.json({ ok: true, message: "2FA disattivato" });
}
