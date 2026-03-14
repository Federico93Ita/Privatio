import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Escape HTML special characters to prevent XSS in email templates */
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Privatio <noreply@privatio.it>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send exception:", error);
    return { success: false, error };
  }
}

// Email templates
export function sellerWelcomeEmail(name: string) {
  return {
    subject: "Benvenuto su Privatio!",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">La prima piattaforma pensata per chi vende</p>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0f172a;">Ciao ${esc(name)}!</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Grazie per aver inserito il tuo immobile su Privatio. Il nostro team sta
            verificando il tuo annuncio. Nella tua dashboard potrai consultare la lista delle agenzie partner nella tua zona e contattare direttamente quella che preferisci.
          </p>
          <p style="color: #64748b; line-height: 1.6;">
            Ricorda: con Privatio <strong>non paghi nessuna commissione</strong>.
            Incassi il 100% del prezzo di vendita.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/venditore"
               style="background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Vai alla tua Dashboard
            </a>
          </div>
        </div>
        <div style="padding: 20px 30px; background: #f8fafc; text-align: center;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">
            Privatio — Vendi casa. Zero commissioni.<br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #2563eb;">privatio.it</a>
          </p>
        </div>
      </div>
    `,
  };
}

export function agencyAssignedEmail(sellerName: string, agencyName: string, agencyPhone: string) {
  return {
    subject: "I tuoi dati sono stati condivisi con un'agenzia — Privatio",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0f172a;">Ciao ${esc(sellerName)}!</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Sono trascorse 48 ore senza che tu abbia contattato un'agenzia. Come previsto, i tuoi dati sono stati condivisi con le agenzie partner nella tua zona, che potranno contattarti direttamente.
          </p>
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #0f172a; margin-top: 0;">Agenzia partner</h3>
            <p style="color: #1e293b; margin: 4px 0;"><strong>${esc(agencyName)}</strong></p>
            <p style="color: #64748b; margin: 4px 0;">Tel: ${esc(agencyPhone)}</p>
          </div>
          <p style="color: #64748b; line-height: 1.6;">
            Puoi comunque scegliere e contattare un'agenzia direttamente dalla tua dashboard in qualsiasi momento.
          </p>
        </div>
        <div style="padding: 20px 30px; background: #f8fafc; text-align: center;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Privatio — privatio.it</p>
        </div>
      </div>
    `,
  };
}

export function agencyNewAssignmentEmail(agencyName: string, propertyTitle: string, propertyAddress: string) {
  return {
    subject: "Nuovo venditore disponibile nella tua zona — Privatio",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0f172a;">Ciao ${esc(agencyName)}!</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Un venditore nella tua zona non ha contattato nessuna agenzia entro 48 ore. I suoi dati sono ora disponibili nella tua dashboard. Puoi contattarlo direttamente.
          </p>
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #0f172a; margin-top: 0;">${esc(propertyTitle)}</h3>
            <p style="color: #64748b; margin: 4px 0;">${esc(propertyAddress)}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia"
               style="background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Vedi Segnalazione
            </a>
          </div>
        </div>
      </div>
    `,
  };
}

export function visitScheduledEmail(name: string, propertyTitle: string, date: string) {
  return {
    subject: `Visita programmata per ${esc(date)} — Privatio`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0f172a;">Ciao ${esc(name)}!</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Una visita è stata programmata per il tuo immobile.
          </p>
          <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #1e293b;"><strong>${esc(propertyTitle)}</strong></p>
            <p style="margin: 4px 0 0; color: #2563eb; font-size: 18px; font-weight: bold;">${esc(date)}</p>
          </div>
        </div>
      </div>
    `,
  };
}

export function emailVerificationEmail(name: string, verifyUrl: string) {
  return {
    subject: "Verifica la tua email — Privatio",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">La prima piattaforma pensata per chi vende</p>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0f172a;">Ciao ${esc(name)}!</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Grazie per esserti registrato su Privatio. Per completare la registrazione,
            verifica il tuo indirizzo email cliccando il pulsante qui sotto.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}"
               style="background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verifica Email
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">Questo link scade tra 24 ore.</p>
          <p style="color: #64748b; font-size: 14px;">Se non hai creato un account su Privatio, ignora questa email.</p>
        </div>
        <div style="padding: 20px 30px; background: #f8fafc; text-align: center;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">
            Privatio — Vendi casa. Zero commissioni.<br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #2563eb;">privatio.it</a>
          </p>
        </div>
      </div>
    `,
  };
}

export function leadReceivedEmail(name: string) {
  return {
    subject: "Richiesta ricevuta — Privatio",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0f172a;">Ciao ${esc(name)}!</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Abbiamo ricevuto la tua richiesta. Ti risponderemo al più presto.
          </p>
        </div>
      </div>
    `,
  };
}

