/**
 * Verifica che indirizzi in città grandi (>50k abitanti) risolvano a
 * microzone OMI diverse dopo il re-import completo.
 *
 * Per ogni indirizzo: Nominatim → PIP (polygon più piccolo).
 * Atteso: ogni set di 4-6 strade di una città deve toccare >=3 zone diverse.
 */
import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "../src/lib/geocode";
import { pointInPolygon, polygonArea } from "../src/lib/point-in-polygon";

const prisma = new PrismaClient();

interface CitySpec {
  city: string;
  province: string;
  streets: string[];
}

const CITIES: CitySpec[] = [
  {
    city: "Milano",
    province: "MI",
    streets: ["Corso Buenos Aires", "Via Dante", "Corso Como", "Via Padova", "Via Solari"],
  },
  {
    city: "Roma",
    province: "RM",
    streets: ["Via del Corso", "Via Tuscolana", "Via Cristoforo Colombo", "Via Prenestina", "Via Cassia"],
  },
  {
    city: "Torino",
    province: "TO",
    streets: ["Via Roma", "Corso Francia", "Corso Giulio Cesare", "Corso Unione Sovietica", "Via Po"],
  },
  {
    city: "Napoli",
    province: "NA",
    streets: ["Via Toledo", "Corso Umberto I", "Via Chiaia", "Via Foria", "Corso San Giovanni"],
  },
  {
    city: "Bologna",
    province: "BO",
    streets: ["Via Indipendenza", "Via San Vitale", "Via Mazzini", "Via Saragozza", "Via Stalingrado"],
  },
  {
    city: "Firenze",
    province: "FI",
    streets: ["Via de' Tornabuoni", "Viale Redi", "Via Bolognese", "Via Senese", "Via Pisana"],
  },
];

async function verify(spec: CitySpec) {
  const zones = await prisma.zone.findMany({
    where: { isActive: true, city: spec.city, province: spec.province },
    select: { id: true, name: true, boundary: true, zoneClass: true },
  });
  console.log(`\n=== ${spec.city} (${spec.province}): ${zones.length} zone ===`);

  const winners = new Set<string>();
  let noMatch = 0;

  for (const street of spec.streets) {
    const geo = await geocodeAddress(street, spec.city, spec.province);
    if (!geo.ok) {
      console.log(`  ${street.padEnd(28)} → geocoding fallito`);
      continue;
    }
    const matches = zones
      .filter((z) => z.boundary && pointInPolygon(geo.lat, geo.lng, z.boundary))
      .map((z) => ({ z, area: polygonArea(z.boundary) }))
      .sort((a, b) => a.area - b.area);

    if (matches.length === 0) {
      console.log(`  ${street.padEnd(28)} → NESSUN match`);
      noMatch++;
    } else {
      const w = matches[0].z;
      const shortName = w.name.length > 55 ? w.name.slice(0, 52) + "..." : w.name;
      console.log(
        `  ${street.padEnd(28)} → [${w.zoneClass}] ${shortName} (candidati: ${matches.length})`,
      );
      winners.add(w.id);
    }
  }

  console.log(
    `  Zone distinte vincitrici: ${winners.size}/${spec.streets.length} ${winners.size >= 3 ? "✓" : winners.size >= 2 ? "~" : "✗"}`,
  );
  return { city: spec.city, distinct: winners.size, total: spec.streets.length, noMatch };
}

async function main() {
  console.log("Verifica risoluzione strade città grandi\n");
  const results = [];
  for (const spec of CITIES) {
    results.push(await verify(spec));
  }

  console.log("\n=== Riepilogo ===");
  for (const r of results) {
    console.log(
      `  ${r.city.padEnd(12)} ${r.distinct}/${r.total} zone distinte, ${r.noMatch} no-match`,
    );
  }

  const goodCities = results.filter((r) => r.distinct >= 3).length;
  console.log(`\n${goodCities}/${results.length} città con dispersione OK (>=3 zone distinte)`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
