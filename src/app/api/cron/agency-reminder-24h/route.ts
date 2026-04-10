import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, agencyReminder24hEmail } from "@/lib/email";

/**
 * GET /api/cron/agency-reminder-24h
 *
 * Invia un promemoria ai venditori che hanno pubblicato un immobile
 * 24 ore fa senza ancora scegliere un'agenzia.
 *
 * Eseguito ogni ora via Vercel Cron.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Immobili pubblicati tra 23 e 25 ore fa, senza assignment, con consenso fallback
    const windowStart = new Date(Date.now() - 25 * 60 * 60 * 1000);
    const windowEnd = new Date(Date.now() - 23 * 60 * 60 * 1000);

    const candidates = await prisma.property.findMany({
      where: {
        status: "DRAFT",
        assignment: null,
        fallbackConsentAt: { not: null },
        createdAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        seller: { select: { email: true, name: true } },
      },
    });

    let sent = 0;
    for (const property of candidates) {
      const template = agencyReminder24hEmail(
        property.seller.name || "Venditore",
        property.title
      );
      const result = await sendEmail({
        to: property.seller.email,
        ...template,
      });
      if (result.success) sent++;
    }

    return NextResponse.json({
      ok: true,
      candidatesFound: candidates.length,
      remindersSent: sent,
    });
  } catch (error) {
    console.error("Agency reminder 24h error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
