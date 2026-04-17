/**
 * Import zone OMI 1:1 — Scarica microzone direttamente dall'API GEOPOI
 * dell'Agenzia delle Entrate e le salva come zone Privatio.
 *
 * Regole:
 * - Comuni >= 50.000 abitanti: 1 zona = 1 microzona OMI (stile immobiliare.it)
 * - Comuni < 50.000 abitanti: max 3-4 zone per comune (raggruppamento per fascia)
 * - Comuni senza microzone OMI: skip (gestiti da import-zones-v3.ts)
 *
 * Ogni zona include il boundary GeoJSON scaricato da richiesta=6.
 *
 * Uso: npx tsx scripts/import-zones-omi.ts
 *      npx tsx scripts/import-zones-omi.ts --dry-run     (solo conteggio, no DB)
 *      npx tsx scripts/import-zones-omi.ts --prov=MI     (solo una provincia)
 *      npx tsx scripts/import-zones-omi.ts --from=BO     (resume da una provincia, incluso)
 *      npx tsx scripts/import-zones-omi.ts --to=CO       (ferma a questa provincia, inclusa)
 *      npx tsx scripts/import-zones-omi.ts --skip-cleanup (non disattiva orfane alla fine)
 */

import { PrismaClient } from "@prisma/client";
import type { ZoneClass } from "@prisma/client";
import {
  calculateMarketScore,
  calculateZonePrice,
} from "../src/lib/zone-pricing";

const prisma = new PrismaClient();

const GEOPOI_BASE = "https://www1.agenziaentrate.gov.it/servizi/geopoi_omi";
const DELAY_MS = 100; // rate limit tra richieste GEOPOI

const POP_THRESHOLD = 50_000; // Soglia per 1:1 vs raggruppamento
const MAX_ZONES_SMALL_CITY = 4; // Max zone per comuni <50k

/* ------------------------------------------------------------------ */
/*  Province e regioni italiane                                        */
/* ------------------------------------------------------------------ */

const PROVINCE_TO_REGION: Record<string, string> = {
  AG: "Sicilia", AL: "Piemonte", AN: "Marche", AO: "Valle d'Aosta",
  AP: "Marche", AQ: "Abruzzo", AR: "Toscana", AT: "Piemonte",
  AV: "Campania", BA: "Puglia", BG: "Lombardia", BI: "Piemonte",
  BL: "Veneto", BN: "Campania", BO: "Emilia-Romagna", BR: "Puglia",
  BS: "Lombardia", BT: "Puglia", BZ: "Trentino-Alto Adige",
  CA: "Sardegna", CB: "Molise", CE: "Campania", CH: "Abruzzo",
  CL: "Sicilia", CN: "Piemonte", CO: "Lombardia", CR: "Lombardia",
  CS: "Calabria", CT: "Sicilia", CZ: "Calabria", EN: "Sicilia",
  FC: "Emilia-Romagna", FE: "Emilia-Romagna", FG: "Puglia",
  FI: "Toscana", FM: "Marche", FR: "Lazio", GE: "Liguria",
  GO: "Friuli Venezia Giulia", GR: "Toscana", IM: "Liguria",
  IS: "Molise", KR: "Calabria", LC: "Lombardia", LE: "Puglia",
  LI: "Toscana", LO: "Lombardia", LT: "Lazio", LU: "Toscana",
  MB: "Lombardia", MC: "Marche", ME: "Sicilia", MI: "Lombardia",
  MN: "Lombardia", MO: "Emilia-Romagna", MS: "Toscana",
  MT: "Basilicata", NA: "Campania", NO: "Piemonte", NU: "Sardegna",
  OR: "Sardegna", PA: "Sicilia", PC: "Emilia-Romagna", PD: "Veneto",
  PE: "Abruzzo", PG: "Umbria", PI: "Toscana", PN: "Friuli Venezia Giulia",
  PO: "Toscana", PR: "Emilia-Romagna", PT: "Toscana", PU: "Marche",
  PV: "Lombardia", PZ: "Basilicata", RA: "Emilia-Romagna",
  RC: "Calabria", RE: "Emilia-Romagna", RG: "Sicilia", RI: "Lazio",
  RM: "Lazio", RN: "Emilia-Romagna", RO: "Veneto", SA: "Campania",
  SI: "Toscana", SO: "Lombardia", SP: "Liguria", SR: "Sicilia",
  SS: "Sardegna", SU: "Sardegna", SV: "Liguria", TA: "Puglia",
  TE: "Abruzzo", TN: "Trentino-Alto Adige", TO: "Piemonte",
  TP: "Sicilia", TR: "Umbria", TS: "Friuli Venezia Giulia",
  TV: "Veneto", UD: "Friuli Venezia Giulia", VA: "Lombardia",
  VB: "Piemonte", VC: "Piemonte", VE: "Veneto", VI: "Veneto",
  VR: "Veneto", VT: "Lazio", VV: "Calabria",
};

