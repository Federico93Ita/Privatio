/**
 * Costanti e utility condivise per il calcolo delle distanze
 * e i raggi operativi delle zone territoriali.
 */

/**
 * Raggio operativo (km) entro cui un'agenzia può presidiare altre zone
 * rispetto alla propria zona home.
 *
 * Modello semplificato: **1 km per TUTTE le zone** (urbane, rurali, cluster).
 * Un'agenzia può acquistare zone adiacenti entro 1 km dal centroide della
 * sua zona home, indipendentemente dal tier.
 */
export const RADIUS_BY_CLASS: Record<string, number> = {
  PREMIUM: 1,
  URBANA: 1,
  BASE: 1,
};

/** Soglia popolazione oltre la quale una zona è considerata "urbana". */
export const URBAN_POP_THRESHOLD = 10_000;

/**
 * Raggio operativo (km) per una zona specifica.
 *
 * Nel modello attuale il raggio è sempre 1 km, ma la funzione accetta
 * l'oggetto zona completo per consentire override futuri (es. reintrodurre
 * distinzione rurale/urbano senza toccare i callsite).
 */
export function getZoneRadius(zone: {
  zoneClass: string;
  population?: number | null;
  city?: string | null;
}): number {
  return RADIUS_BY_CLASS[zone.zoneClass] ?? 1;
}

/** Distanza Haversine tra due punti in km */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
