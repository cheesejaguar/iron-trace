import { describe, it, expect } from "vitest";
import { fitEllipse, ellipseToPolygon } from "../khachiyan";
import type { LatLng } from "@/types";

describe("fitEllipse", () => {
  it("throws for fewer than 3 points", () => {
    expect(() => fitEllipse([{ lat: 32, lng: 34 }])).toThrow();
    expect(() => fitEllipse([])).toThrow();
  });

  it("fits a roughly circular cluster with low eccentricity", () => {
    // Points in a roughly circular pattern around Tel Aviv
    const points: LatLng[] = [
      { lat: 32.08, lng: 34.78 },
      { lat: 32.10, lng: 34.80 },
      { lat: 32.06, lng: 34.80 },
      { lat: 32.10, lng: 34.76 },
      { lat: 32.06, lng: 34.76 },
    ];
    const ellipse = fitEllipse(points);

    expect(ellipse.center.lat).toBeCloseTo(32.08, 1);
    expect(ellipse.center.lng).toBeCloseTo(34.78, 1);
    expect(ellipse.eccentricity).toBeLessThan(0.7);
    expect(ellipse.semiMajorKm).toBeGreaterThan(0);
    expect(ellipse.semiMinorKm).toBeGreaterThan(0);
    expect(ellipse.semiMajorKm).toBeGreaterThanOrEqual(ellipse.semiMinorKm);
  });

  it("fits an elongated cluster with high eccentricity", () => {
    // Points stretched along north-south axis (simulating ballistic dispersion)
    const points: LatLng[] = [
      { lat: 31.80, lng: 34.78 },
      { lat: 31.90, lng: 34.79 },
      { lat: 32.00, lng: 34.78 },
      { lat: 32.10, lng: 34.79 },
      { lat: 32.20, lng: 34.78 },
      { lat: 32.30, lng: 34.79 },
    ];
    const ellipse = fitEllipse(points);

    expect(ellipse.eccentricity).toBeGreaterThan(0.7);
    expect(ellipse.semiMajorKm).toBeGreaterThan(20);
    expect(ellipse.semiMajorKm / ellipse.semiMinorKm).toBeGreaterThan(3);
  });

  it("produces valid angle in 0-360 range", () => {
    const points: LatLng[] = [
      { lat: 32.00, lng: 34.70 },
      { lat: 32.05, lng: 34.80 },
      { lat: 32.10, lng: 34.90 },
      { lat: 32.15, lng: 35.00 },
      { lat: 32.20, lng: 35.10 },
    ];
    const ellipse = fitEllipse(points);
    expect(ellipse.angle).toBeGreaterThanOrEqual(0);
    expect(ellipse.angle).toBeLessThan(360);
  });
});

describe("ellipseToPolygon", () => {
  it("generates correct number of points", () => {
    const ellipse = fitEllipse([
      { lat: 32.00, lng: 34.78 },
      { lat: 32.05, lng: 34.78 },
      { lat: 32.00, lng: 34.82 },
      { lat: 32.05, lng: 34.82 },
    ]);
    const polygon = ellipseToPolygon(ellipse, 32);
    expect(polygon).toHaveLength(32);
  });

  it("all polygon points are valid LatLng", () => {
    const ellipse = fitEllipse([
      { lat: 32.00, lng: 34.78 },
      { lat: 32.05, lng: 34.78 },
      { lat: 32.00, lng: 34.82 },
    ]);
    const polygon = ellipseToPolygon(ellipse);
    for (const p of polygon) {
      expect(p.lat).not.toBeNaN();
      expect(p.lng).not.toBeNaN();
      expect(Math.abs(p.lat)).toBeLessThan(90);
      expect(Math.abs(p.lng)).toBeLessThan(180);
    }
  });
});
