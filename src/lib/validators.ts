/**
 * Validatori per dati fiscali italiani.
 * Usati sia client-side (registrazione) che server-side (API).
 */

/**
 * Valida una Partita IVA italiana (11 cifre + checksum).
 * Algoritmo: variante Luhn per P.IVA italiana.
 */
export function validatePartitaIva(piva: string): boolean {
  const cleaned = piva.trim().replace(/\s/g, "");
  if (!/^\d{11}$/.test(cleaned)) return false;

  let s = 0;
  for (let i = 0; i < 11; i++) {
    let n = parseInt(cleaned[i], 10);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    s += n;
  }
  return s % 10 === 0;
}

/**
 * Valida un indirizzo PEC (formato email base).
 */
export function validatePec(pec: string): boolean {
  const cleaned = pec.trim().toLowerCase();
  if (cleaned.length < 5 || cleaned.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
}
