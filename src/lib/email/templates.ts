/**
 * Registry centralizzato dei template email Privatio.
 *
 * Ogni funzione restituisce { subject, html } (backward compatible)
 * più templateName e category per il logging.
 *
 * I template HTML inline nelle API routes verranno progressivamente
 * migrati qui.
 */

import { esc, legalFooter } from "./helpers";
import { BRAND, APP_URL, FONT_FAMILY, MAX_WIDTH } from "./constants";
import type { EmailTemplate } from "./types";

// ─── Layout helpers ────────────────────────────────────────────────

function header(subtitle?: string): string {
  return `
    <div style="background: ${BRAND.headerBg}; padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Privatio</h1>
      ${subtitle ? `<p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 16px;">${subtitle}</p>` : ""}
    </div>
  `;
}

function wrap(content: string, footer?: string): string {
  return `
    <div style="font-family: ${FONT_FAMILY}; max-width: ${MAX_WIDTH}; margin: 0 auto; border: 1px solid ${BRAND.border}; border-radius: 12px; overflow: hidden;">
      ${content}
      ${footer ?? legalFooter()}
    </div>
  `;
}

function body(content: string): string {
  return `<div style="padding: 30px; background: white;">${content}</div>`;
}

function cta(text: string, href: string): string {
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${href}"
         style="background: ${BRAND.primary}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        ${text}
      </a>
    </div>
  `;
}

function infoBox(content: string): string {
  return `
    <div style="background: ${BRAND.bgLight}; border-radius: 12px; padding: 20px; margin: 20px 0;">
      ${content}
    </div>
  `;
}

function accentBox(content: string): string {
  return `
    <div style="background: ${BRAND.bgAccent}; border-radius: 12px; padding: 24px; margin: 24px 0;">
      ${content}
    </div>
  `;
}

function p(text: string): string {
  return `<p style="color: ${BRAND.textMuted}; line-height: 1.6;">${text}</p>`;
}

// ─── Auth / Account ────────────────────────────────────────────────

