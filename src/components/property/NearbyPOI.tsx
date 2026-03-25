"use client";

import { useEffect, useState } from "react";

interface POI {
  name: string;
  type: string;
  distance: string;
}

interface NearbyPOIProps {
  lat: number;
  lng: number;
}

const CATEGORIES = [
  { key: "school", label: "Scuole", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
  { key: "transit", label: "Trasporti", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "store", label: "Negozi", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { key: "hospital", label: "Sanità", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
];

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function NearbyPOI({ lat, lng }: NearbyPOIProps) {
  const [pois, setPois] = useState<Record<string, POI[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("school");

  useEffect(() => {
    async function fetchPOIs() {
      try {
        const res = await fetch(`/api/places?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          setPois(data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchPOIs();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 w-48 bg-border/50 rounded-lg" />
        <div className="h-20 bg-border/50 rounded-lg" />
      </div>
    );
  }

  const currentPois = pois[activeTab] || [];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border shrink-0 transition-colors ${
              activeTab === cat.key
                ? "bg-primary text-white border-primary"
                : "bg-white text-text-muted border-border hover:bg-bg-soft"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
            </svg>
            {cat.label}
            {pois[cat.key] && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === cat.key ? "bg-white/20" : "bg-bg-soft"
              }`}>
                {pois[cat.key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {currentPois.length === 0 ? (
        <p className="text-sm text-text-muted py-4">Nessun risultato nelle vicinanze per questa categoria.</p>
      ) : (
        <div className="space-y-2">
          {currentPois.slice(0, 5).map((poi, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-text">{poi.name}</p>
                <p className="text-xs text-text-muted capitalize">{poi.type}</p>
              </div>
              <span className="text-sm text-primary font-medium shrink-0 ml-4">{poi.distance}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
