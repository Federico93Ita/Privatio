import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { visitSchema } from "@/lib/validations";
import { sendEmail, visitScheduledEmail, visitBookedAgencyEmail, visitBookedBuyerEmail } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const parsed = visitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        seller: true,
        assignment: { include: { agency: true } },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Immobile non trovato" },
        { status: 404 }
      );
    }

    const visit = await prisma.visit.create({
      data: {
        ...parsed.data,
        scheduledAt: new Date(parsed.data.scheduledAt),
        propertyId: property.id,
      },
    });

    const dateFormatted = formatDateTime(parsed.data.scheduledAt);

    // Notify seller
    const sellerEmail = visitScheduledEmail(
      property.seller.name || "Venditore",
      property.title,
      dateFormatted
    );
    await sendEmail({ to: property.seller.email, ...sellerEmail });

    // Notify agency
    if (property.assignment?.agency) {
      const agencyTemplate = visitBookedAgencyEmail(
        property.assignment.agency.name,
        property.title,
        parsed.data.buyerName,
        dateFormatted
      );
      await sendEmail({ to: property.assignment.agency.email, ...agencyTemplate });
    }

    // Confirmation to buyer
    const buyerTemplate = visitBookedBuyerEmail(
      parsed.data.buyerName,
      property.title,
      dateFormatted,
      property.assignment?.agency?.name || "Privatio"
    );
    await sendEmail({ to: parsed.data.buyerEmail, ...buyerTemplate });

    return NextResponse.json({ visit: { id: visit.id } }, { status: 201 });
  } catch (error) {
    console.error("Visit booking error:", error);
    return NextResponse.json(
      { error: "Errore durante la prenotazione" },
      { status: 500 }
    );
  }
}
