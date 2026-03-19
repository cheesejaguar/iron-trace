import type { LatLng } from "@/types";

const EARTH_RADIUS_KM = 6371;

/** Convert degrees to radians */
export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert radians to degrees */
export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Haversine distance between two points in kilometers */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const aLat = toRad(a.lat);
  const bLat = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat) * Math.cos(bLat) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Compute bearing from point a to point b in degrees (0=north, clockwise) */
export function bearing(a: LatLng, b: LatLng): number {
  const aLat = toRad(a.lat);
  const bLat = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);

  const y = Math.sin(dLng) * Math.cos(bLat);
  const x =
    Math.cos(aLat) * Math.sin(bLat) -
    Math.sin(aLat) * Math.cos(bLat) * Math.cos(dLng);

  return ((toDeg(Math.atan2(y, x)) % 360) + 360) % 360;
}

/** Compute centroid of a set of points */
export function centroid(points: LatLng[]): LatLng {
  if (points.length === 0) throw new Error("Cannot compute centroid of empty set");
  const sum = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  );
  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}