export function emailVerificationEmail(
  name: string,
  verifyUrl: string
): EmailTemplate {
  return {
    subject: "Verifica la tua email — Privatio",
    templateName: "emailVerification",
    category: "TRANSACTIONAL",
    html: wrap(
      header("La prima piattaforma pensata per chi vende") +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(name)}!</h2>
        ${p("Grazie per esserti registrato su Privatio. Per completare la registrazione, verifica il tuo indirizzo email cliccando il pulsante qui sotto.")}
        ${cta("Verifica Email", verifyUrl)}
        <p style="color: ${BRAND.textMuted}; font-size: 14px;">Questo link scade tra 24 ore.</p>
        <p style="color: ${BRAND.textMuted}; font-size: 14px;">Se non hai creato un account su Privatio, ignora questa email.</p>
      `)
    ),
  };
}

export function welcomeEmail(name: string): EmailTemplate {
  return {
    subject: "Benvenuto su Privatio — Ecco come funziona!",
    templateName: "welcome",
    category: "TRANSACTIONAL",
    html: wrap(
      header("Vendi casa. Zero commissioni.") +
        body(`
        <h2 style="color: ${BRAND.textPrimary}; margin-top: 0;">Ciao ${esc(name)}, benvenuto su Privatio!</h2>
        ${p("Siamo felici di averti a bordo! Privatio è la <strong>prima piattaforma immobiliare in Italia pensata per chi vende</strong>. Il nostro obiettivo è semplice: aiutarti a vendere il tuo immobile senza pagare commissioni.")}

        ${accentBox(`
          <h3 style="color: ${BRAND.textPrimary}; margin-top: 0; font-size: 18px;">Come funziona Privatio</h3>

          <div style="margin-bottom: 16px;">
            <p style="color: ${BRAND.primary}; font-weight: bold; margin: 0 0 4px; font-size: 14px;">STEP 1 — Inserisci il tuo immobile</p>
            <p style="color: ${BRAND.textSecondary}; margin: 0; line-height: 1.6; font-size: 14px;">
              Dalla tua dashboard, clicca su "Inserisci immobile" e compila i dati: indirizzo, metratura, prezzo, descrizione e foto.
            </p>
          </div>

          <div style="margin-bottom: 16px;">
            <p style="color: ${BRAND.primary}; font-weight: bold; margin: 0 0 4px; font-size: 14px;">STEP 2 — Scegli la tua agenzia</p>
            <p style="color: ${BRAND.textSecondary}; margin: 0; line-height: 1.6; font-size: 14px;">
              Nella tua dashboard trovi la lista delle agenzie partner verificate nella tua zona. Scegli quella che preferisci e contattala direttamente. Se non contatti nessuno entro 48 ore, le agenzie potranno contattarti.
            </p>
          </div>

          <div style="margin-bottom: 16px;">
            <p style="color: ${BRAND.primary}; font-weight: bold; margin: 0 0 4px; font-size: 14px;">STEP 3 — L'agenzia gestisce tutto</p>
            <p style="color: ${BRAND.textSecondary}; margin: 0; line-height: 1.6; font-size: 14px;">
              L'agenzia si occupa di sopralluogo, foto professionali, pubblicazione dell'annuncio sui principali portali e gestione delle visite.
            </p>
          </div>

          <div>
            <p style="color: ${BRAND.primary}; font-weight: bold; margin: 0 0 4px; font-size: 14px;">STEP 4 — Vendi e incassi il 100%</p>
            <p style="color: ${BRAND.textSecondary}; margin: 0; line-height: 1.6; font-size: 14px;">
              Quando trovi l'acquirente giusto, concludi la vendita e <strong>incassi l'intero prezzo di vendita</strong>. Nessuna commissione, nessun costo nascosto.
            </p>
          </div>
        `)}

        ${cta("Vai alla tua Dashboard", `${APP_URL}/dashboard/venditore`)}
        <p style="text-align: center; color: ${BRAND.textLight}; font-size: 13px; margin-top: 8px;">
          Oppure visita <a href="${APP_URL}" style="color: ${BRAND.primary};">privatio.it</a> per esplorare la piattaforma.
        </p>
      `)
    ),
  };
}

export function passwordResetEmail(
  name: string,
  resetUrl: string
): EmailTemplate {
  return {
    subject: "Reimposta la tua password — Privatio",
    templateName: "passwordReset",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(name)},</h2>
        ${p("Hai richiesto di reimpostare la tua password su Privatio. Clicca il pulsante qui sotto per scegliere una nuova password.")}
        ${cta("Reimposta Password", resetUrl)}
        <p style="color: ${BRAND.textMuted}; font-size: 14px;">Questo link scade tra 1 ora.</p>
        <p style="color: ${BRAND.textMuted}; font-size: 14px;">Se non hai richiesto tu il reset, ignora questa email. La tua password non verrà modificata.</p>
      `)
    ),
  };
}

export function otpCodeEmail(code: string): EmailTemplate {
  return {
    subject: "Codice OTP per firma contratto — Privatio",
    templateName: "otpCode",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Codice di verifica</h2>
        ${p("Usa il seguente codice OTP per confermare la firma del contratto:")}
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: ${BRAND.primary}; background: ${BRAND.bgAccent}; padding: 16px 32px; border-radius: 12px; display: inline-block;">
            ${esc(code)}
          </span>
        </div>
        <p style="color: ${BRAND.textMuted}; font-size: 14px; text-align: center;">Il codice scade tra 5 minuti.</p>
        <p style="color: ${BRAND.textMuted}; font-size: 14px;">Se non hai richiesto questo codice, ignora questa email.</p>
      `)
    ),
  };
}

// ─── Venditore ──────────────────────────────────────────────────────

export function sellerWelcomeEmail(name: string): EmailTemplate {
  return {
    subject: "Il tuo immobile è stato inserito — Privatio",
    templateName: "sellerWelcome",
    category: "TRANSACTIONAL",
    html: wrap(
      header("La prima piattaforma pensata per chi vende") +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(name)}!</h2>
        ${p("Il tuo immobile è stato inserito con successo su Privatio.")}
        ${p("<strong>Cosa succede ora?</strong>")}
        ${p("Nella tua dashboard trovi la lista delle agenzie partner attive nella tua zona. Scegli quella che preferisci: riceverà tutte le informazioni sul tuo immobile e potrà contattarti per organizzare un sopralluogo.")}
        ${p("Se non scegli un'agenzia entro 48 ore, condivideremo i tuoi dati con le agenzie della tua zona, che potranno contattarti direttamente.")}
        ${p("Ricorda: con Privatio <strong>non paghi nessuna commissione</strong>. Incassi il 100% del prezzo di vendita.")}
        ${cta("Scegli un'Agenzia", `${APP_URL}/dashboard/venditore`)}
      `)
    ),
  };
}

