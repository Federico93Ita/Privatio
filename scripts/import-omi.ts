/**
 * Import microzone OMI per grandi città italiane.
 *
 * Crea zone MACROQUARTIERE e MICROZONA_PRIME per le città >100k abitanti,
 * basandosi sulle microzone catastali dell'Osservatorio del Mercato Immobiliare
 * (Agenzia delle Entrate).
 *
 * Le microzone OMI sono classificate per fascia:
 * - Centrale (C) / Centro storico → MICROZONA_PRIME
 * - Semicentrale (B) → MACROQUARTIERE (marketScore alto)
 * - Periferica (D) → MACROQUARTIERE (marketScore medio)
 * - Suburbana (E) / Rurale (R) → MACROQUARTIERE (marketScore basso)
 *
 * Uso: npx tsx scripts/import-omi.ts
 *
 * Nota: I dati OMI reali vanno scaricati dal GeoPortale AdE e convertiti in CSV.
 * Questo script include dati embedded per le principali città come punto di partenza.
 */

import { PrismaClient } from "@prisma/client";
import type { ZoneClass } from "@prisma/client";
import {
  calculateMarketScore,
  calculateZonePricing,
} from "../src/lib/zone-pricing";

const prisma = new PrismaClient();

/* ------------------------------------------------------------------ */
/*  Struttura dati microzone                                           */
/* ------------------------------------------------------------------ */

interface OmiMicrozone {
  city: string;
  province: string;
  region: string;
  name: string;           // Nome quartiere/zona
  fascia: "C" | "B" | "D" | "E" | "R";  // Fascia OMI
  population: number;     // Stima popolazione quartiere
  ntn: number;            // Stima transazioni annue
  cap?: string[];         // CAP associati
}

/* ------------------------------------------------------------------ */
/*  Dati embedded principali città                                     */
/* ------------------------------------------------------------------ */

