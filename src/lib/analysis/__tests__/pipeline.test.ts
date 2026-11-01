import { describe, it, expect } from "vitest";
import { runAnalysisPipeline } from "../pipeline";
import type { NormalizedAlert } from "@/types";
import { ThreatCategory, EngagementClassification, MunitionClass, ThreatOrigin } from "@/types";

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
    // All 8 alerts fall in one 15s window and one ~50km spatial cluster
    expect(results).toHaveLength(1);

    const first = results[0];
    expect(first.engagement.alerts).toHaveLength(8);
    expect(first.engagement.windowStart).toBe(alerts[0].timestamp);
    expect(first.engagement.windowEnd).toBe(alerts[7].timestamp);
    expect(first.clusters).toHaveLength(1);
    expect(first.clusters[0].alerts).toHaveLength(8);
    expect(first.ellipses).toHaveLength(1);
    expect(first.timestamp).toBe(alerts[0].timestamp);
    expect(first.confidence.total).toBeGreaterThan(0.9);
  });

  it("classifies ballistic with trajectory arc", () => {
    const alerts = makeBallisticAlerts();
    const results = runAnalysisPipeline(alerts, { minPoints: 3 });

    expect(results).toHaveLength(1);
    const [ballistic] = results;
    expect(ballistic.classification).toBe(EngagementClassification.BALLISTIC_MISSILE);
    expect(ballistic.ellipses).toHaveLength(1);
    expect(ballistic.trajectories).toHaveLength(1);
    expect(ballistic.trajectories[0].estimatedOrigin).toBe(ThreatOrigin.IRAN);
    expect(ballistic.trajectories[0].origin).toEqual(ballistic.ellipses[0].center);
  });

  it("processes rocket alerts (non-ballistic)", () => {
    const alerts = makeRocketAlerts();
    const results = runAnalysisPipeline(alerts, { minPoints: 2 });
    expect(results).toHaveLength(1);
    // Median countdown 15s → short-range rocket, which gets no back-trace
    expect(results[0].classification).toBe(EngagementClassification.SHORT_RANGE_ROCKET);
    expect(results[0].munitionType).toBe(MunitionClass.ROCKET);
    expect(results[0].trajectories).toEqual([]);
  });

  it("respects custom pipeline options", () => {
    const alerts = makeBallisticAlerts();
    expect(runAnalysisPipeline(alerts, { minPoints: 3 })).toHaveLength(1);

    // Alerts are 1.5s apart: a 1s window puts each in its own engagement,
    // each too small to fit an ellipse or classify
    const split = runAnalysisPipeline(alerts, { windowMs: 1000, minPoints: 3 });
    expect(split).toHaveLength(8);
    for (const r of split) {
      expect(r.engagement.alerts).toHaveLength(1);
      expect(r.ellipses).toEqual([]);
      expect(r.classification).toBe(EngagementClassification.UNKNOWN);
    }

    // A 1km DBSCAN radius isolates every city, so nothing clusters
    expect(runAnalysisPipeline(alerts, { epsilonKm: 1, minPoints: 3 })).toEqual([]);
  });
});