const ALL_PROVINCES = Object.keys(PROVINCE_TO_REGION);

/* ------------------------------------------------------------------ */
/*  Utilità                                                            */
/* ------------------------------------------------------------------ */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fasciaToZoneClass(fascia: string): ZoneClass {
  switch (fascia.charAt(0).toUpperCase()) {
    case "C": return "PREMIUM";
    case "B": return "PREMIUM";
    case "D": return "URBANA";
    case "E": return "URBANA";
    case "R": return "BASE";
    default: return "BASE";
  }
}

/** Calcola centroide da coordinate GeoJSON */
function geometryCentroid(geometry: GeoJSONGeometry): { lat: number; lng: number } {
  let sumLng = 0, sumLat = 0, count = 0;
  const processRing = (ring: number[][]) => {
    for (const [lng, lat] of ring) { sumLng += lng; sumLat += lat; count++; }
  };
  if (geometry.type === "Polygon") {
    processRing((geometry.coordinates as number[][][])[0]);
  } else if (geometry.type === "MultiPolygon") {
    for (const poly of geometry.coordinates as number[][][][]) processRing(poly[0]);
  }
  return count > 0 ? { lat: sumLat / count, lng: sumLng / count } : { lat: 0, lng: 0 };
}

/* ------------------------------------------------------------------ */
/*  Tipi                                                               */
/* ------------------------------------------------------------------ */

interface GeoJSONGeometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}

interface OmiZoneInfo {
  zona: string;      // "B1", "C1", "D2", ecc.
  fascia: string;    // "B", "C", "D", "E", "R"
  dizione: string;   // nome microzona
  linkZona: string;  // ID univoco
}

interface ComuneInfo {
  codcom: string;
  comune: string;
}

interface ComuneIstat {
  name: string;
  province: string;
  population: number;
}

/* ------------------------------------------------------------------ */
/*  API GEOPOI                                                         */
/* ------------------------------------------------------------------ */

/** Scarica lista comuni per provincia */
async function fetchComuni(prov: string): Promise<ComuneInfo[]> {
  try {
    const url = `${GEOPOI_BASE}/zoneomi.php?richiesta=2&prov=${prov}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const raw = await res.json();
    const data = (Array.isArray(raw) ? raw : raw?.dat ?? []) as Array<{
      CODCOM: string; DIZIONE?: string; COMUNE?: string;
    }>;
    if (!Array.isArray(data)) return [];
    return data.map(d => ({
      codcom: d.CODCOM,
      comune: d.DIZIONE || d.COMUNE || "",
    }));
  } catch {
    return [];
  }
}

/** Scarica nomi microzone OMI per un comune */
async function fetchZoneNames(codcom: string): Promise<OmiZoneInfo[]> {
  try {
    const url = `${GEOPOI_BASE}/zoneomi.php?richiesta=3&codcom=${codcom}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const raw = await res.json();
    const data = (Array.isArray(raw) ? raw : raw?.dat ?? []) as Array<{
      LINK_ZONA: string; FASCIA: string; ZONA: string; DIZIONE: string;
    }>;
    if (!Array.isArray(data) || data.length === 0) return [];
    return data.map(d => ({
      zona: d.ZONA,
      fascia: d.FASCIA,
      dizione: d.DIZIONE || d.ZONA,
      linkZona: d.LINK_ZONA,
    }));
  } catch {
    return [];
  }
}

