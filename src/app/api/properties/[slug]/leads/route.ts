import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buyerLeadSchema } from "@/lib/validations";
import { sendEmail, buyerLeadAgencyNotificationEmail, buyerLeadConfirmationEmail } from "@/lib/email";
import { notifyAgency } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const parsed = buyerLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        assignment: {
          include: { agency: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Immobile non trovato" },
        { status: 404 }
      );
    }

    const lead = await prisma.buyerLead.create({
      data: {
        ...parsed.data,
        propertyId: property.id,
      },
    });

    // Notify assigned agency (in-app + email)
    if (property.assignment?.agency) {
      await notifyAgency({
        agencyId: property.assignment.agency.id,
        type: "LEAD_RECEIVED",
        title: "Nuova richiesta acquirente",
        body: `${parsed.data.name} ha richiesto info per "${property.title}"`,
        href: "/dashboard/agenzia",
      });

      const agencyTemplate = buyerLeadAgencyNotificationEmail(
        property.assignment.agency.name,
        property.title,
        parsed.data.name,
        parsed.data.email,
        parsed.data.phone || "",
        parsed.data.message
      );
      await sendEmail({ to: property.assignment.agency.email, ...agencyTemplate });
    }

    // Confirmation to buyer
    const buyerTemplate = buyerLeadConfirmationEmail(parsed.data.name, property.title);
    await sendEmail({ to: parsed.data.email, ...buyerTemplate });

    return NextResponse.json({ lead: { id: lead.id } }, { status: 201 });
  } catch (error) {
    console.error("Buyer lead error:", error);
    return NextResponse.json(
      { error: "Errore durante l'invio" },
      { status: 500 }
    );
  }
}
