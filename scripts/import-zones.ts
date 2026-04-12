/**
 * Import zone territoriali da dati ISTAT.
 *
 * Fonte: CSV ISTAT comuni italiani con popolazione.
 * Il CSV viene incluso inline come costante per le province/regioni italiane,
 * e i dati popolazione vengono scaricati dal sito ISTAT.
 *
 * Uso: npx tsx scripts/import-zones.ts
 *
 * Logica (modello 3 fasce V2):
 * - Comuni > 200.000 abitanti  -> PREMIUM (split quartieri definiti)
 * - Comuni 100.000-200.000     -> PREMIUM (split quartieri definiti)
 * - Comuni 50.000-100.000      -> URBANA  (auto-split 2-4 sub-zone)
 * - Comuni 20.000-50.000       -> URBANA  (zona singola)
 * - Comuni 5.000-20.000        -> BASE    (zona singola)
 * - Comuni < 5.000             -> BASE    (cluster geografico, max 5km)
 */

import { PrismaClient } from "@prisma/client";
import type { ZoneClass } from "@prisma/client";
import {
  calculateMarketScore,
  calculateZonePrice,
  classifyZone,
} from "../src/lib/zone-pricing";

const prisma = new PrismaClient();

/* ------------------------------------------------------------------ */
/*  Mapping regioni e province italiane                                */
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

/* ------------------------------------------------------------------ */
/*  Scarica dati ISTAT via API                                         */
/* ------------------------------------------------------------------ */

interface ComuneData {
  name: string;
  province: string;
  region: string;
  population: number;
}

async function fetchIstatData(): Promise<ComuneData[]> {
  console.log("Scaricamento dati ISTAT...");

  const url =
    "https://demo.istat.it/app/assets/data/comuni/pop_res_gen_2024.csv";

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (response.ok) {
      const text = await response.text();
      return parseIstatCsv(text);
    }
  } catch {
    console.log("API ISTAT non raggiungibile, uso dati embedded...");
  }

  return generateFallbackData();
}

function parseIstatCsv(csv: string): ComuneData[] {
  const lines = csv.split("\n").slice(1);
  const comuni: ComuneData[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(",");
    if (parts.length < 4) continue;

    const name = parts[0]?.trim().replace(/"/g, "");
    const province = parts[1]?.trim().replace(/"/g, "");
    const population = parseInt(parts[parts.length - 1]?.trim() || "0", 10);

    if (name && province && province.length === 2 && !isNaN(population)) {
      const region = PROVINCE_TO_REGION[province.toUpperCase()];
      if (region) {
        comuni.push({
          name,
          province: province.toUpperCase(),
          region,
          population: Math.max(population, 0),
        });
      }
    }
  }

  return comuni;
}

/** Dati di fallback con i comuni principali italiani */
function generateFallbackData(): ComuneData[] {
  const data: ComuneData[] = [];

  const cities: Array<[string, string, number]> = [
    // Piemonte
    ["Torino", "TO", 848885], ["Novara", "NO", 104268], ["Alessandria", "AL", 92204],
    ["Asti", "AT", 74494], ["Cuneo", "CN", 56081], ["Biella", "BI", 43818],
    ["Vercelli", "VC", 45199], ["Verbania", "VB", 30327],
    // Lombardia
    ["Milano", "MI", 1396059], ["Brescia", "BS", 196480], ["Bergamo", "BG", 122444],
    ["Monza", "MB", 122955], ["Como", "CO", 83320], ["Varese", "VA", 79793],
    ["Pavia", "PV", 72125], ["Cremona", "CR", 71924], ["Mantova", "MN", 49308],
    ["Lecco", "LC", 48131], ["Lodi", "LO", 46613], ["Sondrio", "SO", 21876],
    // Veneto
    ["Venezia", "VE", 254661], ["Verona", "VR", 258031], ["Padova", "PD", 207245],
    ["Vicenza", "VI", 111620], ["Treviso", "TV", 84669], ["Rovigo", "RO", 50164],
    ["Belluno", "BL", 35369],
    // Emilia-Romagna
    ["Bologna", "BO", 394463], ["Parma", "PR", 198292], ["Modena", "MO", 184525],
    ["Reggio Emilia", "RE", 170905], ["Ravenna", "RA", 157630],
    ["Rimini", "RN", 150155], ["Ferrara", "FE", 130370],
    ["Forl\u00ec", "FC", 117220], ["Piacenza", "PC", 103082],
    // Toscana
    ["Firenze", "FI", 367150], ["Prato", "PO", 195089], ["Livorno", "LI", 155427],
    ["Arezzo", "AR", 99199], ["Pisa", "PI", 88880], ["Lucca", "LU", 89539],
    ["Pistoia", "PT", 90315], ["Siena", "SI", 53903], ["Grosseto", "GR", 82087],
    ["Massa", "MS", 68886],
    // Lazio
    ["Roma", "RM", 2749031], ["Latina", "LT", 127026], ["Frosinone", "FR", 44806],
    ["Viterbo", "VT", 66817], ["Rieti", "RI", 46850],
    // Campania
    ["Napoli", "NA", 914758], ["Salerno", "SA", 128302], ["Caserta", "CE", 75586],
    ["Avellino", "AV", 53201], ["Benevento", "BN", 56860],
    // Puglia
    ["Bari", "BA", 315284], ["Taranto", "TA", 189023], ["Foggia", "FG", 147036],
    ["Lecce", "LE", 94887], ["Brindisi", "BR", 86023], ["Andria", "BT", 99200],
    // Sicilia
    ["Palermo", "PA", 630828], ["Catania", "CT", 298762], ["Messina", "ME", 222189],
    ["Siracusa", "SR", 118385], ["Ragusa", "RG", 73638], ["Trapani", "TP", 66637],
    ["Agrigento", "AG", 57592], ["Caltanissetta", "CL", 60539], ["Enna", "EN", 25815],
    // Sardegna
    ["Cagliari", "CA", 149883], ["Sassari", "SS", 124610], ["Nuoro", "NU", 35316],
    ["Oristano", "OR", 30452],
    // Altre regioni
    ["Genova", "GE", 560688], ["La Spezia", "SP", 92960], ["Savona", "SV", 60194],
    ["Imperia", "IM", 42586],
    ["Trieste", "TS", 198417], ["Udine", "UD", 98287], ["Pordenone", "PN", 51229],
    ["Gorizia", "GO", 34025],
    ["Trento", "TN", 119731], ["Bolzano", "BZ", 108245],
    ["Aosta", "AO", 33916],
    ["Perugia", "PG", 164493], ["Terni", "TR", 108750],
    ["Ancona", "AN", 99352], ["Pesaro", "PU", 95012], ["Macerata", "MC", 41775],
    ["Fermo", "FM", 37258], ["Ascoli Piceno", "AP", 47324],
    ["L'Aquila", "AQ", 69753], ["Pescara", "PE", 118652], ["Chieti", "CH", 49375],
    ["Teramo", "TE", 53211],
    ["Potenza", "PZ", 65919], ["Matera", "MT", 60403],
    ["Catanzaro", "CZ", 84529], ["Cosenza", "CS", 66000], ["Reggio Calabria", "RC", 170318],
    ["Crotone", "KR", 61529], ["Vibo Valentia", "VV", 31552],
    ["Campobasso", "CB", 47985], ["Isernia", "IS", 21472],
  ];

  for (const [name, province, population] of cities) {
    data.push({
      name,
      province,
      region: PROVINCE_TO_REGION[province] || "Sconosciuta",
      population,
    });
  }

  const smallCities: Array<[string, string, number]> = [
    // Piemonte - AT
    ["Nizza Monferrato", "AT", 10178], ["Canelli", "AT", 10260],
    ["Villanova d'Asti", "AT", 5743], ["San Damiano d'Asti", "AT", 8251],
    ["Costigliole d'Asti", "AT", 5943], ["Moncalvo", "AT", 3009],
    ["Castell'Alfero", "AT", 2770], ["Calliano", "AT", 1518],
    ["Castagnole Monferrato", "AT", 1202], ["Grazzano Badoglio", "AT", 612],
    ["Montemagno", "AT", 1086], ["Cocconato", "AT", 1567],
    ["Montiglio Monferrato", "AT", 1592], ["Incisa Scapaccino", "AT", 2275],
    ["Calamandrana", "AT", 1691],

    // Torino hinterland — URBANA
    ["Moncalieri", "TO", 55844], ["Rivoli", "TO", 47500],
    ["Collegno", "TO", 48340], ["Nichelino", "TO", 46890],
    ["Settimo Torinese", "TO", 47300], ["Grugliasco", "TO", 37800],
    ["Chieri", "TO", 36100], ["Chivasso", "TO", 26700],
    ["Venaria Reale", "TO", 33500], ["Orbassano", "TO", 23200],
    ["Alpignano", "TO", 17200], ["Druento", "TO", 8800],
    // Torino hinterland — BASE (5k-20k)
    ["Pinerolo", "TO", 36200], ["Ivrea", "TO", 23600],
    ["Carmagnola", "TO", 29100], ["Ciri\u00e9", "TO", 18800],
    ["Avigliana", "TO", 12600], ["Giaveno", "TO", 16500],
    ["Susa", "TO", 6300], ["Bussoleno", "TO", 6100],
    ["Rivarolo Canavese", "TO", 12400], ["Cuorgn\u00e8", "TO", 9900],
    ["Castellamonte", "TO", 9600], ["Lanzo Torinese", "TO", 5200],
    ["San Mauro Torinese", "TO", 19400], ["Trofarello", "TO", 11200],
    ["La Loggia", "TO", 8900], ["Piobesi Torinese", "TO", 3800],
    ["Candiolo", "TO", 5700], ["Pecetto Torinese", "TO", 4100],
    ["Pino Torinese", "TO", 8600], ["Brandizzo", "TO", 8800],
    ["Castagneto Po", "TO", 1800], ["Volpiano", "TO", 15500],
    ["Lein\u00ec", "TO", 16200], ["Caselle Torinese", "TO", 19400],
    ["Borgaro Torinese", "TO", 13600],
    // Torino hinterland — micro (<5k)
    ["Sangano", "TO", 3900], ["Trana", "TO", 3900], ["Coazze", "TO", 3200],
    ["Valperga", "TO", 3100], ["Pont Canavese", "TO", 3300],
    ["Agli\u00e8", "TO", 2600], ["Banchette", "TO", 3400],
    ["Pavone Canavese", "TO", 3900], ["Corio", "TO", 3300],
    ["Carignano", "TO", 9200], ["Villastellone", "TO", 5000],

    // Milano hinterland — URBANA
    ["Sesto San Giovanni", "MI", 81773], ["Cinisello Balsamo", "MI", 73908],
    ["Rho", "MI", 50904], ["Legnano", "MI", 59922],
    ["Cologno Monzese", "MI", 47500], ["Paderno Dugnano", "MI", 46900],
    ["Corsico", "MI", 34590], ["Rozzano", "MI", 42900],
    ["San Donato Milanese", "MI", 32600], ["Segrate", "MI", 36700],
    ["Pioltello", "MI", 37900], ["Bollate", "MI", 36800],
    ["Abbiategrasso", "MI", 32700], ["Magenta", "MI", 24200],
    ["Garbagnate Milanese", "MI", 27300], ["Arese", "MI", 19800],
    ["Opera", "MI", 14200], ["Peschiera Borromeo", "MI", 24100],
    ["Bresso", "MI", 26800], ["Buccinasco", "MI", 26900],
    ["Cernusco sul Naviglio", "MI", 34600], ["Melzo", "MI", 18900],
    ["San Giuliano Milanese", "MI", 39300],

    // Roma hinterland — URBANA
    ["Guidonia Montecelio", "RM", 88673], ["Fiumicino", "RM", 80175],
    ["Tivoli", "RM", 56510], ["Velletri", "RM", 52948],
    ["Anzio", "RM", 54211], ["Pomezia", "RM", 63360],
    ["Ciampino", "RM", 38760], ["Marino", "RM", 43925],
    ["Ardea", "RM", 50700], ["Nettuno", "RM", 49200],
    ["Monterotondo", "RM", 41200], ["Ladispoli", "RM", 42500],
    ["Cerveteri", "RM", 37900], ["Palestrina", "RM", 22100],
    ["Civitavecchia", "RM", 52600], ["Frascati", "RM", 22300],
    ["Grottaferrata", "RM", 21500], ["Albano Laziale", "RM", 41600],
    ["Colleferro", "RM", 22100], ["Bracciano", "RM", 19700],
    ["Zagarolo", "RM", 18300], ["Subiaco", "RM", 9100],

    // Napoli hinterland
    ["Giugliano in Campania", "NA", 123000], ["Torre del Greco", "NA", 84000],
    ["Pozzuoli", "NA", 78000], ["Casoria", "NA", 77000],
    ["Afragola", "NA", 65000], ["Marano di Napoli", "NA", 60000],
    ["Portici", "NA", 55000], ["Ercolano", "NA", 52000],
    ["Casalnuovo di Napoli", "NA", 51000], ["Torre Annunziata", "NA", 42000],
    ["Nola", "NA", 34000], ["Acerra", "NA", 60000],
    ["Castellammare di Stabia", "NA", 66000], ["Somma Vesuviana", "NA", 35000],

    // Palermo hinterland
    ["Bagheria", "PA", 55000], ["Carini", "PA", 39000],
    ["Partinico", "PA", 32000], ["Monreale", "PA", 39000],
    ["Termini Imerese", "PA", 25000], ["Villabate", "PA", 20000],
    ["Misilmeri", "PA", 29000], ["Ficarazzi", "PA", 12500],

    // Genova hinterland
    ["Rapallo", "GE", 29700], ["Chiavari", "GE", 27500],
    ["Lavagna", "GE", 12600], ["Sestri Levante", "GE", 18300],
    ["Arenzano", "GE", 11600], ["Recco", "GE", 9900],
    ["Camogli", "GE", 5400], ["Santa Margherita Ligure", "GE", 9200],
    ["Busalla", "GE", 5700], ["Ronco Scrivia", "GE", 4500],

    // Bologna hinterland
    ["Imola", "BO", 70000], ["Casalecchio di Reno", "BO", 36500],
    ["San Lazzaro di Savena", "BO", 32800], ["Castel Maggiore", "BO", 18400],
    ["Budrio", "BO", 18300], ["Pianoro", "BO", 17600],
    ["Zola Predosa", "BO", 19100], ["San Giovanni in Persiceto", "BO", 28200],
    ["Castel San Pietro Terme", "BO", 21000],

    // Firenze hinterland
    ["Scandicci", "FI", 50800], ["Sesto Fiorentino", "FI", 49000],
    ["Campi Bisenzio", "FI", 47200], ["Bagno a Ripoli", "FI", 25800],
    ["Lastra a Signa", "FI", 20700], ["Calenzano", "FI", 18300],
    ["Pontassieve", "FI", 20800], ["Empoli", "FI", 49000],
    ["Fucecchio", "FI", 23600], ["Castelfiorentino", "FI", 17600],

    // Bari hinterland
    ["Altamura", "BA", 70000], ["Monopoli", "BA", 48000],
    ["Bitonto", "BA", 55000], ["Corato", "BA", 48000],
    ["Molfetta", "BA", 58000], ["Modugno", "BA", 38000],
    ["Conversano", "BA", 26000], ["Triggiano", "BA", 27000],
    ["Ruvo di Puglia", "BA", 25500], ["Gioia del Colle", "BA", 27000],
  ];

  for (const [name, province, population] of smallCities) {
    data.push({
      name,
      province,
      region: PROVINCE_TO_REGION[province] || "Sconosciuta",
      population,
    });
  }

  return data;
}

/* ------------------------------------------------------------------ */
/*  Geocoding via Google Maps API                                      */
/* ------------------------------------------------------------------ */

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  if (geocodeCache.has(address)) return geocodeCache.get(address)!;
  if (!GOOGLE_MAPS_KEY) {
    geocodeCache.set(address, null);
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location;
      geocodeCache.set(address, { lat, lng });
      return { lat, lng };
    }
  } catch {
    // Silently fail geocoding
  }
  geocodeCache.set(address, null);
  return null;
}

