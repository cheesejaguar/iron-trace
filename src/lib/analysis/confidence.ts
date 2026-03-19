import type {
  ConfidenceScore,
  FittedEllipse,
  NormalizedAlert,
  SpatialCluster,
} from "@/types";
import { EngagementClassification, MunitionClass } from "@/types";

/**
 * Composite confidence scoring (PRD Section 5.4.1).
 *
 * Factor          | Weight | Rationale
 * Cluster size    | 0.25   | More data points improve ellipse fit quality
 * Eccentricity    | 0.20   | Higher eccentricity = stronger directional signal
 * Countdown       | 0.20   | Uniform countdown = single-munition-type salvo
 * Munition match  | 0.20   | OSINT-confirmed ballistic type boosts confidence
 * Temporal grad.  | 0.15   | Measurable time gradient = independent azimuth confirmation
 */
export function computeConfidence(
  cluster: SpatialCluster,
  ellipse: FittedEllipse | null,
  classification: EngagementClassification,
  munitionType: MunitionClass,
  alerts: NormalizedAlert[]
): ConfidenceScore {
  const clusterSize = scoreClusterSize(cluster.centroids.length);
  const eccentricity = ellipse ? scoreEccentricity(ellipse.eccentricity) : 0;
  const countdownConsistency = scoreCountdownConsistency(alerts);
  const munitionMatch = scoreMunitionMatch(classification, munitionType);
  const temporalGradient = scoreTemporalGradient(alerts, cluster);

  const total =
    clusterSize * 0.25 +
    eccentricity * 0.20 +
    countdownConsistency * 0.20 +
    munitionMatch * 0.20 +
    temporalGradient * 0.15;

  return {
    total: Math.round(total * 100) / 100,
    clusterSize,
    eccentricity,
    countdownConsistency,
    munitionMatch,
    temporalGradient,
  };
}

/** Score cluster size: 5+ is ideal, scales linearly from 3 */
function scoreClusterSize(n: number): number {
  if (n >= 10) return 1.0;
  if (n >= 5) return 0.7 + (n - 5) * 0.06;
  if (n >= 3) return 0.3 + (n - 3) * 0.2;
  return 0.1;
}

/** Score eccentricity: 0.7+ is ideal for ballistic */
function scoreEccentricity(e: number): number {
  if (e >= 0.85) return 1.0;
  if (e >= 0.70) return 0.6 + (e - 0.70) * 2.67;
  return e / 0.70 * 0.6;
}

/** Score countdown consistency: uniform values = single salvo */
function scoreCountdownConsistency(alerts: NormalizedAlert[]): number {
  if (alerts.length < 2) return 0.5;
  const countdowns = alerts.map((a) => a.countdown_seconds);
  const mean = countdowns.reduce((s, v) => s + v, 0) / countdowns.length;
  const variance =
    countdowns.reduce((s, v) => s + (v - mean) ** 2, 0) / countdowns.length;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
  // Low coefficient of variation = consistent
  if (cv < 0.05) return 1.0;
  if (cv < 0.15) return 0.7;
  if (cv < 0.30) return 0.4;
  return 0.1;
}

/** Score munition classification match */
function scoreMunitionMatch(
  classification: EngagementClassification,
  munitionType: MunitionClass
): number {
  if (classification !== EngagementClassification.BALLISTIC_MISSILE) return 0.1;
  switch (munitionType) {
    case MunitionClass.MRBM: return 0.9;
    case MunitionClass.HYPERSONIC_MRBM: return 1.0;
    case MunitionClass.SRBM: return 0.8;
    default: return 0.3;
  }
}

/** Score temporal gradient: measurable spatial-temporal gradient */
function scoreTemporalGradient(
  alerts: NormalizedAlert[],
  cluster: SpatialCluster
): number {
  if (alerts.length < 3 || cluster.centroids.length < 3) return 0;

  // Check if eastern localities alert before western ones
  const paired = alerts
    .filter((a) => a.centroids.length > 0)
    .map((a) => ({
      time: new Date(a.timestamp).getTime(),
      lng: a.centroids[0].lng,
    }))
    .sort((a, b) => a.time - b.time);

  if (paired.length < 3) return 0;

  // Compute correlation between time and longitude
  const n = paired.length;
  const meanT = paired.reduce((s, p) => s + p.time, 0) / n;
  const meanL = paired.reduce((s, p) => s + p.lng, 0) / n;

  let covTL = 0, varT = 0, varL = 0;
  for (const p of paired) {
    const dt = p.time - meanT;
    const dl = p.lng - meanL;
    covTL += dt * dl;
    varT += dt * dt;
    varL += dl * dl;
  }

  if (varT < 1e-6 || varL < 1e-6) return 0;

  const correlation = Math.abs(covTL / Math.sqrt(varT * varL));
  // Strong correlation indicates a measurable gradient
  if (correlation > 0.7) return 1.0;
  if (correlation > 0.4) return 0.5;
  return 0.1;
}
