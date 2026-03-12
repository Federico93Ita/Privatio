import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const agencySettingsSchema = z.object({
  name: z.string().min(2, "Nome richiesto (minimo 2 caratteri)"),
  phone: z.string().min(6, "Telefono richiesto"),
  address: z.string().min(2, "Indirizzo richiesto"),
  city: z.string().min(2, "Città richiesta"),
  province: z.string().length(2, "Provincia deve essere di 2 caratteri"),
  description: z.string().optional(),
  coverageRadius: z.number().min(5).max(50),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { agencyId: true, role: true },
    });

    if (!user?.agencyId || user.role !== "AGENCY_ADMIN") {
      return NextResponse.json(
        { error: "Non hai i permessi per modificare le impostazioni" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = agencySettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.agency.update({
      where: { id: user.agencyId },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        address: parsed.data.address,
        city: parsed.data.city,
        province: parsed.data.province.toUpperCase(),
        description: parsed.data.description || null,
        coverageRadius: parsed.data.coverageRadius,
      },
    });

    return NextResponse.json({ agency: updated });
  } catch (error) {
    console.error("Agency settings update error:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio delle impostazioni" },
      { status: 500 }
    );
  }
}
