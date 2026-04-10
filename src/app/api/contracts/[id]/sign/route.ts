import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendEmail, contractSignedEmail } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit OTP verification to prevent brute-force (3 attempts per 15 min)
    const limited = await applyRateLimit(RATE_LIMITS.otp, req);
    if (limited) return limited;

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

    // Validate role: sellers can only sign as "seller", agency users as "agency"
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, agencyId: true },
    });

    if (role === "agency" && (!user || (user.role !== "AGENCY_ADMIN" && user.role !== "AGENCY_AGENT") || !user.agencyId)) {
      return NextResponse.json(
        { error: "Non sei autorizzato a firmare come agenzia" },
        { status: 403 }
      );
    }
    // Verify the agency user belongs to the agency assigned to this property
    if (role === "agency" && user?.agencyId && contract.property.assignment?.agencyId !== user.agencyId) {
      return NextResponse.json(
        { error: "Non sei autorizzato a firmare per questa agenzia" },
        { status: 403 }
      );
    }
    if (role === "seller" && (!user || user.role !== "SELLER")) {
      return NextResponse.json(
        { error: "Non sei autorizzato a firmare come venditore" },
        { status: 403 }
      );
    }
    if (role !== "seller" && role !== "agency") {
      return NextResponse.json(
        { error: "Ruolo non valido" },
        { status: 400 }
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

      const sellerTemplate = contractSignedEmail(
        property.seller.name || "Venditore",
        property.title
      );
      await sendEmail({ to: property.seller.email, ...sellerTemplate });

      if (property.assignment?.agency) {
        const agencyTemplate = contractSignedEmail(
          property.assignment.agency.name,
          property.title
        );
        await sendEmail({ to: property.assignment.agency.email, ...agencyTemplate });
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
