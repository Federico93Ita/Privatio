import { describe, it, expect } from "vitest";
import { RADIUS_BY_CLASS, getZoneRadius, distanceKm } from "@/lib/zone-radius";
import { polygonArea } from "@/lib/point-in-polygon";

describe("distanceKm (Haversine)", () => {
  it("returns 0 for same point", () => {
    expect(distanceKm(45.07, 7.68, 45.07, 7.68)).toBe(0);
  });

  it("calculates Torino → Moncalieri ~8km", () => {
    const dist = distanceKm(45.0703, 7.6869, 44.9997, 7.6828);
    expect(dist).toBeGreaterThan(6);
    expect(dist).toBeLessThan(10);
  });

  it("calculates Torino → Milano ~126km", () => {
    const dist = distanceKm(45.0703, 7.6869, 45.4642, 9.19);
    expect(dist).toBeGreaterThan(120);
    expect(dist).toBeLessThan(135);
  });

  it("calculates Villafranca d'Asti → Asti ~15km", () => {
    const dist = distanceKm(44.9167, 8.0333, 44.9, 8.2069);
    expect(dist).toBeGreaterThan(10);
    expect(dist).toBeLessThan(20);
  });
});

describe("RADIUS_BY_CLASS (modello unificato 1 km)", () => {
  it("PREMIUM radius = 1 km", () => {
    expect(RADIUS_BY_CLASS["PREMIUM"]).toBe(1);
  });

  it("URBANA radius = 1 km", () => {
    expect(RADIUS_BY_CLASS["URBANA"]).toBe(1);
  });

  it("BASE radius = 1 km", () => {
    expect(RADIUS_BY_CLASS["BASE"]).toBe(1);
  });
});

describe("getZoneRadius (1 km universale)", () => {
  it("PREMIUM urbana (Milano) → 1 km", () => {
    expect(
      getZoneRadius({ zoneClass: "PREMIUM", city: "Milano", population: 1_400_000 }),
    ).toBe(1);
  });

  it("PREMIUM città media (Asti) → 1 km", () => {
    expect(
      getZoneRadius({ zoneClass: "PREMIUM", city: "Asti", population: 74_000 }),
    ).toBe(1);
  });

  it("URBANA urbana → 1 km", () => {
    expect(
      getZoneRadius({ zoneClass: "URBANA", city: "Milano", population: 1_400_000 }),
    ).toBe(1);
  });

  it("Cluster PREMIUM (city=null) → 1 km", () => {
    expect(
      getZoneRadius({ zoneClass: "PREMIUM", city: null, population: 4_500 }),
    ).toBe(1);
  });

  it("Cluster URBANA (city=null) → 1 km", () => {
    expect(
      getZoneRadius({ zoneClass: "URBANA", city: null, population: 8_000 }),
    ).toBe(1);
  });

  it("Cluster BASE (city=null) → 1 km", () => {
    expect(
      getZoneRadius({ zoneClass: "BASE", city: null, population: 3_000 }),
    ).toBe(1);
  });

  it("Comune piccolo (Castell'Alfero) → 1 km", () => {
    expect(
      getZoneRadius({ zoneClass: "PREMIUM", city: "Castell'Alfero", population: 2_750 }),
    ).toBe(1);
  });

  it("Population assente → 1 km (tier default)", () => {
    expect(getZoneRadius({ zoneClass: "PREMIUM", city: "Torino" })).toBe(1);
  });

  it("Zone class sconosciuta → fallback 1 km", () => {
    expect(
      getZoneRadius({ zoneClass: "UNKNOWN", city: "Torino", population: 1_000_000 }),
    ).toBe(1);
  });
});

describe("Zone adjacency scenarios (raggio 1 km)", () => {
  it("Classi diverse possono essere adiacenti — la classe determina solo il prezzo", () => {
    const u = getZoneRadius({ zoneClass: "URBANA", city: "Asti", population: 74_000 });
    const p = getZoneRadius({ zoneClass: "PREMIUM", city: "Asti", population: 74_000 });
    expect(u).toBe(p);
    expect(u).toBe(1);
  });

  it("Due centroidi a ~0.3 km sono dentro il raggio 1 km", () => {
    const dist = distanceKm(44.9005, 8.2070, 44.9035, 8.2095);
    expect(dist).toBeLessThan(
      getZoneRadius({ zoneClass: "PREMIUM", city: "Asti", population: 74_000 }),
    );
  });

  it("Due centroidi a ~3 km sono fuori dal raggio 1 km", () => {
    const dist = distanceKm(44.9000, 8.2000, 44.9200, 8.2400);
    expect(dist).toBeGreaterThan(
      getZoneRadius({ zoneClass: "URBANA", city: "Asti", population: 74_000 }),
    );
  });

  it("Cluster BASE piccolo resta a 1 km", () => {
    expect(
      getZoneRadius({ zoneClass: "BASE", city: null, population: 1_500 }),
    ).toBe(1);
  });
});

describe("polygonArea (per ranking PIP più specifico)", () => {
  it("quadrato unitario (Polygon) → area = 1", () => {
    const sq = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ],
    };
    expect(polygonArea(sq)).toBeCloseTo(1, 5);
  });

  it("quadrato 10x10 ha area 100", () => {
    const sq = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ],
    };
    expect(polygonArea(sq)).toBeCloseTo(100, 5);
  });

  it("poligono piccolo ha area minore di uno grande (ranking)", () => {
    const big = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ],
    };
    const small = {
      type: "Polygon",
      coordinates: [
        [
          [4, 4],
          [6, 4],
          [6, 6],
          [4, 6],
          [4, 4],
        ],
      ],
    };
    expect(polygonArea(small)).toBeLessThan(polygonArea(big));
  });

  it("MultiPolygon: somma le aree dei poligoni", () => {
    const mp = {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        ],
        [
          [
            [10, 10],
            [12, 10],
            [12, 12],
            [10, 12],
            [10, 10],
          ],
        ],
      ],
    };
    expect(polygonArea(mp)).toBeCloseTo(1 + 4, 5);
  });

  it("Polygon con hole: area outer - area hole", () => {
    const withHole = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
        [
          [4, 4],
          [6, 4],
          [6, 6],
          [4, 6],
          [4, 4],
        ],
      ],
    };
    expect(polygonArea(withHole)).toBeCloseTo(100 - 4, 5);
  });

  it("boundary null/invalido → 0", () => {
    expect(polygonArea(null)).toBe(0);
    expect(polygonArea({ type: "Unknown" })).toBe(0);
    expect(polygonArea(undefined)).toBe(0);
  });
});
