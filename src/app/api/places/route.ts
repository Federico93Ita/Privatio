import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

interface PlaceResult {
  name: string;
  type: string;
  distance: string;
  lat: number;
  lng: number;
}

const TYPE_MAP: Record<string, string[]> = {
  school: ["school", "university"],
  transit: ["transit_station", "bus_station", "subway_station", "train_station"],
  store: ["supermarket", "shopping_mall", "convenience_store"],
  hospital: ["hospital", "pharmacy", "doctor"],
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

/**
 * GET /api/places?lat=45.07&lng=7.69
 *
 * Returns nearby POIs grouped by category using Google Places Nearby Search.
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

  if (!GOOGLE_API_KEY) {
    // Return empty results if API key not configured
    return NextResponse.json({ school: [], transit: [], store: [], hospital: [] });
  }

  const results: Record<string, PlaceResult[]> = {};

  await Promise.all(
    Object.entries(TYPE_MAP).map(async ([category, types]) => {
      try {
        const type = types[0]; // Use primary type for search
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=${type}&key=${GOOGLE_API_KEY}&language=it`;
        const res = await fetch(url, { next: { revalidate: 86400 } }); // Cache 24h
        const data = await res.json();

        if (data.results) {
          results[category] = data.results.slice(0, 5).map((place: { name: string; types: string[]; geometry: { location: { lat: number; lng: number } } }) => {
            const dist = haversine(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
            return {
              name: place.name,
              type: place.types?.[0]?.replace(/_/g, " ") || category,
              distance: formatDist(dist),
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            };
          });
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
