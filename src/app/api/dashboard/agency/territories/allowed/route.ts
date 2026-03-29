import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveZoneForProperty } from "@/lib/zones";

/**
 * GET /api/dashboard/agency/territories/allowed
 *
 * Restituisce la lista di zone che l'agenzia loggata può acquistare,
 * ovvero la zona della sede + le zone adiacenti.
 *
 * Risposta: { allowedZoneIds: string[] }
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { agency: true },
  });

  if (!user?.agency) {
    return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 });
  }

  const { city, province } = user.agency;

  const homeZoneId = await resolveZoneForProperty(city, province, "");

  if (!homeZoneId) {
    // Nessuna zona trovata per l'indirizzo dell'agenzia: restituisce lista vuota
    return NextResponse.json({ allowedZoneIds: [] });
  }

  const homeZone = await prisma.zone.findUnique({
    where: { id: homeZoneId },
    select: { adjacentZoneIds: true },
  });

  const allowedZoneIds = [homeZoneId, ...(homeZone?.adjacentZoneIds ?? [])];

  return NextResponse.json({ allowedZoneIds });
}
