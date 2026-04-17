import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, agencyWelcomeEmail, adminAgencyRegistrationEmail } from "@/lib/email";
import { geocodeAddress } from "@/lib/geocode";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { generateAgencySlug } from "@/lib/utils";
import { resolveZoneForProperty } from "@/lib/zones";
import { z } from "zod";
import { validatePartitaIva, validatePec } from "@/lib/validators";
import { getZoneRadius, distanceKm } from "@/lib/zone-radius";

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
  partitaIva: z.string().length(11, "P.IVA deve essere di 11 cifre").regex(/^\d{11}$/, "P.IVA deve contenere solo cifre"),
  pec: z.string().email("PEC non valida"),
  approvalToken: z.string().optional(),
  selectedZoneId: z.string().min(1, "Seleziona almeno un territorio"),
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

    // Validate selected zone exists and has capacity
    const selectedZone = await prisma.zone.findUnique({
      where: { id: data.selectedZoneId },
      include: { territories: { where: { isActive: true }, select: { id: true } } },
    });

    if (!selectedZone) {
      return NextResponse.json({ error: "Territorio selezionato non trovato" }, { status: 400 });
    }

    if (selectedZone.territories.length >= selectedZone.maxAgencies) {
      return NextResponse.json({ error: "Territorio selezionato al completo, scegli un altro territorio" }, { status: 409 });
    }

    // Validate zone is geographically reachable from agency address
    const homeZoneId = await resolveZoneForProperty(data.city, data.province, "", data.address);
    if (homeZoneId) {
      const homeZone = await prisma.zone.findUnique({
        where: { id: homeZoneId },
        select: {
          lat: true,
          lng: true,
          zoneClass: true,
          city: true,
          population: true,
        },
      });

      if (homeZone?.lat && homeZone?.lng) {
        // Check distance (vale per TUTTE le zone, qualsiasi classe — la classe determina solo il prezzo)
        if (selectedZone.lat && selectedZone.lng && selectedZone.id !== homeZoneId) {
          const maxDist = getZoneRadius(homeZone);
          const dist = distanceKm(homeZone.lat, homeZone.lng, selectedZone.lat, selectedZone.lng);
          if (dist > maxDist) {
            return NextResponse.json({ error: "Territorio selezionato troppo lontano dalla tua sede" }, { status: 400 });
          }
        }
      }
    }

    // Validazione checksum P.IVA server-side
    if (!validatePartitaIva(data.partitaIva)) {
      return NextResponse.json({ error: "Partita IVA non valida (checksum errato)." }, { status: 400 });
    }
    if (!validatePec(data.pec)) {
      return NextResponse.json({ error: "Indirizzo PEC non valido." }, { status: 400 });
    }

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
          partitaIva: data.partitaIva,
          pec: data.pec.toLowerCase(),
          lat: geocodeResult.ok ? geocodeResult.lat : null,
          lng: geocodeResult.ok ? geocodeResult.lng : null,
          plan: "BASE",
          isActive: false, // activated after payment
        },
      });

      // Generate and save slug
      const slug = generateAgencySlug(data.agencyName, data.city, agency.id);
      await tx.agency.update({ where: { id: agency.id }, data: { slug } });

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

      return { agency: { ...agency, slug }, user };
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
      try {
        const adminTemplate = adminAgencyRegistrationEmail(data.agencyName, data.city, data.email);
        await sendEmail({ to: adminEmail, ...adminTemplate });
      } catch (err) {
        console.error("Failed to send admin notification for new agency:", err);
      }
    }

    // Welcome email
    const welcomeTemplate = agencyWelcomeEmail(data.agencyName);
    await sendEmail({ to: data.email, ...welcomeTemplate });

    return NextResponse.json(
      {
        agency: { id: result.agency.id, name: result.agency.name, slug: result.agency.slug },
        user: { id: result.user.id, email: result.user.email },
        selectedZoneId: data.selectedZoneId,
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
