import { prisma } from "./prisma";
import { sendEmail, agencyAssignedEmail, agencyNewAssignmentEmail } from "./email";
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
      status: "PUBLISHED",
      assignment: null,
      fallbackConsentAt: { not: null },
      publishedAt: { lte: cutoff },
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

      const email = agencyFallbackNotificationEmail({
        agencyName: agency.name,
        sellerName: property.seller.name || "Venditore",
        sellerEmail: property.seller.email,
        sellerPhone: property.seller.phone || "",
        propertyTitle: property.title,
        propertyAddress: `${property.address}, ${property.city}`,
        propertyDescription: property.description || "",
        propertyPhoto: property.photos[0]?.url || null,
      });
      await sendEmail({ to: agency.email, ...email });
      notifiedAgencies++;
    }

    // Email al venditore solo alla prima notifica
    if (alreadyNotified.size === 0) {
      const sellerEmail = sellerFallbackNotificationEmail(
        property.seller.name || "Venditore",
        newAgencies.length
      );
      await sendEmail({ to: property.seller.email, ...sellerEmail });
    }

    processedProperties++;
  }

  return { processedProperties, notifiedAgencies };
}

function agencyFallbackNotificationEmail(opts: {
  agencyName: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyDescription: string;
  propertyPhoto: string | null;
}) {
  const e = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  return {
    subject: `Nuovo contatto venditore: ${opts.propertyTitle}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0B1D3A; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Privatio</h1>
          <p style="color: #C9A84C; margin: 8px 0 0;">Nuovo contatto venditore disponibile</p>
        </div>
        <div style="padding: 30px; background: white;">
          <p>Ciao ${e(opts.agencyName)},</p>
          <p>Un venditore della tua zona <strong>non ha scelto nessuna agenzia entro 48 ore</strong>.
          Come previsto dal consenso espresso al momento della pubblicazione, ti condividiamo
          i suoi contatti per permetterti di ricontattarlo direttamente.</p>
          ${opts.propertyPhoto ? `<img src="${e(opts.propertyPhoto)}" alt="" style="width:100%; max-width:540px; border-radius:12px; margin:16px 0;" />` : ""}
          <h3 style="color: #0B1D3A; margin-top: 24px;">Immobile</h3>
          <p style="margin: 4px 0;"><strong>${e(opts.propertyTitle)}</strong></p>
          <p style="color: #64748b; margin: 4px 0;">${e(opts.propertyAddress)}</p>
          ${opts.propertyDescription ? `<p style="color: #64748b; line-height: 1.6;">${e(opts.propertyDescription).slice(0, 500)}</p>` : ""}
          <h3 style="color: #0B1D3A; margin-top: 24px;">Contatto venditore</h3>
          <p style="margin: 4px 0;"><strong>Nome:</strong> ${e(opts.sellerName)}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${e(opts.sellerEmail)}">${e(opts.sellerEmail)}</a></p>
          ${opts.sellerPhone ? `<p style="margin: 4px 0;"><strong>Telefono:</strong> ${e(opts.sellerPhone)}</p>` : ""}
          <p style="color: #64748b; font-size: 13px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            Privacy: il venditore ha espressamente acconsentito alla condivisione dei suoi dati con le agenzie partner Privatio della sua zona, in caso di mancata scelta entro 48 ore. Tratta i suoi dati nel rispetto del GDPR.
          </p>
        </div>
      </div>
    `,
  };
}

function sellerFallbackNotificationEmail(sellerName: string, agencyCount: number) {
  const e = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return {
    subject: "Le agenzie della tua zona ti contatteranno",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0B1D3A; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Privatio</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <p>Ciao ${e(sellerName)},</p>
          <p>Sono passate <strong>48 ore</strong> dalla pubblicazione del tuo immobile e non hai ancora scelto un'agenzia partner.</p>
          <p>Come avevi acconsentito al momento della pubblicazione, abbiamo condiviso i tuoi contatti con
          <strong>${agencyCount} ${agencyCount === 1 ? "agenzia partner" : "agenzie partner"}</strong> attive nella tua zona, così potranno ricontattarti direttamente.</p>
          <p>Puoi sempre tornare in dashboard e scegliere tu l'agenzia che preferisci:</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/venditore"
               style="background: #C9A84C; color: #0B1D3A; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Vai in dashboard
            </a>
          </p>
          <p style="color: #64748b; font-size: 13px;">
            Ricorda: con Privatio non paghi nessuna commissione. Se vuoi revocare il consenso alla condivisione, contattaci a privacy@privatio.it.
          </p>
        </div>
      </div>
    `,
  };
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
