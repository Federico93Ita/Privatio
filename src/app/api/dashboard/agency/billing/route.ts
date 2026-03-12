import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const billingDataSchema = z.object({
  ragioneSociale: z.string().min(2, "Ragione sociale richiesta"),
  partitaIva: z
    .string()
    .regex(/^\d{11}$/, "La Partita IVA deve essere di 11 cifre"),
  codiceFiscale: z
    .string()
    .regex(
      /^[A-Z0-9]{11,16}$/i,
      "Codice Fiscale non valido (11 cifre per società o 16 caratteri alfanumerici)"
    ),
  pec: z
    .string()
    .email("Indirizzo PEC non valido")
    .optional()
    .or(z.literal("")),
  codiceSdi: z
    .string()
    .regex(/^[A-Z0-9]{7}$/i, "Codice SDI deve essere di 7 caratteri alfanumerici")
    .optional()
    .or(z.literal("")),
  invoiceAddress: z.string().min(2, "Indirizzo sede legale richiesto"),
  invoiceCity: z.string().min(2, "Città richiesta"),
  invoiceProvince: z.string().length(2, "Provincia deve essere di 2 caratteri"),
  invoiceCap: z
    .string()
    .regex(/^\d{5}$/, "Il CAP deve essere di 5 cifre"),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { agencyId: true },
    });

    if (!user?.agencyId) {
      return NextResponse.json(
        { error: "Non sei associato a un'agenzia" },
        { status: 403 }
      );
    }

    const agency = await prisma.agency.findUnique({
      where: { id: user.agencyId },
      select: {
        ragioneSociale: true,
        partitaIva: true,
        codiceFiscale: true,
        pec: true,
        codiceSdi: true,
        invoiceAddress: true,
        invoiceCity: true,
        invoiceProvince: true,
        invoiceCap: true,
      },
    });

    return NextResponse.json({ billing: agency });
  } catch (error) {
    console.error("Get billing data error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dati fatturazione" },
      { status: 500 }
    );
  }
}

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
        { error: "Non hai i permessi per modificare i dati di fatturazione" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = billingDataSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dati non validi",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // At least one between PEC and Codice SDI must be provided
    if (!parsed.data.pec && !parsed.data.codiceSdi) {
      return NextResponse.json(
        {
          error:
            "È necessario fornire almeno un canale di ricezione: PEC o Codice SDI",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.agency.update({
      where: { id: user.agencyId },
      data: {
        ragioneSociale: parsed.data.ragioneSociale,
        partitaIva: parsed.data.partitaIva,
        codiceFiscale: parsed.data.codiceFiscale.toUpperCase(),
        pec: parsed.data.pec || null,
        codiceSdi: parsed.data.codiceSdi?.toUpperCase() || "0000000",
        invoiceAddress: parsed.data.invoiceAddress,
        invoiceCity: parsed.data.invoiceCity,
        invoiceProvince: parsed.data.invoiceProvince.toUpperCase(),
        invoiceCap: parsed.data.invoiceCap,
      },
    });

    return NextResponse.json({
      billing: {
        ragioneSociale: updated.ragioneSociale,
        partitaIva: updated.partitaIva,
        codiceFiscale: updated.codiceFiscale,
        pec: updated.pec,
        codiceSdi: updated.codiceSdi,
        invoiceAddress: updated.invoiceAddress,
        invoiceCity: updated.invoiceCity,
        invoiceProvince: updated.invoiceProvince,
        invoiceCap: updated.invoiceCap,
      },
    });
  } catch (error) {
    console.error("Update billing data error:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio dati fatturazione" },
      { status: 500 }
    );
  }
}
