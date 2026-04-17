/**
 * Point-in-polygon test using ray-casting algorithm.
 *
 * Used to determine which zone a property belongs to based on its
 * GPS coordinates and the zone's GeoJSON boundary.
 */

type Coordinate = [number, number]; // [lng, lat] — GeoJSON standard

/**
 * Ray-casting algorithm to test if a point is inside a polygon.
 *
 * @param lat - Latitude of the point
 * @param lng - Longitude of the point
 * @param polygon - Array of [lng, lat] coordinates forming the polygon ring
 * @returns true if the point is inside the polygon
 */
function pointInRing(lat: number, lng: number, ring: Coordinate[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][1]; // lat
    const yi = ring[i][0]; // lng
    const xj = ring[j][1]; // lat
    const yj = ring[j][0]; // lng

    const intersect =
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * GeoJSON geometry types we support.
 */
interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: Coordinate[][];
}

interface GeoJSONMultiPolygon {
  type: "MultiPolygon";
  coordinates: Coordinate[][][];
}

interface GeoJSONFeature {
  type: "Feature";
  geometry: GeoJSONPolygon | GeoJSONMultiPolygon;
  properties?: Record<string, unknown>;
}

interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

type SupportedGeoJSON =
  | GeoJSONPolygon
  | GeoJSONMultiPolygon
  | GeoJSONFeature
  | GeoJSONFeatureCollection;

/**
 * Test if a point (lat, lng) is inside a GeoJSON boundary.
 *
 * Handles Polygon, MultiPolygon, Feature, and FeatureCollection.
 * For Polygons with holes, the first ring is the outer boundary and
 * subsequent rings are holes.
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @param boundary - GeoJSON object (any supported type)
 * @returns true if point is inside the boundary
 */
export function pointInPolygon(
  lat: number,
  lng: number,
  boundary: unknown
): boolean {
  if (!boundary || typeof boundary !== "object") return false;

  const geo = boundary as SupportedGeoJSON;

  switch (geo.type) {
    case "Polygon":
      return pointInPolygonGeometry(lat, lng, geo.coordinates);

    case "MultiPolygon":
      return geo.coordinates.some((poly) =>
        pointInPolygonGeometry(lat, lng, poly)
      );

    case "Feature":
      return pointInPolygon(lat, lng, geo.geometry);

    case "FeatureCollection":
      return geo.features.some((f) => pointInPolygon(lat, lng, f.geometry));

    default:
      return false;
  }
}

/**
 * Test point against a single Polygon (array of rings).
 * First ring = outer boundary, subsequent rings = holes.
 */
function pointInPolygonGeometry(
  lat: number,
  lng: number,
  rings: Coordinate[][]
): boolean {
  if (!rings || rings.length === 0) return false;

  // Must be inside outer ring
  if (!pointInRing(lat, lng, rings[0])) return false;

  // Must not be inside any hole
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(lat, lng, rings[i])) return false;
  }

  return true;
}

/**
 * Compute area of a single ring using shoelace formula.
 * Returns area in (lng, lat)² unit-square — sufficient for relative ranking
 * between polygons in the same geographical region (no need for true m²).
 */
function ringArea(ring: Coordinate[]): number {
  if (!ring || ring.length < 3) return 0;
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    sum += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return Math.abs(sum) / 2;
}

/**
 * Compute total area of a GeoJSON boundary (Polygon, MultiPolygon, Feature,
 * or FeatureCollection). Holes are subtracted from the outer ring.
 *
 * The unit is squared-degrees (not m²), which is fine for comparing the
 * relative size of two polygons in the same area — the goal is to pick the
 * smallest (= most specific) microzone when boundaries overlap.
 */
export function polygonArea(boundary: unknown): number {
  if (!boundary || typeof boundary !== "object") return 0;
  const geo = boundary as SupportedGeoJSON;

  switch (geo.type) {
    case "Polygon":
      return polygonGeometryArea(geo.coordinates);
    case "MultiPolygon":
      return geo.coordinates.reduce(
        (acc, poly) => acc + polygonGeometryArea(poly),
        0,
      );
    case "Feature":
      return polygonArea(geo.geometry);
    case "FeatureCollection":
      return geo.features.reduce(
        (acc, f) => acc + polygonArea(f.geometry),
        0,
      );
    default:
      return 0;
  }
}

function polygonGeometryArea(rings: Coordinate[][]): number {
  if (!rings || rings.length === 0) return 0;
  let area = ringArea(rings[0]);
  for (let i = 1; i < rings.length; i++) {
    area -= ringArea(rings[i]);
  }
  return Math.max(0, area);
}
