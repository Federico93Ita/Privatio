/**
 * Fetch real administrative boundaries from OpenStreetMap Nominatim
 * and save them as GeoJSON in the Zone.boundary field.
 *
 * Usage: npx tsx scripts/fetch-zone-boundaries.ts
 *
 * Three zone types:
 *  A) Single municipality (municipalities.length === 1) → fetch its boundary
 *  B) Cluster of municipalities (municipalities.length > 1, city === null) → MultiPolygon
 *  C) City neighborhood (city !== null) → fetch city boundary once, Voronoi-subdivide
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { Delaunay } from "d3-delaunay";

const prisma = new PrismaClient();

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const HEADERS = { "User-Agent": "Privatio/1.0 (privatio.it)" };
const DELAY_MS = 1100; // >1s to respect Nominatim rate limit

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface GeoJSON {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}

async function fetchBoundary(
  query: string,
  province?: string
): Promise<GeoJSON | null> {
  const q = province ? `${query}, ${province}, Italia` : `${query}, Italia`;
  const url = `${NOMINATIM_BASE}?q=${encodeURIComponent(q)}&format=json&polygon_geojson=1&polygon_threshold=0.005&limit=1`;

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    console.warn(`  ⚠ HTTP ${res.status} for "${q}"`);
    return null;
  }

  const data = await res.json();
  if (!data.length) {
    console.warn(`  ⚠ No results for "${q}"`);
    return null;
  }

  const geo = data[0].geojson;
  if (!geo || (geo.type !== "Polygon" && geo.type !== "MultiPolygon")) {
    console.warn(`  ⚠ No polygon for "${q}" (type: ${geo?.type})`);
    return null;
  }

  return geo as GeoJSON;
}

/** Combine multiple GeoJSON polygons into one MultiPolygon */
function mergePolygons(polygons: GeoJSON[]): GeoJSON {
  const allRings: number[][][][] = [];
  for (const p of polygons) {
    if (p.type === "Polygon") {
      allRings.push(p.coordinates as number[][][]);
    } else {
      allRings.push(...(p.coordinates as number[][][][]));
    }
  }
  if (allRings.length === 1) {
    return { type: "Polygon", coordinates: allRings[0] };
  }
  return { type: "MultiPolygon", coordinates: allRings };
}

/** Extract all [lng, lat] points from a GeoJSON polygon */
function extractPoints(geo: GeoJSON): number[][] {
  const pts: number[][] = [];
  if (geo.type === "Polygon") {
    for (const ring of geo.coordinates as number[][][]) {
      pts.push(...ring);
    }
  } else {
    for (const poly of geo.coordinates as number[][][][]) {
      for (const ring of poly) {
        pts.push(...ring);
      }
    }
  }
  return pts;
}

/** Get the outer ring(s) of a polygon as flat [lng, lat] arrays */
function getOuterRings(geo: GeoJSON): number[][][] {
  if (geo.type === "Polygon") {
    return [geo.coordinates[0] as number[][]];
  }
  return (geo.coordinates as number[][][][]).map((p) => p[0]);
}

/* ------------------------------------------------------------------ */
/*  Point-in-polygon test (ray casting)                                */
/* ------------------------------------------------------------------ */

type Point = [number, number]; // [lng, lat]

