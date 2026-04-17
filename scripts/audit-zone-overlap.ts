/**
 * Audit overlap boundary: per ogni città con >1 zona attiva, verifica che
 * le zone non si sovrappongano significativamente. Usa turf.intersect e
 * tollera <1% di overlap relativo (artefatti di confine).
 *
 * Uso:
 *   npx tsx scripts/audit-zone-overlap.ts                  → tutta Italia
 *   npx tsx scripts/audit-zone-overlap.ts --city=Asti     → solo una città
 *   npx tsx scripts/audit-zone-overlap.ts --prov=AT       → una provincia
 *   npx tsx scripts/audit-zone-overlap.ts --threshold=5   → soglia % custom
 *
 * Exit code 1 se trova overlap > soglia (utile per CI).
 */
import { PrismaClient } from "@prisma/client";
import * as turf from "@turf/turf";
import type { Feature, Polygon, MultiPolygon } from "geojson";

const prisma = new PrismaClient();

interface OverlapReport {
  city: string;
  province: string;
  zoneA: string;
  zoneB: string;
  overlapAreaKm2: number;
  pctOfA: number;
  pctOfB: number;
}

function toFeature(boundary: unknown): Feature<Polygon | MultiPolygon> | null {
  if (!boundary || typeof boundary !== "object") return null;
  const geo = boundary as { type?: string; coordinates?: unknown };
  if (geo.type === "Polygon" || geo.type === "MultiPolygon") {
    return turf.feature(geo as Polygon | MultiPolygon);
  }
  return null;
}

async function main() {
  const cityFilter = process.argv.find((a) => a.startsWith("--city="))?.split("=")[1];
  const provFilter = process.argv.find((a) => a.startsWith("--prov="))?.split("=")[1]?.toUpperCase();
  const thresholdPct = parseFloat(
    process.argv.find((a) => a.startsWith("--threshold="))?.split("=")[1] ?? "1",
  );

  console.log(`=== Audit overlap zone (soglia ${thresholdPct}%) ===\n`);

  const where: Record<string, unknown> = { isActive: true };
  if (cityFilter) where.city = { equals: cityFilter, mode: "insensitive" };
  if (provFilter) where.province = provFilter;

  // Step 1: trova le coppie (city, province) con >1 zona attiva — leggera
  const cityCounts = await prisma.zone.groupBy({
    by: ["city", "province"],
    where: { ...where, city: where.city ?? { not: null } },
    _count: { id: true },
  });
  const minZones = parseInt(
    process.argv.find((a) => a.startsWith("--min-zones="))?.split("=")[1] ?? "2",
    10,
  );
  const cities = cityCounts
    .filter((c) => c.city && c._count.id >= minZones)
    .map((c) => ({ city: c.city as string, province: c.province, count: c._count.id }));

  console.log(`Citta da auditare: ${cities.length}\n`);

  const reports: OverlapReport[] = [];
  let citiesChecked = 0;
  let citiesWithOverlap = 0;
  let pairsChecked = 0;

  // Step 2: per ogni città, fetcha solo le sue zone, processa, libera memoria
  for (const { city, province } of cities) {
    // Retry on transient Supabase disconnects (P1017)
    let cityZones: Array<{ id: string; name: string; boundary: unknown }> = [];
    let lastErr: unknown;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        cityZones = await prisma.zone.findMany({
          where: { isActive: true, city, province },
          select: { id: true, name: true, boundary: true },
        });
        break;
      } catch (err) {
        lastErr = err;
        const code = (err as { code?: string }).code;
        if (code === "P1017" || code === "P1001" || code === "P2024") {
          await new Promise((r) => setTimeout(r, 2000 * attempt));
          try {
            await prisma.$disconnect();
            await prisma.$connect();
          } catch {}
          continue;
        }
        throw err;
      }
    }
    if (cityZones.length === 0 && lastErr) {
      console.warn(`  ! saltata [${city}/${province}] dopo retry: ${(lastErr as Error).message}`);
      continue;
    }
    citiesChecked++;
    if (citiesChecked % 50 === 0) {
      console.log(`  ... ${citiesChecked}/${cities.length} citta processate`);
    }
    let cityHasOverlap = false;

    for (let i = 0; i < cityZones.length; i++) {
      const fa = toFeature(cityZones[i].boundary);
      if (!fa) continue;
      const areaA = turf.area(fa) / 1_000_000; // km²
      if (areaA <= 0) continue;

      for (let j = i + 1; j < cityZones.length; j++) {
        const fb = toFeature(cityZones[j].boundary);
        if (!fb) continue;
        pairsChecked++;

        let intersection: Feature<Polygon | MultiPolygon> | null = null;
        try {
          // turf.intersect v7 vuole una FeatureCollection
          intersection = turf.intersect(turf.featureCollection([fa, fb])) as
            | Feature<Polygon | MultiPolygon>
            | null;
        } catch {
          intersection = null;
        }

        if (!intersection) continue;
        const overlapKm2 = turf.area(intersection) / 1_000_000;
        const areaB = turf.area(fb) / 1_000_000;
        const pctA = (overlapKm2 / areaA) * 100;
        const pctB = (overlapKm2 / areaB) * 100;
        const worstPct = Math.max(pctA, pctB);

        if (worstPct >= thresholdPct) {
          cityHasOverlap = true;
          reports.push({
            city,
            province,
            zoneA: cityZones[i].name,
            zoneB: cityZones[j].name,
            overlapAreaKm2: overlapKm2,
            pctOfA: pctA,
            pctOfB: pctB,
          });
        }
      }
    }
    if (cityHasOverlap) citiesWithOverlap++;
    // Suggerisci al GC di liberare i Feature
  }

  // Report
  console.log(`Citta controllate: ${citiesChecked}`);
  console.log(`Coppie zone confrontate: ${pairsChecked}`);
  console.log(`Citta con overlap > ${thresholdPct}%: ${citiesWithOverlap}\n`);

  if (reports.length === 0) {
    console.log("Nessun overlap significativo. OK.");
  } else {
    // Ordina per gravita
    reports.sort((a, b) => Math.max(b.pctOfA, b.pctOfB) - Math.max(a.pctOfA, a.pctOfB));
    console.log(`Trovate ${reports.length} sovrapposizioni:\n`);
    for (const r of reports.slice(0, 50)) {
      console.log(
        `  [${r.city}/${r.province}] ${r.zoneA} <-> ${r.zoneB}\n` +
          `    overlap = ${r.overlapAreaKm2.toFixed(3)} km² (${r.pctOfA.toFixed(1)}% di A, ${r.pctOfB.toFixed(1)}% di B)`,
      );
    }
    if (reports.length > 50) {
      console.log(`\n  ... e altre ${reports.length - 50} sovrapposizioni`);
    }
  }

  await prisma.$disconnect();
  process.exit(reports.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