/**
 * Scarica TUTTI i boundary GeoJSON per un comune in una sola chiamata.
 * L'API GEOPOI ignora il parametro &zona e restituisce sempre tutte le zone.
 * Ogni feature ha properties.zona che indica a quale zona appartiene (es. "B1", "C1").
 * Ritorna una mappa zona_code → GeoJSONGeometry.
 */
async function fetchAllBoundaries(
  codcom: string,
  semestre: string,
): Promise<Map<string, GeoJSONGeometry>> {
  const result = new Map<string, GeoJSONGeometry>();
  try {
    const url = `${GEOPOI_BASE}/zoneomi.php?richiesta=6&codcom=${codcom}&semestre=${semestre}`;
    const res = await fetch(url);
    if (!res.ok) return result;
    const text = await res.text();
    if (!text || text.trim() === "" || text.trim() === "null") return result;

    const data = JSON.parse(text);
    const fc = data.dat || data;

    if (fc.type !== "FeatureCollection" || !Array.isArray(fc.features)) return result;

    // Raggruppa features per zona code (da properties.zona)
    const byZona = new Map<string, Array<{ geometry: { type: string; coordinates: unknown } }>>();
    for (const f of fc.features) {
      const zonaCode = f.properties?.zona as string;
      if (!zonaCode || !f.geometry) continue;
      const list = byZona.get(zonaCode) || [];
      list.push(f);
      byZona.set(zonaCode, list);
    }

    // Merge features per zona
    for (const [zonaCode, features] of byZona) {
      result.set(zonaCode, mergeFeatureGeometries(features));
    }
  } catch {
    // Ignora errori
  }
  return result;
}

/** Trova l'ultimo semestre disponibile */
async function getLatestSemestre(): Promise<string> {
  try {
    const url = `${GEOPOI_BASE}/zoneomi.php?richiesta=5`;
    const res = await fetch(url);
    if (!res.ok) return "20252";
    const raw = await res.json();
    const data = (Array.isArray(raw) ? raw : raw?.dat ?? []) as Array<{ SEMESTRE: string }>;
    if (Array.isArray(data) && data.length > 0) {
      const sorted = data.map(d => d.SEMESTRE).sort();
      return sorted[sorted.length - 1];
    }
  } catch { /* fallback */ }
  return "20252";
}

/* ------------------------------------------------------------------ */
/*  Merge geometrie                                                    */
/* ------------------------------------------------------------------ */

function mergeFeatureGeometries(features: Array<{ geometry: { type: string; coordinates: unknown } }>): GeoJSONGeometry {
  const allRings: number[][][][] = [];
  for (const f of features) {
    const g = f.geometry;
    if (g.type === "Polygon") {
      allRings.push(g.coordinates as number[][][]);
    } else if (g.type === "MultiPolygon") {
      allRings.push(...(g.coordinates as number[][][][]));
    }
  }
  if (allRings.length === 0) {
    return { type: "Polygon", coordinates: [] as unknown as number[][][] };
  }
  if (allRings.length === 1) {
    return { type: "Polygon", coordinates: allRings[0] };
  }
  return { type: "MultiPolygon", coordinates: allRings };
}

function mergeGeoJSONGeometries(geometries: GeoJSONGeometry[]): GeoJSONGeometry {
  const allRings: number[][][][] = [];
  for (const g of geometries) {
    if (g.type === "Polygon") {
      allRings.push(g.coordinates as number[][][]);
    } else if (g.type === "MultiPolygon") {
      allRings.push(...(g.coordinates as number[][][][]));
    }
  }
  if (allRings.length === 0) {
    return { type: "Polygon", coordinates: [] as unknown as number[][][] };
  }
  if (allRings.length === 1) {
    return { type: "Polygon", coordinates: allRings[0] };
  }
  return { type: "MultiPolygon", coordinates: allRings };
}

