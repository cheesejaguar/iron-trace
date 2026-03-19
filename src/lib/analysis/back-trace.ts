import type { LatLng, FittedEllipse, TrajectoryArc, MunitionSignature } from "@/types";
import { ThreatOrigin, MunitionClass } from "@/types";
import { vincentyDirect, geodesicInterpolate } from "./vincenty";
import { bearing as computeBearing } from "./haversine";
import { MUNITION_SIGNATURES } from "@/data/munitions";

/**
 * Azimuth ranges (from central Israel) toward known threat regions.
 * Used for disambiguation of the bidirectional semi-major axis.
 */
const THREAT_BEARING_RANGES = {
  [ThreatOrigin.IRAN]: { min: 30, max: 90 },
  [ThreatOrigin.LEBANON]: { min: 340, max: 30 }, // wraps around north
  [ThreatOrigin.SYRIA]: { min: 20, max: 60 },
};

/**
 * Default back-trace distances by threat origin (km).
 * Used when munition type is unknown.
 */
const DEFAULT_TRACE_DISTANCES: Record<ThreatOrigin, { min: number; max: number }> = {
  [ThreatOrigin.IRAN]: { min: 1000, max: 1800 },
  [ThreatOrigin.LEBANON]: { min: 50, max: 200 },
  [ThreatOrigin.SYRIA]: { min: 100, max: 400 },
  [ThreatOrigin.UNKNOWN]: { min: 200, max: 1000 },
};

/**
 * Maximum range for each munition class (km).
 * Used to constrain back-trace distance based on identified munition.
 */
const MUNITION_MAX_RANGE_KM: Record<MunitionClass, number> = {
  [MunitionClass.MRBM]: 2000,       // Shahab-3/Emad: ~1300-2000km
  [MunitionClass.HYPERSONIC_MRBM]: 1500, // Fattah-1: ~1400km
  [MunitionClass.SRBM]: 700,        // Fateh-110/Dezful: ~300-700km
  [MunitionClass.CRUISE_MISSILE]: 1650, // Paveh: ~1650km
  [MunitionClass.OWA_UAV]: 2500,    // Shahed-136: ~2500km
  [MunitionClass.ROCKET]: 200,      // Fajr-5: ~75km, Zelzal: ~200km
  [MunitionClass.UNKNOWN]: 1800,
};

/**
 * Minimum range for each munition class (km).
 * The arc should extend at least this far.
 */
const MUNITION_MIN_RANGE_KM: Record<MunitionClass, number> = {
  [MunitionClass.MRBM]: 800,
  [MunitionClass.HYPERSONIC_MRBM]: 800,
  [MunitionClass.SRBM]: 100,
  [MunitionClass.CRUISE_MISSILE]: 300,
  [MunitionClass.OWA_UAV]: 500,
  [MunitionClass.ROCKET]: 20,
  [MunitionClass.UNKNOWN]: 200,
};

interface BackTraceOptions {
  /** Uncertainty cone half-angle in degrees (default ±10°) */
  coneHalfAngle?: number;
  /** Number of points for arc interpolation */
  arcResolution?: number;
  /** Identified munition class (constrains trace distance) */
  munitionClass?: MunitionClass;
  /** Specific matched munition name (for precise range lookup) */
  matchedMunition?: string | null;
}

/**
 * Compute back-trace from a fitted ellipse.
 *
 * 1. Takes the semi-major axis azimuth from the ellipse
 * 2. Disambiguates direction using geographic constraints
 * 3. Determines trace distance from munition max range (if known)
 *    or defaults to threat-region distance
 * 4. Projects great-circle arc via Vincenty direct
 * 5. Generates uncertainty cone
 */
