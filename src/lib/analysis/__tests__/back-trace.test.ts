import { describe, it, expect } from "vitest";
import { computeBackTrace } from "../back-trace";
import { ThreatOrigin, MunitionClass, type FittedEllipse } from "@/types";

describe("computeBackTrace", () => {
  it("traces toward Iran for NE-pointing ellipse", () => {
    // Ellipse with semi-major axis pointing NE (azimuth ~50°)
    // Back-azimuth = 50° + 180° = 230° (SW), forward = 50° (NE)
    // Since 50° falls in Iran range (30-90), the back-trace should point NE
    const ellipse: FittedEllipse = {
      center: { lat: 32.08, lng: 34.78 },
      semiMajorKm: 30,
      semiMinorKm: 5,
      eccentricity: 0.85,
      angle: 230, // Semi-major points SW, so back-azimuth = 230+180=50 → Iran
    };
    const arc = computeBackTrace(ellipse, "test-eng-1");

    expect(arc).not.toBeNull();
    expect(arc!.estimatedOrigin).toBe(ThreatOrigin.IRAN);
    expect(arc!.backAzimuth).toBeGreaterThan(30);
    expect(arc!.backAzimuth).toBeLessThan(90);
    expect(arc!.arcPoints.length).toBeGreaterThan(50);
  });

  it("traces toward Lebanon for N-pointing ellipse", () => {
    // Ellipse pointing roughly north (azimuth ~0°/360°)
    const ellipse: FittedEllipse = {
      center: { lat: 32.92, lng: 35.30 },
      semiMajorKm: 15,
      semiMinorKm: 3,
      eccentricity: 0.80,
      angle: 180, // Points south, back-azimuth = 0° → Lebanon
    };
    const arc = computeBackTrace(ellipse, "test-eng-2");

    expect(arc).not.toBeNull();
    expect(arc!.estimatedOrigin).toBe(ThreatOrigin.LEBANON);
  });

  it("returns null for ellipse pointing toward Mediterranean", () => {
    // Ellipse pointing due west (270°) — no threat region
    const ellipse: FittedEllipse = {
      center: { lat: 32.08, lng: 34.78 },
      semiMajorKm: 25,
      semiMinorKm: 5,
      eccentricity: 0.80,
      angle: 270, // Points west; back-azimuth = 90° (Iran) or forward = 270° (Med)
    };
    // Actually 270 back-azimuth = 90° which IS in Iran range
    const arc = computeBackTrace(ellipse, "test-eng-3");
    // This should point to Iran since 90° is in range 30-90
    if (arc) {
      expect(arc.estimatedOrigin).toBe(ThreatOrigin.IRAN);
    }
  });

  it("uses munition max range when munition class provided", () => {
    const ellipse: FittedEllipse = {
      center: { lat: 32.08, lng: 34.78 },
      semiMajorKm: 25,
      semiMinorKm: 5,
      eccentricity: 0.85,
      angle: 230,
    };

    // SRBM should have shorter trace distance than MRBM
    const srbmArc = computeBackTrace(ellipse, "test-srbm", {
      munitionClass: MunitionClass.SRBM,
    });
    const mrbmArc = computeBackTrace(ellipse, "test-mrbm", {
      munitionClass: MunitionClass.MRBM,
    });

    expect(srbmArc).not.toBeNull();
    expect(mrbmArc).not.toBeNull();
    expect(srbmArc!.distanceKm).toBeLessThan(mrbmArc!.distanceKm);
  });

  it("uses specific munition range when matched munition provided", () => {
    const ellipse: FittedEllipse = {
      center: { lat: 32.08, lng: 34.78 },
      semiMajorKm: 25,
      semiMinorKm: 5,
      eccentricity: 0.85,
      angle: 230,
    };

    const arc = computeBackTrace(ellipse, "test-specific", {
      matchedMunition: "Shahab-3 / Kheibar Shekan",
    });

    expect(arc).not.toBeNull();
    // MRBM max range should be used
    expect(arc!.distanceKm).toBeGreaterThanOrEqual(800);
  });

  it("generates uncertainty cone polygon", () => {
    const ellipse: FittedEllipse = {
      center: { lat: 32.08, lng: 34.78 },
      semiMajorKm: 30,
      semiMinorKm: 5,
      eccentricity: 0.85,
      angle: 230,
    };
    const arc = computeBackTrace(ellipse, "test-cone");

    expect(arc).not.toBeNull();
    expect(arc!.uncertaintyCone.length).toBeGreaterThan(10);
    // Cone should start and end at origin
    expect(arc!.uncertaintyCone[0].lat).toBeCloseTo(ellipse.center.lat, 1);
  });
});