export function agencyAssignedEmail(
  sellerName: string,
  agencyName: string,
  agencyPhone: string
): EmailTemplate {
  return {
    subject: "I tuoi dati sono stati condivisi con un'agenzia — Privatio",
    templateName: "agencyAssigned",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(sellerName)}!</h2>
        ${p("Sono trascorse 48 ore senza che tu abbia contattato un'agenzia. Come previsto, i tuoi dati sono stati condivisi con le agenzie partner nella tua zona, che potranno contattarti direttamente.")}
        ${infoBox(`
          <h3 style="color: ${BRAND.textPrimary}; margin-top: 0;">Agenzia partner</h3>
          <p style="color: #1e293b; margin: 4px 0;"><strong>${esc(agencyName)}</strong></p>
          <p style="color: ${BRAND.textMuted}; margin: 4px 0;">Tel: ${esc(agencyPhone)}</p>
        `)}
        ${p("Puoi comunque scegliere e contattare un'agenzia direttamente dalla tua dashboard in qualsiasi momento.")}
      `)
    ),
  };
}

export function agencyReminder24hEmail(
  sellerName: string,
  propertyTitle: string
): EmailTemplate {
  return {
    subject: "Hai ancora 24 ore per scegliere un'agenzia — Privatio",
    templateName: "agencyReminder24h",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(sellerName)},</h2>
        ${p(`Hai inserito <strong>"${esc(propertyTitle)}"</strong> su Privatio 24 ore fa.`)}
        ${p("Puoi ancora scegliere un'agenzia partner dalla tua dashboard. Se non scegli entro le prossime 24 ore, condivideremo i tuoi dati di contatto con le agenzie convenzionate nella tua zona, che potranno contattarti direttamente.")}
        ${cta("Scegli un'Agenzia", `${APP_URL}/dashboard/venditore`)}
        <p style="color: ${BRAND.textMuted}; font-size: 14px;">Se preferisci essere contattato direttamente dalle agenzie, non devi fare nulla.</p>
      `)
    ),
  };
}

// ─── Agenzia ────────────────────────────────────────────────────────

