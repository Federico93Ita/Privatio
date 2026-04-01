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
 * Category → OpenStreetMap amenity/public_transport tags
 */
const OSM_QUERIES: Record<string, string> = {
  school: `node["amenity"~"school|university"](around:2000,{LAT},{LNG});`,
  transit: `node["public_transport"~"station|stop_position"](around:2000,{LAT},{LNG});node["railway"="station"](around:2000,{LAT},{LNG});node["amenity"="bus_station"](around:2000,{LAT},{LNG});`,
  store: `node["shop"~"supermarket|mall|convenience"](around:2000,{LAT},{LNG});`,
  hospital: `node["amenity"~"hospital|pharmacy|clinic|doctors"](around:2000,{LAT},{LNG});`,
};

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
  const amenity = tags.amenity || tags.shop || tags.public_transport || tags.railway || "";
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
    stop_position: "Fermata",
    bus_station: "Stazione bus",
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

  const results: Record<string, PlaceResult[]> = {};

  await Promise.all(
    Object.entries(OSM_QUERIES).map(async ([category, queryTemplate]) => {
      try {
        const query = queryTemplate.replace(/{LAT}/g, String(lat)).replace(/{LNG}/g, String(lng));
        const overpassQuery = `[out:json][timeout:10];(${query});out body 10;`;

        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(overpassQuery)}`,
          next: { revalidate: 86400 }, // Cache 24h
        });

        if (!res.ok) {
          results[category] = [];
          return;
        }

        const data = await res.json();

        if (data.elements && data.elements.length > 0) {
          const places: PlaceResult[] = data.elements
            .filter((el: { tags?: Record<string, string>; lat?: number; lon?: number }) => el.tags?.name && el.lat && el.lon)
            .map((el: { tags: Record<string, string>; lat: number; lon: number }) => {
              const dist = haversine(lat, lng, el.lat, el.lon);
              return {
                name: el.tags.name,
                type: formatType(el.tags),
                distance: formatDist(dist),
                lat: el.lat,
                lng: el.lon,
              };
            })
            .sort((a: PlaceResult, b: PlaceResult) => {
              const distA = parseFloat(a.distance);
              const distB = parseFloat(b.distance);
              return distA - distB;
            })
            .slice(0, 5);

          results[category] = places;
        } else {
          results[category] = [];
        }
      } catch {
        results[category] = [];
      }
    })
  );

  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" },
  });
}
