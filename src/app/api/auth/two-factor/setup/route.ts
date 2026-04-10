import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateTwoFactorSetup } from "@/lib/two-factor";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/auth/two-factor/setup — Generate a new 2FA secret + QR code
 */
export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(RATE_LIMITS.auth, req);
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, twoFactorEnabled: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  if (user.twoFactorEnabled) {
    return NextResponse.json(
      { error: "2FA è già attivo. Disattivalo prima di configurarne uno nuovo." },
      { status: 400 }
    );
  }

  const { secret, qrCodeDataUrl } = await generateTwoFactorSetup(user.email);

  // Save secret temporarily (not enabled yet until verified)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: secret },
  });

  return NextResponse.json({ qrCode: qrCodeDataUrl });
}