export function agencyWelcomeEmail(agencyName: string): EmailTemplate {
  return {
    subject: "Benvenuto nel network Privatio!",
    templateName: "agencyWelcome",
    category: "TRANSACTIONAL",
    html: wrap(
      header("Network Agenzie Immobiliari") +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Benvenuta ${esc(agencyName)}!</h2>
        ${p("La tua agenzia è stata registrata su Privatio. Per iniziare a ricevere immobili nella tua zona, attiva il tuo piano dalla dashboard.")}
        ${cta("Attiva il tuo Piano", `${APP_URL}/dashboard/agenzia/territori`)}
      `)
    ),
  };
}

export function agencyApprovedEmail(
  contactName: string,
  agencyName: string,
  registrationUrl: string
): EmailTemplate {
  return {
    subject: "La tua agenzia è stata approvata — Privatio Partner",
    templateName: "agencyApproved",
    category: "TRANSACTIONAL",
    html: wrap(
      header("Network Agenzie Immobiliari") +
        body(`
        <h2 style="color: ${BRAND.textPrimary}; margin-top: 0;">Complimenti ${esc(contactName)}!</h2>
        ${p(`Siamo lieti di comunicarti che <strong>${esc(agencyName)}</strong> è stata <strong style="color: ${BRAND.success};">approvata</strong> per entrare nel network Privatio Partner. Abbiamo valutato attentamente la tua candidatura e siamo convinti che la collaborazione sarà vantaggiosa per entrambi.`)}

        ${accentBox(`
          <h3 style="color: ${BRAND.textPrimary}; margin-top: 0; font-size: 18px;">Come funziona per le agenzie partner</h3>

          <div style="margin-bottom: 16px;">
            <p style="color: ${BRAND.primary}; font-weight: bold; margin: 0 0 4px; font-size: 14px;">1. Completa la registrazione</p>
            <p style="color: ${BRAND.textSecondary}; margin: 0; line-height: 1.6; font-size: 14px;">
              Clicca il link in fondo a questa email per creare il tuo account agenzia e scegliere il piano più adatto alle tue esigenze.
            </p>
          </div>

          <div style="margin-bottom: 16px;">
            <p style="color: ${BRAND.primary}; font-weight: bold; margin: 0 0 4px; font-size: 14px;">2. I venditori ti trovano</p>
            <p style="color: ${BRAND.textSecondary}; margin: 0; line-height: 1.6; font-size: 14px;">
              I venditori nella tua zona possono trovarti e contattarti direttamente dalla piattaforma. I venditori che non contattano un'agenzia entro 48h vengono segnalati nella tua dashboard.
            </p>
          </div>

          <div style="margin-bottom: 16px;">
            <p style="color: ${BRAND.primary}; font-weight: bold; margin: 0 0 4px; font-size: 14px;">3. Gestisci tutto dalla dashboard</p>
            <p style="color: ${BRAND.textSecondary}; margin: 0; line-height: 1.6; font-size: 14px;">
              Sopralluoghi, foto, pubblicazione annunci, visite e trattative: tutto gestibile dalla tua dashboard dedicata.
            </p>
          </div>

          <div>
            <p style="color: ${BRAND.primary}; font-weight: bold; margin: 0 0 4px; font-size: 14px;">4. Cresci senza costi di acquisizione</p>
            <p style="color: ${BRAND.textSecondary}; margin: 0; line-height: 1.6; font-size: 14px;">
              Nessun costo per lead o acquisizione clienti. Paghi solo l'abbonamento mensile e i venditori nella tua zona ti trovano direttamente.
            </p>
          </div>
        `)}

        ${cta("Completa la Registrazione", registrationUrl)}
        <p style="text-align: center; color: ${BRAND.textLight}; font-size: 13px; margin-top: 8px;">
          Questo link è riservato esclusivamente a ${esc(agencyName)}.
        </p>
      `)
    ),
  };
}

export function agencyRejectedEmail(
  contactName: string,
  agencyName: string
): EmailTemplate {
  return {
    subject: "Aggiornamento sulla tua candidatura — Privatio",
    templateName: "agencyRejected",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary}; margin-top: 0;">Ciao ${esc(contactName)},</h2>
        ${p(`Ti ringraziamo per l'interesse dimostrato nel voler far parte del network Privatio Partner con <strong>${esc(agencyName)}</strong>.`)}
        ${p("Dopo un'attenta valutazione, al momento non siamo in grado di procedere con l'attivazione della partnership. Il nostro processo di selezione è molto rigoroso per garantire il massimo livello di qualità ai nostri clienti venditori.")}
        ${p("Questo non preclude future collaborazioni. Ti invitiamo a ripresentare la candidatura in futuro, saremo felici di rivalutarla.")}
        <p style="color: ${BRAND.textSecondary}; margin-top: 24px; font-size: 15px;">
          Cordiali saluti,<br/>
          <strong>Il team Privatio</strong>
        </p>
      `)
    ),
  };
}

export function agencyNewAssignmentEmail(
  agencyName: string,
  propertyTitle: string,
  propertyAddress: string
): EmailTemplate {
  return {
    subject: "Nuovo venditore disponibile nella tua zona — Privatio",
    templateName: "agencyNewAssignment",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(agencyName)}!</h2>
        ${p("Un venditore nella tua zona non ha contattato nessuna agenzia entro 48 ore. I suoi dati sono ora disponibili nella tua dashboard. Puoi contattarlo direttamente.")}
        ${infoBox(`
          <h3 style="color: ${BRAND.textPrimary}; margin-top: 0;">${esc(propertyTitle)}</h3>
          <p style="color: ${BRAND.textMuted}; margin: 4px 0;">${esc(propertyAddress)}</p>
        `)}
        ${cta("Vedi Segnalazione", `${APP_URL}/dashboard/agenzia`)}
      `)
    ),
  };
}

// ─── Billing / Stripe ───────────────────────────────────────────────

export function territoryActivatedEmail(
  zoneName?: string
): EmailTemplate {
  return {
    subject: "Territorio attivato — Privatio",
    templateName: "territoryActivated",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.success};">Territorio attivato!</h2>
        ${p(`${zoneName ? `Il territorio "${esc(zoneName)}" è ora attivo.` : "Il tuo territorio è ora attivo."} Puoi iniziare a ricevere immobili nella tua zona.`)}
        ${cta("Vedi i tuoi territori", `${APP_URL}/dashboard/agenzia/territori`)}
      `)
    ),
  };
}

export function subscriptionCanceledEmail(): EmailTemplate {
  return {
    subject: "Abbonamento disattivato — Privatio",
    templateName: "subscriptionCanceled",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Abbonamento disattivato</h2>
        ${p("Il tuo abbonamento Privatio è stato disattivato. I tuoi territori non sono più attivi.")}
        ${p("Puoi riattivare i tuoi territori in qualsiasi momento dalla dashboard.")}
        ${cta("Riattiva", `${APP_URL}/dashboard/agenzia/territori`)}
      `)
    ),
  };
}

