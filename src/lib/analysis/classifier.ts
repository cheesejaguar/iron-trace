import {
  EngagementClassification,
  MunitionClass,
  type FittedEllipse,
  type NormalizedAlert,
  type SpatialCluster,
} from "@/types";
import { MUNITION_SIGNATURES } from "@/data/munitions";

interface ClassificationResult {
  classification: EngagementClassification;
  munitionType: MunitionClass;
  matchedMunition: string | null;
}

/**
 * Munition classification decision tree (PRD Section 6.2).
 * Evaluates eccentricity, semi-major axis, countdown, and temporal pattern
 * to classify an engagement cluster.
 */
export function classifyEngagement(
  cluster: SpatialCluster,
  ellipse: FittedEllipse | null,
  alerts: NormalizedAlert[]
): ClassificationResult {
  // Default: unknown
  if (!ellipse || cluster.centroids.length < 3) {
    return {
      classification: EngagementClassification.UNKNOWN,
      munitionType: MunitionClass.UNKNOWN,
      matchedMunition: null,
    };
  }

  const { eccentricity, semiMajorKm } = ellipse;
  const countdowns = alerts.map((a) => a.countdown_seconds);
  const medianCountdown = median(countdowns);

  // Step 1: Eccentricity check
  if (eccentricity < 0.50) {
    if (semiMajorKm < 10) {
      return {
        classification: EngagementClassification.SHORT_RANGE_ROCKET,
        munitionType: MunitionClass.ROCKET,
        matchedMunition: matchMunition(eccentricity, semiMajorKm, medianCountdown),
      };
    }
    // Could be cruise missile or UAV
    return {
      classification: isSequentialPattern(alerts)
        ? EngagementClassification.CRUISE_MISSILE
        : EngagementClassification.UAV,
      munitionType: isSequentialPattern(alerts)
        ? MunitionClass.CRUISE_MISSILE
        : MunitionClass.OWA_UAV,
      matchedMunition: matchMunition(eccentricity, semiMajorKm, medianCountdown),
    };
  }

  // Step 2: Semi-major axis check
  if (semiMajorKm < 10) {
    return {
      classification: EngagementClassification.SHORT_RANGE_ROCKET,
      munitionType: MunitionClass.ROCKET,
      matchedMunition: matchMunition(eccentricity, semiMajorKm, medianCountdown),
    };
  }

  // Step 3: Countdown cross-reference
  if (medianCountdown < 30) {
    return {
      classification: isSequentialPattern(alerts)
        ? EngagementClassification.CRUISE_MISSILE
        : EngagementClassification.SHORT_RANGE_ROCKET,
      munitionType: isSequentialPattern(alerts)
        ? MunitionClass.CRUISE_MISSILE
        : MunitionClass.ROCKET,
      matchedMunition: matchMunition(eccentricity, semiMajorKm, medianCountdown),
    };
  }

  // Step 4: Temporal pattern check
  if (isSequentialPattern(alerts)) {
    return {
      classification: EngagementClassification.CRUISE_MISSILE,
      munitionType: MunitionClass.CRUISE_MISSILE,
      matchedMunition: matchMunition(eccentricity, semiMajorKm, medianCountdown),
    };
  }

  // All checks pass → ballistic missile
  return {
    classification: EngagementClassification.BALLISTIC_MISSILE,
    munitionType: matchBallisticType(eccentricity, semiMajorKm, medianCountdown),
    matchedMunition: matchMunition(eccentricity, semiMajorKm, medianCountdown),
  };
}

/** Check if alerts arrive sequentially over > 60 seconds */
function isSequentialPattern(alerts: NormalizedAlert[]): boolean {
  if (alerts.length < 2) return false;
  const times = alerts.map((a) => new Date(a.timestamp).getTime()).sort((a, b) => a - b);
  const span = times[times.length - 1] - times[0];
  return span > 60000;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Find best-matching munition from signature library */
function matchMunition(
  eccentricity: number,
  semiMajorKm: number,
  countdown: number
): string | null {
  let bestMatch: string | null = null;
  let bestScore = -Infinity;

  for (const sig of MUNITION_SIGNATURES) {
    let score = 0;
    if (eccentricity >= sig.eccentricity_min && eccentricity <= sig.eccentricity_max) score++;
    if (semiMajorKm >= sig.semi_major_min_km && semiMajorKm <= sig.semi_major_max_km) score++;
    if (countdown >= sig.countdown_min_s && countdown <= sig.countdown_max_s) score++;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = sig.name;
    }
  }

  return bestScore >= 2 ? bestMatch : null;
}

/** Determine specific ballistic missile type from parameters */
function matchBallisticType(
  eccentricity: number,
  semiMajorKm: number,
  countdown: number
): MunitionClass {
  if (eccentricity > 0.85 && countdown >= 60) return MunitionClass.HYPERSONIC_MRBM;
  if (countdown >= 90) return MunitionClass.MRBM;
  if (countdown >= 45) return MunitionClass.SRBM;
  return MunitionClass.MRBM;
}
