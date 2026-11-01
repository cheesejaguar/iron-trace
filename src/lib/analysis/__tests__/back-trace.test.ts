import { describe, it, expect } from "vitest";
import { computeBackTrace } from "../back-trace";
import { haversineDistance } from "../haversine";
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
    expect(arc!.backAzimuth).toBe(50);
    // arcResolution 100 → start + 100 points, starting at the ellipse center
    expect(arc!.arcPoints).toHaveLength(101);
    expect(arc!.arcPoints[0].lat).toBeCloseTo(ellipse.center.lat, 6);
    expect(arc!.arcPoints[0].lng).toBeCloseTo(ellipse.center.lng, 6);
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
    expect(arc!.backAzimuth).toBe(0);
    // Default Lebanon trace distance when munition is unknown
    expect(arc!.distanceKm).toBe(200);
  });

  it("picks the Iran-facing end of an E-W axis (back-azimuth 90°)", () => {
    // angle 270 → candidates 90° (Iran range 30-90, inclusive) and 270° (none)
    const ellipse: FittedEllipse = {
      center: { lat: 32.08, lng: 34.78 },
      semiMajorKm: 25,
      semiMinorKm: 5,
      eccentricity: 0.80,
      angle: 270,
    };
    const arc = computeBackTrace(ellipse, "test-eng-3");
    expect(arc).not.toBeNull();
    expect(arc!.estimatedOrigin).toBe(ThreatOrigin.IRAN);
    expect(arc!.backAzimuth).toBe(90);
    // Default Iran trace distance when munition is unknown
    expect(arc!.distanceKm).toBe(1800);
  });

  it("returns null when neither end of the axis points to a threat region", () => {
    // angle 120 → candidates 300° (Mediterranean) and 120° (Jordan/Saudi): neither known
    const ellipse: FittedEllipse = {
      center: { lat: 32.08, lng: 34.78 },
      semiMajorKm: 25,
      semiMinorKm: 5,
      eccentricity: 0.80,
      angle: 120,
    };
    expect(computeBackTrace(ellipse, "test-eng-null")).toBeNull();
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
    expect(srbmArc!.distanceKm).toBe(700);
    expect(mrbmArc!.distanceKm).toBe(2000);
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
    // Shahab-3 is an MRBM → MRBM max range (2000km), not the Iran default (1800km)
    expect(arc!.distanceKm).toBe(2000);
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
    // origin + 31 left-edge points + 31 right-edge points + origin
    expect(arc!.uncertaintyCone).toHaveLength(64);
    // Cone should start and end at origin (closed polygon)
    expect(arc!.uncertaintyCone[0]).toEqual(ellipse.center);
    expect(arc!.uncertaintyCone[arc!.uncertaintyCone.length - 1]).toEqual(ellipse.center);
    // Far edge lies ~1800km out on both sides of the back-azimuth
    const farLeft = arc!.uncertaintyCone[31];
    const farRight = arc!.uncertaintyCone[32];
    expect(haversineDistance(ellipse.center, farLeft)).toBeCloseTo(1800, -1);
    expect(haversineDistance(ellipse.center, farRight)).toBeCloseTo(1800, -1);
  });
});
