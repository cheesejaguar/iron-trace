import { describe, it, expect } from "vitest";
import { haversineDistance, bearing, centroid, toRad, toDeg } from "../haversine";

describe("haversine utilities", () => {
  it("converts degrees to radians", () => {
    expect(toRad(180)).toBeCloseTo(Math.PI);
    expect(toRad(90)).toBeCloseTo(Math.PI / 2);
    expect(toRad(0)).toBe(0);
  });

  it("converts radians to degrees", () => {
    expect(toDeg(Math.PI)).toBeCloseTo(180);
    expect(toDeg(Math.PI / 2)).toBeCloseTo(90);
  });

  it("computes distance between Tel Aviv and Jerusalem (~60km)", () => {
    const telAviv = { lat: 32.0853, lng: 34.7818 };
    const jerusalem = { lat: 31.7683, lng: 35.2137 };
    const dist = haversineDistance(telAviv, jerusalem);
    expect(dist).toBeGreaterThan(50);
    expect(dist).toBeLessThan(70);
  });

  it("returns 0 for identical points", () => {
    const p = { lat: 31.5, lng: 35.0 };
    expect(haversineDistance(p, p)).toBe(0);
  });

  it("computes bearing from Tel Aviv to Jerusalem (~120° ESE)", () => {
    const telAviv = { lat: 32.0853, lng: 34.7818 };
    const jerusalem = { lat: 31.7683, lng: 35.2137 };
    const b = bearing(telAviv, jerusalem);
    expect(b).toBeGreaterThan(100);
    expect(b).toBeLessThan(140);
  });

  it("computes centroid of triangle", () => {
    const points = [
      { lat: 30, lng: 34 },
      { lat: 32, lng: 34 },
      { lat: 31, lng: 36 },
    ];
    const c = centroid(points);
    expect(c.lat).toBeCloseTo(31);
    expect(c.lng).toBeCloseTo(34.667, 2);
  });

  it("throws on empty centroid", () => {
    expect(() => centroid([])).toThrow();
  });
});
