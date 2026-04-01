import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

interface PlaceResult {
  name: string;
  type: string;
  distance: string;
  lat: number;
  lng: number;
}

/**
 * Classify an OSM element into a category based on its tags
 */
function classifyElement(tags: Record<string, string>): string | null {
  const amenity = tags.amenity || "";
  const shop = tags.shop || "";
  const pt = tags.public_transport || "";
  const railway = tags.railway || "";
  const highway = tags.highway || "";

  if (amenity === "school" || amenity === "university") return "school";
  if (amenity === "hospital" || amenity === "pharmacy" || amenity === "clinic" || amenity === "doctors") return "hospital";
  if (amenity === "bus_station") return "transit";
  if (shop === "supermarket" || shop === "mall" || shop === "convenience") return "store";
  if (pt === "station" || pt === "stop_position" || pt === "platform") return "transit";
  if (railway === "station" || railway === "halt" || railway === "tram_stop") return "transit";
  if (highway === "bus_stop") return "transit";
  return null;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function formatType(tags: Record<string, string>): string {
  const amenity = tags.amenity || tags.shop || tags.public_transport || tags.railway || tags.highway || "";
  const labels: Record<string, string> = {
    school: "Scuola",
    university: "Università",
    hospital: "Ospedale",
    pharmacy: "Farmacia",
    clinic: "Clinica",
    doctors: "Medico",
    supermarket: "Supermercato",
    mall: "Centro commerciale",
    convenience: "Alimentari",
    station: "Stazione",
    halt: "Fermata treno",
    tram_stop: "Fermata tram",
    stop_position: "Fermata",
    platform: "Fermata",
    bus_station: "Stazione bus",
    bus_stop: "Fermata bus",
  };
  return labels[amenity] || amenity.replace(/_/g, " ");
}

/**
 * GET /api/places?lat=45.07&lng=7.69
 *
 * Returns nearby POIs grouped by category using OpenStreetMap Overpass API (free, no key required).
 */
export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(RATE_LIMITS.apiRead, req);
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const results: Record<string, PlaceResult[]> = {
    school: [],
    transit: [],
    store: [],
    hospital: [],
  };

  try {
    // Single Overpass query for all categories to avoid rate-limiting
    const overpassQuery = `[out:json][timeout:25];(
      node["amenity"~"school|university"](around:3000,${lat},${lng});
      way["amenity"~"school|university"](around:3000,${lat},${lng});
      node["amenity"~"hospital|pharmacy|clinic|doctors"](around:3000,${lat},${lng});
      way["amenity"~"hospital|clinic"](around:3000,${lat},${lng});
      node["shop"~"supermarket|mall|convenience"](around:3000,${lat},${lng});
      way["shop"~"supermarket|mall|convenience"](around:3000,${lat},${lng});
      node["public_transport"~"station|stop_position|platform"](around:3000,${lat},${lng});
      node["railway"~"station|halt|tram_stop"](around:3000,${lat},${lng});
      node["amenity"="bus_station"](around:3000,${lat},${lng});
      node["highway"="bus_stop"](around:3000,${lat},${lng});
      way["railway"="station"](around:3000,${lat},${lng});
      way["amenity"="bus_station"](around:3000,${lat},${lng});
    );out center 100;`;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.elements) {
        // Deduplicate by name per category
        const seen: Record<string, Set<string>> = {
          school: new Set(), transit: new Set(), store: new Set(), hospital: new Set(),
        };

        const grouped: Record<string, (PlaceResult & { distKm: number })[]> = {
          school: [], transit: [], store: [], hospital: [],
        };

        for (const el of data.elements) {
          if (!el.tags?.name) continue;
          const elLat = el.lat ?? el.center?.lat;
          const elLon = el.lon ?? el.center?.lon;
          if (!elLat || !elLon) continue;

          const category = classifyElement(el.tags);
          if (!category) continue;
          if (seen[category].has(el.tags.name)) continue;
          seen[category].add(el.tags.name);

          const dist = haversine(lat, lng, elLat, elLon);
          grouped[category].push({
            name: el.tags.name,
            type: formatType(el.tags),
            distance: formatDist(dist),
            lat: elLat,
            lng: elLon,
            distKm: dist,
          });
        }

        for (const cat of Object.keys(results)) {
          grouped[cat].sort((a, b) => a.distKm - b.distKm);
          results[cat] = grouped[cat].slice(0, 5).map(({ distKm: _, ...rest }) => rest);
        }
      }
    }
  } catch {
    // Return empty results on error
  }

  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" },
  });
}
