import { COMPANY } from "@/lib/company";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://privatio.it";

/** Escape HTML special characters to prevent XSS in email templates */
export function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Formatta un importo in centesimi come valuta EUR */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/** Formatta una data in formato italiano */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Footer legale per tutte le email.
 * Include ragione sociale, sede, P.IVA, link privacy.
 * Opzionalmente link unsubscribe per email marketing.
 */
export function legalFooter(options?: {
  showUnsubscribe?: boolean;
  unsubscribeUrl?: string;
}): string {
  const year = new Date().getFullYear();
  const pivaLine =
    COMPANY.piva !== "da definire" ? ` — P.IVA ${COMPANY.piva}` : "";

  return `
    <div style="padding: 20px 30px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.8;">
        &copy; ${year} ${esc(COMPANY.name)}${pivaLine}<br/>
        Sede: ${esc(COMPANY.address)}<br/>
        <a href="${APP_URL}/privacy-policy" style="color: #64748b; text-decoration: underline;">Privacy Policy</a>
        &nbsp;|&nbsp;
        <a href="${APP_URL}/termini-di-servizio" style="color: #64748b; text-decoration: underline;">Termini di Servizio</a>
        ${
          options?.showUnsubscribe
            ? `&nbsp;|&nbsp;<a href="${options.unsubscribeUrl || APP_URL + "/impostazioni/notifiche"}" style="color: #64748b; text-decoration: underline;">Disiscriviti</a>`
            : ""
        }
      </p>
    </div>
  `;
}
