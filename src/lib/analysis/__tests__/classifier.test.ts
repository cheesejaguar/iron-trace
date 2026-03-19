import { describe, it, expect } from "vitest";
import { classifyEngagement } from "../classifier";
import {
  EngagementClassification,
  ThreatCategory,
  type FittedEllipse,
  type NormalizedAlert,
  type SpatialCluster,
} from "@/types";

function makeCluster(n: number): SpatialCluster {
  const centroids = Array.from({ length: n }, (_, i) => ({
    lat: 32 + i * 0.01,
    lng: 34.78,
  }));
  return {
    id: "test-cluster",
    engagementId: "test-eng",
    centroids,
    alerts: makeAlerts(n),
  };
}

function makeAlerts(n: number, countdown = 90, sequential = false): NormalizedAlert[] {
  const base = Date.now();
  return Array.from({ length: n }, (_, i) => ({
    id: `alert-${i}`,
    timestamp: new Date(base + (sequential ? i * 30000 : i * 2000)).toISOString(),
    regions: [`Region ${i}`],
    centroids: [{ lat: 32 + i * 0.01, lng: 34.78 }],
    threat_category: ThreatCategory.MISSILES,
    countdown_seconds: countdown,
    raw_payload: null,
  }));
}

function makeEllipse(eccentricity: number, semiMajorKm: number): FittedEllipse {
  return {
    center: { lat: 32.05, lng: 34.78 },
    semiMajorKm,
    semiMinorKm: semiMajorKm * Math.sqrt(1 - eccentricity ** 2),
    eccentricity,
    angle: 45,
  };
}

describe("classifyEngagement", () => {
  it("classifies high-eccentricity elongated cluster as ballistic", () => {
    const cluster = makeCluster(8);
    const ellipse = makeEllipse(0.85, 30);
    const alerts = makeAlerts(8, 90);
    const result = classifyEngagement(cluster, ellipse, alerts);
    expect(result.classification).toBe(EngagementClassification.BALLISTIC_MISSILE);
  });

  it("classifies low-eccentricity small cluster as rocket", () => {
    const cluster = makeCluster(5);
    const ellipse = makeEllipse(0.3, 5);
    const alerts = makeAlerts(5, 15);
    const result = classifyEngagement(cluster, ellipse, alerts);
    expect(result.classification).toBe(EngagementClassification.SHORT_RANGE_ROCKET);
  });

  it("classifies sequential low-eccentricity as cruise missile", () => {
    const cluster = makeCluster(5);
    const ellipse = makeEllipse(0.3, 15);
    const alerts = makeAlerts(5, 20, true); // Sequential over > 60s
    const result = classifyEngagement(cluster, ellipse, alerts);
    expect(result.classification).toBe(EngagementClassification.CRUISE_MISSILE);
  });

  it("returns unknown for null ellipse", () => {
    const cluster = makeCluster(3);
    const alerts = makeAlerts(3);
    const result = classifyEngagement(cluster, null, alerts);
    expect(result.classification).toBe(EngagementClassification.UNKNOWN);
  });

  it("classifies small semi-major as short range rocket", () => {
    const cluster = makeCluster(5);
    const ellipse = makeEllipse(0.75, 8); // High eccentricity but small
    const alerts = makeAlerts(5, 15);
    const result = classifyEngagement(cluster, ellipse, alerts);
    expect(result.classification).toBe(EngagementClassification.SHORT_RANGE_ROCKET);
  });
});
