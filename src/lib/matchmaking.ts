import { prisma } from "./prisma";
import {
  sendEmail,
  agencyAssignedEmail,
  agencyNewAssignmentEmail,
  agencyFallbackNotificationEmail,
  sellerFallbackNotificationEmail,
  adminNoZoneFoundEmail,
  adminNoAgencyAvailableEmail,
} from "./email";
import { autoAssignZoneToProperty } from "./zones";
import { PLANS } from "./stripe";
import type { PlanKey } from "./stripe";

/**
 * Assegna un immobile all'agenzia migliore basandosi sul sistema territoriale.
 *
 * Flusso di contatto (Fase 2 — dopo 48 ore):
 *   1. Il venditore pubblica l'immobile e vede la lista delle agenzie nella sua zona.
 *   2. Se il venditore non contatta nessuna agenzia entro 48 ore,
 *      i suoi dati vengono condivisi automaticamente con le agenzie della zona.
 *   3. Questa funzione gestisce l'assegnazione automatica del caso 48h.
 *
 * Logica di assegnazione:
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
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const template = adminNoZoneFoundEmail(property.title, property.address || "");
      await sendEmail({ to: adminEmail, ...template });
    }
    return null;
  }

  // 2. Trova agenzie con territorio attivo in questa zona
  const territoryAssignments = await prisma.territoryAssignment.findMany({
    where: {
      zoneId,
      isActive: true,
      agency: { isActive: true, billingStatus: "ACTIVE" },
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
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const template = adminNoAgencyAvailableEmail(property.title, "zona senza agenzie");
      await sendEmail({ to: adminEmail, ...template });
    }
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

/**
 * Fallback 48h: per ogni immobile pubblicato da più di 48h che NON ha
 * ancora un'assignment scelta dal venditore (ma con consenso GDPR),
 * condivide i contatti del venditore con tutte le agenzie con profilo
 * completo attive nella zona, e invia notifica al venditore.
 *
 * Eseguito ogni ora via Vercel Cron.
 */
export async function checkFallback48h() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const candidates = await prisma.property.findMany({
    where: {
      status: "DRAFT",
      assignment: null,
      fallbackConsentAt: { not: null },
      createdAt: { lte: cutoff },
      zoneId: { not: null },
    },
    include: {
      seller: true,
      photos: { take: 1, orderBy: { order: "asc" } },
      fallbackContacts: true,
    },
  });

  let processedProperties = 0;
  let notifiedAgencies = 0;

  for (const property of candidates) {
    if (!property.zoneId) continue;

    // Trova agenzie attive in zona con profilo completo
    const territories = await prisma.territoryAssignment.findMany({
      where: {
        zoneId: property.zoneId,
        isActive: true,
        agency: {
          isActive: true,
          profileCompletedAt: { not: null },
        },
      },
      include: { agency: true },
    });

    if (territories.length === 0) continue;

    const alreadyNotified = new Set(property.fallbackContacts.map((c) => c.agencyId));
    const newAgencies = territories
      .map((t) => t.agency)
      .filter((a) => !alreadyNotified.has(a.id));

    if (newAgencies.length === 0) continue;

    for (const agency of newAgencies) {
      await prisma.propertyFallbackContact.create({
        data: { propertyId: property.id, agencyId: agency.id },
      });

      const fallbackTemplate = agencyFallbackNotificationEmail(
        agency.name,
        property.title,
        `${property.address}, ${property.city}`,
        property.seller.name || "Venditore",
        property.seller.phone || "",
        property.seller.email,
        property.photos[0]?.url || undefined
      );
      await sendEmail({ to: agency.email, ...fallbackTemplate });
      notifiedAgencies++;
    }

    // Email al venditore solo alla prima notifica
    if (alreadyNotified.size === 0) {
      const sellerTemplate = sellerFallbackNotificationEmail(
        property.seller.name || "Venditore"
      );
      await sendEmail({ to: property.seller.email, ...sellerTemplate });
    }

    processedProperties++;
  }

  return { processedProperties, notifiedAgencies };
}

