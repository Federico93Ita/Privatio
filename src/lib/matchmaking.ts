import { prisma } from "./prisma";
import { sendEmail, agencyAssignedEmail, agencyNewAssignmentEmail } from "./email";
import { autoAssignZoneToProperty } from "./zones";
import { PLANS } from "./stripe";
import type { PlanKey } from "./stripe";

/**
 * Assegna un immobile all'agenzia migliore basandosi sul sistema territoriale.
 *
 * TODO: Aggiornare per il nuovo flusso di contatto:
 *   1. Il venditore vede la lista delle agenzie nella sua zona e le contatta direttamente.
 *   2. Solo se il venditore non contatta nessuna agenzia entro 48 ore,
 *      i suoi dati vengono condivisi automaticamente con le agenzie della zona.
 *   Attualmente questa funzione viene usata come fallback per il caso 48h.
 *
 * Logica attuale:
 * 1. Risolve la zona dell'immobile (auto-detect se non assegnata)
 * 2. Trova tutte le agenzie con territorio attivo in quella zona
 * 3. Ordina per: priorità piano (Elite > Prime > City > Local > Base)
 *    → workload (meno incarichi attivi) → rating (più alto)
 * 4. Assegna alla migliore candidata
 */
export async function assignAgencyToProperty(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { assignment: true, seller: true },
  });

  if (!property || property.assignment) return null;

  // 1. Risolvi zona
  let zoneId = property.zoneId;
  if (!zoneId) {
    zoneId = await autoAssignZoneToProperty(propertyId);
  }

  if (!zoneId) {
    await notifyAdminNoZoneFound(propertyId, property.title);
    return null;
  }

  // 2. Trova agenzie con territorio attivo in questa zona
  const territoryAssignments = await prisma.territoryAssignment.findMany({
    where: {
      zoneId,
      isActive: true,
      agency: { isActive: true },
    },
    include: {
      agency: {
        include: {
          assignments: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
  });

  if (territoryAssignments.length === 0) {
    await notifyAdminNoAgencyAvailable(propertyId, property.title);
    return null;
  }

  // 3. Ordina per priorità piano → workload → rating
  territoryAssignments.sort((a, b) => {
    const aPriority = PLANS[a.plan as PlanKey]?.priority || 0;
    const bPriority = PLANS[b.plan as PlanKey]?.priority || 0;
    if (aPriority !== bPriority) return bPriority - aPriority;

    const loadDiff = a.agency.assignments.length - b.agency.assignments.length;
    if (loadDiff !== 0) return loadDiff;

    return (b.agency.rating || 0) - (a.agency.rating || 0);
  });

  // 4. Assegna alla migliore
  const selectedAgency = territoryAssignments[0].agency;

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

async function notifyAdminNoZoneFound(propertyId: string, propertyTitle: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  await sendEmail({
    to: adminEmail,
    subject: "Nessuna zona trovata per immobile — Privatio",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Attenzione: Zona non risolta</h2>
        <p>L'immobile <strong>${propertyTitle}</strong> (ID: ${propertyId}) non corrisponde a nessuna zona configurata.</p>
        <p>Verifica l'indirizzo e assegna manualmente la zona dall'admin panel.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">Vai all'Admin Panel</a>
      </div>
    `,
  });
}

async function notifyAdminNoAgencyAvailable(propertyId: string, propertyTitle: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  await sendEmail({
    to: adminEmail,
    subject: "Nessuna agenzia disponibile — Privatio",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Attenzione: Nessuna agenzia nella zona</h2>
        <p>L'immobile <strong>${propertyTitle}</strong> (ID: ${propertyId}) è in una zona senza agenzie partner attive.</p>
        <p>È necessario un intervento manuale per l'assegnazione.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">Vai all'Admin Panel</a>
      </div>
    `,
  });
}