export function welcomeEmail(name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://privatio.vercel.app";
  return {
    subject: "Benvenuto su Privatio — Ecco come funziona!",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing: -0.5px;">Privatio</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 16px;">Vendi casa. Zero commissioni.</p>
        </div>

        <!-- Welcome -->
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0f172a; margin-top: 0;">Ciao ${esc(name)}, benvenuto su Privatio! 🎉</h2>
          <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            Siamo felici di averti a bordo! Privatio è la <strong>prima piattaforma immobiliare in Italia
            pensata per chi vende</strong>. Il nostro obiettivo è semplice: aiutarti a vendere il tuo
            immobile senza pagare commissioni.
          </p>

          <!-- How it works -->
          <div style="background: #f0f9ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">📋 Come funziona Privatio</h3>

            <div style="margin-bottom: 16px;">
              <p style="color: #2563eb; font-weight: bold; margin: 0 0 4px; font-size: 14px;">STEP 1 — Inserisci il tuo immobile</p>
              <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">
                Dalla tua dashboard, clicca su "Inserisci immobile" e compila i dati: indirizzo,
                metratura, prezzo, descrizione e foto. Più dettagli inserisci, meglio è!
              </p>
            </div>

            <div style="margin-bottom: 16px;">
              <p style="color: #2563eb; font-weight: bold; margin: 0 0 4px; font-size: 14px;">STEP 2 — Scegli la tua agenzia</p>
              <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">
                Nella tua dashboard trovi la lista delle agenzie partner verificate nella tua zona.
                Scegli quella che preferisci e contattala direttamente. Se non contatti nessuno entro 48 ore, le agenzie potranno contattarti.
              </p>
            </div>

            <div style="margin-bottom: 16px;">
              <p style="color: #2563eb; font-weight: bold; margin: 0 0 4px; font-size: 14px;">STEP 3 — L'agenzia gestisce tutto</p>
              <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">
                L'agenzia si occupa di sopralluogo, foto professionali, pubblicazione dell'annuncio
                sui principali portali e gestione delle visite con i potenziali acquirenti.
              </p>
            </div>

            <div>
              <p style="color: #2563eb; font-weight: bold; margin: 0 0 4px; font-size: 14px;">STEP 4 — Vendi e incassi il 100%</p>
              <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">
                Quando trovi l'acquirente giusto, concludi la vendita e <strong>incassi l'intero
                prezzo di vendita</strong>. Nessuna commissione, nessun costo nascosto.
              </p>
            </div>
          </div>

          <!-- Key benefits -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">✨ Perché scegliere Privatio</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 12px 8px 0; vertical-align: top; color: #2563eb; font-size: 20px; width: 30px;">💰</td>
                <td style="padding: 8px 0;">
                  <p style="margin: 0; color: #1e293b; font-weight: bold; font-size: 14px;">Zero commissioni</p>
                  <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">Non paghi nulla. Il servizio è completamente gratuito per il venditore.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 12px 8px 0; vertical-align: top; color: #2563eb; font-size: 20px; width: 30px;">🏠</td>
                <td style="padding: 8px 0;">
                  <p style="margin: 0; color: #1e293b; font-weight: bold; font-size: 14px;">Agenzie verificate</p>
                  <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">Collaboriamo solo con agenzie professionali selezionate nella tua zona.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 12px 8px 0; vertical-align: top; color: #2563eb; font-size: 20px; width: 30px;">📊</td>
                <td style="padding: 8px 0;">
                  <p style="margin: 0; color: #1e293b; font-weight: bold; font-size: 14px;">Dashboard dedicata</p>
                  <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">Monitora lo stato del tuo immobile, le visite programmate e i contatti ricevuti.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 12px 8px 0; vertical-align: top; color: #2563eb; font-size: 20px; width: 30px;">🔒</td>
                <td style="padding: 8px 0;">
                  <p style="margin: 0; color: #1e293b; font-weight: bold; font-size: 14px;">Trasparenza totale</p>
                  <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">Sei sempre aggiornato su ogni fase della vendita del tuo immobile.</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 32px 0 16px;">
            <a href="${appUrl}/dashboard/venditore"
               style="background: #2563eb; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Vai alla tua Dashboard
            </a>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 13px; margin-top: 8px;">
            Oppure visita <a href="${appUrl}" style="color: #2563eb;">privatio.it</a> per esplorare la piattaforma.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 24px 30px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 4px;">Hai domande? Rispondi a questa email, siamo qui per aiutarti.</p>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">
            Privatio — Vendi casa. Zero commissioni.<br/>
            <a href="${appUrl}" style="color: #2563eb;">privatio.it</a>
          </p>
        </div>
      </div>
    `,
  };
}

export function agencyApprovedEmail(contactName: string, agencyName: string, registrationUrl: string) {
  return {
    subject: "La tua agenzia è stata approvata — Privatio Partner",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing: -0.5px;">Privatio Partner</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 16px;">Network Agenzie Immobiliari</p>
        </div>

        <div style="padding: 30px; background: white;">
          <h2 style="color: #0f172a; margin-top: 0;">Complimenti ${esc(contactName)}!</h2>
          <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            Siamo lieti di comunicarti che <strong>${esc(agencyName)}</strong> è stata
            <strong style="color: #10b981;">approvata</strong> per entrare nel network Privatio Partner.
            Abbiamo valutato attentamente la tua candidatura e siamo convinti che la collaborazione
            sarà vantaggiosa per entrambi.
          </p>

          <div style="background: #f0f9ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Come funziona per le agenzie partner</h3>

            <div style="margin-bottom: 16px;">
              <p style="color: #2563eb; font-weight: bold; margin: 0 0 4px; font-size: 14px;">1. Completa la registrazione</p>
              <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">
                Clicca il link in fondo a questa email per creare il tuo account agenzia
                e scegliere il piano più adatto alle tue esigenze.
              </p>
            </div>

            <div style="margin-bottom: 16px;">
              <p style="color: #2563eb; font-weight: bold; margin: 0 0 4px; font-size: 14px;">2. I venditori ti trovano</p>
              <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">
                I venditori nella tua zona possono trovarti e contattarti direttamente dalla piattaforma.
                Inoltre, i venditori che non contattano un'agenzia entro 48h vengono segnalati automaticamente nella tua dashboard.
              </p>
            </div>

            <div style="margin-bottom: 16px;">
              <p style="color: #2563eb; font-weight: bold; margin: 0 0 4px; font-size: 14px;">3. Gestisci tutto dalla dashboard</p>
              <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">
                Sopralluoghi, foto, pubblicazione annunci, visite e trattative:
                tutto gestibile dalla tua dashboard dedicata.
              </p>
            </div>

            <div>
              <p style="color: #2563eb; font-weight: bold; margin: 0 0 4px; font-size: 14px;">4. Cresci senza costi di acquisizione</p>
              <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">
                Nessun costo per lead o acquisizione clienti. Paghi solo l'abbonamento
                mensile e i venditori nella tua zona ti trovano direttamente.
              </p>
            </div>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Piani disponibili</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; vertical-align: top; width: 48%;">
                  <p style="margin: 0; color: #0f172a; font-weight: bold; font-size: 16px;">Base</p>
                  <p style="margin: 4px 0 8px; color: #2563eb; font-size: 24px; font-weight: bold;">da €200<span style="font-size: 14px; color: #64748b; font-weight: normal;">/mese</span></p>
                  <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">1 area operativa<br/>Dashboard base<br/>Notifica nuovi immobili 24h</p>
                </td>
                <td style="width: 4%;"></td>
                <td style="padding: 12px; border: 2px solid #2563eb; border-radius: 8px; vertical-align: top; width: 48%; background: #f0f9ff;">
                  <p style="margin: 0; color: #0f172a; font-weight: bold; font-size: 16px;">Premier City <span style="background: #2563eb; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; vertical-align: middle;">CONSIGLIATO</span></p>
                  <p style="margin: 4px 0 8px; color: #2563eb; font-size: 24px; font-weight: bold;">da €690<span style="font-size: 14px; color: #64748b; font-weight: normal;">/mese</span></p>
                  <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">3 aree operative<br/>Statistiche avanzate<br/>Alta visibilità venditore</p>
                </td>
              </tr>
            </table>
            <p style="margin: 12px 0 0; color: #94a3b8; font-size: 12px; text-align: center;">5 piani disponibili da Base a Premier Elite. Scopri tutti i dettagli dopo la registrazione.</p>
          </div>

          <div style="text-align: center; margin: 32px 0 16px;">
            <a href="${registrationUrl}"
               style="background: #2563eb; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Completa la Registrazione
            </a>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 13px; margin-top: 8px;">
            Questo link è riservato esclusivamente a ${esc(agencyName)}.
          </p>
        </div>

        <div style="padding: 24px 30px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 4px;">Hai domande? Rispondi a questa email, siamo qui per aiutarti.</p>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Privatio Partner — Network Agenzie Immobiliari</p>
        </div>
      </div>
    `,
  };
}

export function agencyRejectedEmail(contactName: string, agencyName: string) {
  return {
    subject: "Aggiornamento sulla tua candidatura — Privatio",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Privatio Partner</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0f172a; margin-top: 0;">Ciao ${esc(contactName)},</h2>
          <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            Ti ringraziamo per l'interesse dimostrato nel voler far parte del network Privatio Partner
            con <strong>${esc(agencyName)}</strong>.
          </p>
          <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            Dopo un'attenta valutazione, al momento non siamo in grado di procedere con l'attivazione
            della partnership. Il nostro processo di selezione è molto rigoroso per garantire il massimo
            livello di qualità ai nostri clienti venditori.
          </p>
          <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            Questo non preclude future collaborazioni. Ti invitiamo a ripresentare la candidatura
            in futuro, saremo felici di rivalutarla.
          </p>
          <p style="color: #475569; margin-top: 24px; font-size: 15px;">
            Cordiali saluti,<br/>
            <strong>Il team Privatio</strong>
          </p>
        </div>
        <div style="padding: 24px 30px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Privatio — Vendi casa. Zero commissioni.</p>
        </div>
      </div>
    `,
  };
}
