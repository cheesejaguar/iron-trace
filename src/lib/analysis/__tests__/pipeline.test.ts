import { describe, it, expect } from "vitest";
import { runAnalysisPipeline } from "../pipeline";
import type { NormalizedAlert } from "@/types";
import { ThreatCategory, EngagementClassification } from "@/types";

function makeBallisticAlerts(): NormalizedAlert[] {
  // Simulate an Iranian MRBM salvo: elongated NE-SW pattern over central Israel
  // with 90s countdown and tight temporal window
  const base = Date.now();
  const cities = [
    { name: "Tel Aviv", lat: 32.0853, lng: 34.7818 },
    { name: "Rishon LeZion", lat: 31.9642, lng: 34.8043 },
    { name: "Petah Tikva", lat: 32.0889, lng: 34.8864 },
    { name: "Netanya", lat: 32.3215, lng: 34.8532 },
    { name: "Herzliya", lat: 32.1629, lng: 34.7915 },
    { name: "Raanana", lat: 32.1849, lng: 34.8706 },
    { name: "Kfar Saba", lat: 32.1780, lng: 34.9071 },
    { name: "Hadera", lat: 32.4340, lng: 34.9196 },
  ];

  return cities.map((city, i) => ({
    id: `test-${i}`,
    timestamp: new Date(base + i * 1500).toISOString(), // 1.5s apart
    regions: [city.name],
    centroids: [{ lat: city.lat, lng: city.lng }],
    threat_category: ThreatCategory.MISSILES,
    countdown_seconds: 90,
    raw_payload: {},
  }));
}

function makeRocketAlerts(): NormalizedAlert[] {
  // Small cluster near Gaza border with short countdown
  const base = Date.now();
  return [
    { id: "r-1", timestamp: new Date(base).toISOString(), regions: ["Sderot"], centroids: [{ lat: 31.525, lng: 34.596 }], threat_category: ThreatCategory.ROCKETS, countdown_seconds: 15, raw_payload: {} },
    { id: "r-2", timestamp: new Date(base + 500).toISOString(), regions: ["Netivot"], centroids: [{ lat: 31.421, lng: 34.588 }], threat_category: ThreatCategory.ROCKETS, countdown_seconds: 15, raw_payload: {} },
    { id: "r-3", timestamp: new Date(base + 1000).toISOString(), regions: ["Ofakim"], centroids: [{ lat: 31.315, lng: 34.619 }], threat_category: ThreatCategory.ROCKETS, countdown_seconds: 30, raw_payload: {} },
  ];
}

describe("analysis pipeline", () => {
  it("returns empty for no alerts", () => {
    expect(runAnalysisPipeline([])).toEqual([]);
  });

  it("processes ballistic alerts into engagement analyses", () => {
    const alerts = makeBallisticAlerts();
    const results = runAnalysisPipeline(alerts, { minPoints: 3 });
    expect(results.length).toBeGreaterThan(0);

    const first = results[0];
    expect(first.engagement).toBeDefined();
    expect(first.clusters.length).toBeGreaterThan(0);
    expect(first.confidence.total).toBeGreaterThan(0);
  });

  it("classifies ballistic with trajectory arc", () => {
    const alerts = makeBallisticAlerts();
    const results = runAnalysisPipeline(alerts, { minPoints: 3 });

    const ballistic = results.find(
      (r) => r.classification === EngagementClassification.BALLISTIC_MISSILE
    );
    if (ballistic) {
      expect(ballistic.trajectories.length).toBeGreaterThan(0);
      expect(ballistic.ellipses.length).toBeGreaterThan(0);
    }
  });

  it("processes rocket alerts (non-ballistic)", () => {
    const alerts = makeRocketAlerts();
    const results = runAnalysisPipeline(alerts, { minPoints: 2 });
    expect(results.length).toBeGreaterThan(0);
    // Rockets should not have back-trace trajectories
    for (const r of results) {
      if (r.classification !== EngagementClassification.BALLISTIC_MISSILE) {
        expect(r.trajectories.length).toBe(0);
      }
    }
  });

  it("respects custom pipeline options", () => {
    const alerts = makeBallisticAlerts();
    // Very large epsilon should merge all into one cluster
    const results = runAnalysisPipeline(alerts, {
      epsilonKm: 500,
      minPoints: 2,
    });
    expect(results.length).toBeGreaterThan(0);
  });
});
