import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/address/lookup-by-cap?cap=10100
 *
 * Cerca nel database Zone un CAP e ritorna città + provincia.
 * Usa la tabella Zone già popolata con dati ISTAT/comuni italiani.
 */
export async function GET(req: NextRequest) {
  const cap = req.nextUrl.searchParams.get("cap");

  if (!cap || !/^\d{5}$/.test(cap)) {
    return NextResponse.json(
      { error: "CAP non valido. Deve essere di 5 cifre." },
      { status: 400 }
    );
  }

  try {
    // Cerca zone che contengono questo CAP, preferendo quelle con city definita
    const zone = await prisma.zone.findFirst({
      where: {
        capCodes: { has: cap },
        city: { not: null },
      },
      select: {
        city: true,
        province: true,
      },
      orderBy: {
        population: "desc",
      },
    });

    if (!zone || !zone.city) {
      // Fallback: cerca qualsiasi zona con questo CAP (anche senza city)
      const fallback = await prisma.zone.findFirst({
        where: {
          capCodes: { has: cap },
        },
        select: {
          city: true,
          province: true,
          municipalities: true,
        },
        orderBy: {
          population: "desc",
        },
      });

      if (!fallback) {
        return NextResponse.json(
          { error: "CAP non trovato" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        city: fallback.city || fallback.municipalities?.[0] || "",
        province: fallback.province,
      });
    }

    return NextResponse.json({
      city: zone.city,
      province: zone.province,
    });
  } catch (error) {
    console.error("CAP lookup error:", error);
    return NextResponse.json(
      { error: "Errore durante la ricerca" },
      { status: 500 }
    );
  }
}