/* ------------------------------------------------------------------ */
/*  Scarica dati ISTAT                                                 */
/* ------------------------------------------------------------------ */

async function fetchIstatData(): Promise<Map<string, ComuneIstat>> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const cachePath = path.join(process.cwd(), "scripts", "comuni-istat-cache.json");

  let json: Array<{ nome: string; sigla: string; popolazione: number }>;

  // 1. Prova cache locale
  try {
    const raw = await fs.readFile(cachePath, "utf-8");
    json = JSON.parse(raw);
    console.log(`Dati ISTAT letti da cache locale: scripts/comuni-istat-cache.json`);
  } catch {
    console.log("Cache ISTAT mancante, scaricamento da GitHub (con 3 tentativi)...");
    const url = "https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json";
    let lastErr: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        json = (await res.json()) as typeof json;
        await fs.writeFile(cachePath, JSON.stringify(json));
        console.log(`  ✓ Scaricato (tentativo ${attempt}) e salvato in cache`);
        break;
      } catch (err) {
        lastErr = err;
        console.log(`  ✗ Tentativo ${attempt}/3 fallito: ${(err as Error).message}`);
        if (attempt < 3) await sleep(2000 * attempt);
      }
    }
    if (!json!) throw new Error(`Impossibile scaricare dati ISTAT dopo 3 tentativi: ${String(lastErr)}`);
  }

  const map = new Map<string, ComuneIstat>();
  for (const c of json) {
    const prov = c.sigla?.toUpperCase();
    if (c.nome && prov && prov.length === 2) {
      // Chiave: "NOME|PROV" normalizzato per match con GEOPOI
      const key = `${c.nome.toUpperCase()}|${prov}`;
      map.set(key, { name: c.nome, province: prov, population: c.popolazione || 0 });
    }
  }
  console.log(`  ✓ ${map.size} comuni caricati\n`);
  return map;
}

/* ------------------------------------------------------------------ */
/*  Raggruppamento microzone per comuni piccoli                        */
/* ------------------------------------------------------------------ */

interface ZoneGroup {
  name: string;
  slug: string;
  fascia: string;
  zoneClass: ZoneClass;
  zonas: string[]; // codici zona da scaricare (es. ["B1", "B2"])
  dizioni: string[]; // nomi delle microzone
}

/**
 * Raggruppa le microzone OMI in max MAX_ZONES_SMALL_CITY zone.
 * Strategia:
 * 1. Se <=4 microzone → 1 zona per microzona
 * 2. Se >4 → raggruppa per fascia (tutte le B insieme, tutte le D, ecc.)
 * 3. Se ancora >4 → merge fasce simili (C+B→PREMIUM, D+E→URBANA)
 */
