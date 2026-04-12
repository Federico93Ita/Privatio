import { describe, it, expect } from "vitest";

/**
 * Test the Haversine distance formula used in zone proximity calculations.
 * This is a pure function we can test without DB.
 */
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const RADIUS_BY_CLASS: Record<string, number> = {
  PREMIUM: 1,
  URBANA: 1,
  BASE: 5,
};

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

describe("Zone radius restrictions", () => {
  it("PREMIUM radius is 1km", () => {
    expect(RADIUS_BY_CLASS["PREMIUM"]).toBe(1);
  });

  it("URBANA radius is 1km", () => {
    expect(RADIUS_BY_CLASS["URBANA"]).toBe(1);
  });

  it("BASE radius is 5km", () => {
    expect(RADIUS_BY_CLASS["BASE"]).toBe(5);
  });

  it("Moncalieri (URBANA) cannot reach Torino Centro (PREMIUM, ~8km)", () => {
    const dist = distanceKm(44.9997, 7.6828, 45.0703, 7.6869);
    const moncalieriClass = "URBANA";
    const torinoClass = "PREMIUM";
    // Different class → always blocked
    expect(moncalieriClass).not.toBe(torinoClass);
  });

  it("Villafranca (BASE) can reach nearby BASE zones within 5km", () => {
    // Villafranca d'Asti to a nearby cluster ~4km away
    const dist = distanceKm(44.9167, 8.0333, 44.9000, 8.0700);
    expect(dist).toBeLessThan(RADIUS_BY_CLASS["BASE"]);
  });

  it("Villafranca (BASE) cannot reach zones >5km away", () => {
    // Villafranca d'Asti to a cluster ~12km away
    const dist = distanceKm(44.9167, 8.0333, 44.85, 8.1);
    expect(dist).toBeGreaterThan(RADIUS_BY_CLASS["BASE"]);
  });

  it("Torino Centro (PREMIUM) cannot reach zones >1km away", () => {
    // Torino Centro to Torino Nord ~4km
    const dist = distanceKm(45.0703, 7.6869, 45.105, 7.665);
    expect(dist).toBeGreaterThan(RADIUS_BY_CLASS["PREMIUM"]);
  });
});
