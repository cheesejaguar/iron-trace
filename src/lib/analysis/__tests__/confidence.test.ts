import { describe, it, expect } from "vitest";
import { computeConfidence } from "../confidence";
import { EngagementClassification, MunitionClass } from "@/types";
import type { SpatialCluster, FittedEllipse, NormalizedAlert } from "@/types";
import { ThreatCategory } from "@/types";

function makeAlerts(count: number, countdown: number = 90): NormalizedAlert[] {
  const base = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: `a-${i}`,
    timestamp: new Date(base + i * 2000).toISOString(),
    regions: [`Region ${i}`],
    centroids: [{ lat: 31.5 + i * 0.1, lng: 35.0 + i * 0.05 }],
    threat_category: ThreatCategory.MISSILES,
    countdown_seconds: countdown,
    raw_payload: {},
  }));
}

function makeCluster(alerts: NormalizedAlert[]): SpatialCluster {
  return {
    id: "c-1",
    engagementId: "e-1",
    centroids: alerts.flatMap((a) => a.centroids),
    alerts,
  };
}

describe("confidence scoring", () => {
  it("returns total between 0 and 1", () => {
    const alerts = makeAlerts(5);
    const cluster = makeCluster(alerts);
    const ellipse: FittedEllipse = {
      center: { lat: 31.5, lng: 35.0 },
      semiMajorKm: 50,
      semiMinorKm: 10,
      eccentricity: 0.98,
      angle: 60,
    };
    const score = computeConfidence(
      cluster,
      ellipse,
      EngagementClassification.BALLISTIC_MISSILE,
      MunitionClass.MRBM,
      alerts
    );
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(1);
  });

  it("gives higher score to large clusters", () => {
    const smallAlerts = makeAlerts(3);
    const largeAlerts = makeAlerts(10);
    const smallCluster = makeCluster(smallAlerts);
    const largeCluster = makeCluster(largeAlerts);

    const smallScore = computeConfidence(
      smallCluster, null, EngagementClassification.UNKNOWN, MunitionClass.UNKNOWN, smallAlerts
    );
    const largeScore = computeConfidence(
      largeCluster, null, EngagementClassification.UNKNOWN, MunitionClass.UNKNOWN, largeAlerts
    );
    expect(largeScore.clusterSize).toBeGreaterThan(smallScore.clusterSize);
  });

  it("gives higher eccentricity score to elongated ellipses", () => {
    const alerts = makeAlerts(5);
    const cluster = makeCluster(alerts);
    const round: FittedEllipse = {
      center: { lat: 31.5, lng: 35.0 }, semiMajorKm: 30, semiMinorKm: 28,
      eccentricity: 0.25, angle: 0,
    };
    const elongated: FittedEllipse = {
      center: { lat: 31.5, lng: 35.0 }, semiMajorKm: 50, semiMinorKm: 5,
      eccentricity: 0.995, angle: 60,
    };

    const roundScore = computeConfidence(
      cluster, round, EngagementClassification.UNKNOWN, MunitionClass.UNKNOWN, alerts
    );
    const elongatedScore = computeConfidence(
      cluster, elongated, EngagementClassification.UNKNOWN, MunitionClass.UNKNOWN, alerts
    );
    expect(elongatedScore.eccentricity).toBeGreaterThan(roundScore.eccentricity);
  });

  it("rewards consistent countdowns", () => {
    const consistent = makeAlerts(5, 90); // all 90s
    const inconsistent = makeAlerts(5, 90);
    inconsistent[0].countdown_seconds = 15;
    inconsistent[1].countdown_seconds = 180;

    const cluster1 = makeCluster(consistent);
    const cluster2 = makeCluster(inconsistent);

    const score1 = computeConfidence(
      cluster1, null, EngagementClassification.UNKNOWN, MunitionClass.UNKNOWN, consistent
    );
    const score2 = computeConfidence(
      cluster2, null, EngagementClassification.UNKNOWN, MunitionClass.UNKNOWN, inconsistent
    );
    expect(score1.countdownConsistency).toBeGreaterThan(score2.countdownConsistency);
  });

  it("gives high munition match for MRBM ballistic", () => {
    const alerts = makeAlerts(5);
    const cluster = makeCluster(alerts);
    const score = computeConfidence(
      cluster, null, EngagementClassification.BALLISTIC_MISSILE, MunitionClass.MRBM, alerts
    );
    expect(score.munitionMatch).toBeGreaterThanOrEqual(0.9);
  });
});
