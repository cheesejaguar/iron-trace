import { describe, it, expect } from "vitest";
import { findArcIntersections, computeKDE, generateHeatmap } from "../kde";
import type { TrajectoryArc, LatLng } from "@/types";
import { ThreatOrigin } from "@/types";

function makeArc(points: LatLng[]): TrajectoryArc {
  return {
    id: `arc-${Math.random().toString(36).slice(2)}`,
    engagementId: "e-1",
    origin: points[0],
    backAzimuth: 60,
    arcPoints: points,
    uncertaintyCone: [],
    estimatedOrigin: ThreatOrigin.IRAN,
    distanceKm: 1500,
  };
}

describe("KDE", () => {
  it("finds intersections between crossing arcs", () => {
    // Two arcs that cross in an X pattern
    const arc1 = makeArc([
      { lat: 30, lng: 34 },
      { lat: 32, lng: 36 },
    ]);
    const arc2 = makeArc([
      { lat: 30, lng: 36 },
      { lat: 32, lng: 34 },
    ]);
    const intersections = findArcIntersections([arc1, arc2]);
    expect(intersections.length).toBeGreaterThan(0);
    // Intersection should be near (31, 35)
    expect(intersections[0].lat).toBeCloseTo(31, 0);
    expect(intersections[0].lng).toBeCloseTo(35, 0);
  });

  it("returns empty for parallel arcs", () => {
    const arc1 = makeArc([
      { lat: 30, lng: 34 },
      { lat: 32, lng: 34 },
    ]);
    const arc2 = makeArc([
      { lat: 30, lng: 35 },
      { lat: 32, lng: 35 },
    ]);
    const intersections = findArcIntersections([arc1, arc2]);
    expect(intersections.length).toBe(0);
  });

  it("computes KDE with normalized intensities", () => {
    const points: LatLng[] = [
      { lat: 33, lng: 45 },
      { lat: 33.1, lng: 45.1 },
      { lat: 33.05, lng: 45.05 },
      { lat: 35, lng: 50 }, // outlier
    ];
    const heat = computeKDE(points);
    expect(heat.length).toBe(4);
    // Max intensity should be 1.0
    const maxI = Math.max(...heat.map((h) => h.intensity));
    expect(maxI).toBeCloseTo(1.0);
    // Clustered points should have higher intensity than outlier
    const outlier = heat.find((h) => h.lat === 35);
    const clustered = heat.find((h) => h.lat === 33.05);
    expect(clustered!.intensity).toBeGreaterThan(outlier!.intensity);
  });

  it("returns empty KDE for empty input", () => {
    expect(computeKDE([])).toEqual([]);
  });

  it("generates heatmap from arcs", () => {
    const arc1 = makeArc([
      { lat: 30, lng: 34 },
      { lat: 32, lng: 36 },
    ]);
    const arc2 = makeArc([
      { lat: 30, lng: 36 },
      { lat: 32, lng: 34 },
    ]);
    const heat = generateHeatmap([arc1, arc2]);
    expect(heat.length).toBeGreaterThan(0);
  });

  it("returns empty heatmap for no arcs", () => {
    expect(generateHeatmap([])).toEqual([]);
  });
});
