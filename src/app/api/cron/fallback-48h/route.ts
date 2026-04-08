import { NextRequest, NextResponse } from "next/server";
import { checkFallback48h } from "@/lib/matchmaking";

/**
 * GET /api/cron/fallback-48h
 *
 * Esegue il fallback 48h: condivide i contatti dei venditori che non hanno
 * scelto un'agenzia entro 48 ore (con consenso GDPR esplicito) con tutte le
 * agenzie attive nella loro zona aventi un profilo completo.
 *
 * Protetto da CRON_SECRET. Schedule: ogni ora (vedi vercel.json).
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkFallback48h();
    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fallback 48h cron error:", error);
    return NextResponse.json(
      { ok: false, error: "Errore esecuzione fallback" },
      { status: 500 }
    );
  }
}
