/**
 * Verifica risoluzione strade Asti dopo re-import OMI.
 * Per ogni indirizzo: geocode Nominatim → trova zona via point-in-polygon
 * (preferendo polygon più piccolo). Stampa anche tutti i match candidati.
 *
 * Atteso: indirizzi in zone diverse della città devono risolvere a zone
 * differenti (vs prima del re-import quando cadevano nello stesso poligono
 * gigante).
 *
 * Uso: npx tsx scripts/verify-asti-streets.ts
 */
import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "../src/lib/geocode";
import { pointInPolygon, polygonArea } from "../src/lib/point-in-polygon";

const prisma = new PrismaClient();

const STREETS = [
  "Corso Torino",
  "Corso Savona",
  "Corso Alfieri",
  "Corso Dante",
  "Via Roma",
  "Corso Casale",
  "Piazza Alfieri",
  "Via Brofferio",
];

async function main() {
  const zones = await prisma.zone.findMany({
    where: { isActive: true, city: "Asti", province: "AT" },
    select: { id: true, name: true, boundary: true, zoneClass: true },
  });
  console.log(`Asti: ${zones.length} zone attive\n`);

  const summary: Record<string, number> = {};

  for (const street of STREETS) {
    process.stdout.write(`${street.padEnd(20)} → `);
    const geo = await geocodeAddress(street, "Asti", "AT");
    if (!geo.ok) {
      console.log("(geocoding fallito)");
      continue;
    }

    const matches = zones
      .filter((z) => z.boundary && pointInPolygon(geo.lat, geo.lng, z.boundary))
      .map((z) => ({
        name: z.name,
        zoneClass: z.zoneClass,
        area: polygonArea(z.boundary),
      }))
      .sort((a, b) => a.area - b.area);

    if (matches.length === 0) {
      console.log("NESSUN match");
    } else {
      const winner = matches[0];
      console.log(
        `${winner.name} [${winner.zoneClass}] (candidati: ${matches.length})`,
      );
      summary[winner.name] = (summary[winner.name] ?? 0) + 1;
    }
  }

  console.log("\n=== Distribuzione vincitori ===");
  for (const [name, count] of Object.entries(summary)) {
    console.log(`  ${count}× ${name}`);
  }

  const distinctZones = Object.keys(summary).length;
  console.log(
    `\n${distinctZones} zone distinte su ${STREETS.length} indirizzi.`,
  );
  if (distinctZones === 1) {
    console.log(
      "ATTENZIONE: tutti gli indirizzi cadono in UNA zona — boundary ancora sovrapposti.",
    );
  } else if (distinctZones >= 4) {
    console.log("OK: dispersione sufficiente sui boundary distinti.");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