/* ------------------------------------------------------------------ */
/*  Clustering geografico per micro comuni                             */
/* ------------------------------------------------------------------ */

type GeoComune = ComuneData & { lat: number; lng: number };

/**
 * Haversine distance in meters between two lat/lng points.
 */
function haversineMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Greedy nearest-neighbor clustering.
 *
 * Starts from the largest unassigned comune, adds neighbors within
 * `maxDistanceMeters` until the cluster reaches `targetPopulation`.
 * Then starts a new cluster.
 */
function clusterByProximity(
  comuni: GeoComune[],
  targetPopulation: number,
  maxPopulation: number,
  maxDistanceMeters: number = 5000 // 5 km (was 15km)
): GeoComune[][] {
  if (comuni.length === 0) return [];

  // Sort by population desc — start clusters from the biggest
  const remaining = [...comuni].sort((a, b) => b.population - a.population);
  const used = new Set<string>();
  const clusters: GeoComune[][] = [];

  while (used.size < comuni.length) {
    // Pick the largest unused comune as seed
    const seed = remaining.find((c) => !used.has(c.name));
    if (!seed) break;

    const cluster: GeoComune[] = [seed];
    used.add(seed.name);
    let totalPop = seed.population;

    // Center of current cluster (updated as we add members)
    let centerLat = seed.lat;
    let centerLng = seed.lng;

    // Find nearby unassigned comuni
    let changed = true;
    while (changed && totalPop < maxPopulation) {
      changed = false;

      // Sort remaining by distance to cluster center
      const candidates = remaining
        .filter((c) => !used.has(c.name))
        .map((c) => ({
          comune: c,
          dist: haversineMeters(centerLat, centerLng, c.lat, c.lng),
        }))
        .filter((c) => c.dist <= maxDistanceMeters)
        .sort((a, b) => a.dist - b.dist);

      for (const { comune } of candidates) {
        if (totalPop + comune.population > maxPopulation) continue;
        cluster.push(comune);
        used.add(comune.name);
        totalPop += comune.population;
        changed = true;

        // Recalculate center
        centerLat = cluster.reduce((s, c) => s + c.lat, 0) / cluster.length;
        centerLng = cluster.reduce((s, c) => s + c.lng, 0) / cluster.length;

        if (totalPop >= targetPopulation) break;
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

/* ------------------------------------------------------------------ */
/*  Quartieri delle grandi citta (stile Immobiliare.it)                */
/* ------------------------------------------------------------------ */

interface CityNeighborhood {
  name: string;
  lat: number;
  lng: number;
  population: number;
  municipalities: string[];
  avgPricePerSqm: number;
  ntnEstimate: number;
}

/**
 * Per le citta > 100k abitanti, definizione dei quartieri/sub-zone.
 * Ispirato alla suddivisione di Immobiliare.it.
 * Ogni quartiere diventa una zona PREMIUM indipendente.
 */
const CITY_NEIGHBORHOODS: Record<string, CityNeighborhood[]> = {
  /* ============================================================== */
  /*  CITTA > 200k — PREMIUM con quartieri esistenti (espansi)      */
  /* ============================================================== */
  "Roma": [
    { name: "Roma Centro Storico", lat: 41.8986, lng: 12.4769, population: 120000, municipalities: ["Centro Storico", "Trevi", "Monti", "Trastevere", "Navona"], avgPricePerSqm: 5500, ntnEstimate: 2800 },
    { name: "Roma Prati - Trionfale", lat: 41.9097, lng: 12.4559, population: 155000, municipalities: ["Prati", "Trionfale", "Della Vittoria", "Borgo"], avgPricePerSqm: 4200, ntnEstimate: 2200 },
    { name: "Roma Parioli - Salario", lat: 41.9206, lng: 12.4928, population: 130000, municipalities: ["Parioli", "Salario", "Trieste", "Villa Ada"], avgPricePerSqm: 4800, ntnEstimate: 1900 },
    { name: "Roma Nomentano - Tiburtino", lat: 41.9104, lng: 12.5233, population: 185000, municipalities: ["Nomentano", "Tiburtino", "San Lorenzo", "Pietralata"], avgPricePerSqm: 3200, ntnEstimate: 2400 },
    { name: "Roma Tuscolano - Appio", lat: 41.8770, lng: 12.5183, population: 210000, municipalities: ["Tuscolano", "Appio Latino", "Don Bosco", "Cinecitt\u00e0"], avgPricePerSqm: 3000, ntnEstimate: 2800 },
    { name: "Roma EUR - Torrino", lat: 41.8314, lng: 12.4698, population: 180000, municipalities: ["EUR", "Torrino", "Laurentino", "Fonte Ostiense"], avgPricePerSqm: 3500, ntnEstimate: 2100 },
    { name: "Roma Ostia - Litorale", lat: 41.7350, lng: 12.2874, population: 100000, municipalities: ["Ostia", "Acilia", "Infernetto", "Casal Palocco"], avgPricePerSqm: 2400, ntnEstimate: 1200 },
    { name: "Roma Monte Mario - Balduina", lat: 41.9261, lng: 12.4297, population: 165000, municipalities: ["Monte Mario", "Balduina", "Primavalle", "Ottavia"], avgPricePerSqm: 3100, ntnEstimate: 2000 },
    { name: "Roma San Giovanni - Prenestino", lat: 41.8866, lng: 12.5172, population: 195000, municipalities: ["San Giovanni", "Prenestino", "Centocelle", "Torpignattara"], avgPricePerSqm: 2800, ntnEstimate: 2600 },
    { name: "Roma Monteverde - Portuense", lat: 41.8750, lng: 12.4500, population: 175000, municipalities: ["Monteverde", "Portuense", "Gianicolense", "Marconi"], avgPricePerSqm: 3400, ntnEstimate: 2100 },
    { name: "Roma Aurelio - Boccea", lat: 41.9010, lng: 12.4080, population: 170000, municipalities: ["Aurelio", "Boccea", "Casalotti", "Val Cannuta"], avgPricePerSqm: 2600, ntnEstimate: 1800 },
    { name: "Roma Casilino - Torre Angela", lat: 41.8650, lng: 12.5700, population: 220000, municipalities: ["Casilino", "Torre Angela", "Torre Maura", "Tor Bella Monaca"], avgPricePerSqm: 2100, ntnEstimate: 2500 },
    // Nuove zone Roma (expand da 12 a 20)
    { name: "Roma Testaccio - Ostiense", lat: 41.8760, lng: 12.4770, population: 85000, municipalities: ["Testaccio", "Ostiense", "Gazometro", "Piramide"], avgPricePerSqm: 3600, ntnEstimate: 1400 },
    { name: "Roma Garbatella - Ardeatino", lat: 41.8620, lng: 12.4880, population: 95000, municipalities: ["Garbatella", "Ardeatino", "Tor Marancia", "Grotta Perfetta"], avgPricePerSqm: 3200, ntnEstimate: 1500 },
    { name: "Roma Talenti - Monte Sacro", lat: 41.9400, lng: 12.5300, population: 130000, municipalities: ["Talenti", "Monte Sacro", "Nuovo Salario", "Valli"], avgPricePerSqm: 3000, ntnEstimate: 1800 },
    { name: "Roma Fleming - Vigna Clara", lat: 41.9350, lng: 12.4600, population: 90000, municipalities: ["Fleming", "Vigna Clara", "Tor di Quinto", "Farnesina"], avgPricePerSqm: 4000, ntnEstimate: 1300 },
    { name: "Roma Ponte Milvio - Flaminio", lat: 41.9320, lng: 12.4700, population: 95000, municipalities: ["Ponte Milvio", "Flaminio", "Villaggio Olimpico", "Parioli Nord"], avgPricePerSqm: 4500, ntnEstimate: 1400 },
    { name: "Roma Tor Vergata - Romanina", lat: 41.8500, lng: 12.6100, population: 110000, municipalities: ["Tor Vergata", "Romanina", "Morena", "Borghesiana"], avgPricePerSqm: 2000, ntnEstimate: 1600 },
    { name: "Roma Casal Monastero - Settecamini", lat: 41.9500, lng: 12.6200, population: 105000, municipalities: ["Casal Monastero", "Settecamini", "Case Rosse", "Tor Cervara"], avgPricePerSqm: 1900, ntnEstimate: 1400 },
    { name: "Roma Primavalle - Torrevecchia", lat: 41.9200, lng: 12.4100, population: 115000, municipalities: ["Primavalle", "Torrevecchia", "Montespaccato", "La Giustiniana"], avgPricePerSqm: 2300, ntnEstimate: 1600 },
  ],
  "Milano": [
    { name: "Milano Centro - Duomo", lat: 45.4642, lng: 9.1900, population: 95000, municipalities: ["Centro", "Duomo", "Brera", "Vittorio Emanuele"], avgPricePerSqm: 7500, ntnEstimate: 2800 },
    { name: "Milano Navigli - Porta Genova", lat: 45.4530, lng: 9.1740, population: 85000, municipalities: ["Navigli", "Porta Genova", "Porta Ticinese", "Barona"], avgPricePerSqm: 5200, ntnEstimate: 1800 },
    { name: "Milano Porta Romana - Lodi", lat: 45.4495, lng: 9.2040, population: 120000, municipalities: ["Porta Romana", "Lodi", "Corvetto", "Rogoredo"], avgPricePerSqm: 4200, ntnEstimate: 2100 },
    { name: "Milano Citt\u00e0 Studi - Lambrate", lat: 45.4750, lng: 9.2280, population: 135000, municipalities: ["Citt\u00e0 Studi", "Lambrate", "Ortica", "Casoretto"], avgPricePerSqm: 4000, ntnEstimate: 2200 },
    { name: "Milano Loreto - Turro", lat: 45.4850, lng: 9.2200, population: 115000, municipalities: ["Loreto", "Turro", "Gorla", "Precotto"], avgPricePerSqm: 3800, ntnEstimate: 1900 },
    { name: "Milano Sempione - Fiera", lat: 45.4780, lng: 9.1550, population: 110000, municipalities: ["Sempione", "Fiera", "City Life", "De Angeli"], avgPricePerSqm: 5000, ntnEstimate: 2000 },
    { name: "Milano Isola - Garibaldi", lat: 45.4850, lng: 9.1840, population: 80000, municipalities: ["Isola", "Garibaldi", "Porta Nuova", "Repubblica"], avgPricePerSqm: 6000, ntnEstimate: 1600 },
    { name: "Milano San Siro - Baggio", lat: 45.4630, lng: 9.1200, population: 140000, municipalities: ["San Siro", "Baggio", "Quarto Cagnino", "Quinto Romano"], avgPricePerSqm: 3200, ntnEstimate: 2000 },
    { name: "Milano Bicocca - Niguarda", lat: 45.5100, lng: 9.2050, population: 155000, municipalities: ["Bicocca", "Niguarda", "Affori", "Bovisa"], avgPricePerSqm: 3500, ntnEstimate: 2200 },
    { name: "Milano Certosa - Gallaratese", lat: 45.4980, lng: 9.1300, population: 130000, municipalities: ["Certosa", "Gallaratese", "QT8", "Villapizzone"], avgPricePerSqm: 3400, ntnEstimate: 1800 },
    // Nuove zone Milano (expand da 10 a 16)
    { name: "Milano Porta Venezia - Buenos Aires", lat: 45.4750, lng: 9.2050, population: 90000, municipalities: ["Porta Venezia", "Buenos Aires", "Indipendenza", "Lazzaretto"], avgPricePerSqm: 5500, ntnEstimate: 1700 },
    { name: "Milano NoLo - Pasteur", lat: 45.4920, lng: 9.2180, population: 75000, municipalities: ["NoLo", "Pasteur", "Rovereto", "Via Padova Nord"], avgPricePerSqm: 3600, ntnEstimate: 1400 },
    { name: "Milano Porta Vittoria - Forlanini", lat: 45.4600, lng: 9.2200, population: 100000, municipalities: ["Porta Vittoria", "Forlanini", "Mecenate", "Taliedo"], avgPricePerSqm: 3800, ntnEstimate: 1600 },
    { name: "Milano Dergano - Affori", lat: 45.5050, lng: 9.1800, population: 85000, municipalities: ["Dergano", "Affori", "Bruzzano", "Comasina"], avgPricePerSqm: 3200, ntnEstimate: 1500 },
    { name: "Milano Quarto Oggiaro - Vialba", lat: 45.5100, lng: 9.1400, population: 90000, municipalities: ["Quarto Oggiaro", "Vialba", "Musocco", "Roserio"], avgPricePerSqm: 2600, ntnEstimate: 1300 },
    { name: "Milano Gratosoglio - Chiesa Rossa", lat: 45.4250, lng: 9.1800, population: 95000, municipalities: ["Gratosoglio", "Chiesa Rossa", "Missaglia", "Quintosole"], avgPricePerSqm: 2800, ntnEstimate: 1400 },
  ],
  "Napoli": [
    { name: "Napoli Centro - Porto", lat: 40.8470, lng: 14.2560, population: 125000, municipalities: ["Centro Storico", "Porto", "Mercato", "Pendino"], avgPricePerSqm: 3200, ntnEstimate: 1800 },
    { name: "Napoli Chiaia - Posillipo", lat: 40.8350, lng: 14.2280, population: 105000, municipalities: ["Chiaia", "Posillipo", "Mergellina", "San Ferdinando"], avgPricePerSqm: 4500, ntnEstimate: 1500 },
    { name: "Napoli Vomero - Arenella", lat: 40.8530, lng: 14.2350, population: 135000, municipalities: ["Vomero", "Arenella", "Rione Alto"], avgPricePerSqm: 3800, ntnEstimate: 1700 },
    { name: "Napoli Fuorigrotta - Bagnoli", lat: 40.8230, lng: 14.1890, population: 120000, municipalities: ["Fuorigrotta", "Bagnoli", "Agnano", "Cavalleggeri"], avgPricePerSqm: 2800, ntnEstimate: 1400 },
    { name: "Napoli Est - Ponticelli", lat: 40.8580, lng: 14.3100, population: 155000, municipalities: ["Ponticelli", "San Giovanni", "Barra", "Poggioreale"], avgPricePerSqm: 2000, ntnEstimate: 1600 },
    { name: "Napoli Nord - Secondigliano", lat: 40.8940, lng: 14.2520, population: 145000, municipalities: ["Secondigliano", "Scampia", "Miano", "Piscinola"], avgPricePerSqm: 1800, ntnEstimate: 1400 },
    { name: "Napoli Capodimonte - Stella", lat: 40.8700, lng: 14.2530, population: 125000, municipalities: ["Capodimonte", "Stella", "San Carlo Arena", "Avvocata"], avgPricePerSqm: 2200, ntnEstimate: 1300 },
    // Nuove zone Napoli (expand da 7 a 10)
    { name: "Napoli Pianura - Soccavo", lat: 40.8400, lng: 14.1950, population: 95000, municipalities: ["Pianura", "Soccavo", "Traiano", "Montagna Spaccata"], avgPricePerSqm: 2000, ntnEstimate: 1100 },
    { name: "Napoli San Carlo Arena - Sanit\u00e0", lat: 40.8600, lng: 14.2500, population: 80000, municipalities: ["San Carlo Arena", "Sanit\u00e0", "Vergini", "Fontanelle"], avgPricePerSqm: 1900, ntnEstimate: 1000 },
    { name: "Napoli Arenella - Camaldoli", lat: 40.8580, lng: 14.2200, population: 70000, municipalities: ["Arenella Alta", "Camaldoli", "Vomero Alto", "Due Porte"], avgPricePerSqm: 2600, ntnEstimate: 900 },
  ],
  "Torino": [
    { name: "Torino Centro", lat: 45.070, lng: 7.687, population: 180000, municipalities: ["Centro", "Crocetta", "San Salvario", "Vanchiglia"], avgPricePerSqm: 3500, ntnEstimate: 2500 },
    { name: "Torino Collina", lat: 45.050, lng: 7.720, population: 85000, municipalities: ["Precollina", "Borgo Po", "Madonna del Pilone", "Cavoretto"], avgPricePerSqm: 4200, ntnEstimate: 1000 },
    { name: "Torino Nord", lat: 45.105, lng: 7.665, population: 125000, municipalities: ["Barriera di Milano", "Aurora", "Rebaudengo", "Falchera"], avgPricePerSqm: 1800, ntnEstimate: 1800 },
    { name: "Torino Sud", lat: 45.030, lng: 7.670, population: 140000, municipalities: ["Lingotto", "Mirafiori", "Nizza Millefonti", "Santa Rita"], avgPricePerSqm: 2200, ntnEstimate: 2000 },
    { name: "Torino Ovest", lat: 45.075, lng: 7.625, population: 115000, municipalities: ["San Paolo", "Cenisia", "Pozzo Strada", "Parella"], avgPricePerSqm: 2000, ntnEstimate: 1700 },
    // Nuove zone Torino (expand da 5 a 9)
    { name: "Torino Cit Turin - San Donato", lat: 45.080, lng: 7.660, population: 75000, municipalities: ["Cit Turin", "San Donato", "Campidoglio", "Borgo San Paolo"], avgPricePerSqm: 2400, ntnEstimate: 1200 },
    { name: "Torino San Salvario - Valentino", lat: 45.058, lng: 7.690, population: 65000, municipalities: ["San Salvario", "Valentino", "Dante", "Nizza"], avgPricePerSqm: 2800, ntnEstimate: 1100 },
    { name: "Torino Mirafiori - Lingotto Sud", lat: 45.020, lng: 7.650, population: 90000, municipalities: ["Mirafiori Sud", "Lingotto Sud", "Borgaretto", "Italia 61"], avgPricePerSqm: 1600, ntnEstimate: 1300 },
    { name: "Torino Barriera di Milano Est", lat: 45.100, lng: 7.700, population: 80000, municipalities: ["Barriera Est", "Barca", "Bertolla", "Regio Parco"], avgPricePerSqm: 1500, ntnEstimate: 1100 },
  ],
  "Palermo": [
    { name: "Palermo Centro", lat: 38.1157, lng: 13.3615, population: 130000, municipalities: ["Centro Storico", "Kalsa", "Capo", "Albergheria"], avgPricePerSqm: 1800, ntnEstimate: 1500 },
    { name: "Palermo Libert\u00e0 - Politeama", lat: 38.1220, lng: 13.3510, population: 120000, municipalities: ["Libert\u00e0", "Politeama", "Malaspina", "Noce"], avgPricePerSqm: 2200, ntnEstimate: 1400 },
    { name: "Palermo Nord - Mondello", lat: 38.1800, lng: 13.3300, population: 100000, municipalities: ["Mondello", "Partanna", "Pallavicino", "Tommaso Natale"], avgPricePerSqm: 2000, ntnEstimate: 1100 },
    { name: "Palermo Resuttana - Zisa", lat: 38.1350, lng: 13.3350, population: 140000, municipalities: ["Resuttana", "Zisa", "Altarello", "Uditore"], avgPricePerSqm: 1500, ntnEstimate: 1300 },
    { name: "Palermo Brancaccio - Ciaculli", lat: 38.0900, lng: 13.3800, population: 140000, municipalities: ["Brancaccio", "Ciaculli", "Settecannoli", "Corso dei Mille"], avgPricePerSqm: 1200, ntnEstimate: 1200 },
  ],
  "Genova": [
    { name: "Genova Centro", lat: 44.4068, lng: 8.9340, population: 110000, municipalities: ["Centro Storico", "Castelletto", "Porto Antico", "Carignano"], avgPricePerSqm: 2800, ntnEstimate: 1500 },
    { name: "Genova Levante", lat: 44.3950, lng: 8.9700, population: 120000, municipalities: ["Albaro", "Sturla", "Quarto", "Nervi"], avgPricePerSqm: 3200, ntnEstimate: 1400 },
    { name: "Genova Ponente", lat: 44.4200, lng: 8.8700, population: 130000, municipalities: ["Sampierdarena", "Cornigliano", "Sestri Ponente", "Pegli"], avgPricePerSqm: 1800, ntnEstimate: 1300 },
    { name: "Genova Valpolcevera", lat: 44.4400, lng: 8.9100, population: 100000, municipalities: ["Rivarolo", "Bolzaneto", "Pontedecimo", "Begato"], avgPricePerSqm: 1500, ntnEstimate: 1000 },
    { name: "Genova Valbisagno", lat: 44.4250, lng: 8.9500, population: 100000, municipalities: ["Marassi", "Staglieno", "Molassana", "Struppa"], avgPricePerSqm: 1600, ntnEstimate: 1100 },
  ],
  "Bologna": [
    { name: "Bologna Centro", lat: 44.4949, lng: 11.3426, population: 95000, municipalities: ["Centro Storico", "Galvani", "Irnerio", "Malpighi"], avgPricePerSqm: 4000, ntnEstimate: 1800 },
    { name: "Bologna Collina - San Luca", lat: 44.4750, lng: 11.3200, population: 80000, municipalities: ["Colli", "San Luca", "Saragozza", "San Mamolo"], avgPricePerSqm: 3800, ntnEstimate: 1200 },
    { name: "Bologna Nord - Fiera", lat: 44.5150, lng: 11.3400, population: 110000, municipalities: ["Fiera", "Bolognina", "Corticella", "Navile"], avgPricePerSqm: 2800, ntnEstimate: 1600 },
    { name: "Bologna San Donato - Pilastro", lat: 44.5050, lng: 11.3800, population: 110000, municipalities: ["San Donato", "Pilastro", "San Vitale", "Massarenti"], avgPricePerSqm: 2600, ntnEstimate: 1500 },
  ],
  "Firenze": [
    { name: "Firenze Centro", lat: 43.7696, lng: 11.2558, population: 85000, municipalities: ["Centro Storico", "Santa Croce", "San Frediano", "Oltrarno"], avgPricePerSqm: 5000, ntnEstimate: 1600 },
    { name: "Firenze Campo di Marte", lat: 43.7780, lng: 11.2750, population: 95000, municipalities: ["Campo di Marte", "Coverciano", "Settignano", "Rovezzano"], avgPricePerSqm: 3800, ntnEstimate: 1300 },
    { name: "Firenze Rifredi - Novoli", lat: 43.7900, lng: 11.2350, population: 100000, municipalities: ["Rifredi", "Novoli", "Careggi", "Le Piagge"], avgPricePerSqm: 3000, ntnEstimate: 1400 },
    { name: "Firenze Gavinana - Galluzzo", lat: 43.7450, lng: 11.2500, population: 87000, municipalities: ["Gavinana", "Galluzzo", "Soffiano", "Porta Romana"], avgPricePerSqm: 3200, ntnEstimate: 1200 },
  ],
  "Bari": [
    { name: "Bari Centro - Murat", lat: 41.1260, lng: 16.8700, population: 80000, municipalities: ["Murat", "Bari Vecchia", "Libert\u00e0", "Madonnella"], avgPricePerSqm: 2500, ntnEstimate: 1200 },
    { name: "Bari Poggiofranco - Picone", lat: 41.1100, lng: 16.8600, population: 85000, municipalities: ["Poggiofranco", "Picone", "Carrassi", "Mungivacca"], avgPricePerSqm: 2200, ntnEstimate: 1100 },
    { name: "Bari Japigia - San Paolo", lat: 41.0950, lng: 16.8700, population: 80000, municipalities: ["Japigia", "San Paolo", "Stanic", "Torre a Mare"], avgPricePerSqm: 1600, ntnEstimate: 900 },
    { name: "Bari Santo Spirito - Palese", lat: 41.1450, lng: 16.8200, population: 70000, municipalities: ["Santo Spirito", "Palese", "San Pio", "Catino"], avgPricePerSqm: 1800, ntnEstimate: 800 },
  ],
  "Catania": [
    { name: "Catania Centro", lat: 37.5079, lng: 15.0830, population: 100000, municipalities: ["Centro", "Porta Uzeda", "Civita", "San Cristoforo"], avgPricePerSqm: 1800, ntnEstimate: 1000 },
    { name: "Catania Nord - Ognina", lat: 37.5300, lng: 15.0950, population: 100000, municipalities: ["Ognina", "Picanello", "Barriera", "Canalicchio"], avgPricePerSqm: 2200, ntnEstimate: 1000 },
    { name: "Catania Ovest - Nesima", lat: 37.5100, lng: 15.0500, population: 100000, municipalities: ["Nesima", "Monte Po", "San Giovanni Galermo", "San Nullo"], avgPricePerSqm: 1200, ntnEstimate: 900 },
  ],
  "Verona": [
    { name: "Verona Centro", lat: 45.4384, lng: 10.9916, population: 65000, municipalities: ["Centro Storico", "Cittadella", "San Zeno", "Veronetta"], avgPricePerSqm: 3200, ntnEstimate: 1200 },
    { name: "Verona Nord - Borgo Trento", lat: 45.4550, lng: 10.9800, population: 65000, municipalities: ["Borgo Trento", "Valdonega", "Avesa", "Quinzano"], avgPricePerSqm: 2800, ntnEstimate: 1000 },
    { name: "Verona Sud - Borgo Roma", lat: 45.4180, lng: 10.9850, population: 65000, municipalities: ["Borgo Roma", "Golosine", "Santa Lucia", "Cadidavid"], avgPricePerSqm: 1800, ntnEstimate: 1100 },
    { name: "Verona Est - Borgo Venezia", lat: 45.4400, lng: 11.0200, population: 63000, municipalities: ["Borgo Venezia", "Porto San Pancrazio", "San Michele", "Montorio"], avgPricePerSqm: 2000, ntnEstimate: 900 },
  ],
  "Venezia": [
    { name: "Venezia Centro Storico", lat: 45.4375, lng: 12.3358, population: 52000, municipalities: ["San Marco", "Dorsoduro", "Cannaregio", "Castello"], avgPricePerSqm: 5000, ntnEstimate: 800 },
    { name: "Venezia Lido - Pellestrina", lat: 45.3800, lng: 12.3600, population: 22000, municipalities: ["Lido", "Pellestrina", "Malamocco", "Alberoni"], avgPricePerSqm: 3200, ntnEstimate: 400 },
    { name: "Venezia Mestre", lat: 45.4900, lng: 12.2400, population: 90000, municipalities: ["Mestre Centro", "Carpenedo", "Bissuola", "Chirignago"], avgPricePerSqm: 2200, ntnEstimate: 1400 },
    { name: "Venezia Marghera - Favaro", lat: 45.4700, lng: 12.2100, population: 50000, municipalities: ["Marghera", "Favaro Veneto", "Catene", "Malcontenta"], avgPricePerSqm: 1600, ntnEstimate: 800 },
    { name: "Venezia Murano - Burano", lat: 45.4580, lng: 12.3520, population: 40000, municipalities: ["Murano", "Burano", "Torcello", "Sant'Erasmo"], avgPricePerSqm: 3000, ntnEstimate: 400 },
  ],
  "Messina": [
    { name: "Messina Centro", lat: 38.1937, lng: 15.5542, population: 75000, municipalities: ["Centro", "Duomo", "Provinciale", "Giostra"], avgPricePerSqm: 1200, ntnEstimate: 800 },
    { name: "Messina Nord - Villafranca", lat: 38.2300, lng: 15.5200, population: 75000, municipalities: ["Villafranca Tirrena", "Rometta", "Tremestieri", "Gravitelli"], avgPricePerSqm: 1000, ntnEstimate: 700 },
    { name: "Messina Sud - Gazzi", lat: 38.1600, lng: 15.5400, population: 72000, municipalities: ["Gazzi", "Contesse", "Pistunina", "Giampilieri"], avgPricePerSqm: 900, ntnEstimate: 600 },
  ],
  "Padova": [
    { name: "Padova Centro", lat: 45.4064, lng: 11.8768, population: 70000, municipalities: ["Centro Storico", "Portello", "Santo", "Prato della Valle"], avgPricePerSqm: 3000, ntnEstimate: 1200 },
    { name: "Padova Nord - Arcella", lat: 45.4250, lng: 11.8750, population: 70000, municipalities: ["Arcella", "San Bellino", "Pontevigodarzere", "Torre"], avgPricePerSqm: 2000, ntnEstimate: 1000 },
    { name: "Padova Est - Forcellini", lat: 45.4000, lng: 11.9100, population: 67000, municipalities: ["Forcellini", "Terranegra", "Voltabarozzo", "Salboro"], avgPricePerSqm: 1800, ntnEstimate: 900 },
  ],

  /* ============================================================== */
  /*  CITTA 100k-200k — PREMIUM con quartieri (nuove)               */
  /* ============================================================== */
  "Brescia": [
    { name: "Brescia Centro - Carmine", lat: 45.5395, lng: 10.2175, population: 38000, municipalities: ["Centro Storico", "Carmine", "Porta Venezia"], avgPricePerSqm: 3200, ntnEstimate: 800 },
    { name: "Brescia San Polo - Buffalora", lat: 45.5280, lng: 10.2450, population: 32000, municipalities: ["San Polo", "Buffalora", "San Polo Vecchio"], avgPricePerSqm: 2000, ntnEstimate: 600 },
    { name: "Brescia Lamarmora - Sant'Eufemia", lat: 45.5200, lng: 10.2200, population: 34000, municipalities: ["Lamarmora", "Sant'Eufemia", "San Polo Parco"], avgPricePerSqm: 2200, ntnEstimate: 650 },
    { name: "Brescia Nord - Mompiano", lat: 45.5550, lng: 10.2100, population: 30000, municipalities: ["Mompiano", "Borgo Trento", "Sant'Anna", "San Bartolomeo"], avgPricePerSqm: 2600, ntnEstimate: 550 },
    { name: "Brescia Ovest - Urago", lat: 45.5400, lng: 10.1900, population: 32000, municipalities: ["Urago Mella", "Fiumicello", "Chiesanuova"], avgPricePerSqm: 1800, ntnEstimate: 500 },
    { name: "Brescia Fornaci - Don Bosco", lat: 45.5300, lng: 10.2000, population: 30000, municipalities: ["Fornaci", "Don Bosco", "Folzano", "San Polino"], avgPricePerSqm: 1900, ntnEstimate: 500 },
  ],
  "Bergamo": [
    { name: "Bergamo Citt\u00e0 Alta - Centro", lat: 45.7030, lng: 9.6690, population: 28000, municipalities: ["Citt\u00e0 Alta", "Centro", "Pignolo", "Borgo Palazzo"], avgPricePerSqm: 3500, ntnEstimate: 600 },
    { name: "Bergamo Borgo Santa Caterina - Redona", lat: 45.6980, lng: 9.6900, population: 26000, municipalities: ["Borgo Santa Caterina", "Redona", "Val d'Astino"], avgPricePerSqm: 2400, ntnEstimate: 500 },
    { name: "Bergamo Colognola - Villaggio degli Sposi", lat: 45.6850, lng: 9.6500, population: 24000, municipalities: ["Colognola", "Villaggio degli Sposi", "Grumello"], avgPricePerSqm: 2000, ntnEstimate: 450 },
    { name: "Bergamo Longuelo - Loreto", lat: 45.7100, lng: 9.6550, population: 22000, municipalities: ["Longuelo", "Loreto", "Monterosso", "Valtesse"], avgPricePerSqm: 2200, ntnEstimate: 420 },
    { name: "Bergamo Celadina - Campagnola", lat: 45.6900, lng: 9.7000, population: 22000, municipalities: ["Celadina", "Campagnola", "Boccaleone", "Malpensata"], avgPricePerSqm: 1800, ntnEstimate: 400 },
  ],
  "Monza": [
    { name: "Monza Centro - San Gerardo", lat: 45.5843, lng: 9.2743, population: 28000, municipalities: ["Centro", "San Gerardo", "Duomo", "Parco"], avgPricePerSqm: 3200, ntnEstimate: 600 },
    { name: "Monza San Rocco - Libert\u00e0", lat: 45.5800, lng: 9.2600, population: 25000, municipalities: ["San Rocco", "Libert\u00e0", "Regina Pacis"], avgPricePerSqm: 2600, ntnEstimate: 500 },
    { name: "Monza San Biagio - Cazzaniga", lat: 45.5900, lng: 9.2850, population: 24000, municipalities: ["San Biagio", "Cazzaniga", "Sant'Albino"], avgPricePerSqm: 2200, ntnEstimate: 470 },
    { name: "Monza Cederna - Cantalupo", lat: 45.5750, lng: 9.2900, population: 23000, municipalities: ["Cederna", "Cantalupo", "San Donato"], avgPricePerSqm: 2000, ntnEstimate: 440 },
    { name: "Monza Triante - San Fruttuoso", lat: 45.5700, lng: 9.2600, population: 23000, municipalities: ["Triante", "San Fruttuoso", "San Giuseppe"], avgPricePerSqm: 2400, ntnEstimate: 450 },
  ],
  "Trieste": [
    { name: "Trieste Centro - Borgo Teresiano", lat: 45.6495, lng: 13.7768, population: 45000, municipalities: ["Centro", "Borgo Teresiano", "Borgo Giuseppino", "San Giusto"], avgPricePerSqm: 2800, ntnEstimate: 700 },
    { name: "Trieste San Vito - Citt\u00e0 Vecchia", lat: 45.6450, lng: 13.7700, population: 40000, municipalities: ["San Vito", "Citt\u00e0 Vecchia", "Cavana", "Ghetto"], avgPricePerSqm: 2400, ntnEstimate: 600 },
    { name: "Trieste Barcola - Grignano", lat: 45.6700, lng: 13.7500, population: 38000, municipalities: ["Barcola", "Grignano", "Miramare", "Roiano"], avgPricePerSqm: 3000, ntnEstimate: 550 },
    { name: "Trieste Opicina - Servola", lat: 45.6800, lng: 13.7900, population: 38000, municipalities: ["Opicina", "Servola", "Borgo San Sergio", "Valmaura"], avgPricePerSqm: 1800, ntnEstimate: 480 },
    { name: "Trieste Valmaura - San Giacomo", lat: 45.6350, lng: 13.7850, population: 37000, municipalities: ["Valmaura", "San Giacomo", "Rozzol Melara", "Muggia Vecchia"], avgPricePerSqm: 1600, ntnEstimate: 450 },
  ],
  "Parma": [
    { name: "Parma Centro - Oltretorrente", lat: 44.8015, lng: 10.3280, population: 45000, municipalities: ["Centro Storico", "Oltretorrente", "Duomo", "Pilotta"], avgPricePerSqm: 3000, ntnEstimate: 750 },
    { name: "Parma Cittadella - San Leonardo", lat: 44.8100, lng: 10.3450, population: 40000, municipalities: ["Cittadella", "San Leonardo", "Stazione"], avgPricePerSqm: 2200, ntnEstimate: 620 },
    { name: "Parma Molinetto - Montanara", lat: 44.7900, lng: 10.3100, population: 38000, municipalities: ["Molinetto", "Montanara", "Paradigna"], avgPricePerSqm: 1800, ntnEstimate: 550 },
    { name: "Parma San Lazzaro - Lubiana", lat: 44.8050, lng: 10.3600, population: 38000, municipalities: ["San Lazzaro", "Lubiana", "Campus", "Ospedale"], avgPricePerSqm: 2000, ntnEstimate: 530 },
    { name: "Parma Pablo - Due Torri", lat: 44.7850, lng: 10.3400, population: 37000, municipalities: ["Pablo", "Due Torri", "San Pancrazio", "Corcagnano"], avgPricePerSqm: 1600, ntnEstimate: 500 },
  ],
  "Modena": [
    { name: "Modena Centro Storico", lat: 44.6471, lng: 10.9254, population: 42000, municipalities: ["Centro Storico", "Duomo", "Ghirlandina", "Piazza Grande"], avgPricePerSqm: 2800, ntnEstimate: 720 },
    { name: "Modena Madonnina - Quattro Ville", lat: 44.6550, lng: 10.9450, population: 38000, municipalities: ["Madonnina", "Quattro Ville", "Crocetta"], avgPricePerSqm: 2000, ntnEstimate: 580 },
    { name: "Modena Buon Pastore - Sant'Agnese", lat: 44.6400, lng: 10.9100, population: 36000, municipalities: ["Buon Pastore", "Sant'Agnese", "San Lazzaro"], avgPricePerSqm: 2200, ntnEstimate: 560 },
    { name: "Modena San Faustino - Saliceta", lat: 44.6350, lng: 10.9400, population: 35000, municipalities: ["San Faustino", "Saliceta San Giuliano", "Baggiovara"], avgPricePerSqm: 1700, ntnEstimate: 500 },
    { name: "Modena Villaggio Giardino - Sacca", lat: 44.6600, lng: 10.9100, population: 34000, municipalities: ["Villaggio Giardino", "Sacca", "San Cataldo", "Collegara"], avgPricePerSqm: 1900, ntnEstimate: 480 },
  ],
  "Reggio Emilia": [
    { name: "Reggio Emilia Centro - Cittadella", lat: 44.6973, lng: 10.6312, population: 40000, municipalities: ["Centro", "Cittadella", "San Prospero", "Piazza Prampolini"], avgPricePerSqm: 2600, ntnEstimate: 680 },
    { name: "Reggio Emilia Ospizio - San Pellegrino", lat: 44.6900, lng: 10.6500, population: 35000, municipalities: ["Ospizio", "San Pellegrino", "Stazione"], avgPricePerSqm: 1800, ntnEstimate: 520 },
    { name: "Reggio Emilia Masone - Canalina", lat: 44.6850, lng: 10.6100, population: 33000, municipalities: ["Masone", "Canalina", "Rosta Nuova"], avgPricePerSqm: 1600, ntnEstimate: 480 },
    { name: "Reggio Emilia Rivalta - Codemondo", lat: 44.7050, lng: 10.6000, population: 32000, municipalities: ["Rivalta", "Codemondo", "San Maurizio"], avgPricePerSqm: 1500, ntnEstimate: 440 },
    { name: "Reggio Emilia Pieve Modolena - Mancasale", lat: 44.7100, lng: 10.6500, population: 31000, municipalities: ["Pieve Modolena", "Mancasale", "Gavasseto"], avgPricePerSqm: 1400, ntnEstimate: 420 },
  ],
  "Ravenna": [
    { name: "Ravenna Centro - Darsena", lat: 44.4175, lng: 12.1996, population: 45000, municipalities: ["Centro Storico", "Darsena", "San Vitale", "Porta Adriana"], avgPricePerSqm: 2400, ntnEstimate: 620 },
    { name: "Ravenna San Biagio - Ponte Nuovo", lat: 44.4300, lng: 12.2200, population: 40000, municipalities: ["San Biagio", "Ponte Nuovo", "Fornace Zarattini"], avgPricePerSqm: 1600, ntnEstimate: 500 },
    { name: "Ravenna Marina - Lido", lat: 44.4400, lng: 12.2800, population: 38000, municipalities: ["Marina di Ravenna", "Punta Marina", "Lido Adriano", "Lido di Dante"], avgPricePerSqm: 2000, ntnEstimate: 550 },
    { name: "Ravenna Classe - Porto Fuori", lat: 44.3900, lng: 12.2200, population: 35000, municipalities: ["Classe", "Porto Fuori", "San Zaccaria", "Fosso Ghiaia"], avgPricePerSqm: 1400, ntnEstimate: 420 },
  ],
  "Rimini": [
    { name: "Rimini Centro - Marina Centro", lat: 44.0593, lng: 12.5681, population: 42000, municipalities: ["Centro Storico", "Marina Centro", "Borgo San Giuliano", "San Giuliano Mare"], avgPricePerSqm: 3000, ntnEstimate: 650 },
    { name: "Rimini Miramare - Rivazzurra", lat: 44.0350, lng: 12.5800, population: 38000, municipalities: ["Miramare", "Rivazzurra", "Marebello", "Bellariva"], avgPricePerSqm: 2400, ntnEstimate: 550 },
    { name: "Rimini Viserba - Torre Pedrera", lat: 44.0850, lng: 12.5500, population: 36000, municipalities: ["Viserba", "Torre Pedrera", "Viserbella", "Rivabella"], avgPricePerSqm: 2200, ntnEstimate: 500 },
    { name: "Rimini San Giuliano - Celle", lat: 44.0600, lng: 12.5400, population: 34000, municipalities: ["San Giuliano", "Celle", "Vergiano", "Spadarolo"], avgPricePerSqm: 1800, ntnEstimate: 450 },
  ],
  "Livorno": [
    { name: "Livorno Centro - Venezia", lat: 43.5485, lng: 10.3106, population: 45000, municipalities: ["Centro", "Venezia", "Pontino", "Piazza Grande"], avgPricePerSqm: 2400, ntnEstimate: 600 },
    { name: "Livorno Ardenza - Antignano", lat: 43.5300, lng: 10.3200, population: 38000, municipalities: ["Ardenza", "Antignano", "Montenero", "Quercianella"], avgPricePerSqm: 2800, ntnEstimate: 520 },
    { name: "Livorno Coteto - Fiorentina", lat: 43.5600, lng: 10.3250, population: 38000, municipalities: ["Coteto", "Fiorentina", "Leccia", "Scopaia"], avgPricePerSqm: 1600, ntnEstimate: 470 },
    { name: "Livorno Collinaia - Salviano", lat: 43.5550, lng: 10.2900, population: 34000, municipalities: ["Collinaia", "Salviano", "Corea", "Shangai"], avgPricePerSqm: 1400, ntnEstimate: 420 },
  ],
  "Foggia": [
    { name: "Foggia Centro - Arpi", lat: 41.4622, lng: 15.5446, population: 42000, municipalities: ["Centro", "Arpi", "Via Manzoni", "Corso Roma"], avgPricePerSqm: 1400, ntnEstimate: 520 },
    { name: "Foggia CEP - Villaggio Artigiani", lat: 41.4700, lng: 15.5600, population: 38000, municipalities: ["CEP", "Villaggio Artigiani", "Salice"], avgPricePerSqm: 900, ntnEstimate: 400 },
    { name: "Foggia Ordona Sud - Candelaro", lat: 41.4500, lng: 15.5300, population: 35000, municipalities: ["Ordona Sud", "Candelaro", "Rione Martucci"], avgPricePerSqm: 1000, ntnEstimate: 380 },
    { name: "Foggia San Lorenzo - Incoronata", lat: 41.4550, lng: 15.5650, population: 32000, municipalities: ["San Lorenzo", "Incoronata", "Borgo Croci"], avgPricePerSqm: 1100, ntnEstimate: 350 },
  ],
  "Ferrara": [
    { name: "Ferrara Centro Storico - Arianuova", lat: 44.8381, lng: 11.6198, population: 38000, municipalities: ["Centro Storico", "Arianuova", "Giardino", "Castello"], avgPricePerSqm: 2200, ntnEstimate: 520 },
    { name: "Ferrara Barco - Pontelagoscuro", lat: 44.8600, lng: 11.6000, population: 32000, municipalities: ["Barco", "Pontelagoscuro", "Francolino"], avgPricePerSqm: 1400, ntnEstimate: 380 },
    { name: "Ferrara Gad - Giardino", lat: 44.8350, lng: 11.6400, population: 32000, municipalities: ["Gad", "Giardino", "Via Bologna", "Doro"], avgPricePerSqm: 1600, ntnEstimate: 400 },
    { name: "Ferrara Porotto - Mizzana", lat: 44.8300, lng: 11.5800, population: 28000, municipalities: ["Porotto", "Mizzana", "Cassana", "Boara"], avgPricePerSqm: 1200, ntnEstimate: 340 },
  ],
  "Latina": [
    { name: "Latina Centro", lat: 41.4673, lng: 12.9035, population: 38000, municipalities: ["Centro", "Piazza del Popolo", "Via Emanuele Filiberto"], avgPricePerSqm: 2000, ntnEstimate: 480 },
    { name: "Latina Borgo Piave - Q4", lat: 41.4750, lng: 12.9200, population: 32000, municipalities: ["Borgo Piave", "Q4", "Q5", "Piccarello"], avgPricePerSqm: 1500, ntnEstimate: 380 },
    { name: "Latina Scalo - Tor Tre Ponti", lat: 41.4900, lng: 12.9100, population: 30000, municipalities: ["Latina Scalo", "Tor Tre Ponti", "Borgo Bainsizza"], avgPricePerSqm: 1300, ntnEstimate: 350 },
    { name: "Latina Borgo Grappa - Borgo Sabotino", lat: 41.4500, lng: 12.8800, population: 27000, municipalities: ["Borgo Grappa", "Borgo Sabotino", "Foce Verde", "Borgo Montello"], avgPricePerSqm: 1400, ntnEstimate: 320 },
  ],
  "Salerno": [
    { name: "Salerno Centro - Porto", lat: 40.6824, lng: 14.7681, population: 38000, municipalities: ["Centro", "Porto", "Corso Vittorio Emanuele", "Lungomare"], avgPricePerSqm: 2400, ntnEstimate: 500 },
    { name: "Salerno Mercatello - Torrione", lat: 40.6750, lng: 14.7800, population: 34000, municipalities: ["Mercatello", "Torrione", "Pastena Alta"], avgPricePerSqm: 1800, ntnEstimate: 420 },
    { name: "Salerno Pastena - Ogliara", lat: 40.6650, lng: 14.7900, population: 30000, municipalities: ["Pastena", "Ogliara", "Brignano", "Rufoli"], avgPricePerSqm: 1500, ntnEstimate: 370 },
    { name: "Salerno Fratte - Industriale", lat: 40.6900, lng: 14.7550, population: 26000, municipalities: ["Fratte", "Industriale", "Mercatello Nord", "Irno"], avgPricePerSqm: 1200, ntnEstimate: 320 },
  ],
  "Prato": [
    { name: "Prato Centro - Santa Trinita", lat: 43.8800, lng: 11.0966, population: 45000, municipalities: ["Centro", "Santa Trinita", "Piazza del Mercato", "Piazza Duomo"], avgPricePerSqm: 2600, ntnEstimate: 700 },
    { name: "Prato San Paolo - Soccorso", lat: 43.8850, lng: 11.1100, population: 40000, municipalities: ["San Paolo", "Soccorso", "Pietà", "Villanuova"], avgPricePerSqm: 1800, ntnEstimate: 560 },
    { name: "Prato Galciana - Iolo", lat: 43.8650, lng: 11.0800, population: 38000, municipalities: ["Galciana", "Iolo", "Tavola", "Cafaggio"], avgPricePerSqm: 1500, ntnEstimate: 500 },
    { name: "Prato Narnali - Fontanelle", lat: 43.8900, lng: 11.0750, population: 36000, municipalities: ["Narnali", "Fontanelle", "Figline", "Coiano"], avgPricePerSqm: 1600, ntnEstimate: 480 },
    { name: "Prato Mezzana - Tobbiana", lat: 43.8700, lng: 11.1200, population: 36000, municipalities: ["Mezzana", "Tobbiana", "Grignano", "Paperino"], avgPricePerSqm: 1400, ntnEstimate: 450 },
  ],
  // Citta 100k-200k con neighborhoods ma gia gestite sopra come >200k in realta:
  // Taranto, Reggio Calabria, Perugia, Terni, Pescara, Siracusa, Cagliari, Sassari,
  // Forli, Piacenza, Trento, Bolzano, Vicenza
  "Taranto": [
    { name: "Taranto Centro - Borgo", lat: 40.4764, lng: 17.2292, population: 50000, municipalities: ["Centro", "Borgo", "Citt\u00e0 Vecchia", "Porta Napoli"], avgPricePerSqm: 1200, ntnEstimate: 600 },
    { name: "Taranto Paolo VI - Tamburi", lat: 40.4900, lng: 17.2100, population: 50000, municipalities: ["Paolo VI", "Tamburi", "Lido Azzurro"], avgPricePerSqm: 700, ntnEstimate: 450 },
    { name: "Taranto Italia - Montegranaro", lat: 40.4650, lng: 17.2450, population: 45000, municipalities: ["Italia", "Montegranaro", "Salinella", "Solito"], avgPricePerSqm: 1000, ntnEstimate: 500 },
    { name: "Taranto Talsano - San Vito", lat: 40.4400, lng: 17.2600, population: 44000, municipalities: ["Talsano", "San Vito", "Lama", "Leporano Marina"], avgPricePerSqm: 1100, ntnEstimate: 480 },
  ],
  "Reggio Calabria": [
    { name: "Reggio Calabria Centro", lat: 38.1112, lng: 15.6473, population: 45000, municipalities: ["Centro", "Lungomare", "Corso Garibaldi", "Pineta Zerbi"], avgPricePerSqm: 1400, ntnEstimate: 550 },
    { name: "Reggio Calabria Nord - Sbarre", lat: 38.1250, lng: 15.6600, population: 42000, municipalities: ["Sbarre", "Vito", "Ravagnese", "San Brunello"], avgPricePerSqm: 1000, ntnEstimate: 450 },
    { name: "Reggio Calabria Sud - Pellaro", lat: 38.0850, lng: 15.6600, population: 42000, municipalities: ["Pellaro", "Bocale", "Lazzaro", "Saracinello"], avgPricePerSqm: 900, ntnEstimate: 400 },
    { name: "Reggio Calabria Collina - Pentimele", lat: 38.1200, lng: 15.6300, population: 41000, municipalities: ["Pentimele", "Gallico", "Catona", "Archi"], avgPricePerSqm: 800, ntnEstimate: 380 },
  ],
  "Perugia": [
    { name: "Perugia Centro - Acropoli", lat: 43.1107, lng: 12.3908, population: 40000, municipalities: ["Centro Storico", "Acropoli", "Porta Sole", "Porta Eburnea"], avgPricePerSqm: 2400, ntnEstimate: 600 },
    { name: "Perugia Elce - Monteluce", lat: 43.1200, lng: 12.4000, population: 38000, municipalities: ["Elce", "Monteluce", "Universit\u00e0", "Pallotta"], avgPricePerSqm: 2000, ntnEstimate: 520 },
    { name: "Perugia Ponte San Giovanni", lat: 43.0900, lng: 12.4300, population: 35000, municipalities: ["Ponte San Giovanni", "Collestrada", "Balanzano"], avgPricePerSqm: 1400, ntnEstimate: 450 },
    { name: "Perugia San Sisto - Madonna Alta", lat: 43.0850, lng: 12.3700, population: 28000, municipalities: ["San Sisto", "Madonna Alta", "Lacugnano"], avgPricePerSqm: 1500, ntnEstimate: 400 },
    { name: "Perugia Fontivegge - Ferro di Cavallo", lat: 43.1050, lng: 12.3750, population: 23000, municipalities: ["Fontivegge", "Ferro di Cavallo", "Stazione"], avgPricePerSqm: 1600, ntnEstimate: 380 },
  ],
  "Terni": [
    { name: "Terni Centro", lat: 42.5636, lng: 12.6427, population: 30000, municipalities: ["Centro Storico", "Corso Tacito", "Piazza Tacito"], avgPricePerSqm: 1600, ntnEstimate: 420 },
    { name: "Terni Borgo Rivo - Campomicciolo", lat: 42.5750, lng: 12.6300, population: 28000, municipalities: ["Borgo Rivo", "Campomicciolo", "Le Grazie"], avgPricePerSqm: 1200, ntnEstimate: 350 },
    { name: "Terni Cesi - Piedimonte", lat: 42.5800, lng: 12.6600, population: 26000, municipalities: ["Cesi", "Piedimonte", "Papigno"], avgPricePerSqm: 1000, ntnEstimate: 300 },
    { name: "Terni Polymer - San Giovanni", lat: 42.5500, lng: 12.6500, population: 25000, municipalities: ["Polymer", "San Giovanni", "Sabbione", "Maratta"], avgPricePerSqm: 1100, ntnEstimate: 320 },
  ],
  "Pescara": [
    { name: "Pescara Centro - Lungomare", lat: 42.4612, lng: 14.2111, population: 35000, municipalities: ["Centro", "Lungomare", "Piazza Salotto", "Porto"], avgPricePerSqm: 2200, ntnEstimate: 550 },
    { name: "Pescara Nord - Montesilvano confine", lat: 42.4750, lng: 14.2000, population: 30000, municipalities: ["Pescara Nord", "Fontanelle", "Zanni"], avgPricePerSqm: 1800, ntnEstimate: 450 },
    { name: "Pescara Porta Nuova - Tribunale", lat: 42.4550, lng: 14.2200, population: 28000, municipalities: ["Porta Nuova", "Tribunale", "Via Firenze"], avgPricePerSqm: 1600, ntnEstimate: 400 },
    { name: "Pescara Colli - San Silvestro", lat: 42.4450, lng: 14.1900, population: 26000, municipalities: ["Colli", "San Silvestro", "Rancitelli", "Villa del Fuoco"], avgPricePerSqm: 1400, ntnEstimate: 370 },
  ],
  "Siracusa": [
    { name: "Siracusa Ortigia - Centro", lat: 37.0596, lng: 15.2930, population: 30000, municipalities: ["Ortigia", "Centro", "Porto Grande", "Duomo"], avgPricePerSqm: 2000, ntnEstimate: 450 },
    { name: "Siracusa Tyche - Neapolis", lat: 37.0700, lng: 15.2800, population: 30000, municipalities: ["Tyche", "Neapolis", "Teatro Greco", "Acradina"], avgPricePerSqm: 1400, ntnEstimate: 380 },
    { name: "Siracusa Cassibile - Fontane Bianche", lat: 37.0200, lng: 15.2200, population: 30000, municipalities: ["Cassibile", "Fontane Bianche", "Arenella"], avgPricePerSqm: 1600, ntnEstimate: 350 },
    { name: "Siracusa Santa Panagia - Scala Greca", lat: 37.0800, lng: 15.3100, population: 28000, municipalities: ["Santa Panagia", "Scala Greca", "Belvedere", "Borgata"], avgPricePerSqm: 1000, ntnEstimate: 320 },
  ],
  "Cagliari": [
    { name: "Cagliari Centro - Castello", lat: 39.2238, lng: 9.1217, population: 40000, municipalities: ["Castello", "Marina", "Stampace", "Villanova"], avgPricePerSqm: 2400, ntnEstimate: 550 },
    { name: "Cagliari Poetto - Quartiere del Sole", lat: 39.2100, lng: 9.1600, population: 38000, municipalities: ["Poetto", "Quartiere del Sole", "Margine Rosso"], avgPricePerSqm: 2800, ntnEstimate: 480 },
    { name: "Cagliari Is Mirrionis - San Michele", lat: 39.2300, lng: 9.1050, population: 38000, municipalities: ["Is Mirrionis", "San Michele", "La Vega"], avgPricePerSqm: 1400, ntnEstimate: 400 },
    { name: "Cagliari Pirri - Monreale", lat: 39.2400, lng: 9.1300, population: 34000, municipalities: ["Pirri", "Monreale", "Mulinu Becciu"], avgPricePerSqm: 1200, ntnEstimate: 370 },
  ],
  "Sassari": [
    { name: "Sassari Centro", lat: 40.7267, lng: 8.5592, population: 35000, municipalities: ["Centro", "Corso Vittorio Emanuele", "Piazza Italia"], avgPricePerSqm: 1800, ntnEstimate: 450 },
    { name: "Sassari Li Punti - Luna e Sole", lat: 40.7400, lng: 8.5400, population: 32000, municipalities: ["Li Punti", "Luna e Sole", "Monte Rosello"], avgPricePerSqm: 1400, ntnEstimate: 380 },
    { name: "Sassari Latte Dolce - Santa Maria", lat: 40.7200, lng: 8.5700, population: 30000, municipalities: ["Latte Dolce", "Santa Maria di Pisa", "Carbonazzi"], avgPricePerSqm: 1000, ntnEstimate: 320 },
    { name: "Sassari Platamona - Fertilia", lat: 40.7500, lng: 8.5200, population: 28000, municipalities: ["Platamona", "Fertilia", "Ottava", "Bancali"], avgPricePerSqm: 1200, ntnEstimate: 300 },
  ],
  "Forl\u00ec": [
    { name: "Forl\u00ec Centro", lat: 44.2227, lng: 12.0409, population: 35000, municipalities: ["Centro", "San Mercuriale", "Piazza Saffi"], avgPricePerSqm: 2000, ntnEstimate: 480 },
    { name: "Forl\u00ec Romiti - Cava", lat: 44.2350, lng: 12.0300, population: 30000, municipalities: ["Romiti", "Cava", "San Martino in Strada"], avgPricePerSqm: 1400, ntnEstimate: 380 },
    { name: "Forl\u00ec Coriano - Ospedaletto", lat: 44.2100, lng: 12.0550, population: 28000, municipalities: ["Coriano", "Ospedaletto", "Villa Selva"], avgPricePerSqm: 1200, ntnEstimate: 340 },
    { name: "Forl\u00ec San Benedetto - Foro Boario", lat: 44.2150, lng: 12.0250, population: 24000, municipalities: ["San Benedetto", "Foro Boario", "Vecchiazzano"], avgPricePerSqm: 1500, ntnEstimate: 320 },
  ],
  "Piacenza": [
    { name: "Piacenza Centro", lat: 45.0526, lng: 9.6930, population: 30000, municipalities: ["Centro", "Piazza Cavalli", "Duomo", "Corso Vittorio Emanuele"], avgPricePerSqm: 2200, ntnEstimate: 450 },
    { name: "Piacenza Besurica - Farnesiana", lat: 45.0600, lng: 9.7100, population: 26000, municipalities: ["Besurica", "Farnesiana", "Belvedere"], avgPricePerSqm: 1500, ntnEstimate: 350 },
    { name: "Piacenza Borgotrebbia - Barriera Genova", lat: 45.0450, lng: 9.6800, population: 24000, municipalities: ["Borgotrebbia", "Barriera Genova", "Montale"], avgPricePerSqm: 1300, ntnEstimate: 320 },
    { name: "Piacenza San Lazzaro - Stadio", lat: 45.0400, lng: 9.7050, population: 23000, municipalities: ["San Lazzaro", "Stadio", "Clinica", "Infrangibile"], avgPricePerSqm: 1400, ntnEstimate: 310 },
  ],
  "Trento": [
    { name: "Trento Centro", lat: 46.0748, lng: 11.1217, population: 35000, municipalities: ["Centro", "Duomo", "Piazza Fiera", "Portaquila"], avgPricePerSqm: 3200, ntnEstimate: 500 },
    { name: "Trento Gardolo - Meano", lat: 46.1000, lng: 11.1100, population: 30000, municipalities: ["Gardolo", "Meano", "Spini di Gardolo"], avgPricePerSqm: 2200, ntnEstimate: 380 },
    { name: "Trento Bondone - Sardagna", lat: 46.0600, lng: 11.1000, population: 28000, municipalities: ["Bondone", "Sardagna", "Sopramonte", "Cadine"], avgPricePerSqm: 2600, ntnEstimate: 350 },
    { name: "Trento Mattarello - Ravina", lat: 46.0450, lng: 11.1300, population: 27000, municipalities: ["Mattarello", "Ravina", "Romagnano", "Villazzano"], avgPricePerSqm: 2400, ntnEstimate: 340 },
  ],
  "Bolzano": [
    { name: "Bolzano Centro", lat: 46.4983, lng: 11.3548, population: 32000, municipalities: ["Centro", "Piazza Walther", "Via dei Portici", "Duomo"], avgPricePerSqm: 4000, ntnEstimate: 480 },
    { name: "Bolzano Gries - San Quirino", lat: 46.4900, lng: 11.3400, population: 28000, municipalities: ["Gries", "San Quirino", "Moritzing"], avgPricePerSqm: 3500, ntnEstimate: 400 },
    { name: "Bolzano Don Bosco - Europa", lat: 46.5050, lng: 11.3700, population: 26000, municipalities: ["Don Bosco", "Europa", "Firmian", "Casanova"], avgPricePerSqm: 2800, ntnEstimate: 360 },
    { name: "Bolzano Oltrisarco - Aslago", lat: 46.4850, lng: 11.3650, population: 22000, municipalities: ["Oltrisarco", "Aslago", "Rencio", "Colle"], avgPricePerSqm: 3000, ntnEstimate: 320 },
  ],
  "Vicenza": [
    { name: "Vicenza Centro", lat: 45.5455, lng: 11.5354, population: 32000, municipalities: ["Centro", "Piazza dei Signori", "Corso Palladio", "Basilica"], avgPricePerSqm: 2600, ntnEstimate: 480 },
    { name: "Vicenza Bertesinella - San Pio X", lat: 45.5350, lng: 11.5500, population: 28000, municipalities: ["Bertesinella", "San Pio X", "Sant'Andrea"], avgPricePerSqm: 1800, ntnEstimate: 380 },
    { name: "Vicenza Laghetto - Anconetta", lat: 45.5550, lng: 11.5200, population: 26000, municipalities: ["Laghetto", "Anconetta", "Campedello"], avgPricePerSqm: 2000, ntnEstimate: 350 },
    { name: "Vicenza Maddalene - Polegge", lat: 45.5600, lng: 11.5500, population: 26000, municipalities: ["Maddalene", "Polegge", "Ospedaletto", "Guerra"], avgPricePerSqm: 1600, ntnEstimate: 330 },
  ],
};

/* ------------------------------------------------------------------ */
/*  Genera slug univoco                                                */
/* ------------------------------------------------------------------ */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ------------------------------------------------------------------ */
/*  Auto-split per citta 50k-100k (URBANA sub-zone)                   */
/* ------------------------------------------------------------------ */

interface AutoSplitZone {
  name: string;
  latOffset: number;
  lngOffset: number;
  populationShare: number; // fraction of total
  priceFactor: number;     // multiplier on base price
}

/**
 * Generate 2-4 URBANA sub-zones for cities between 50k and 100k.
 * - 50k-70k: 2 zones (Centro, Periferia)
 * - 70k-100k: 3 zones (Centro, Nord/Ovest, Sud/Est)
 */
function getAutoSplitZones(population: number): AutoSplitZone[] {
  if (population < 70000) {
    // 2 zones
    return [
      { name: "Centro", latOffset: 0, lngOffset: 0, populationShare: 0.4, priceFactor: 1.4 },
      { name: "Periferia", latOffset: -0.01, lngOffset: 0.01, populationShare: 0.6, priceFactor: 0.8 },
    ];
  } else {
    // 3 zones
    return [
      { name: "Centro", latOffset: 0, lngOffset: 0, populationShare: 0.4, priceFactor: 1.4 },
      { name: "Nord-Ovest", latOffset: 0.01, lngOffset: -0.01, populationShare: 0.3, priceFactor: 0.85 },
      { name: "Sud-Est", latOffset: -0.01, lngOffset: 0.01, populationShare: 0.3, priceFactor: 0.8 },
    ];
  }
}

/* ------------------------------------------------------------------ */
/*  Creazione zone nel database                                        */
/* ------------------------------------------------------------------ */

async function createZones(comuni: ComuneData[]) {
  const byProvince = new Map<string, ComuneData[]>();
  for (const c of comuni) {
    const list = byProvince.get(c.province) || [];
    list.push(c);
    byProvince.set(c.province, list);
  }

  let created = 0;
  let clustered = 0;

  for (const [province, provinceComuni] of byProvince) {
    const region = PROVINCE_TO_REGION[province] || "Sconosciuta";

    // Separa per fascia (nuovi threshold V2)
    const comuniGrandi = provinceComuni.filter((c) => c.population >= 200000);       // PREMIUM (>200k) — quartieri definiti
    const comuniGrandiMed = provinceComuni.filter((c) => c.population >= 100000 && c.population < 200000); // PREMIUM (100k-200k) — quartieri definiti
    const comuniMediGrandi = provinceComuni.filter((c) => c.population >= 50000 && c.population < 100000); // URBANA auto-split (50k-100k)
    const comuniMedi = provinceComuni.filter((c) => c.population >= 20000 && c.population < 50000);  // URBANA singolo
    const comuniPiccoli5k = provinceComuni.filter((c) => c.population >= 5000 && c.population < 20000);  // BASE singolo
    const comuniMicro = provinceComuni.filter((c) => c.population < 5000);  // BASE cluster (5km)

    // ─── Grandi citta (>200k): PREMIUM con quartieri ───
    for (const c of comuniGrandi) {
      const neighborhoods = CITY_NEIGHBORHOODS[c.name];

      if (neighborhoods && neighborhoods.length > 0) {
        console.log(`  \u21b3 ${c.name}: split in ${neighborhoods.length} quartieri (>200k)`);
        for (const hood of neighborhoods) {
          const slug = slugify(`${hood.name}-${province}`);
          const score = calculateMarketScore(hood.population, hood.ntnEstimate);
          const pricing = calculateZonePrice("PREMIUM", hood.population, hood.ntnEstimate, hood.avgPricePerSqm);
          await upsertZone({
            name: hood.name,
            slug,
            zoneClass: "PREMIUM",
            region,
            province,
            city: c.name,
            municipalities: hood.municipalities,
            population: hood.population,
            marketScore: score,
            lat: hood.lat,
            lng: hood.lng,
            monthlyPrice: pricing.monthlyPrice,
            maxAgencies: pricing.maxAgencies,
            avgPricePerSqm: hood.avgPricePerSqm,
            ntn: hood.ntnEstimate,
          });
          created++;
        }
      } else {
        // Citta senza quartieri definiti: zona singola PREMIUM
        const slug = slugify(`${c.name}-${province}`);
        const score = calculateMarketScore(c.population, c.population * 0.015);
        const pricing = calculateZonePrice("PREMIUM", c.population, c.population * 0.015);
        const coords = await geocode(`${c.name}, ${province}, Italia`);
        await upsertZone({
          name: c.name,
          slug,
          zoneClass: "PREMIUM",
          region,
          province,
          city: c.name,
          municipalities: [c.name],
          population: c.population,
          marketScore: score,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          monthlyPrice: pricing.monthlyPrice,
          maxAgencies: pricing.maxAgencies,
        });
        created++;
      }
    }

    // ─── Citta medio-grandi (100k-200k): PREMIUM con quartieri ───
    for (const c of comuniGrandiMed) {
      const neighborhoods = CITY_NEIGHBORHOODS[c.name];

      if (neighborhoods && neighborhoods.length > 0) {
        console.log(`  \u21b3 ${c.name}: split in ${neighborhoods.length} quartieri (100k-200k)`);
        for (const hood of neighborhoods) {
          const slug = slugify(`${hood.name}-${province}`);
          const score = calculateMarketScore(hood.population, hood.ntnEstimate);
          const pricing = calculateZonePrice("PREMIUM", hood.population, hood.ntnEstimate, hood.avgPricePerSqm);
          await upsertZone({
            name: hood.name,
            slug,
            zoneClass: "PREMIUM",
            region,
            province,
            city: c.name,
            municipalities: hood.municipalities,
            population: hood.population,
            marketScore: score,
            lat: hood.lat,
            lng: hood.lng,
            monthlyPrice: pricing.monthlyPrice,
            maxAgencies: pricing.maxAgencies,
            avgPricePerSqm: hood.avgPricePerSqm,
            ntn: hood.ntnEstimate,
          });
          created++;
        }
      } else {
        // Citta 100k-200k senza quartieri definiti: zona singola PREMIUM
        console.log(`  \u26a0 ${c.name} (${c.population}): nessun quartiere definito, zona singola PREMIUM`);
        const slug = slugify(`${c.name}-${province}`);
        const score = calculateMarketScore(c.population, c.population * 0.012);
        const pricing = calculateZonePrice("PREMIUM", c.population, c.population * 0.012);
        const coords = await geocode(`${c.name}, ${province}, Italia`);
        await upsertZone({
          name: c.name,
          slug,
          zoneClass: "PREMIUM",
          region,
          province,
          city: c.name,
          municipalities: [c.name],
          population: c.population,
          marketScore: score,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          monthlyPrice: pricing.monthlyPrice,
          maxAgencies: pricing.maxAgencies,
        });
        created++;
      }
    }

    // ─── Citta medio-grandi (50k-100k): URBANA auto-split 2-4 sub-zone ───
    for (const c of comuniMediGrandi) {
      const coords = await geocode(`${c.name}, ${province}, Italia`);
      const baseLat = coords?.lat ?? 0;
      const baseLng = coords?.lng ?? 0;

      // Estimate base price per sqm based on region
      let basePricePerSqm = 1800;
      if (["Lombardia", "Veneto", "Emilia-Romagna", "Trentino-Alto Adige", "Friuli Venezia Giulia", "Liguria", "Piemonte"].includes(region)) {
        basePricePerSqm = 2200;
      } else if (["Toscana", "Lazio", "Umbria", "Marche"].includes(region)) {
        basePricePerSqm = 2000;
      } else if (["Campania", "Puglia", "Calabria", "Sicilia", "Sardegna", "Basilicata", "Molise", "Abruzzo"].includes(region)) {
        basePricePerSqm = 1400;
      }

      const splits = getAutoSplitZones(c.population);
      console.log(`  \u21b3 ${c.name}: auto-split in ${splits.length} sub-zone URBANA (50k-100k)`);

      for (const split of splits) {
        const subName = `${c.name} ${split.name}`;
        const subPop = Math.round(c.population * split.populationShare);
        const subPrice = Math.round(basePricePerSqm * split.priceFactor);
        const subNtn = Math.round(subPop * 0.01);
        const subLat = baseLat + split.latOffset;
        const subLng = baseLng + split.lngOffset;

        const slug = slugify(`${subName}-${province}`);
        const score = calculateMarketScore(subPop, subNtn);
        const pricing = calculateZonePrice("URBANA", subPop, subNtn, subPrice);

        await upsertZone({
          name: subName,
          slug,
          zoneClass: "URBANA",
          region,
          province,
          city: c.name,
          municipalities: [split.name],
          population: subPop,
          marketScore: score,
          lat: subLat || null,
          lng: subLng || null,
          monthlyPrice: pricing.monthlyPrice,
          maxAgencies: pricing.maxAgencies,
          avgPricePerSqm: subPrice,
          ntn: subNtn,
        });
        created++;
      }
    }

    // ─── Comuni medi (20k-50k): URBANA singolo ───
    for (const c of comuniMedi) {
      const slug = slugify(`${c.name}-${province}`);
      const score = calculateMarketScore(c.population, c.population * 0.01);
      const pricing = calculateZonePrice("URBANA", c.population, c.population * 0.01);
      const coords = await geocode(`${c.name}, ${province}, Italia`);

      await upsertZone({
        name: c.name,
        slug,
        zoneClass: "URBANA",
        region,
        province,
        city: c.name,
        municipalities: [c.name],
        population: c.population,
        marketScore: score,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        monthlyPrice: pricing.monthlyPrice,
        maxAgencies: pricing.maxAgencies,
      });
      created++;
    }

    // ─── Comuni piccoli (5k-20k): BASE singolo ───
    for (const c of comuniPiccoli5k) {
      const slug = slugify(`${c.name}-${province}`);
      const score = calculateMarketScore(c.population, c.population * 0.01);
      const pricing = calculateZonePrice("BASE", c.population, c.population * 0.01);
      const coords = await geocode(`${c.name}, ${province}, Italia`);

      await upsertZone({
        name: c.name,
        slug,
        zoneClass: "BASE",
        region,
        province,
        city: c.name,
        municipalities: [c.name],
        population: c.population,
        marketScore: score,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        monthlyPrice: pricing.monthlyPrice,
        maxAgencies: pricing.maxAgencies,
      });
      created++;
    }

    // ─── Comuni micro (<5k): BASE cluster — raggruppamento GEOGRAFICO (5km) ───
    if (comuniMicro.length > 0) {
      // Step 1: Geocodifica tutti i micro comuni per avere coordinate
      const geoComuni: Array<ComuneData & { lat: number; lng: number }> = [];
      const noGeoComuni: ComuneData[] = [];

      for (const c of comuniMicro) {
        const coords = await geocode(`${c.name}, ${province}, Italia`);
        if (coords) {
          geoComuni.push({ ...c, ...coords });
        } else {
          noGeoComuni.push(c);
        }
      }

      // Step 2: Clustering geografico (greedy nearest-neighbor, 5km max)
      const clusters = clusterByProximity(geoComuni, 5000, 20000);

      // Aggiungi comuni senza coordinate al cluster piu vicino o creane uno nuovo
      if (noGeoComuni.length > 0) {
        if (clusters.length > 0) {
          // Aggiungi al primo cluster della provincia
          for (const c of noGeoComuni) {
            clusters[0].push({ ...c, lat: clusters[0][0].lat, lng: clusters[0][0].lng });
          }
        } else {
          // Nessun cluster geocodificato — crea un cluster unico
          const fallbackCluster = noGeoComuni.map((c) => ({ ...c, lat: 0, lng: 0 }));
          clusters.push(fallbackCluster);
        }
      }

      // Step 3: Crea zone per ogni cluster
      for (let i = 0; i < clusters.length; i++) {
        const chunk = clusters[i];
        const totalPop = chunk.reduce((s, c) => s + c.population, 0);
        const names = chunk.map((c) => c.name);

        // Trova il comune piu grande del cluster per il nome
        const biggest = chunk.reduce((a, b) => (a.population > b.population ? a : b));
        const clusterName =
          chunk.length === 1
            ? chunk[0].name
            : `Area ${biggest.name}`;

        const slug = slugify(`area-${biggest.name}-${province}`);
        const score = calculateMarketScore(totalPop, totalPop * 0.005);
        const pricing = calculateZonePrice("BASE", totalPop, totalPop * 0.005);

        // Centro del cluster (media coordinate)
        const avgLat = chunk.reduce((s, c) => s + c.lat, 0) / chunk.length;
        const avgLng = chunk.reduce((s, c) => s + c.lng, 0) / chunk.length;

        await upsertZone({
          name: clusterName,
          slug,
          zoneClass: "BASE",
          region,
          province,
          city: null,
          municipalities: names,
          population: totalPop,
          marketScore: score,
          lat: avgLat || null,
          lng: avgLng || null,
          monthlyPrice: pricing.monthlyPrice,
          maxAgencies: pricing.maxAgencies,
        });
        clustered += chunk.length;
        created++;
      }
    }
  }

  console.log(`\nRisultato: ${created} zone create (${clustered} piccoli comuni raggruppati in cluster)`);
}

interface ZoneInput {
  name: string;
  slug: string;
  zoneClass: ZoneClass;
  region: string;
  province: string;
  city: string | null;
  municipalities: string[];
  population: number;
  marketScore: number;
  lat: number | null;
  lng: number | null;
  monthlyPrice: number;
  maxAgencies: number;
  avgPricePerSqm?: number;
  ntn?: number;
}

async function upsertZone(input: ZoneInput) {
  try {
    await prisma.zone.upsert({
      where: { slug: input.slug },
      update: {
        name: input.name,
        population: input.population,
        marketScore: input.marketScore,
        lat: input.lat,
        lng: input.lng,
        monthlyPrice: input.monthlyPrice,
        maxAgencies: input.maxAgencies,
        avgPricePerSqm: input.avgPricePerSqm ?? null,
        ntn: input.ntn ?? 0,
      },
      create: {
        name: input.name,
        slug: input.slug,
        zoneClass: input.zoneClass,
        region: input.region,
        province: input.province,
        city: input.city,
        municipalities: input.municipalities,
        capCodes: [],
        population: input.population,
        ntn: input.ntn ?? 0,
        marketScore: input.marketScore,
        lat: input.lat,
        lng: input.lng,
        monthlyPrice: input.monthlyPrice,
        maxAgencies: input.maxAgencies,
        avgPricePerSqm: input.avgPricePerSqm ?? null,
      },
    });
  } catch (err) {
    console.error(`Errore creando zona "${input.name}":`, err);
  }
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  console.log("=== Import Zone ISTAT ===\n");

  const comuni = await fetchIstatData();
  console.log(`Trovati ${comuni.length} comuni\n`);

  await createZones(comuni);

  const totalZones = await prisma.zone.count();
  console.log(`\nTotale zone nel database: ${totalZones}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