export function paymentFailedEmail(): EmailTemplate {
  return {
    subject: "Pagamento fallito — Privatio",
    templateName: "paymentFailed",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.error};">Pagamento non riuscito</h2>
        ${p("Il pagamento del tuo abbonamento Privatio non è andato a buon fine.")}
        ${p("Aggiorna il tuo metodo di pagamento per continuare a utilizzare la piattaforma.")}
        ${cta("Aggiorna pagamento", `${APP_URL}/dashboard/agenzia/fatturazione`)}
      `)
    ),
  };
}

export function subscriptionRenewedEmail(): EmailTemplate {
  return {
    subject: "Pagamento ricevuto — Privatio",
    templateName: "subscriptionRenewed",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.success};">Pagamento ricevuto</h2>
        ${p("Il pagamento del tuo abbonamento Privatio è andato a buon fine. I tuoi territori restano attivi.")}
        ${cta("Vai alla Dashboard", `${APP_URL}/dashboard/agenzia`)}
      `)
    ),
  };
}

// ─── Visite ──────────────────────────────────────────────────────────

export function visitScheduledEmail(
  name: string,
  propertyTitle: string,
  date: string
): EmailTemplate {
  return {
    subject: `Visita programmata per ${date} — Privatio`,
    templateName: "visitScheduled",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(name)}!</h2>
        ${p("Una visita è stata programmata per il tuo immobile.")}
        <div style="background: ${BRAND.bgAccent}; border-left: 4px solid ${BRAND.primary}; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #1e293b;"><strong>${esc(propertyTitle)}</strong></p>
          <p style="margin: 4px 0 0; color: ${BRAND.primary}; font-size: 18px; font-weight: bold;">${esc(date)}</p>
        </div>
      `)
    ),
  };
}

export function visitBookedAgencyEmail(
  agencyName: string,
  propertyTitle: string,
  buyerName: string,
  date: string
): EmailTemplate {
  return {
    subject: `Nuova visita prenotata — ${propertyTitle}`,
    templateName: "visitBookedAgency",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(agencyName)},</h2>
        ${p(`Un acquirente ha prenotato una visita per <strong>"${esc(propertyTitle)}"</strong>.`)}
        ${infoBox(`
          <p style="color: #1e293b; margin: 4px 0;"><strong>Acquirente:</strong> ${esc(buyerName)}</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Data:</strong> ${esc(date)}</p>
        `)}
        ${cta("Gestisci Visite", `${APP_URL}/dashboard/agenzia`)}
      `)
    ),
  };
}

export function visitBookedBuyerEmail(
  buyerName: string,
  propertyTitle: string,
  date: string,
  agencyName: string
): EmailTemplate {
  return {
    subject: `Visita confermata — ${propertyTitle}`,
    templateName: "visitBookedBuyer",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(buyerName)},</h2>
        ${p(`La tua visita per <strong>"${esc(propertyTitle)}"</strong> è stata confermata.`)}
        ${infoBox(`
          <p style="color: #1e293b; margin: 4px 0;"><strong>Data:</strong> ${esc(date)}</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Agenzia:</strong> ${esc(agencyName)}</p>
        `)}
        <p style="color: ${BRAND.textMuted}; font-size: 14px;">L'agenzia ti contatterà per i dettagli del punto di incontro.</p>
      `)
    ),
  };
}

export function visitStatusUpdateEmail(
  buyerName: string,
  propertyTitle: string,
  date: string,
  status: "confirmed" | "cancelled"
): EmailTemplate {
  const isConfirmed = status === "confirmed";
  return {
    subject: `Visita ${isConfirmed ? "confermata" : "annullata"} — ${propertyTitle}`,
    templateName: "visitStatusUpdate",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${isConfirmed ? BRAND.success : BRAND.error};">
          Visita ${isConfirmed ? "confermata" : "annullata"}
        </h2>
        ${p(`Ciao ${esc(buyerName)}, la visita per <strong>"${esc(propertyTitle)}"</strong> del ${esc(date)} è stata ${isConfirmed ? "confermata" : "annullata"}.`)}
        ${!isConfirmed ? p("Puoi prenotare una nuova visita dalla pagina dell'immobile.") : ""}
      `)
    ),
  };
}