function groupMicrozones(
  zonaNames: OmiZoneInfo[],
  cityName: string,
  province: string,
): ZoneGroup[] {
  // Se poche microzone, tienile separate
  if (zonaNames.length <= MAX_ZONES_SMALL_CITY) {
    return zonaNames.map(z => ({
      name: `${cityName} — ${formatDizione(z.dizione)}`,
      slug: slugify(`${cityName}-${province}-${z.zona}`),
      fascia: z.fascia,
      zoneClass: fasciaToZoneClass(z.fascia),
      zonas: [z.zona],
      dizioni: [z.dizione],
    }));
  }

  // Raggruppa per fascia
  const byFascia = new Map<string, OmiZoneInfo[]>();
  for (const z of zonaNames) {
    const f = z.fascia.charAt(0).toUpperCase();
    const list = byFascia.get(f) || [];
    list.push(z);
    byFascia.set(f, list);
  }

  // Se raggruppando per fascia siamo <=4, usa quello
  if (byFascia.size <= MAX_ZONES_SMALL_CITY) {
    const groups: ZoneGroup[] = [];
    for (const [fascia, zones] of byFascia) {
      const mainName = zones.length === 1
        ? formatDizione(zones[0].dizione)
        : `Zona ${fasciaLabel(fascia)}`;
      groups.push({
        name: `${cityName} — ${mainName}`,
        slug: slugify(`${cityName}-${province}-${fascia.toLowerCase()}`),
        fascia,
        zoneClass: fasciaToZoneClass(fascia),
        zonas: zones.map(z => z.zona),
        dizioni: zones.map(z => z.dizione),
      });
    }
    return groups;
  }

  // Merge fasce simili: C+B→PREMIUM, D+E→URBANA, R→BASE
  const merged = new Map<string, OmiZoneInfo[]>();
  for (const [fascia, zones] of byFascia) {
    let group: string;
    if (fascia === "C" || fascia === "B") group = "premium";
    else if (fascia === "D" || fascia === "E") group = "urbana";
    else group = "base";
    const list = merged.get(group) || [];
    list.push(...zones);
    merged.set(group, list);
  }

  const groups: ZoneGroup[] = [];
  for (const [group, zones] of merged) {
    const zc = group === "premium" ? "PREMIUM" : group === "urbana" ? "URBANA" : "BASE";
    const fascia = zones[0].fascia; // Prima fascia del gruppo
    groups.push({
      name: `${cityName} — Zona ${group.charAt(0).toUpperCase() + group.slice(1)}`,
      slug: slugify(`${cityName}-${province}-${group}`),
      fascia,
      zoneClass: zc as ZoneClass,
      zonas: zones.map(z => z.zona),
      dizioni: zones.map(z => z.dizione),
    });
  }
  return groups;
}

function fasciaLabel(fascia: string): string {
  switch (fascia) {
    case "C": return "Centrale";
    case "B": return "Semicentrale";
    case "D": return "Periferica";
    case "E": return "Suburbana";
    case "R": return "Rurale";
    default: return fascia;
  }
}

function formatDizione(dizione: string): string {
  // Converte "PIAZZE: ALFIERI-S.SECONDO" → "Piazze: Alfieri-S.Secondo"
  return dizione
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/^(.{60}).+$/, "$1..."); // Tronca nomi lunghissimi
}

/* ------------------------------------------------------------------ */
/*  Zone upsert                                                        */
/* ------------------------------------------------------------------ */

const importedSlugs = new Set<string>();

