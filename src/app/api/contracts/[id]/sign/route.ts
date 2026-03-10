import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { otpCode, role } = body; // role: "seller" or "agency"

    if (!otpCode || otpCode.length !== 6) {
      return NextResponse.json(
        { error: "Codice OTP non valido" },
        { status: 400 }
      );
    }

    const userId = (session.user as { id: string }).id;

    // Verify OTP from VerificationToken
    const identifier = `contract-otp:${id}:${userId}`;
    const storedToken = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token: otpCode,
        expires: { gte: new Date() },
      },
    });

    if (!storedToken) {
      return NextResponse.json(
        { error: "Codice OTP non valido o scaduto. Richiedi un nuovo codice." },
        { status: 400 }
      );
    }

    // Delete used OTP
    await prisma.verificationToken.deleteMany({ where: { identifier } });

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            seller: true,
            assignment: { include: { agency: true } },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contratto non trovato" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (role === "seller") {
      updateData.sellerSigned = true;
    } else if (role === "agency") {
      updateData.agencySigned = true;
    }

    // Check if both signed -> set signedAt and expiresAt
    const willBeFullySigned =
      (role === "seller" && contract.agencySigned) ||
      (role === "agency" && contract.sellerSigned);

    if (willBeFullySigned) {
      updateData.signedAt = new Date();
      updateData.expiresAt = new Date(
        Date.now() + contract.duration * 24 * 60 * 60 * 1000
      );
    }

    const updated = await prisma.contract.update({
      where: { id },
      data: updateData,
    });

    // Notify when contract is fully signed
    if (willBeFullySigned) {
      const property = contract.property;
      const emailHtml = `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Privatio</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #10b981;">Contratto firmato!</h2>
            <p>Il contratto di esclusiva per <strong>${property.title}</strong> è stato firmato da entrambe le parti.</p>
            <p>L'immobile verrà pubblicato a breve sulla piattaforma.</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: property.seller.email,
        subject: "Contratto firmato — Privatio",
        html: emailHtml,
      });

      if (property.assignment?.agency) {
        await sendEmail({
          to: property.assignment.agency.email,
          subject: "Contratto firmato — Privatio",
          html: emailHtml,
        });
      }
    }

    return NextResponse.json({ contract: updated });
  } catch (error) {
    console.error("Contract sign error:", error);
    return NextResponse.json(
      { error: "Errore durante la firma" },
      { status: 500 }
    );
  }
}