export function computeBackTrace(
  ellipse: FittedEllipse,
  engagementId: string,
  options: BackTraceOptions = {}
): TrajectoryArc | null {
  const {
    coneHalfAngle = 10,
    arcResolution = 100,
    munitionClass,
    matchedMunition,
  } = options;

  // The ellipse angle gives the semi-major axis azimuth.
  // The back-azimuth is the opposite direction (pointing toward launch).
  const forwardAzimuth = ellipse.angle;
  const backAzimuth1 = (forwardAzimuth + 180) % 360;
  const backAzimuth2 = forwardAzimuth;

  // Disambiguate: which of the two azimuths points toward a threat region?
  const origin1 = identifyThreatOrigin(backAzimuth1);
  const origin2 = identifyThreatOrigin(backAzimuth2);

  let backAzimuth: number;
  let estimatedOrigin: ThreatOrigin;

  if (origin1 !== ThreatOrigin.UNKNOWN && origin2 === ThreatOrigin.UNKNOWN) {
    backAzimuth = backAzimuth1;
    estimatedOrigin = origin1;
  } else if (origin2 !== ThreatOrigin.UNKNOWN && origin1 === ThreatOrigin.UNKNOWN) {
    backAzimuth = backAzimuth2;
    estimatedOrigin = origin2;
  } else if (origin1 !== ThreatOrigin.UNKNOWN) {
    // Both valid; prefer Iran over Lebanon (longer range = more likely ballistic)
    backAzimuth = origin1 === ThreatOrigin.IRAN ? backAzimuth1 : backAzimuth2;
    estimatedOrigin = origin1 === ThreatOrigin.IRAN ? origin1 : origin2;
  } else {
    // Neither points to a known threat region — cannot trace
    return null;
  }

  // Determine trace distance
  const distanceKm = computeTraceDistance(
    estimatedOrigin,
    munitionClass,
    matchedMunition
  );

  // Generate great-circle arc points
  const arcPoints = geodesicInterpolate(
    ellipse.center,
    backAzimuth,
    distanceKm * 1000, // Convert km to meters
    arcResolution
  );

  // Generate uncertainty cone
  const uncertaintyCone = generateUncertaintyCone(
    ellipse.center,
    backAzimuth,
    distanceKm * 1000,
    coneHalfAngle
  );

  return {
    id: `arc-${engagementId}`,
    engagementId,
    origin: ellipse.center,
    backAzimuth,
    arcPoints,
    uncertaintyCone,
    estimatedOrigin,
    distanceKm,
  };
}

/**
 * Compute trace distance using munition max range when available,
 * falling back to default threat-region distances.
 */
function computeTraceDistance(
  origin: ThreatOrigin,
  munitionClass?: MunitionClass,
  matchedMunition?: string | null
): number {
  // Priority 1: Use specific munition's max range if matched
  if (matchedMunition) {
    const sig = MUNITION_SIGNATURES.find((s) => s.name === matchedMunition);
    if (sig) {
      const maxRange = MUNITION_MAX_RANGE_KM[sig.class];
      const minRange = MUNITION_MIN_RANGE_KM[sig.class];
      // Use the munition's max range, but ensure it reaches the threat region
      return Math.max(minRange, maxRange);
    }
  }

  // Priority 2: Use munition class range bounds
  if (munitionClass && munitionClass !== MunitionClass.UNKNOWN) {
    return MUNITION_MAX_RANGE_KM[munitionClass];
  }

  // Priority 3: Default by threat region
  const defaults = DEFAULT_TRACE_DISTANCES[origin];
  return defaults.max;
}

/** Identify threat origin from back-azimuth */
function identifyThreatOrigin(azimuth: number): ThreatOrigin {
  for (const [origin, range] of Object.entries(THREAT_BEARING_RANGES)) {
    if (range.min < range.max) {
      // Normal range
      if (azimuth >= range.min && azimuth <= range.max) {
        return origin as ThreatOrigin;
      }
    } else {
      // Wraps around 360°
      if (azimuth >= range.min || azimuth <= range.max) {
        return origin as ThreatOrigin;
      }
    }
  }
  return ThreatOrigin.UNKNOWN;
}

/** Generate uncertainty cone as a polygon */
function generateUncertaintyCone(
  origin: LatLng,
  centralBearing: number,
  distanceM: number,
  halfAngle: number
): LatLng[] {
  const leftBearing = (centralBearing - halfAngle + 360) % 360;
  const rightBearing = (centralBearing + halfAngle + 360) % 360;

  // Left edge of cone
  const leftEdge = geodesicInterpolate(origin, leftBearing, distanceM, 30);
  // Right edge of cone (reversed so polygon is contiguous)
  const rightEdge = geodesicInterpolate(origin, rightBearing, distanceM, 30).reverse();

  // Close the polygon: origin → left edge → far arc → right edge → origin
  return [origin, ...leftEdge, ...rightEdge, origin];
}