// ─── Lead ────────────────────────────────────────────────────────────

export function leadReceivedEmail(name: string): EmailTemplate {
  return {
    subject: "Richiesta ricevuta — Privatio",
    templateName: "leadReceived",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(name)}!</h2>
        ${p("Abbiamo ricevuto la tua richiesta. Ti risponderemo al più presto.")}
      `)
    ),
  };
}

export function buyerLeadAgencyNotificationEmail(
  agencyName: string,
  propertyTitle: string,
  buyerName: string,
  buyerEmail: string,
  buyerPhone: string,
  message?: string
): EmailTemplate {
  return {
    subject: `Nuova richiesta per: ${propertyTitle}`,
    templateName: "buyerLeadAgencyNotification",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Nuova richiesta per un immobile</h2>
        ${p(`Ciao ${esc(agencyName)}, un acquirente è interessato a <strong>"${esc(propertyTitle)}"</strong>.`)}
        ${infoBox(`
          <p style="color: #1e293b; margin: 4px 0;"><strong>Nome:</strong> ${esc(buyerName)}</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Email:</strong> ${esc(buyerEmail)}</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Telefono:</strong> ${esc(buyerPhone)}</p>
          ${message ? `<p style="color: #1e293b; margin: 8px 0 4px;"><strong>Messaggio:</strong></p><p style="color: ${BRAND.textMuted}; margin: 4px 0;">${esc(message)}</p>` : ""}
        `)}
        ${cta("Vai alla Dashboard", `${APP_URL}/dashboard/agenzia`)}
      `)
    ),
  };
}

export function buyerLeadConfirmationEmail(
  buyerName: string,
  propertyTitle: string
): EmailTemplate {
  return {
    subject: "Richiesta inviata — Privatio",
    templateName: "buyerLeadConfirmation",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(buyerName)},</h2>
        ${p(`La tua richiesta per <strong>"${esc(propertyTitle)}"</strong> è stata inviata all'agenzia. Verrai ricontattato al più presto.`)}
        <p style="color: ${BRAND.textMuted}; font-size: 14px;">Ricorda: l'eventuale commissione acquirente (2-2,5%) viene negoziata direttamente con l'agenzia.</p>
      `)
    ),
  };
}

export function agencyLeadConfirmationEmail(
  agencyName: string
): EmailTemplate {
  return {
    subject: "Candidatura ricevuta — Privatio Partner",
    templateName: "agencyLeadConfirmation",
    category: "TRANSACTIONAL",
    html: wrap(
      header("Network Agenzie Immobiliari") +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(agencyName)},</h2>
        ${p("Abbiamo ricevuto la tua candidatura per entrare nel network Privatio Partner. Il nostro team la esaminerà e ti contatterà al più presto con l'esito.")}
        ${p("Grazie per l'interesse!")}
      `)
    ),
  };
}

// ─── Contatto / Reclami ──────────────────────────────────────────────

export function contactConfirmationEmail(name: string): EmailTemplate {
  return {
    subject: "Abbiamo ricevuto il tuo messaggio — Privatio",
    templateName: "contactConfirmation",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(name)},</h2>
        ${p("Abbiamo ricevuto il tuo messaggio. Ti risponderemo al più presto.")}
      `)
    ),
  };
}

export function complaintConfirmationEmail(
  name: string,
  referenceNumber: string
): EmailTemplate {
  return {
    subject: `Reclamo ricevuto [${referenceNumber}] — Privatio`,
    templateName: "complaintConfirmation",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(name)},</h2>
        ${p(`Abbiamo ricevuto il tuo reclamo con numero di riferimento <strong>${esc(referenceNumber)}</strong>. Il nostro team lo esaminerà e ti contatterà al più presto.`)}
      `)
    ),
  };
}

// ─── Contratti ────────────────────────────────────────────────────────

