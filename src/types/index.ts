/** WGS-84 coordinate pair */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Threat categories from Pikud HaOref */
export enum ThreatCategory {
  MISSILES = "MISSILES",
  HOSTILE_AIRCRAFT = "HOSTILE_AIRCRAFT",
  UAV = "UAV",
  ROCKETS = "ROCKETS",
  UNKNOWN = "UNKNOWN",
}

/** Munition classification result */
export enum MunitionClass {
  MRBM = "MRBM",
  SRBM = "SRBM",
  HYPERSONIC_MRBM = "HYPERSONIC_MRBM",
  CRUISE_MISSILE = "CRUISE_MISSILE",
  OWA_UAV = "OWA_UAV",
  ROCKET = "ROCKET",
  UNKNOWN = "UNKNOWN",
}

/** Ballistic pipeline classification */
export enum EngagementClassification {
  BALLISTIC_MISSILE = "BALLISTIC_MISSILE",
  SHORT_RANGE_ROCKET = "SHORT_RANGE_ROCKET",
  CRUISE_MISSILE = "CRUISE_MISSILE",
  UAV = "UAV",
  UNKNOWN = "UNKNOWN",
}

/** Estimated threat origin region */
export enum ThreatOrigin {
  IRAN = "IRAN",
  LEBANON = "LEBANON",
  SYRIA = "SYRIA",
  UNKNOWN = "UNKNOWN",
}

/** Raw alert from Pikud HaOref API */
export interface RawOrefAlert {
  id: string;
  cat: string;
  title: string;
  data: string[];
  desc: string;
}

/** Normalized internal alert */
export interface NormalizedAlert {
  id: string;
  timestamp: string;
  regions: string[];
  centroids: LatLng[];
  threat_category: ThreatCategory;
  countdown_seconds: number;
  raw_payload: unknown;
}

/** Gazetteer entry for an Israeli locality */
export interface LocalityEntry {
  name_he: string;
  name_en: string;
  lat: number;
  lng: number;
  countdown_seconds: number;
  region: string;
}

/** Munition signature from OSINT knowledge base */
export interface MunitionSignature {
  name: string;
  class: MunitionClass;
  flight_time_min_s: number;
  flight_time_max_s: number;
  eccentricity_min: number;
  eccentricity_max: number;
  semi_major_min_km: number;
  semi_major_max_km: number;
  countdown_min_s: number;
  countdown_max_s: number;
  alert_pattern: string;
}

/** Known or suspected launch site */
export interface LaunchSite {
  name: string;
  country: string;
  lat: number;
  lng: number;
  associated_munitions: string[];
  source: string;
}

/** Fitted ellipse parameters from Khachiyan algorithm */
export interface FittedEllipse {
  center: LatLng;
  semiMajorKm: number;
  semiMinorKm: number;
  eccentricity: number;
  /** Azimuth of semi-major axis in degrees (0=north, clockwise) */
  angle: number;
}

/** Engagement window: a group of temporally-clustered alerts */
export interface EngagementWindow {
  id: string;
  windowStart: string;
  windowEnd: string;
  alerts: NormalizedAlert[];
}

/** Spatial sub-cluster within an engagement window */
export interface SpatialCluster {
  id: string;
  engagementId: string;
  centroids: LatLng[];
  alerts: NormalizedAlert[];
}

/** Trajectory arc from back-trace computation */
export interface TrajectoryArc {
  id: string;
  engagementId: string;
  origin: LatLng;
  backAzimuth: number;
  arcPoints: LatLng[];
  uncertaintyCone: LatLng[];
  estimatedOrigin: ThreatOrigin;
  distanceKm: number;
}

/** Confidence score breakdown */
export interface ConfidenceScore {
  total: number;
  clusterSize: number;
  eccentricity: number;
  countdownConsistency: number;
  munitionMatch: number;
  temporalGradient: number;
}

/** Full engagement analysis result */
export interface EngagementAnalysis {
  id: string;
  engagement: EngagementWindow;
  clusters: SpatialCluster[];
  ellipses: FittedEllipse[];
  classification: EngagementClassification;
  munitionType: MunitionClass;
  trajectories: TrajectoryArc[];
  confidence: ConfidenceScore;
  timestamp: string;
}
