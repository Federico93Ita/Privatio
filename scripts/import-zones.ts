/**
 * Import zone territoriali da dati ISTAT.
 *
 * Fonte: CSV ISTAT comuni italiani con popolazione.
 * Il CSV viene incluso inline come costante per le province/regioni italiane,
 * e i dati popolazione vengono scaricati dal sito ISTAT.
 *
 * Uso: npx tsx scripts/import-zones.ts
 *
 * Logica (nuovo modello 3 fasce):
 * - Comuni < 20.000 abitanti → BASE (raggruppati in cluster se < 5.000)
 * - Comuni 20.000–100.000 → URBANA
 * - Comuni > 100.000 → PREMIUM (da suddividere manualmente in quartieri)
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
    ["Carmagnola", "TO", 29100], ["Cirié", "TO", 18800],
    ["Avigliana", "TO", 12600], ["Giaveno", "TO", 16500],
    ["Susa", "TO", 6300], ["Bussoleno", "TO", 6100],
    ["Rivarolo Canavese", "TO", 12400], ["Cuorgnè", "TO", 9900],
    ["Castellamonte", "TO", 9600], ["Lanzo Torinese", "TO", 5200],
    ["San Mauro Torinese", "TO", 19400], ["Trofarello", "TO", 11200],
    ["La Loggia", "TO", 8900], ["Piobesi Torinese", "TO", 3800],
    ["Candiolo", "TO", 5700], ["Pecetto Torinese", "TO", 4100],
    ["Pino Torinese", "TO", 8600], ["Brandizzo", "TO", 8800],
    ["Castagneto Po", "TO", 1800], ["Volpiano", "TO", 15500],
    ["Leinì", "TO", 16200], ["Caselle Torinese", "TO", 19400],
    ["Borgaro Torinese", "TO", 13600],
    // Torino hinterland — micro (<5k)
    ["Sangano", "TO", 3900], ["Trana", "TO", 3900], ["Coazze", "TO", 3200],
    ["Valperga", "TO", 3100], ["Pont Canavese", "TO", 3300],
    ["Agliè", "TO", 2600], ["Banchette", "TO", 3400],
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
  maxDistanceMeters: number = 15000 // 15 km
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
/*  Quartieri delle grandi città (stile Immobiliare.it)                */
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
 * Per le città > 200k abitanti, definizione dei quartieri/sub-zone.
 * Ispirato alla suddivisione di Immobiliare.it.
 * Ogni quartiere diventa una zona PREMIUM indipendente.
 */
