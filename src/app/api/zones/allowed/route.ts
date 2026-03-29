import { NextRequest, NextResponse } from "next/server";
import { resolveZoneForProperty } from "@/lib/zones";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/zones/allowed?city=Moncalieri&province=TO
 *
 * Endpoint pubblico (no auth) — restituisce le zone acquistabili
 * da un'agenzia con sede nella città specificata.
 *
 * Risposta: { allowedZoneIds: string[] }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city")?.trim() ?? "";
  const province = searchParams.get("province")?.trim().toUpperCase() ?? "";

  if (!city || !province) {
    return NextResponse.json({ allowedZoneIds: [] });
  }

  const homeZoneId = await resolveZoneForProperty(city, province, "");

  if (!homeZoneId) {
    return NextResponse.json({ allowedZoneIds: [] });
  }

  const homeZone = await prisma.zone.findUnique({
    where: { id: homeZoneId },
    select: { adjacentZoneIds: true },
  });

  const allowedZoneIds = [homeZoneId, ...(homeZone?.adjacentZoneIds ?? [])];

  return NextResponse.json({ allowedZoneIds });
}
