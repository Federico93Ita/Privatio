/**
 * Dati aziendali centralizzati.
 *
 * ⚠️  PRIMA DEL LANCIO: Aggiornare tutti i campi con i dati reali
 *     della società una volta costituita.
 *
 * Questo file è l'unico punto dove modificare i dati aziendali.
 * Tutti i componenti (Footer, Contratto, Privacy Policy, ecc.)
 * leggono da qui.
 */

export const COMPANY = {
  /** Ragione sociale completa */
  name: "Privatio S.r.l.",

  /** Partita IVA — Aggiornare quando disponibile */
  piva: "da definire",

  /** Codice Fiscale — Aggiornare quando disponibile */
  codiceFiscale: "da definire",

  /** Numero REA — Aggiornare quando disponibile */
  rea: "da definire",

  /** Sede legale */
  address: "Torino",

  /** Città del foro competente */
  foro: "Torino",

  /** Email per comunicazioni legali */
  legalEmail: "info@privatio.it",

  /** Versione corrente dei termini */
  termsVersion: "1.0",

  /** Data ultimo aggiornamento termini */
  termsDate: "Marzo 2026",

  /**
   * Restituisce true se i dati aziendali sono completi (non placeholder).
   * Usare per mostrare avvisi in ambiente di sviluppo.
   */
  isComplete(): boolean {
    return this.piva !== "da definire" && this.rea !== "da definire";
  },

  /** Stringa per il footer: "© 2026 Privatio S.r.l. — P.IVA ..." */
  footerText(year: number): string {
    return `© ${year} ${this.name} — P.IVA ${this.piva}`;
  },

  /** Stringa per le premesse del contratto */
  contractPremise(): string {
    const base = `La Piattaforma è gestita da ${this.name}, con sede legale in ${this.address}`;
    if (!this.isComplete()) {
      return `${base}. I dati societari completi (C.F./P.IVA, numero REA) saranno indicati a seguito della costituzione della società.`;
    }
    return `${base}, C.F./P.IVA ${this.piva}, iscritta al Registro delle Imprese di ${this.address} al n. ${this.rea}.`;
  },
} as const;
