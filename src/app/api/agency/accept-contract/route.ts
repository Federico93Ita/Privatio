import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const acceptContractSchema = z.object({
  accettaContratto: z.literal(true, { message: "Devi accettare il Contratto di Convenzionamento" }),
  accettaPrivacy: z.literal(true, { message: "Devi accettare la Privacy Policy" }),
  accettaZeroCommissioni: z.literal(true, { message: "Devi accettare la clausola zero provvigioni" }),
  accettaClausole: z.literal(true, { message: "Devi approvare le clausole vessatorie" }),
  accettaRegistro: z.literal(true, { message: "Devi dichiarare l'iscrizione al Registro" }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Get user and verify agency admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { agency: true },
    });

    if (!user || user.role !== "AGENCY_ADMIN" || !user.agencyId) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 403 });
    }

    // Validate body
    const body = await req.json();
    const parsed = acceptContractSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Tutti i consensi sono obbligatori", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Get IP from headers
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const now = new Date();

    // Save contract acceptance
    await prisma.agency.update({
      where: { id: user.agencyId },
      data: {
        contractAcceptedAt: now,
        privacyAcceptedAt: now,
        zeroCommissionAcceptedAt: now,
        clausoleAcceptedAt: now,
        registroAcceptedAt: now,
        contractVersion: "1.0",
        contractAcceptedIp: ip,
      },
    });

    return NextResponse.json({ success: true, acceptedAt: now.toISOString() });
  } catch (error) {
    console.error("Accept contract error:", error);
    return NextResponse.json({ error: "Errore durante l'accettazione del contratto" }, { status: 500 });
  }
}
