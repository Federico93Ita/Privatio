"use client";

import { useEffect, useState } from "react";
import PropertyCard, { type PropertyCardProps } from "@/components/property/PropertyCard";

type Property = PropertyCardProps["property"];

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties?limit=6&sort=newest")
      .then((res) => res.json())
      .then((data) => {
        if (data.properties) {
          setProperties(data.properties);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-2xl border border-border bg-white"
          >
            <div className="aspect-[4/3] bg-slate-100" />
            <div className="flex flex-col gap-3 p-4">
              <div className="h-5 w-3/4 rounded bg-slate-100" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              <div className="h-6 w-1/3 rounded bg-slate-100" />
              <div className="h-4 w-full rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {properties.slice(0, 6).map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
