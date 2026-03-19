import { describe, it, expect } from "vitest";
import { vincentyDirect, vincentyInverse, geodesicInterpolate } from "../vincenty";

describe("vincentyDirect", () => {
  it("computes correct destination for known geodesic", () => {
    // From Tel Aviv heading due east ~90km should be near Jerusalem area
    const start = { lat: 32.0853, lng: 34.7818 };
    const result = vincentyDirect(start, 90, 60000); // 60km east

    expect(result.destination.lat).toBeCloseTo(32.08, 0);
    expect(result.destination.lng).toBeGreaterThan(35.2); // Should be east
    expect(result.destination.lng).toBeLessThan(35.6);
  });

  it("heading north from equator", () => {
    const result = vincentyDirect({ lat: 0, lng: 0 }, 0, 111320);
    // ~1 degree north
    expect(result.destination.lat).toBeCloseTo(1.0, 0);
    expect(result.destination.lng).toBeCloseTo(0, 1);
  });

  it("returns start point for zero distance", () => {
    const start = { lat: 32.0853, lng: 34.7818 };
    const result = vincentyDirect(start, 45, 0);
    expect(result.destination.lat).toBeCloseTo(start.lat, 4);
    expect(result.destination.lng).toBeCloseTo(start.lng, 4);
  });
});

describe("vincentyInverse", () => {
  it("computes correct distance Tel Aviv ↔ Jerusalem", () => {
    const telAviv = { lat: 32.0853, lng: 34.7818 };
    const jerusalem = { lat: 31.7683, lng: 35.2137 };
    const result = vincentyInverse(telAviv, jerusalem);

    // Should be approximately 54-57 km
    expect(result.distanceM / 1000).toBeGreaterThan(50);
    expect(result.distanceM / 1000).toBeLessThan(65);
  });

  it("returns zero for identical points", () => {
    const p = { lat: 32.0853, lng: 34.7818 };
    const result = vincentyInverse(p, p);
    expect(result.distanceM).toBe(0);
  });

  it("computes reasonable bearing Tel Aviv → northeast (Iran direction)", () => {
    const telAviv = { lat: 32.0853, lng: 34.7818 };
    const tehran = { lat: 35.6892, lng: 51.3890 };
    const result = vincentyInverse(telAviv, tehran);

    // Bearing should be roughly northeast (40-70°)
    expect(result.initialBearing).toBeGreaterThan(40);
    expect(result.initialBearing).toBeLessThan(75);
    // Distance should be roughly 1500-1600 km
    expect(result.distanceM / 1000).toBeGreaterThan(1400);
    expect(result.distanceM / 1000).toBeLessThan(1700);
  });
});

describe("geodesicInterpolate", () => {
  it("generates correct number of intermediate points", () => {
    const points = geodesicInterpolate({ lat: 32, lng: 35 }, 45, 100000, 50);
    expect(points).toHaveLength(51); // start + 50 intermediate
  });

  it("first point is start, last point is at target distance", () => {
    const start = { lat: 32, lng: 35 };
    const points = geodesicInterpolate(start, 0, 111320, 10);

    expect(points[0].lat).toBeCloseTo(start.lat, 4);
    expect(points[0].lng).toBeCloseTo(start.lng, 4);
    // Last point should be ~1 degree north
    expect(points[points.length - 1].lat).toBeCloseTo(33, 0);
  });
});
