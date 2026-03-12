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
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">La prima piattaforma pensata per chi vende</p>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0a1f44;">Ciao ${esc(name)}!</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Grazie per aver inserito il tuo immobile su Privatio. Il nostro team sta
            verificando il tuo annuncio e ti assegneremo un'agenzia partner nella tua zona.
          </p>
          <p style="color: #64748b; line-height: 1.6;">
            Ricorda: con Privatio <strong>non paghi nessuna commissione</strong>.
            Incassi il 100% del prezzo di vendita.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/venditore"
               style="background: #0e8ff1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Vai alla tua Dashboard
            </a>
          </div>
        </div>
        <div style="padding: 20px 30px; background: #f8fafc; text-align: center;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">
            Privatio — Vendi casa. Zero commissioni.<br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #0e8ff1;">privatio.it</a>
          </p>
        </div>
      </div>
    `,
  };
}

export function agencyAssignedEmail(sellerName: string, agencyName: string, agencyPhone: string) {
  return {
    subject: "La tua agenzia è stata assegnata — Privatio",
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0a1f44;">Ciao ${esc(sellerName)}!</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Ottime notizie! Abbiamo assegnato il tuo immobile a un'agenzia partner nella tua zona.
          </p>
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #0a1f44; margin-top: 0;">La tua agenzia</h3>
            <p style="color: #1e293b; margin: 4px 0;"><strong>${esc(agencyName)}</strong></p>
            <p style="color: #64748b; margin: 4px 0;">Tel: ${esc(agencyPhone)}</p>
          </div>
          <p style="color: #64748b; line-height: 1.6;">
            L'agenzia ti contatterà a breve per organizzare il sopralluogo e la
            pubblicazione del tuo annuncio.
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
    subject: "Nuovo immobile assegnato — Privatio",
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0a1f44;">Ciao ${esc(agencyName)}!</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Un nuovo immobile è stato assegnato alla tua agenzia.
          </p>
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #0a1f44; margin-top: 0;">${esc(propertyTitle)}</h3>
            <p style="color: #64748b; margin: 4px 0;">${esc(propertyAddress)}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenzia"
               style="background: #0e8ff1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Gestisci Immobile
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
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0a1f44;">Ciao ${esc(name)}!</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Una visita è stata programmata per il tuo immobile.
          </p>
          <div style="background: #f0f9ff; border-left: 4px solid #0e8ff1; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #1e293b;"><strong>${esc(propertyTitle)}</strong></p>
            <p style="margin: 4px 0 0; color: #0e8ff1; font-size: 18px; font-weight: bold;">${esc(date)}</p>
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
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">La prima piattaforma pensata per chi vende</p>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0a1f44;">Ciao ${esc(name)}!</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Grazie per esserti registrato su Privatio. Per completare la registrazione,
            verifica il tuo indirizzo email cliccando il pulsante qui sotto.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}"
               style="background: #0e8ff1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verifica Email
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">Questo link scade tra 24 ore.</p>
          <p style="color: #64748b; font-size: 14px;">Se non hai creato un account su Privatio, ignora questa email.</p>
        </div>
        <div style="padding: 20px 30px; background: #f8fafc; text-align: center;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">
            Privatio — Vendi casa. Zero commissioni.<br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #0e8ff1;">privatio.it</a>
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
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Privatio</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0a1f44;">Ciao ${esc(name)}!</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Abbiamo ricevuto la tua richiesta. Un nostro agente ti contatterà al più presto.
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
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0e8ff1, #0a1f44); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing: -0.5px;">Privatio</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 16px;">Vendi casa. Zero commissioni.</p>
        </div>

        <!-- Welcome -->
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0a1f44; margin-top: 0;">Ciao ${esc(name)}, benvenuto su Privatio! 🎉</h2>
          <p style="color: #475569; line-height: 1.7; font-size: 15px;">
            Siamo felici di averti a bordo! Privatio è la <strong>prima piattaforma immobiliare in Italia
            pensata per chi vende</strong>. Il nostro obiettivo è semplice: aiutarti a vendere il tuo
            immobile senza pagare commissioni.
          </p>

          <!-- How it works -->
          <div style="background: #f0f9ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #0a1f44; margin-top: 0; font-size: 18px;">📋 Come funziona Privatio</h3>

            <div style="margin-bottom: 16px;">
              <p style="color: #0e8ff1; font-weight: bold; margin: 0 0 4px; font-size: 14px;">STEP 1 — Inserisci il tuo immobile</p>
              <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">
                Dalla tua dashboard, clicca su "Inserisci immobile" e compila i dati: indirizzo,
                metratura, prezzo, descrizione e foto. Più dettagli inserisci, meglio è!
              </p>
            </div>

            <div style="margin-bottom: 16px;">
              <p style="color: #0e8ff1; font-weight: bold; margin: 0 0 4px; font-size: 14px;">STEP 2 — Ti assegniamo un'agenzia partner</p>
              <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">
                Il nostro team verifica il tuo annuncio e ti assegna un'agenzia immobiliare
                partner nella tua zona. Riceverai un'email con i contatti dell'agenzia.
              </p>
            </div>

            <div style="margin-bottom: 16px;">
              <p style="color: #0e8ff1; font-weight: bold; margin: 0 0 4px; font-size: 14px;">STEP 3 — L'agenzia gestisce tutto</p>
              <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">
                L'agenzia si occupa di sopralluogo, foto professionali, pubblicazione dell'annuncio
                sui principali portali e gestione delle visite con i potenziali acquirenti.
              </p>
            </div>

            <div>
              <p style="color: #0e8ff1; font-weight: bold; margin: 0 0 4px; font-size: 14px;">STEP 4 — Vendi e incassi il 100%</p>
              <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">
                Quando trovi l'acquirente giusto, concludi la vendita e <strong>incassi l'intero
                prezzo di vendita</strong>. Nessuna commissione, nessun costo nascosto.
              </p>
            </div>
          </div>

          <!-- Key benefits -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #0a1f44; margin-top: 0; font-size: 18px;">✨ Perché scegliere Privatio</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 12px 8px 0; vertical-align: top; color: #0e8ff1; font-size: 20px; width: 30px;">💰</td>
                <td style="padding: 8px 0;">
                  <p style="margin: 0; color: #1e293b; font-weight: bold; font-size: 14px;">Zero commissioni</p>
                  <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">Non paghi nulla. Il servizio è completamente gratuito per il venditore.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 12px 8px 0; vertical-align: top; color: #0e8ff1; font-size: 20px; width: 30px;">🏠</td>
                <td style="padding: 8px 0;">
                  <p style="margin: 0; color: #1e293b; font-weight: bold; font-size: 14px;">Agenzie verificate</p>
                  <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">Collaboriamo solo con agenzie professionali selezionate nella tua zona.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 12px 8px 0; vertical-align: top; color: #0e8ff1; font-size: 20px; width: 30px;">📊</td>
                <td style="padding: 8px 0;">
                  <p style="margin: 0; color: #1e293b; font-weight: bold; font-size: 14px;">Dashboard dedicata</p>
                  <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">Monitora lo stato del tuo immobile, le visite programmate e i contatti ricevuti.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 12px 8px 0; vertical-align: top; color: #0e8ff1; font-size: 20px; width: 30px;">🔒</td>
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
               style="background: #0e8ff1; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Vai alla tua Dashboard
            </a>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 13px; margin-top: 8px;">
            Oppure visita <a href="${appUrl}" style="color: #0e8ff1;">privatio.it</a> per esplorare la piattaforma.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 24px 30px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 4px;">Hai domande? Rispondi a questa email, siamo qui per aiutarti.</p>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">
            Privatio — Vendi casa. Zero commissioni.<br/>
            <a href="${appUrl}" style="color: #0e8ff1;">privatio.it</a>
          </p>
        </div>
      </div>
    `,
  };
}
