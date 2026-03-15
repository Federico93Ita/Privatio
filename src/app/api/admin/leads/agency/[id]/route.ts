import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, agencyApprovedEmail, agencyRejectedEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const { id } = await params;
    const { action } = await req.json();
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
    }

    const lead = await prisma.agencyLead.findUnique({
      where: { id: id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead non trovato" }, { status: 404 });
    }

    if (lead.status === "CONVERTED") {
      return NextResponse.json({ error: "Lead già convertito" }, { status: 400 });
    }

    if (action === "approve") {
      const approvalToken = crypto.randomBytes(32).toString("hex");

      await prisma.agencyLead.update({
        where: { id: id },
        data: {
          status: "APPROVED",
          approvalToken,
          approvedAt: new Date(),
        },
      });

      const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/registra-agenzia?token=${approvalToken}`;
      const emailContent = agencyApprovedEmail(lead.contactName, lead.agencyName, registrationUrl);
      const approveEmailResult = await sendEmail({ to: lead.email, ...emailContent });
      if (!approveEmailResult.success) {
        console.error("Failed to send agency approval email:", approveEmailResult.error);
      }

      return NextResponse.json({ message: "Lead approvato, email inviata" });
    }

    // Reject
    await prisma.agencyLead.update({
      where: { id: id },
      data: { status: "LOST" },
    });

    const emailContent = agencyRejectedEmail(lead.contactName, lead.agencyName);
    const rejectEmailResult = await sendEmail({ to: lead.email, ...emailContent });
    if (!rejectEmailResult.success) {
      console.error("Failed to send agency rejection email:", rejectEmailResult.error);
    }

    return NextResponse.json({ message: "Lead rifiutato, email inviata" });
  } catch (error) {
    console.error("Admin lead agency action error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
