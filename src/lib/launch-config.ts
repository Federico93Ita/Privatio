/**
 * Configurazione centrale per offerte e countdown pre-lancio.
 * Fonte di verità unica: cambiala qui e si aggiorna ovunque.
 */
export const LAUNCH_CONFIG = {
  /** Scadenza offerta "3 mesi gratis" per agenzie fondatrici */
  founderOfferDeadline: "2026-05-31",

  /** Testo offerta agenzie */
  founderOfferLabel: "3 mesi gratis + prezzo bloccato 12 mesi",

  /** Sconto Prezzo Fondatore (%) sul primo anno */
  founderDiscountPct: 10,

  /** Mesi di trial gratuito */
  freeMonths: 3,

  /** Commissione media agenzie tradizionali (usata in confronti) */
  avgTraditionalFeePct: 3,
} as const;