async function upsertZone(input: {
  name: string;
  slug: string;
  zoneClass: ZoneClass;
  region: string;
  province: string;
  city: string;
  fascia: string;
  population: number;
  ntn: number;
  lat: number | null;
  lng: number | null;
  monthlyPrice: number;
  maxAgencies: number;
  marketScore: number;
  boundary: GeoJSONGeometry | null;
  municipalities: string[];
}) {
  importedSlugs.add(input.slug);
  try {
    await prisma.zone.upsert({
      where: { slug: input.slug },
      update: {
        name: input.name,
        zoneClass: input.zoneClass,
        region: input.region,
        province: input.province,
        city: input.city,
        fascia: input.fascia,
        population: input.population,
        ntn: input.ntn,
        marketScore: input.marketScore,
        lat: input.lat,
        lng: input.lng,
        monthlyPrice: input.monthlyPrice,
        maxAgencies: input.maxAgencies,
        municipalities: input.municipalities,
        capCodes: [],
        isActive: true,
        ...(input.boundary ? { boundary: input.boundary as object } : {}),
      },
      create: {
        name: input.name,
        slug: input.slug,
        zoneClass: input.zoneClass,
        region: input.region,
        province: input.province,
        city: input.city,
        fascia: input.fascia,
        population: input.population,
        ntn: input.ntn,
        marketScore: input.marketScore,
        lat: input.lat,
        lng: input.lng,
        monthlyPrice: input.monthlyPrice,
        maxAgencies: input.maxAgencies,
        municipalities: input.municipalities,
        capCodes: [],
        ...(input.boundary ? { boundary: input.boundary as object } : {}),
      },
    });
  } catch (err) {
    console.error(`  ✗ Errore zona "${input.name}":`, err);
  }
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  console.log("=== Import Zone OMI 1:1 ===\n");

  const dryRun = process.argv.includes("--dry-run");
  const skipCleanup = process.argv.includes("--skip-cleanup");
  const provFilter = process.argv.find(a => a.startsWith("--prov="))?.split("=")[1]?.toUpperCase();
  const fromProv = process.argv.find(a => a.startsWith("--from="))?.split("=")[1]?.toUpperCase();
  const toProv = process.argv.find(a => a.startsWith("--to="))?.split("=")[1]?.toUpperCase();

  if (dryRun) console.log("*** DRY RUN — nessuna scrittura DB ***\n");
  if (skipCleanup) console.log("*** SKIP CLEANUP — orfane NON verranno disattivate ***\n");

  // 1. Dati ISTAT
  const istat = await fetchIstatData();

  // 2. Semestre OMI
  const semestre = await getLatestSemestre();
  console.log(`Semestre OMI: ${semestre}\n`);

  // 3. Province da processare (rispetta provFilter / fromProv / toProv)
  let provinces: string[];
  if (provFilter) {
    provinces = [provFilter];
  } else {
    const sorted = [...ALL_PROVINCES].sort();
    const fromIdx = fromProv ? sorted.findIndex(p => p >= fromProv) : 0;
    let toIdx = toProv ? sorted.findIndex(p => p > toProv) : sorted.length;
    if (toIdx === -1) toIdx = sorted.length;
    provinces = sorted.slice(Math.max(0, fromIdx), toIdx);
  }
  console.log(`Province da processare: ${provinces.length} (${provinces[0]}...${provinces[provinces.length-1]})`);

  let totalZones = 0;
  let totalComuni = 0;
  let totalBoundaries = 0;
  let totalSkipped = 0;
  const stats = { premium: 0, urbana: 0, base: 0 };

  for (const prov of provinces) {
    const region = PROVINCE_TO_REGION[prov];
    if (!region) continue;

    await sleep(DELAY_MS);
    const comuni = await fetchComuni(prov);
    if (comuni.length === 0) continue;

    console.log(`\n📍 ${prov} (${region}): ${comuni.length} comuni`);

    for (const comune of comuni) {
      await sleep(DELAY_MS);
      const zoneNames = await fetchZoneNames(comune.codcom);
      if (zoneNames.length === 0) {
        totalSkipped++;
        continue;
      }

      // Trova popolazione ISTAT
      const istatKey = `${comune.comune.toUpperCase()}|${prov}`;
      const istatData = istat.get(istatKey);
      const pop = istatData?.population || 0;
      const cityName = istatData?.name || comune.comune;

      // Decidere: 1:1 o raggruppamento
      let groups: ZoneGroup[];
      if (pop >= POP_THRESHOLD) {
        // 1:1: ogni microzona diventa una zona separata
        groups = zoneNames.map(z => ({
          name: `${cityName} — ${formatDizione(z.dizione)}`,
          slug: slugify(`${cityName}-${prov}-${z.zona}`),
          fascia: z.fascia,
          zoneClass: fasciaToZoneClass(z.fascia),
          zonas: [z.zona],
          dizioni: [z.dizione],
        }));
      } else {
        groups = groupMicrozones(zoneNames, cityName, prov);
      }

      const popPerZone = groups.length > 0 ? Math.round(pop / groups.length) : 0;
      const ntnPerZone = Math.round(popPerZone * 0.01);

      totalComuni++;

      // Scarica TUTTI i boundary del comune in una sola chiamata
      let allBoundaries = new Map<string, GeoJSONGeometry>();
      if (!dryRun) {
        await sleep(DELAY_MS);
        allBoundaries = await fetchAllBoundaries(comune.codcom, semestre);
        if (allBoundaries.size === 0) {
          // Prova semestre precedente
          const prevSemestre = semestre === "20252" ? "20251" : "20242";
          await sleep(DELAY_MS);
          allBoundaries = await fetchAllBoundaries(comune.codcom, prevSemestre);
        }
      }

      for (const group of groups) {
        // Prendi i boundary per le microzone di questo gruppo
        let boundary: GeoJSONGeometry | null = null;
        if (!dryRun) {
          const boundaries: GeoJSONGeometry[] = [];
          for (const zona of group.zonas) {
            const geo = allBoundaries.get(zona);
            if (geo) boundaries.push(geo);
          }
          if (boundaries.length === 1) {
            boundary = boundaries[0];
          } else if (boundaries.length > 1) {
            boundary = mergeGeoJSONGeometries(boundaries);
          }
          if (boundary) totalBoundaries++;
        }

        // Centroide dalla geometria
        const centroid = boundary ? geometryCentroid(boundary) : { lat: 0, lng: 0 };

        const score = calculateMarketScore(popPerZone, ntnPerZone);
        const pricing = calculateZonePrice(group.zoneClass, popPerZone, ntnPerZone);

        if (!dryRun) {
          await upsertZone({
            name: group.name,
            slug: group.slug,
            zoneClass: group.zoneClass,
            region,
            province: prov,
            city: cityName,
            fascia: group.fascia,
            population: popPerZone,
            ntn: ntnPerZone,
            lat: centroid.lat || null,
            lng: centroid.lng || null,
            monthlyPrice: pricing.monthlyPrice,
            maxAgencies: pricing.maxAgencies,
            marketScore: score,
            boundary,
            municipalities: [cityName],
          });
        }

        totalZones++;
        if (group.zoneClass === "PREMIUM") stats.premium++;
        else if (group.zoneClass === "URBANA") stats.urbana++;
        else stats.base++;
      }

      if (groups.length > 0) {
        const mode = pop >= POP_THRESHOLD ? "1:1" : `raggruppato (${groups.length})`;
        console.log(`  ${cityName}: ${zoneNames.length} microzone OMI → ${groups.length} zone [${mode}]`);
      }
    }
  }

  // Disattiva zone OMI orfane (solo se non dry-run, non provFilter, non chunk, non skip-cleanup)
  // IMPORTANTE: se hai fatto un import parziale (--from/--to/--prov/--skip-cleanup)
  // il cleanup salterebbe a disattivare province valide → SEMPRE saltato in questi casi.
  const isPartialImport = !!provFilter || !!fromProv || !!toProv || skipCleanup;
  if (!dryRun && !isPartialImport) {
    console.log("\n=== Pulizia zone orfane ===");
    const result = await prisma.zone.updateMany({
      where: {
        fascia: { not: null },
        slug: { notIn: [...importedSlugs] },
        isActive: true,
      },
      data: { isActive: false },
    });
    console.log(`  ⚠ Disattivate ${result.count} zone OMI orfane`);
  } else if (skipCleanup || isPartialImport) {
    console.log("\n=== Cleanup saltato (import parziale) ===");
  }

  // Report
  console.log("\n=== Risultato finale ===");
  console.log(`Comuni con OMI: ${totalComuni}`);
  console.log(`Comuni senza OMI: ${totalSkipped} (gestiti da import-zones-v3)`);
  console.log(`Zone create/aggiornate: ${totalZones}`);
  console.log(`  - PREMIUM: ${stats.premium}`);
  console.log(`  - URBANA: ${stats.urbana}`);
  console.log(`  - BASE: ${stats.base}`);
  console.log(`Con boundary GeoJSON: ${totalBoundaries}`);
  if (dryRun) console.log("\n*** DRY RUN — nessuna modifica al DB ***");
}

main()
  .catch((err) => {
    console.error("\n\n*** ERRORE FATALE ***");
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
