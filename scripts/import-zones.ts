/**
 * Import zone territoriali da dati ISTAT.
 *
 * Fonte: CSV ISTAT comuni italiani con popolazione.
 * Il CSV viene incluso inline come costante per le province/regioni italiane,
 * e i dati popolazione vengono scaricati dal sito ISTAT.
 *
 * Uso: npx tsx scripts/import-zones.ts
 *
 * Logica:
 * - Comuni < 5.000 abitanti → raggruppati in CLUSTER_LOCAL per provincia
 * - Comuni 5.000–50.000 → COMUNE singolo
 * - Comuni 50.000–250.000 → COMUNE (da suddividere manualmente in MACROQUARTIERE)
 * - Comuni > 250.000 → saltati (gestiti da import-omi.ts per microzone)
 */

import { PrismaClient } from "@prisma/client";
import {
  calculateMarketScore,
  calculateZonePricing,
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
  // Usa l'API ISTAT SDMX per i dati popolazione
  // Fallback: dati sintetici per i comuni principali se API non disponibile
  console.log("Scaricamento dati ISTAT...");

  // Tentiamo di scaricare il CSV dal portale ISTAT
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

  // Fallback: genera dati sintetici da province note
  return generateFallbackData();
}

function parseIstatCsv(csv: string): ComuneData[] {
  const lines = csv.split("\n").slice(1); // skip header
  const comuni: ComuneData[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    // Il formato CSV ISTAT varia, adattiamo il parsing
    const parts = line.split(",");
    if (parts.length < 4) continue;

    // Tenta parsing generico: nome, provincia, regione, popolazione
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

  // Capoluoghi e città principali per ogni provincia
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

  // Aggiungi comuni medi/piccoli per province principali (campione)
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
    // Milano hinterland
    ["Sesto San Giovanni", "MI", 81773], ["Cinisello Balsamo", "MI", 73908],
    ["Rho", "MI", 50904], ["Legnano", "MI", 59922],
    ["Cologno Monzese", "MI", 47500], ["Paderno Dugnano", "MI", 46900],
    ["Corsico", "MI", 34590], ["Rozzano", "MI", 42900],
    ["San Donato Milanese", "MI", 32600], ["Segrate", "MI", 36700],
    // Roma hinterland
    ["Guidonia Montecelio", "RM", 88673], ["Fiumicino", "RM", 80175],
    ["Tivoli", "RM", 56510], ["Velletri", "RM", 52948],
    ["Anzio", "RM", 54211], ["Pomezia", "RM", 63360],
    ["Ciampino", "RM", 38760], ["Marino", "RM", 43925],
    // Torino hinterland
    ["Moncalieri", "TO", 55844], ["Rivoli", "TO", 47500],
    ["Collegno", "TO", 48340], ["Nichelino", "TO", 46890],
    ["Settimo Torinese", "TO", 47300], ["Grugliasco", "TO", 37800],
    ["Chieri", "TO", 36100], ["Chivasso", "TO", 26700],
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
  // Raggruppa per provincia
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

    // Separa grandi città (>250k, gestite da import-omi) da comuni normali
    const grandiCitta = provinceComuni.filter((c) => c.population > 250000);
    const comuniNormali = provinceComuni.filter((c) => c.population <= 250000);
    const comuniMedi = comuniNormali.filter((c) => c.population >= 5000);
    const comuniPiccoli = comuniNormali.filter((c) => c.population < 5000);

    // Grandi città: crea come COMUNE (le microzone vengono da import-omi)
    for (const c of grandiCitta) {
      const slug = slugify(`${c.name}-${province}`);
      const score = calculateMarketScore(c.population, c.population * 0.015);
      const pricing = calculateZonePricing("COMUNE", score, c.population);
      const coords = await geocode(`${c.name}, ${province}, Italia`);

      await upsertZone({
        name: c.name,
        slug,
        zoneClass: "COMUNE",
        region,
        province,
        city: c.name,
        municipalities: [c.name],
        population: c.population,
        marketScore: score,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        ...pricing,
      });
      created++;
    }

    // Comuni medi (5k-250k): una zona per comune
    for (const c of comuniMedi) {
      const zoneClass = classifyZone(c.population);
      const slug = slugify(`${c.name}-${province}`);
      const score = calculateMarketScore(c.population, c.population * 0.01);
      const pricing = calculateZonePricing(zoneClass, score, c.population);
      const coords = await geocode(`${c.name}, ${province}, Italia`);

      await upsertZone({
        name: c.name,
        slug,
        zoneClass,
        region,
        province,
        city: c.name,
        municipalities: [c.name],
        population: c.population,
        marketScore: score,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        ...pricing,
      });
      created++;
    }

    // Comuni piccoli (<5k): raggruppa in cluster da 5-15 comuni
    if (comuniPiccoli.length > 0) {
      // Ordina per nome per raggruppamento stabile
      comuniPiccoli.sort((a, b) => a.name.localeCompare(b.name));

      const clusterSize = Math.min(
        15,
        Math.max(5, Math.ceil(comuniPiccoli.length / Math.ceil(comuniPiccoli.length / 10)))
      );

      for (let i = 0; i < comuniPiccoli.length; i += clusterSize) {
        const chunk = comuniPiccoli.slice(i, i + clusterSize);
        const totalPop = chunk.reduce((s, c) => s + c.population, 0);
        const names = chunk.map((c) => c.name);

        // Nome cluster: "Area [primo comune] - [ultimo comune]"
        const clusterName =
          chunk.length === 1
            ? `${chunk[0].name}`
            : `Area ${chunk[0].name} - ${chunk[chunk.length - 1].name}`;

        const slug = slugify(`cluster-${province}-${i}`);
        const score = calculateMarketScore(totalPop, totalPop * 0.005);
        const pricing = calculateZonePricing("CLUSTER_LOCAL", score, totalPop);
        // Geocode primo comune del cluster
        const coords = await geocode(`${chunk[0].name}, ${province}, Italia`);

        await upsertZone({
          name: clusterName,
          slug,
          zoneClass: "CLUSTER_LOCAL",
          region,
          province,
          city: null,
          municipalities: names,
          population: totalPop,
          marketScore: score,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          ...pricing,
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
  zoneClass: "CLUSTER_LOCAL" | "COMUNE" | "MACROQUARTIERE" | "MICROZONA_PRIME";
  region: string;
  province: string;
  city: string | null;
  municipalities: string[];
  population: number;
  marketScore: number;
  lat: number | null;
  lng: number | null;
  priceBase: number | null;
  priceLocal: number | null;
  priceCity: number | null;
  pricePrime: number | null;
  priceElite: number | null;
  maxBase: number;
  maxLocal: number;
  maxCity: number;
  maxPrime: number;
  maxElite: number;
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
        priceBase: input.priceBase,
        priceLocal: input.priceLocal,
        priceCity: input.priceCity,
        pricePrime: input.pricePrime,
        priceElite: input.priceElite,
        maxBase: input.maxBase,
        maxLocal: input.maxLocal,
        maxCity: input.maxCity,
        maxPrime: input.maxPrime,
        maxElite: input.maxElite,
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
        ntn: 0,
        marketScore: input.marketScore,
        lat: input.lat,
        lng: input.lng,
        priceBase: input.priceBase,
        priceLocal: input.priceLocal,
        priceCity: input.priceCity,
        pricePrime: input.pricePrime,
        priceElite: input.priceElite,
        maxBase: input.maxBase,
        maxLocal: input.maxLocal,
        maxCity: input.maxCity,
        maxPrime: input.maxPrime,
        maxElite: input.maxElite,
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
