import { ThreatCategory, type NormalizedAlert, type RawOrefAlert, type LatLng } from "@/types";
import { lookupLocality } from "@/data/gazetteer";

/** Map Pikud HaOref category codes to ThreatCategory */
function mapCategory(cat: string): ThreatCategory {
  switch (cat) {
    case "1": return ThreatCategory.MISSILES;
    case "2": return ThreatCategory.HOSTILE_AIRCRAFT;
    case "3": return ThreatCategory.UAV;
    case "4": return ThreatCategory.ROCKETS;
    default: return ThreatCategory.UNKNOWN;
  }
}

/** Deterministic ID from timestamp + regions for deduplication */
function computeAlertId(timestamp: string, regions: string[]): string {
  const hash = regions.sort().join("|");
  return `${timestamp}-${simpleHash(hash)}`;
}

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

/** Normalize a raw Pikud HaOref alert into internal format */
export function normalizeOrefAlert(raw: RawOrefAlert): NormalizedAlert {
  const timestamp = new Date().toISOString();
  const regions = raw.data;
  const centroids: LatLng[] = [];
  let totalCountdown = 0;
  let countdownCount = 0;

  for (const region of regions) {
    const locality = lookupLocality(region);
    if (locality) {
      centroids.push({ lat: locality.lat, lng: locality.lng });
      totalCountdown += locality.countdown_seconds;
      countdownCount++;
    }
  }

  return {
    id: computeAlertId(timestamp, regions),
    timestamp,
    regions,
    centroids,
    threat_category: mapCategory(raw.cat),
    countdown_seconds: countdownCount > 0 ? Math.round(totalCountdown / countdownCount) : 90,
    raw_payload: raw,
  };
}