function pointInPolygon(pt: Point, ring: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (((yi > pt[1]) !== (yj > pt[1])) &&
        (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

/** Find intersection of segment (a→b) with segment (c→d) */
function segmentIntersection(
  a: Point, b: Point, c: Point, d: Point
): Point | null {
  const dx1 = b[0] - a[0], dy1 = b[1] - a[1];
  const dx2 = d[0] - c[0], dy2 = d[1] - c[1];
  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-12) return null;
  const t = ((c[0] - a[0]) * dy2 - (c[1] - a[1]) * dx2) / denom;
  const u = ((c[0] - a[0]) * dy1 - (c[1] - a[1]) * dx1) / denom;
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return [a[0] + t * dx1, a[1] + t * dy1];
  }
  return null;
}

/** Clip a convex Voronoi cell by a concave city boundary.
 *  Collects: cell vertices inside boundary + boundary vertices inside cell
 *  + all edge-edge intersection points. Orders by angle from centroid. */
function clipCellByBoundary(
  cell: Point[],
  boundary: Point[],
  centroid: Point
): Point[] {
  const points: Point[] = [];

  // 1. Cell vertices inside boundary
  for (const pt of cell) {
    if (pointInPolygon(pt, boundary)) points.push(pt);
  }

  // 2. Boundary vertices inside cell (convex point-in-polygon for cell)
  for (const pt of boundary) {
    if (pointInConvexPolygon(pt, cell)) points.push(pt);
  }

  // 3. All intersection points between cell edges and boundary edges
  for (let i = 0; i < cell.length; i++) {
    const a = cell[i], b = cell[(i + 1) % cell.length];
    for (let j = 0; j < boundary.length - 1; j++) {
      const pt = segmentIntersection(a, b, boundary[j], boundary[j + 1]);
      if (pt) points.push(pt);
    }
  }

  if (points.length < 3) return [];

  // Deduplicate nearby points
  const deduped: Point[] = [];
  for (const pt of points) {
    if (!deduped.some(d => Math.abs(d[0] - pt[0]) < 1e-8 && Math.abs(d[1] - pt[1]) < 1e-8)) {
      deduped.push(pt);
    }
  }

  if (deduped.length < 3) return [];

  // Order by angle from centroid
  deduped.sort((a, b) =>
    Math.atan2(a[1] - centroid[1], a[0] - centroid[0]) -
    Math.atan2(b[1] - centroid[1], b[0] - centroid[0])
  );

  return deduped;
}

/** Check if point is inside a convex polygon (cross product test) */
function pointInConvexPolygon(pt: Point, poly: Point[]): boolean {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const cross = (b[0] - a[0]) * (pt[1] - a[1]) - (b[1] - a[1]) * (pt[0] - a[0]);
    if (Math.abs(cross) < 1e-10) continue;
    if (sign === 0) sign = cross > 0 ? 1 : -1;
    else if ((cross > 0 ? 1 : -1) !== sign) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/*  City neighborhood subdivision via Voronoi                          */
/* ------------------------------------------------------------------ */

function subdivideCityBoundary(
  cityGeo: GeoJSON,
  neighborhoods: { id: string; lat: number; lng: number }[]
): Map<string, GeoJSON> {
  const result = new Map<string, GeoJSON>();

  // Get the outer ring of the city boundary (largest ring for MultiPolygon)
  const outerRings = getOuterRings(cityGeo);
  const cityRing = outerRings.reduce((best, ring) =>
    ring.length > best.length ? ring : best
  );
  const boundary: Point[] = cityRing.map(([lng, lat]) => [lng, lat] as Point);

  // Compute bounding box
  const allPts = extractPoints(cityGeo);
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const [lng, lat] of allPts) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  const padLng = (maxLng - minLng) * 0.3;
  const padLat = (maxLat - minLat) * 0.3;

  // Build Voronoi from neighborhood centroids
  const points = neighborhoods.map((n) => [n.lng, n.lat] as [number, number]);
  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi([
    minLng - padLng,
    minLat - padLat,
    maxLng + padLng,
    maxLat + padLat,
  ]);

  for (let i = 0; i < neighborhoods.length; i++) {
    const cell = voronoi.cellPolygon(i);
    if (!cell) continue;

    // Remove the closing point (d3-delaunay closes the polygon)
    const cellPts: Point[] = cell.slice(0, -1).map(([x, y]) => [x, y] as Point);

    const centroid: Point = [neighborhoods[i].lng, neighborhoods[i].lat];
    const clipped = clipCellByBoundary(cellPts, boundary, centroid);

    if (clipped.length >= 3) {
      // Close the ring for GeoJSON
      const ring = [...clipped.map(([lng, lat]) => [lng, lat]), [clipped[0][0], clipped[0][1]]];
      result.set(neighborhoods[i].id, {
        type: "Polygon",
        coordinates: [ring],
      });
    }
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  const onlyMissing = process.argv.includes("--missing");
  const zones = await prisma.zone.findMany({
    where: {
      isActive: true,
      ...(onlyMissing ? { boundary: { equals: Prisma.DbNull } } : {}),
    },
    orderBy: { name: "asc" },
  });

  console.log(`Found ${zones.length} active zones\n`);

  // Group city neighborhoods: only zones where city differs from zone name
  // (neighborhoods like "Torino Centro" have city="Torino", name="Torino Centro")
  // Standalone municipalities may have city=name (e.g. city="Moncalieri", name="Moncalieri")
  const cityNeighborhoods = new Map<
    string,
    { id: string; lat: number; lng: number; province: string }[]
  >();
  const standaloneZones: typeof zones = [];

  // First pass: count how many zones share each city
  const cityCounts = new Map<string, number>();
  for (const z of zones) {
    if (z.city) {
      const key = `${z.city}|${z.province}`;
      cityCounts.set(key, (cityCounts.get(key) || 0) + 1);
    }
  }

  for (const z of zones) {
    if (z.city) {
      const key = `${z.city}|${z.province}`;
      const count = cityCounts.get(key) || 0;
      // Only treat as neighborhood if multiple zones share the same city
      if (count > 1) {
        const list = cityNeighborhoods.get(key) || [];
        list.push({ id: z.id, lat: z.lat!, lng: z.lng!, province: z.province });
        cityNeighborhoods.set(key, list);
      } else {
        standaloneZones.push(z);
      }
    } else {
      standaloneZones.push(z);
    }
  }

  let updated = 0;
  let failed = 0;

  // --- Process city neighborhoods ---
  for (const [key, hoods] of cityNeighborhoods) {
    const [cityName, province] = key.split("|");
    console.log(`\n🏙  ${cityName} (${province}): ${hoods.length} quartieri`);

    // Fetch city boundary
    await sleep(DELAY_MS);
    const cityGeo = await fetchBoundary(cityName, province);
    if (!cityGeo) {
      console.warn(`  ✗ No city boundary for ${cityName}, skipping all neighborhoods`);
      failed += hoods.length;
      continue;
    }

    // If only 1 zone for this city, use the city boundary directly
    if (hoods.length === 1) {
      await prisma.zone.update({
        where: { id: hoods[0].id },
        data: { boundary: cityGeo as object },
      });
      updated++;
      console.log(`  ✓ ${hoods[0].id} (city boundary)`);
      continue;
    }

    // Multiple zones → subdivide city boundary via Voronoi
    const subdivisions = subdivideCityBoundary(cityGeo, hoods);

    for (const hood of hoods) {
      const boundary = subdivisions.get(hood.id);
      if (boundary) {
        await prisma.zone.update({
          where: { id: hood.id },
          data: { boundary: boundary as object },
        });
        updated++;
        console.log(`  ✓ ${hood.id}`);
      } else {
        failed++;
        console.log(`  ✗ ${hood.id} (no subdivision)`);
      }
    }
  }

  // --- Process standalone zones ---
  for (const zone of standaloneZones) {
    const munis = zone.municipalities;

    if (munis.length === 0) {
      // No municipalities — try zone name
      console.log(`\n📍 ${zone.name} (${zone.province}): by name`);
      await sleep(DELAY_MS);
      const geo = await fetchBoundary(zone.name, zone.province);
      if (geo) {
        await prisma.zone.update({
          where: { id: zone.id },
          data: { boundary: geo as object },
        });
        updated++;
        console.log(`  ✓`);
      } else {
        failed++;
        console.log(`  ✗`);
      }
    } else if (munis.length === 1) {
      // Single municipality
      console.log(`\n📍 ${zone.name} → ${munis[0]} (${zone.province})`);
      await sleep(DELAY_MS);
      const geo = await fetchBoundary(munis[0], zone.province);
      if (geo) {
        await prisma.zone.update({
          where: { id: zone.id },
          data: { boundary: geo as object },
        });
        updated++;
        console.log(`  ✓`);
      } else {
        failed++;
        console.log(`  ✗`);
      }
    } else {
      // Cluster of municipalities
      console.log(
        `\n📍 ${zone.name} (${zone.province}): cluster of ${munis.length} municipalities`
      );
      const polygons: GeoJSON[] = [];
      for (const muni of munis) {
        await sleep(DELAY_MS);
        const geo = await fetchBoundary(muni, zone.province);
        if (geo) {
          polygons.push(geo);
          console.log(`  ✓ ${muni}`);
        } else {
          console.log(`  ✗ ${muni}`);
        }
      }
      if (polygons.length > 0) {
        const merged = mergePolygons(polygons);
        await prisma.zone.update({
          where: { id: zone.id },
          data: { boundary: merged as object },
        });
        updated++;
      } else {
        failed++;
      }
    }
  }

  console.log(`\n✅ Done: ${updated} updated, ${failed} failed out of ${zones.length}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