const CITY_NEIGHBORHOODS: Record<string, CityNeighborhood[]> = {
  "Roma": [
    { name: "Roma Centro Storico", lat: 41.8986, lng: 12.4769, population: 120000, municipalities: ["Centro Storico", "Trevi", "Monti", "Trastevere", "Navona"], avgPricePerSqm: 5500, ntnEstimate: 2800 },
    { name: "Roma Prati - Trionfale", lat: 41.9097, lng: 12.4559, population: 155000, municipalities: ["Prati", "Trionfale", "Della Vittoria", "Borgo"], avgPricePerSqm: 4200, ntnEstimate: 2200 },
    { name: "Roma Parioli - Salario", lat: 41.9206, lng: 12.4928, population: 130000, municipalities: ["Parioli", "Salario", "Trieste", "Villa Ada"], avgPricePerSqm: 4800, ntnEstimate: 1900 },
    { name: "Roma Nomentano - Tiburtino", lat: 41.9104, lng: 12.5233, population: 185000, municipalities: ["Nomentano", "Tiburtino", "San Lorenzo", "Pietralata"], avgPricePerSqm: 3200, ntnEstimate: 2400 },
    { name: "Roma Tuscolano - Appio", lat: 41.8770, lng: 12.5183, population: 210000, municipalities: ["Tuscolano", "Appio Latino", "Don Bosco", "Cinecittà"], avgPricePerSqm: 3000, ntnEstimate: 2800 },
    { name: "Roma EUR - Torrino", lat: 41.8314, lng: 12.4698, population: 180000, municipalities: ["EUR", "Torrino", "Laurentino", "Fonte Ostiense"], avgPricePerSqm: 3500, ntnEstimate: 2100 },
    { name: "Roma Ostia - Litorale", lat: 41.7350, lng: 12.2874, population: 100000, municipalities: ["Ostia", "Acilia", "Infernetto", "Casal Palocco"], avgPricePerSqm: 2400, ntnEstimate: 1200 },
    { name: "Roma Monte Mario - Balduina", lat: 41.9261, lng: 12.4297, population: 165000, municipalities: ["Monte Mario", "Balduina", "Primavalle", "Ottavia"], avgPricePerSqm: 3100, ntnEstimate: 2000 },
    { name: "Roma San Giovanni - Prenestino", lat: 41.8866, lng: 12.5172, population: 195000, municipalities: ["San Giovanni", "Prenestino", "Centocelle", "Torpignattara"], avgPricePerSqm: 2800, ntnEstimate: 2600 },
    { name: "Roma Monteverde - Portuense", lat: 41.8750, lng: 12.4500, population: 175000, municipalities: ["Monteverde", "Portuense", "Gianicolense", "Marconi"], avgPricePerSqm: 3400, ntnEstimate: 2100 },
    { name: "Roma Aurelio - Boccea", lat: 41.9010, lng: 12.4080, population: 170000, municipalities: ["Aurelio", "Boccea", "Casalotti", "Val Cannuta"], avgPricePerSqm: 2600, ntnEstimate: 1800 },
    { name: "Roma Casilino - Torre Angela", lat: 41.8650, lng: 12.5700, population: 220000, municipalities: ["Casilino", "Torre Angela", "Torre Maura", "Tor Bella Monaca"], avgPricePerSqm: 2100, ntnEstimate: 2500 },
  ],
  "Milano": [
    { name: "Milano Centro - Duomo", lat: 45.4642, lng: 9.1900, population: 95000, municipalities: ["Centro", "Duomo", "Brera", "Vittorio Emanuele"], avgPricePerSqm: 7500, ntnEstimate: 2800 },
    { name: "Milano Navigli - Porta Genova", lat: 45.4530, lng: 9.1740, population: 85000, municipalities: ["Navigli", "Porta Genova", "Porta Ticinese", "Barona"], avgPricePerSqm: 5200, ntnEstimate: 1800 },
    { name: "Milano Porta Romana - Lodi", lat: 45.4495, lng: 9.2040, population: 120000, municipalities: ["Porta Romana", "Lodi", "Corvetto", "Rogoredo"], avgPricePerSqm: 4200, ntnEstimate: 2100 },
    { name: "Milano Città Studi - Lambrate", lat: 45.4750, lng: 9.2280, population: 135000, municipalities: ["Città Studi", "Lambrate", "Ortica", "Casoretto"], avgPricePerSqm: 4000, ntnEstimate: 2200 },
    { name: "Milano Loreto - Turro", lat: 45.4850, lng: 9.2200, population: 115000, municipalities: ["Loreto", "Turro", "Gorla", "Precotto"], avgPricePerSqm: 3800, ntnEstimate: 1900 },
    { name: "Milano Sempione - Fiera", lat: 45.4780, lng: 9.1550, population: 110000, municipalities: ["Sempione", "Fiera", "City Life", "De Angeli"], avgPricePerSqm: 5000, ntnEstimate: 2000 },
    { name: "Milano Isola - Garibaldi", lat: 45.4850, lng: 9.1840, population: 80000, municipalities: ["Isola", "Garibaldi", "Porta Nuova", "Repubblica"], avgPricePerSqm: 6000, ntnEstimate: 1600 },
    { name: "Milano San Siro - Baggio", lat: 45.4630, lng: 9.1200, population: 140000, municipalities: ["San Siro", "Baggio", "Quarto Cagnino", "Quinto Romano"], avgPricePerSqm: 3200, ntnEstimate: 2000 },
    { name: "Milano Bicocca - Niguarda", lat: 45.5100, lng: 9.2050, population: 155000, municipalities: ["Bicocca", "Niguarda", "Affori", "Bovisa"], avgPricePerSqm: 3500, ntnEstimate: 2200 },
    { name: "Milano Certosa - Gallaratese", lat: 45.4980, lng: 9.1300, population: 130000, municipalities: ["Certosa", "Gallaratese", "QT8", "Villapizzone"], avgPricePerSqm: 3400, ntnEstimate: 1800 },
  ],
  "Napoli": [
    { name: "Napoli Centro - Porto", lat: 40.8470, lng: 14.2560, population: 125000, municipalities: ["Centro Storico", "Porto", "Mercato", "Pendino"], avgPricePerSqm: 3200, ntnEstimate: 1800 },
    { name: "Napoli Chiaia - Posillipo", lat: 40.8350, lng: 14.2280, population: 105000, municipalities: ["Chiaia", "Posillipo", "Mergellina", "San Ferdinando"], avgPricePerSqm: 4500, ntnEstimate: 1500 },
    { name: "Napoli Vomero - Arenella", lat: 40.8530, lng: 14.2350, population: 135000, municipalities: ["Vomero", "Arenella", "Rione Alto"], avgPricePerSqm: 3800, ntnEstimate: 1700 },
    { name: "Napoli Fuorigrotta - Bagnoli", lat: 40.8230, lng: 14.1890, population: 120000, municipalities: ["Fuorigrotta", "Bagnoli", "Agnano", "Cavalleggeri"], avgPricePerSqm: 2800, ntnEstimate: 1400 },
    { name: "Napoli Est - Ponticelli", lat: 40.8580, lng: 14.3100, population: 155000, municipalities: ["Ponticelli", "San Giovanni", "Barra", "Poggioreale"], avgPricePerSqm: 2000, ntnEstimate: 1600 },
    { name: "Napoli Nord - Secondigliano", lat: 40.8940, lng: 14.2520, population: 145000, municipalities: ["Secondigliano", "Scampia", "Miano", "Piscinola"], avgPricePerSqm: 1800, ntnEstimate: 1400 },
    { name: "Napoli Capodimonte - Stella", lat: 40.8700, lng: 14.2530, population: 125000, municipalities: ["Capodimonte", "Stella", "San Carlo Arena", "Avvocata"], avgPricePerSqm: 2200, ntnEstimate: 1300 },
  ],
  "Torino": [
    { name: "Torino Centro", lat: 45.070, lng: 7.687, population: 180000, municipalities: ["Centro", "Crocetta", "San Salvario", "Vanchiglia"], avgPricePerSqm: 3500, ntnEstimate: 2500 },
    { name: "Torino Collina", lat: 45.050, lng: 7.720, population: 85000, municipalities: ["Precollina", "Borgo Po", "Madonna del Pilone", "Cavoretto"], avgPricePerSqm: 4200, ntnEstimate: 1000 },
    { name: "Torino Nord", lat: 45.105, lng: 7.665, population: 125000, municipalities: ["Barriera di Milano", "Aurora", "Rebaudengo", "Falchera"], avgPricePerSqm: 1800, ntnEstimate: 1800 },
    { name: "Torino Sud", lat: 45.030, lng: 7.670, population: 140000, municipalities: ["Lingotto", "Mirafiori", "Nizza Millefonti", "Santa Rita"], avgPricePerSqm: 2200, ntnEstimate: 2000 },
    { name: "Torino Ovest", lat: 45.075, lng: 7.625, population: 115000, municipalities: ["San Paolo", "Cenisia", "Pozzo Strada", "Parella"], avgPricePerSqm: 2000, ntnEstimate: 1700 },
  ],
  "Palermo": [
    { name: "Palermo Centro", lat: 38.1157, lng: 13.3615, population: 130000, municipalities: ["Centro Storico", "Kalsa", "Capo", "Albergheria"], avgPricePerSqm: 1800, ntnEstimate: 1500 },
    { name: "Palermo Libertà - Politeama", lat: 38.1220, lng: 13.3510, population: 120000, municipalities: ["Libertà", "Politeama", "Malaspina", "Noce"], avgPricePerSqm: 2200, ntnEstimate: 1400 },
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
    { name: "Bari Centro - Murat", lat: 41.1260, lng: 16.8700, population: 80000, municipalities: ["Murat", "Bari Vecchia", "Libertà", "Madonnella"], avgPricePerSqm: 2500, ntnEstimate: 1200 },
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

    // Separa per fascia
    const comuniGrandi = provinceComuni.filter((c) => c.population >= 100000);  // PREMIUM
    const comuniMedi = provinceComuni.filter((c) => c.population >= 20000 && c.population < 100000);  // URBANA
    const comuniPiccoli5k = provinceComuni.filter((c) => c.population >= 5000 && c.population < 20000);  // BASE singolo
    const comuniMicro = provinceComuni.filter((c) => c.population < 5000);  // BASE cluster

    // Grandi città (>100k): PREMIUM — con split in quartieri se disponibile
    for (const c of comuniGrandi) {
      const neighborhoods = CITY_NEIGHBORHOODS[c.name];

      if (neighborhoods && neighborhoods.length > 0) {
        // Split città in quartieri
        console.log(`  ↳ ${c.name}: split in ${neighborhoods.length} quartieri`);
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
        // Città senza quartieri definiti: zona singola
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

    // Comuni medi (20k-100k): URBANA
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

    // Comuni piccoli (5k-20k): BASE singolo
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

    // Comuni micro (<5k): BASE cluster — raggruppamento GEOGRAFICO
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

      // Step 2: Clustering geografico (greedy nearest-neighbor)
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
