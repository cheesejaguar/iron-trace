import type { LatLng } from "@/types";

/**
 * Vincenty direct & inverse formulae on the WGS-84 ellipsoid.
 * Based on T. Vincenty (1975), adapted from Chris Veness's JavaScript implementation
 * (movable-type.co.uk/scripts/latlong-vincenty.html).
 */

// WGS-84 ellipsoid constants
const WGS84_A = 6378137; // semi-major axis (m)
const WGS84_B = 6356752.314245; // semi-minor axis (m)
const WGS84_F = 1 / 298.257223563; // flattening

/**
 * Vincenty Direct: given a start point, bearing, and distance,
 * compute the destination point and final bearing.
 *
 * @param start Starting point
 * @param bearing Initial bearing in degrees (0 = north, clockwise)
 * @param distanceM Distance in meters
 * @returns Destination point and final bearing
 */
export function vincentyDirect(
  start: LatLng,
  bearing: number,
  distanceM: number
): { destination: LatLng; finalBearing: number } {
  const phi1 = toRad(start.lat);
  const lambda1 = toRad(start.lng);
  const alpha1 = toRad(bearing);
  const s = distanceM;

  const sinAlpha1 = Math.sin(alpha1);
  const cosAlpha1 = Math.cos(alpha1);

  const tanU1 = (1 - WGS84_F) * Math.tan(phi1);
  const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
  const sinU1 = tanU1 * cosU1;

  const sigma1 = Math.atan2(tanU1, cosAlpha1);
  const sinAlpha = cosU1 * sinAlpha1;
  const cosSqAlpha = 1 - sinAlpha * sinAlpha;

  const uSq = (cosSqAlpha * (WGS84_A * WGS84_A - WGS84_B * WGS84_B)) / (WGS84_B * WGS84_B);
  const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

  let sigma = s / (WGS84_B * A);
  let sigmaP: number;
  let sinSigma: number, cosSigma: number;
  let cos2SigmaM: number;

  let iterations = 0;
  do {
    cos2SigmaM = Math.cos(2 * sigma1 + sigma);
    sinSigma = Math.sin(sigma);
    cosSigma = Math.cos(sigma);

    const deltaSigma =
      B *
      sinSigma *
      (cos2SigmaM +
        (B / 4) *
          (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
            (B / 6) *
              cos2SigmaM *
              (-3 + 4 * sinSigma * sinSigma) *
              (-3 + 4 * cos2SigmaM * cos2SigmaM)));

    sigmaP = sigma;
    sigma = s / (WGS84_B * A) + deltaSigma;
  } while (Math.abs(sigma - sigmaP) > 1e-12 && ++iterations < 200);

  const x = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
  const phi2 = Math.atan2(
    sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
    (1 - WGS84_F) * Math.sqrt(sinAlpha * sinAlpha + x * x)
  );

  const lambda = Math.atan2(
    sinSigma * sinAlpha1,
    cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1
  );

  const C = (WGS84_F / 16) * cosSqAlpha * (4 + WGS84_F * (4 - 3 * cosSqAlpha));
  const L =
    lambda -
    (1 - C) *
      WGS84_F *
      sinAlpha *
      (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));

  const lambda2 = lambda1 + L;

  const alpha2 = Math.atan2(sinAlpha, -x);

  return {
    destination: {
      lat: toDeg(phi2),
      lng: ((toDeg(lambda2) + 540) % 360) - 180, // normalize to -180..+180
    },
    finalBearing: ((toDeg(alpha2) % 360) + 360) % 360,
  };
}

/**
 * Vincenty Inverse: given two points, compute distance and bearings.
 *
 * @returns Distance in meters, initial bearing, and final bearing
 */
export function vincentyInverse(
  p1: LatLng,
  p2: LatLng
): { distanceM: number; initialBearing: number; finalBearing: number } {
  const phi1 = toRad(p1.lat);
  const phi2 = toRad(p2.lat);
  const lambda1 = toRad(p1.lng);
  const lambda2 = toRad(p2.lng);

  const L = lambda2 - lambda1;
  const tanU1 = (1 - WGS84_F) * Math.tan(phi1);
  const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
  const sinU1 = tanU1 * cosU1;
  const tanU2 = (1 - WGS84_F) * Math.tan(phi2);
  const cosU2 = 1 / Math.sqrt(1 + tanU2 * tanU2);
  const sinU2 = tanU2 * cosU2;

  let lambda = L;
  let lambdaP: number;
  let sinLambda: number, cosLambda: number;
  let sinSigma: number, cosSigma: number, sigma: number;
  let sinAlpha: number, cosSqAlpha: number;
  let cos2SigmaM: number;
  let C: number;

  let iterations = 0;
  do {
    sinLambda = Math.sin(lambda);
    cosLambda = Math.cos(lambda);
    sinSigma = Math.sqrt(
      (cosU2 * sinLambda) ** 2 + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) ** 2
    );

    if (sinSigma === 0) return { distanceM: 0, initialBearing: 0, finalBearing: 0 };

    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    sinAlpha = (cosU1 * cosU2 * sinLambda) / sinSigma;
    cosSqAlpha = 1 - sinAlpha * sinAlpha;
    cos2SigmaM = cosSqAlpha !== 0 ? cosSigma - (2 * sinU1 * sinU2) / cosSqAlpha : 0;
    C = (WGS84_F / 16) * cosSqAlpha * (4 + WGS84_F * (4 - 3 * cosSqAlpha));

    lambdaP = lambda;
    lambda =
      L +
      (1 - C) *
        WGS84_F *
        sinAlpha *
        (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
  } while (Math.abs(lambda - lambdaP) > 1e-12 && ++iterations < 200);

  const uSq = (cosSqAlpha! * (WGS84_A * WGS84_A - WGS84_B * WGS84_B)) / (WGS84_B * WGS84_B);
  const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  const deltaSigma =
    B *
    sinSigma! *
    (cos2SigmaM! +
      (B / 4) *
        (cosSigma! * (-1 + 2 * cos2SigmaM! * cos2SigmaM!) -
          (B / 6) *
            cos2SigmaM! *
            (-3 + 4 * sinSigma! * sinSigma!) *
            (-3 + 4 * cos2SigmaM! * cos2SigmaM!)));

  const distanceM = WGS84_B * A * (sigma! - deltaSigma);

  const initialBearing =
    ((toDeg(
      Math.atan2(cosU2 * sinLambda!, cosU1 * sinU2 - sinU1 * cosU2 * cosLambda!)
    ) % 360) + 360) % 360;

  const finalBearing =
    ((toDeg(
      Math.atan2(cosU1 * sinLambda!, -sinU1 * cosU2 + cosU1 * sinU2 * cosLambda!)
    ) % 360) + 360) % 360;

  return { distanceM, initialBearing, finalBearing };
}

/**
 * Generate intermediate points along a geodesic line.
 * Useful for rendering great-circle arcs on the map.
 */
export function geodesicInterpolate(
  start: LatLng,
  bearing: number,
  distanceM: number,
  numPoints = 100
): LatLng[] {
  const points: LatLng[] = [start];
  const step = distanceM / numPoints;

  for (let i = 1; i <= numPoints; i++) {
    const { destination } = vincentyDirect(start, bearing, step * i);
    points.push(destination);
  }

  return points;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