export function contractSignedEmail(
  name: string,
  contractTitle: string
): EmailTemplate {
  return {
    subject: "Autorizzazione confermata — Privatio",
    templateName: "contractSigned",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.success};">Autorizzazione confermata!</h2>
        ${p(`Ciao ${esc(name)}, il contratto <strong>"${esc(contractTitle)}"</strong> è stato firmato con successo da entrambe le parti.`)}
        ${cta("Vedi Contratto", `${APP_URL}/dashboard`)}
      `)
    ),
  };
}

// ─── Matchmaking / Fallback ──────────────────────────────────────────

export function agencyFallbackNotificationEmail(
  agencyName: string,
  propertyTitle: string,
  propertyAddress: string,
  sellerName: string,
  sellerPhone: string,
  sellerEmail: string,
  propertyImageUrl?: string
): EmailTemplate {
  return {
    subject: `Nuovo contatto venditore: ${propertyTitle} — Privatio`,
    templateName: "agencyFallbackNotification",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(agencyName)},</h2>
        ${p(`Un venditore nella tua zona non ha scelto un'agenzia entro 48 ore. I suoi dati di contatto sono ora disponibili.`)}
        ${propertyImageUrl ? `<img src="${propertyImageUrl}" alt="${esc(propertyTitle)}" style="width: 100%; border-radius: 8px; margin: 16px 0;" />` : ""}
        ${infoBox(`
          <h3 style="color: ${BRAND.textPrimary}; margin-top: 0;">${esc(propertyTitle)}</h3>
          <p style="color: ${BRAND.textMuted}; margin: 4px 0;">${esc(propertyAddress)}</p>
          <hr style="border: none; border-top: 1px solid ${BRAND.border}; margin: 12px 0;" />
          <p style="color: #1e293b; margin: 4px 0;"><strong>Venditore:</strong> ${esc(sellerName)}</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Telefono:</strong> ${esc(sellerPhone)}</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Email:</strong> ${esc(sellerEmail)}</p>
        `)}
        ${cta("Vai alla Dashboard", `${APP_URL}/dashboard/agenzia`)}
      `)
    ),
  };
}

export function sellerFallbackNotificationEmail(
  sellerName: string
): EmailTemplate {
  return {
    subject: "Le agenzie della tua zona ti contatteranno — Privatio",
    templateName: "sellerFallbackNotification",
    category: "TRANSACTIONAL",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(sellerName)},</h2>
        ${p("Sono trascorse 48 ore dalla pubblicazione del tuo immobile e non hai ancora contattato un'agenzia. Come previsto, i tuoi dati di contatto sono stati condivisi con le agenzie partner nella tua zona.")}
        ${p("Le agenzie potranno contattarti direttamente. Puoi comunque scegliere e contattare un'agenzia dalla tua dashboard in qualsiasi momento.")}
        ${cta("Vai alla Dashboard", `${APP_URL}/dashboard/venditore`)}
      `)
    ),
  };
}

// ─── Ricerche salvate ────────────────────────────────────────────────

export function savedSearchAlertEmail(
  userName: string,
  searchName: string,
  matchCount: number,
  searchUrl: string,
  unsubscribeUrl?: string
): EmailTemplate {
  return {
    subject: `${matchCount} nuovi immobili per "${searchName}" — Privatio`,
    templateName: "savedSearchAlert",
    category: "MARKETING",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Ciao ${esc(userName)},</h2>
        ${p(`Abbiamo trovato <strong>${matchCount} ${matchCount === 1 ? "nuovo immobile" : "nuovi immobili"}</strong> che corrispondono alla tua ricerca salvata <strong>"${esc(searchName)}"</strong>.`)}
        ${cta("Vedi Risultati", searchUrl)}
      `),
      legalFooter({
        showUnsubscribe: true,
        unsubscribeUrl: unsubscribeUrl || `${APP_URL}/dashboard/acquirente/ricerche`,
      })
    ),
  };
}

// ─── Admin ───────────────────────────────────────────────────────────

export function adminUserRegistrationEmail(
  userName: string,
  userEmail: string,
  userRole: string
): EmailTemplate {
  return {
    subject: `Nuova registrazione: ${userName} (${userRole})`,
    templateName: "adminUserRegistration",
    category: "ADMIN_NOTIFICATION",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Nuova registrazione utente</h2>
        ${infoBox(`
          <p style="color: #1e293b; margin: 4px 0;"><strong>Nome:</strong> ${esc(userName)}</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Email:</strong> ${esc(userEmail)}</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Tipo:</strong> ${esc(userRole)}</p>
        `)}
        ${cta("Pannello Admin", `${APP_URL}/admin`)}
      `)
    ),
  };
}