const OMI_DATA: OmiMicrozone[] = [
  // === MILANO ===
  { city: "Milano", province: "MI", region: "Lombardia", name: "Centro Storico / Duomo", fascia: "C", population: 28000, ntn: 1200, cap: ["20121", "20122"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "Brera / Moscova", fascia: "C", population: 18000, ntn: 800, cap: ["20121"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "Porta Romana", fascia: "B", population: 45000, ntn: 950, cap: ["20135", "20136"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "Navigli / Ticinese", fascia: "B", population: 38000, ntn: 820, cap: ["20143", "20144"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "CityLife / Fiera", fascia: "B", population: 42000, ntn: 900, cap: ["20145", "20149"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "Isola / Garibaldi", fascia: "B", population: 32000, ntn: 750, cap: ["20159"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "Corso Sempione", fascia: "B", population: 48000, ntn: 680, cap: ["20154", "20149"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "Porta Venezia", fascia: "B", population: 35000, ntn: 720, cap: ["20124", "20129"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "Città Studi", fascia: "D", population: 55000, ntn: 600, cap: ["20133", "20132"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "San Siro / De Angeli", fascia: "D", population: 62000, ntn: 580, cap: ["20151", "20146"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "Lambrate / Ortica", fascia: "D", population: 35000, ntn: 420, cap: ["20134"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "Affori / Bovisa", fascia: "D", population: 48000, ntn: 380, cap: ["20162", "20157"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "Corvetto / Rogoredo", fascia: "E", population: 52000, ntn: 350, cap: ["20138", "20139"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "Baggio / Quinto Romano", fascia: "E", population: 45000, ntn: 280, cap: ["20153"] },
  { city: "Milano", province: "MI", region: "Lombardia", name: "Quarto Oggiaro / Villapizzone", fascia: "E", population: 40000, ntn: 250, cap: ["20157", "20156"] },

  // === ROMA ===
  { city: "Roma", province: "RM", region: "Lazio", name: "Centro Storico", fascia: "C", population: 42000, ntn: 1500, cap: ["00186", "00187"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "Prati / Borgo", fascia: "C", population: 55000, ntn: 1100, cap: ["00193", "00192"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "Trastevere", fascia: "C", population: 28000, ntn: 650, cap: ["00153"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "Parioli / Flaminio", fascia: "B", population: 48000, ntn: 800, cap: ["00197", "00196"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "Testaccio / Aventino", fascia: "B", population: 32000, ntn: 520, cap: ["00153", "00154"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "EUR", fascia: "B", population: 65000, ntn: 750, cap: ["00144"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "San Giovanni / Re di Roma", fascia: "B", population: 72000, ntn: 680, cap: ["00183", "00182"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "Monteverde", fascia: "B", population: 58000, ntn: 580, cap: ["00152", "00151"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "Nomentano / Bologna", fascia: "B", population: 45000, ntn: 620, cap: ["00161", "00162"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "Trieste / Salario", fascia: "B", population: 52000, ntn: 700, cap: ["00198", "00199"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "Ostiense / Garbatella", fascia: "D", population: 48000, ntn: 420, cap: ["00154", "00145"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "Tuscolano / Appio Latino", fascia: "D", population: 85000, ntn: 650, cap: ["00174", "00175"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "Tiburtino / Pietralata", fascia: "D", population: 68000, ntn: 380, cap: ["00159"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "Torre Angela / Tor Bella Monaca", fascia: "E", population: 95000, ntn: 400, cap: ["00133"] },
  { city: "Roma", province: "RM", region: "Lazio", name: "Ostia", fascia: "E", population: 82000, ntn: 350, cap: ["00121", "00122"] },

  // === TORINO ===
  { city: "Torino", province: "TO", region: "Piemonte", name: "Centro / Crocetta", fascia: "C", population: 35000, ntn: 600, cap: ["10121", "10126"] },
  { city: "Torino", province: "TO", region: "Piemonte", name: "San Salvario / Valentino", fascia: "B", population: 42000, ntn: 480, cap: ["10125", "10126"] },
  { city: "Torino", province: "TO", region: "Piemonte", name: "Vanchiglia / Borgo Po", fascia: "B", population: 28000, ntn: 350, cap: ["10124", "10131"] },
  { city: "Torino", province: "TO", region: "Piemonte", name: "Santa Rita / Mirafiori Nord", fascia: "D", population: 65000, ntn: 420, cap: ["10127", "10135"] },
  { city: "Torino", province: "TO", region: "Piemonte", name: "Aurora / Porta Palazzo", fascia: "D", population: 45000, ntn: 280, cap: ["10152", "10154"] },
  { city: "Torino", province: "TO", region: "Piemonte", name: "Barriera di Milano", fascia: "E", population: 48000, ntn: 220, cap: ["10155"] },
  { city: "Torino", province: "TO", region: "Piemonte", name: "Mirafiori Sud / Lingotto", fascia: "D", population: 55000, ntn: 350, cap: ["10135", "10136"] },

  // === NAPOLI ===
  { city: "Napoli", province: "NA", region: "Campania", name: "Chiaia / Posillipo", fascia: "C", population: 45000, ntn: 650, cap: ["80121", "80122"] },
  { city: "Napoli", province: "NA", region: "Campania", name: "Vomero / Arenella", fascia: "B", population: 72000, ntn: 580, cap: ["80129", "80128"] },
  { city: "Napoli", province: "NA", region: "Campania", name: "Centro Storico / Decumani", fascia: "B", population: 55000, ntn: 380, cap: ["80138", "80134"] },
  { city: "Napoli", province: "NA", region: "Campania", name: "Fuorigrotta / Bagnoli", fascia: "D", population: 68000, ntn: 350, cap: ["80125", "80124"] },
  { city: "Napoli", province: "NA", region: "Campania", name: "Scampia / Secondigliano", fascia: "E", population: 85000, ntn: 200, cap: ["80144", "80145"] },

  // === FIRENZE ===
  { city: "Firenze", province: "FI", region: "Toscana", name: "Centro Storico", fascia: "C", population: 22000, ntn: 500, cap: ["50122", "50123"] },
  { city: "Firenze", province: "FI", region: "Toscana", name: "Oltrarno / Santo Spirito", fascia: "B", population: 28000, ntn: 350, cap: ["50125"] },
  { city: "Firenze", province: "FI", region: "Toscana", name: "Campo di Marte", fascia: "B", population: 45000, ntn: 380, cap: ["50136", "50137"] },
  { city: "Firenze", province: "FI", region: "Toscana", name: "Rifredi / Novoli", fascia: "D", population: 52000, ntn: 320, cap: ["50134", "50141"] },
  { city: "Firenze", province: "FI", region: "Toscana", name: "Isolotto / Legnaia", fascia: "D", population: 48000, ntn: 280, cap: ["50142", "50143"] },

  // === BOLOGNA ===
  { city: "Bologna", province: "BO", region: "Emilia-Romagna", name: "Centro Storico", fascia: "C", population: 25000, ntn: 480, cap: ["40121", "40124"] },
  { city: "Bologna", province: "BO", region: "Emilia-Romagna", name: "Colli / Murri", fascia: "B", population: 35000, ntn: 350, cap: ["40137", "40136"] },
  { city: "Bologna", province: "BO", region: "Emilia-Romagna", name: "San Donato / Pilastro", fascia: "D", population: 48000, ntn: 280, cap: ["40127", "40128"] },
  { city: "Bologna", province: "BO", region: "Emilia-Romagna", name: "Borgo Panigale / Reno", fascia: "D", population: 42000, ntn: 250, cap: ["40132", "40133"] },

  // === GENOVA ===
  { city: "Genova", province: "GE", region: "Liguria", name: "Centro / Carignano", fascia: "C", population: 32000, ntn: 400, cap: ["16121", "16126"] },
  { city: "Genova", province: "GE", region: "Liguria", name: "Nervi / Quinto", fascia: "B", population: 28000, ntn: 280, cap: ["16167", "16166"] },
  { city: "Genova", province: "GE", region: "Liguria", name: "Albaro / Sturla", fascia: "B", population: 35000, ntn: 320, cap: ["16131", "16143"] },
  { city: "Genova", province: "GE", region: "Liguria", name: "Sampierdarena / Cornigliano", fascia: "D", population: 52000, ntn: 250, cap: ["16149", "16152"] },

  // === PALERMO ===
  { city: "Palermo", province: "PA", region: "Sicilia", name: "Centro / Politeama", fascia: "C", population: 35000, ntn: 380, cap: ["90133", "90139"] },
  { city: "Palermo", province: "PA", region: "Sicilia", name: "Libertà / Notarbartolo", fascia: "B", population: 48000, ntn: 320, cap: ["90143", "90144"] },
  { city: "Palermo", province: "PA", region: "Sicilia", name: "Mondello / Addaura", fascia: "B", population: 22000, ntn: 200, cap: ["90151"] },
  { city: "Palermo", province: "PA", region: "Sicilia", name: "Zen / Borgo Nuovo", fascia: "E", population: 65000, ntn: 150, cap: ["90146"] },

  // === BARI ===
  { city: "Bari", province: "BA", region: "Puglia", name: "Murattiano / Lungomare", fascia: "C", population: 28000, ntn: 350, cap: ["70121", "70122"] },
  { city: "Bari", province: "BA", region: "Puglia", name: "Poggiofranco / Picone", fascia: "B", population: 42000, ntn: 280, cap: ["70124", "70126"] },
  { city: "Bari", province: "BA", region: "Puglia", name: "Japigia / Torre a Mare", fascia: "D", population: 55000, ntn: 220, cap: ["70126", "70132"] },

  // === CATANIA ===
  { city: "Catania", province: "CT", region: "Sicilia", name: "Centro / Corso Italia", fascia: "C", population: 25000, ntn: 280, cap: ["95129", "95131"] },
  { city: "Catania", province: "CT", region: "Sicilia", name: "Ognina / Picanello", fascia: "B", population: 38000, ntn: 220, cap: ["95128", "95127"] },
  { city: "Catania", province: "CT", region: "Sicilia", name: "Librino / San Giorgio", fascia: "E", population: 62000, ntn: 150, cap: ["95121"] },

  // === VENEZIA ===
  { city: "Venezia", province: "VE", region: "Veneto", name: "Centro Storico Venezia", fascia: "C", population: 52000, ntn: 450, cap: ["30121", "30122", "30123", "30124", "30125"] },
  { city: "Venezia", province: "VE", region: "Veneto", name: "Mestre Centro", fascia: "B", population: 65000, ntn: 380, cap: ["30171", "30172"] },
  { city: "Venezia", province: "VE", region: "Veneto", name: "Marghera", fascia: "D", population: 28000, ntn: 180, cap: ["30175"] },
  { city: "Venezia", province: "VE", region: "Veneto", name: "Lido", fascia: "B", population: 18000, ntn: 150, cap: ["30126"] },

  // === VERONA ===
  { city: "Verona", province: "VR", region: "Veneto", name: "Centro Storico / Arena", fascia: "C", population: 22000, ntn: 350, cap: ["37121", "37122"] },
  { city: "Verona", province: "VR", region: "Veneto", name: "Borgo Trento / Valdonega", fascia: "B", population: 35000, ntn: 280, cap: ["37126", "37128"] },
  { city: "Verona", province: "VR", region: "Veneto", name: "Borgo Roma / Golosine", fascia: "D", population: 48000, ntn: 220, cap: ["37134", "37136"] },
];

/* ------------------------------------------------------------------ */
/*  Genera slug                                                        */
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
/*  Classifica fascia OMI → ZoneClass                                  */
/* ------------------------------------------------------------------ */

function fasciaToZoneClass(fascia: OmiMicrozone["fascia"]): ZoneClass {
  switch (fascia) {
    case "C":
      return "MICROZONA_PRIME";
    case "B":
      return "MACROQUARTIERE";
    case "D":
    case "E":
    case "R":
      return "MACROQUARTIERE";
  }
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  console.log("=== Import Microzone OMI ===\n");

  let created = 0;
  let updated = 0;

  for (const mz of OMI_DATA) {
    const zoneClass = fasciaToZoneClass(mz.fascia);
    const score = calculateMarketScore(mz.population, mz.ntn);
    const pricing = calculateZonePricing(zoneClass, score);

    const slug = slugify(`${mz.city}-${mz.name}`);

    try {
      const existing = await prisma.zone.findUnique({ where: { slug } });

      if (existing) {
        await prisma.zone.update({
          where: { slug },
          data: {
            population: mz.population,
            ntn: mz.ntn,
            marketScore: score,
            ...pricing,
          },
        });
        updated++;
      } else {
        await prisma.zone.create({
          data: {
            name: `${mz.city} — ${mz.name}`,
            slug,
            zoneClass,
            region: mz.region,
            province: mz.province,
            city: mz.city,
            capCodes: mz.cap || [],
            municipalities: [mz.city],
            population: mz.population,
            ntn: mz.ntn,
            marketScore: score,
            ...pricing,
          },
        });
        created++;
      }
    } catch (err) {
      console.error(`Errore per "${mz.city} - ${mz.name}":`, err);
    }
  }

  console.log(`Risultato: ${created} microzone create, ${updated} aggiornate`);

  const totalZones = await prisma.zone.count();
  const microzone = await prisma.zone.count({ where: { zoneClass: "MICROZONA_PRIME" } });
  const macroquartieri = await prisma.zone.count({ where: { zoneClass: "MACROQUARTIERE" } });

  console.log(`\nTotale zone nel DB: ${totalZones}`);
  console.log(`  - MICROZONA_PRIME: ${microzone}`);
  console.log(`  - MACROQUARTIERE: ${macroquartieri}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
