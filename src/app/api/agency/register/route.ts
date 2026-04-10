import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { geocodeAddress } from "@/lib/geocode";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const agencyRegisterSchema = z.object({
  agencyName: z.string().min(2, "Nome agenzia richiesto"),
  name: z.string().min(2, "Nome contatto richiesto"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(8, "Telefono richiesto"),
  password: z
    .string()
    .min(8, "Password minimo 8 caratteri")
    .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/[0-9]/, "La password deve contenere almeno un numero")
    .regex(/[^A-Za-z0-9]/, "La password deve contenere almeno un carattere speciale"),
  address: z.string().min(5, "Indirizzo richiesto"),
  city: z.string().min(2, "Città richiesta"),
  province: z.string().min(2, "Provincia richiesta"),
  description: z.string().optional(),
  approvalToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const limited = await applyRateLimit(RATE_LIMITS.register, req);
    if (limited) return limited;
    const body = await req.json();
    const parsed = agencyRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Email già registrata" }, { status: 409 });
    }

    const existingAgency = await prisma.agency.findUnique({
      where: { email: data.email },
    });
    if (existingAgency) {
      return NextResponse.json({ error: "Agenzia già registrata" }, { status: 409 });
    }

    // Validate approval token if provided
    let approvedLead = null;
    if (data.approvalToken) {
      approvedLead = await prisma.agencyLead.findFirst({
        where: { approvalToken: data.approvalToken, status: "APPROVED" },
      });
      if (!approvedLead) {
        return NextResponse.json(
          { error: "Token di approvazione non valido o già utilizzato" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Geocode agency address for matchmaking
    const geocodeResult = await geocodeAddress(data.address, data.city, data.province);

    // Create agency and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name: data.agencyName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          province: data.province,
          description: data.description,
          lat: geocodeResult.ok ? geocodeResult.lat : null,
          lng: geocodeResult.ok ? geocodeResult.lng : null,
          plan: "BASE",
          isActive: false, // activated after payment
        },
      });

      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: hashedPassword,
          role: "AGENCY_ADMIN",
          agencyId: agency.id,
        },
      });

      return { agency, user };
    });

    // Mark lead as converted if registered via approval token
    if (approvedLead) {
      await prisma.agencyLead.update({
        where: { id: approvedLead.id },
        data: { status: "CONVERTED" },
      });
    }

    // Notify admin of new agency registration
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://privatio.it";
      try {
        await sendEmail({
          to: adminEmail,
          subject: `Nuova agenzia registrata: ${esc(data.agencyName)} — ${esc(data.city)}`,
          html: `
            <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0f172a; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Nuova Registrazione Agenzia</h1>
              </div>
              <div style="padding: 30px; background: white;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #6b7280;">Agenzia</td><td style="padding: 8px 0; font-weight: 600;">${esc(data.agencyName)}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280;">Contatto</td><td style="padding: 8px 0; font-weight: 600;">${esc(data.name)}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0; font-weight: 600;">${esc(data.email)}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280;">Telefono</td><td style="padding: 8px 0; font-weight: 600;">${esc(data.phone)}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280;">Indirizzo</td><td style="padding: 8px 0; font-weight: 600;">${esc(data.address)}, ${esc(data.city)} (${esc(data.province)})</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280;">Da lead approvato</td><td style="padding: 8px 0; font-weight: 600;">${approvedLead ? "Sì" : "No (registrazione diretta)"}</td></tr>
                  <tr><td style="padding: 8px 0; color: #6b7280;">Data</td><td style="padding: 8px 0; font-weight: 600;">${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}</td></tr>
                </table>
                <a href="${appUrl}/admin" style="display: inline-block; margin-top: 20px; background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 500;">Pannello Admin</a>
              </div>
            </div>
          `,
        });
      } catch (err) {
        console.error("Failed to send admin notification for new agency:", err);
      }
    }

    // Welcome email
    await sendEmail({
      to: data.email,
      subject: "Benvenuto nel network Privatio!",
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Privatio Partner</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #0f172a;">Benvenuto ${esc(data.name)}!</h2>
            <p style="color: #6b7280; line-height: 1.6;">
              La registrazione di <strong>${esc(data.agencyName)}</strong> è stata completata.
              Per attivare il tuo profilo e iniziare a ricevere immobili, sottoscrivi un piano.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia"
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500; margin-top: 16px;">
              Attiva il tuo piano
            </a>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      {
        agency: { id: result.agency.id, name: result.agency.name },
        user: { id: result.user.id, email: result.user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Agency registration error:", error);
    return NextResponse.json(
      { error: "Errore durante la registrazione" },
      { status: 500 }
    );
  }
}