export function adminAgencyRegistrationEmail(
  agencyName: string,
  city: string,
  contactEmail: string
): EmailTemplate {
  return {
    subject: `Nuova agenzia registrata: ${agencyName} — ${city}`,
    templateName: "adminAgencyRegistration",
    category: "ADMIN_NOTIFICATION",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Nuova agenzia registrata</h2>
        ${infoBox(`
          <p style="color: #1e293b; margin: 4px 0;"><strong>Agenzia:</strong> ${esc(agencyName)}</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Città:</strong> ${esc(city)}</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Email:</strong> ${esc(contactEmail)}</p>
        `)}
        ${cta("Pannello Admin", `${APP_URL}/admin`)}
      `)
    ),
  };
}

export function adminContactEmail(
  senderName: string,
  senderEmail: string,
  subject: string,
  message: string
): EmailTemplate {
  return {
    subject: `[Contatto] ${subject} — da ${senderName}`,
    templateName: "adminContact",
    category: "ADMIN_NOTIFICATION",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Nuovo messaggio di contatto</h2>
        ${infoBox(`
          <p style="color: #1e293b; margin: 4px 0;"><strong>Da:</strong> ${esc(senderName)} (${esc(senderEmail)})</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Oggetto:</strong> ${esc(subject)}</p>
          <p style="color: ${BRAND.textMuted}; margin: 8px 0 0; white-space: pre-wrap;">${esc(message)}</p>
        `)}
      `)
    ),
  };
}

export function adminComplaintEmail(
  name: string,
  email: string,
  referenceNumber: string,
  subject: string,
  description: string
): EmailTemplate {
  return {
    subject: `[Reclamo ${referenceNumber}] ${subject}`,
    templateName: "adminComplaint",
    category: "ADMIN_NOTIFICATION",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Nuovo reclamo ricevuto</h2>
        ${infoBox(`
          <p style="color: #1e293b; margin: 4px 0;"><strong>Rif:</strong> ${esc(referenceNumber)}</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Da:</strong> ${esc(name)} (${esc(email)})</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Oggetto:</strong> ${esc(subject)}</p>
          <p style="color: ${BRAND.textMuted}; margin: 8px 0 0; white-space: pre-wrap;">${esc(description)}</p>
        `)}
        ${cta("Pannello Admin — Reclami", `${APP_URL}/admin/complaints`)}
      `)
    ),
  };
}

export function adminNewLeadEmail(
  leadType: "venditore" | "agenzia" | "acquirente",
  name: string,
  email: string,
  details: string
): EmailTemplate {
  return {
    subject: `Nuovo lead ${leadType}: ${name}`,
    templateName: "adminNewLead",
    category: "ADMIN_NOTIFICATION",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.textPrimary};">Nuovo lead ${esc(leadType)}</h2>
        ${infoBox(`
          <p style="color: #1e293b; margin: 4px 0;"><strong>Nome:</strong> ${esc(name)}</p>
          <p style="color: #1e293b; margin: 4px 0;"><strong>Email:</strong> ${esc(email)}</p>
          <p style="color: ${BRAND.textMuted}; margin: 8px 0 0;">${esc(details)}</p>
        `)}
        ${cta("Pannello Admin", `${APP_URL}/admin`)}
      `)
    ),
  };
}

export function adminNoZoneFoundEmail(
  propertyTitle: string,
  propertyAddress: string
): EmailTemplate {
  return {
    subject: `Alert: nessuna zona trovata per "${propertyTitle}"`,
    templateName: "adminNoZoneFound",
    category: "ADMIN_NOTIFICATION",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.warning};">Nessuna zona trovata</h2>
        ${p(`L'immobile <strong>"${esc(propertyTitle)}"</strong> in <strong>${esc(propertyAddress)}</strong> non rientra in nessuna zona attiva. Verifica la configurazione delle zone.`)}
        ${cta("Gestisci Zone", `${APP_URL}/admin/zones`)}
      `)
    ),
  };
}

export function adminNoAgencyAvailableEmail(
  propertyTitle: string,
  zoneName: string
): EmailTemplate {
  return {
    subject: `Alert: nessuna agenzia disponibile per "${propertyTitle}"`,
    templateName: "adminNoAgencyAvailable",
    category: "ADMIN_NOTIFICATION",
    html: wrap(
      header() +
        body(`
        <h2 style="color: ${BRAND.warning};">Nessuna agenzia disponibile</h2>
        ${p(`L'immobile <strong>"${esc(propertyTitle)}"</strong> nella zona <strong>"${esc(zoneName)}"</strong> non ha agenzie attive per il fallback 48h.`)}
        ${cta("Pannello Admin", `${APP_URL}/admin`)}
      `)
    ),
  };
}
