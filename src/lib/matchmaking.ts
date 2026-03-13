import { prisma } from "./prisma";
import { sendEmail, agencyAssignedEmail, agencyNewAssignmentEmail } from "./email";

export async function assignAgencyToProperty(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { assignment: true, seller: true },
  });

  if (!property || property.assignment) return null;

  const agencies = await prisma.agency.findMany({
    where: { isActive: true },
    include: {
      assignments: {
        where: { status: "ACTIVE" },
      },
    },
  });

  // Filter by distance
  const nearbyAgencies = agencies.filter((agency) => {
    if (!agency.lat || !agency.lng) return false;
    const distance = haversineDistance(
      property.lat,
      property.lng,
      agency.lat,
      agency.lng
    );
    return distance <= agency.coverageRadius;
  });

  // Filter by plan capacity
  const availableAgencies = nearbyAgencies.filter((agency) => {
    if (agency.plan === "BASE" && agency.assignments.length >= 5) return false;
    return true;
  });

  // Sort by: PRO first, then workload (ascending), then rating (descending)
  availableAgencies.sort((a, b) => {
    // PRO agencies get priority over BASE
    const aPro = a.plan === "PRO" ? 0 : 1;
    const bPro = b.plan === "PRO" ? 0 : 1;
    if (aPro !== bPro) return aPro - bPro;

    // Then by workload (fewer active assignments first)
    const loadDiff = a.assignments.length - b.assignments.length;
    if (loadDiff !== 0) return loadDiff;

    // Then by rating (higher first)
    return (b.rating || 0) - (a.rating || 0);
  });

  if (availableAgencies.length === 0) {
    await notifyAdminNoAgencyAvailable(propertyId, property.title);
    return null;
  }

  const selectedAgency = availableAgencies[0];

  const assignment = await prisma.propertyAssignment.create({
    data: {
      propertyId: property.id,
      agencyId: selectedAgency.id,
      status: "ACTIVE",
    },
  });

  // Email to agency
  const agencyEmail = agencyNewAssignmentEmail(
    selectedAgency.name,
    property.title,
    `${property.address}, ${property.city}`
  );
  await sendEmail({
    to: selectedAgency.email,
    ...agencyEmail,
  });

  // Email to seller
  const sellerEmail = agencyAssignedEmail(
    property.seller.name || "Venditore",
    selectedAgency.name,
    selectedAgency.phone
  );
  await sendEmail({
    to: property.seller.email,
    ...sellerEmail,
  });

  return assignment;
}

async function notifyAdminNoAgencyAvailable(propertyId: string, propertyTitle: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  await sendEmail({
    to: adminEmail,
    subject: "Nessuna agenzia disponibile — Privatio",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Attenzione: Nessuna agenzia disponibile</h2>
        <p>L'immobile <strong>${propertyTitle}</strong> (ID: ${propertyId}) non ha agenzie disponibili nella zona.</p>
        <p>È necessario un intervento manuale per l'assegnazione.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">Vai all'Admin Panel</a>
      </div>
    `,
  });
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number) {
  return deg * (Math.PI / 180);
}
