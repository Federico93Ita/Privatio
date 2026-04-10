import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  sendEmail,
  agencyNewAssignmentEmail,
  agencyAssignedEmail,
} from "@/lib/email";

/**
 * POST /api/properties/:id/choose-agency
 *
 * Il venditore sceglie un'agenzia per il proprio immobile.
 * Crea un PropertyAssignment e notifica agenzia + venditore.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json();
    const { agencyId } = body as { agencyId?: string };

    if (!agencyId) {
      return NextResponse.json({ error: "agencyId richiesto" }, { status: 400 });
    }

    // Verify property belongs to seller and has no assignment yet
    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        seller: { select: { name: true, email: true, phone: true } },
        assignment: true,
      },
    });

    if (!property || property.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
    }

    if (property.assignment) {
      return NextResponse.json(
        { error: "Questo immobile ha già un'agenzia assegnata" },
        { status: 409 }
      );
    }

    // Verify agency is active and has territory in the property's zone
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        billingStatus: true,
      },
    });

    if (!agency || !agency.isActive || agency.billingStatus !== "ACTIVE") {
      return NextResponse.json(
        { error: "Agenzia non disponibile" },
        { status: 400 }
      );
    }

    // Verify agency has active territory in the property's zone
    if (property.zoneId) {
      const territory = await prisma.territoryAssignment.findFirst({
        where: {
          agencyId,
          zoneId: property.zoneId,
          isActive: true,
        },
      });

      if (!territory) {
        return NextResponse.json(
          { error: "L'agenzia non è attiva nella zona dell'immobile" },
          { status: 400 }
        );
      }
    }

    // Create assignment
    const assignment = await prisma.propertyAssignment.create({
      data: {
        propertyId: property.id,
        agencyId,
        status: "ACTIVE",
      },
    });

    // Send emails in parallel
    const emailPromises = [];

    // Notify agency
    const agencyTemplate = agencyNewAssignmentEmail(
      agency.name,
      property.title,
      `${property.address}, ${property.city}`
    );
    emailPromises.push(
      sendEmail({ to: agency.email, ...agencyTemplate })
    );

    // Notify seller
    const sellerTemplate = agencyAssignedEmail(
      property.seller.name || "Venditore",
      agency.name,
      agency.phone || ""
    );
    emailPromises.push(
      sendEmail({ to: property.seller.email, ...sellerTemplate })
    );

    await Promise.allSettled(emailPromises);

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error("Choose agency error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
