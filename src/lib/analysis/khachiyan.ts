import type { LatLng, FittedEllipse } from "@/types";
import { haversineDistance, toDeg } from "./haversine";

/**
 * Minimum-area bounding ellipse via Khachiyan's algorithm.
 * Operates in a local 2D coordinate frame (km offsets from centroid)
 * to handle geographic coordinates correctly.
 *
 * Returns ellipse parameters in geographic terms.
 */
export function fitEllipse(points: LatLng[]): FittedEllipse {
  if (points.length < 3) {
    throw new Error("Need at least 3 points to fit an ellipse");
  }

  // Compute centroid
  const cx = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.lng, 0) / points.length;
  const center: LatLng = { lat: cx, lng: cy };

  // Project to local km coordinates
  // At the centroid latitude, 1 degree lat ≈ 111.32 km
  // 1 degree lng ≈ 111.32 * cos(lat) km
  const kmPerDegLat = 111.32;
  const kmPerDegLng = 111.32 * Math.cos((cx * Math.PI) / 180);

  const localPoints: [number, number][] = points.map((p) => [
    (p.lat - cx) * kmPerDegLat,
    (p.lng - cy) * kmPerDegLng,
  ]);

  // Run Khachiyan's algorithm in 2D
  const { A, c: ellipseCenter } = khachiyan2D(localPoints);

  // Extract ellipse parameters from the matrix A
  // A defines the ellipse as (x-c)^T A (x-c) <= 1
  const { semiMajor, semiMinor, angle } = extractEllipseParams(A);

  // Adjust center back to geographic
  const adjustedCenter: LatLng = {
    lat: cx + ellipseCenter[0] / kmPerDegLat,
    lng: cy + ellipseCenter[1] / kmPerDegLng,
  };

  const eccentricity =
    semiMajor > 0 ? Math.sqrt(1 - (semiMinor / semiMajor) ** 2) : 0;

  // Convert angle from local frame to geographic azimuth (0=north, CW)
  // In local frame: x=north, y=east. angle is from x-axis CCW.
  // Azimuth = 90 - angle (convert from math convention to bearing)
  const azimuth = ((90 - toDeg(angle)) % 360 + 360) % 360;

  return {
    center: adjustedCenter,
    semiMajorKm: semiMajor,
    semiMinorKm: semiMinor,
    eccentricity,
    angle: azimuth,
  };
}

/**
 * Khachiyan's algorithm for minimum-volume enclosing ellipsoid in 2D.
 * Iteratively refines a matrix A and center c such that
 * (x-c)^T A (x-c) <= 1 for all input points.
 */
function khachiyan2D(
  points: [number, number][],
  tolerance = 1e-6,
  maxIter = 100
): { A: [number, number, number]; c: [number, number] } {
  const n = points.length;
  const d = 2;

  // Initialize uniform weights
  const u = new Array(n).fill(1 / n);

  for (let iter = 0; iter < maxIter; iter++) {
    // Compute weighted center
    let cx = 0, cy = 0;
    for (let i = 0; i < n; i++) {
      cx += u[i] * points[i][0];
      cy += u[i] * points[i][1];
    }

    // Compute weighted covariance matrix S = sum(u_i * (p_i - c)(p_i - c)^T)
    let s00 = 0, s01 = 0, s11 = 0;
    for (let i = 0; i < n; i++) {
      const dx = points[i][0] - cx;
      const dy = points[i][1] - cy;
      s00 += u[i] * dx * dx;
      s01 += u[i] * dx * dy;
      s11 += u[i] * dy * dy;
    }

    // Invert S (2x2 matrix inversion)
    const det = s00 * s11 - s01 * s01;
    if (Math.abs(det) < 1e-12) break;

    const inv00 = s11 / det;
    const inv01 = -s01 / det;
    const inv11 = s00 / det;

    // Find point with maximum Mahalanobis distance
    let maxDist = -Infinity;
    let maxIdx = 0;
    for (let i = 0; i < n; i++) {
      const dx = points[i][0] - cx;
      const dy = points[i][1] - cy;
      const dist = (inv00 * dx + inv01 * dy) * dx + (inv01 * dx + inv11 * dy) * dy;
      if (dist > maxDist) {
        maxDist = dist;
        maxIdx = i;
      }
    }

    // Check convergence
    const step = (maxDist / d - 1) / (maxDist - 1);
    if (step < tolerance) break;

    // Update weight of maximum point
    const newWeight = (1 - step) * u[maxIdx] + step;
    for (let i = 0; i < n; i++) {
      u[i] *= 1 - step;
    }
    u[maxIdx] = newWeight;
  }

  // Compute final center and covariance
  let cx = 0, cy = 0;
  for (let i = 0; i < n; i++) {
    cx += u[i] * points[i][0];
    cy += u[i] * points[i][1];
  }

  let s00 = 0, s01 = 0, s11 = 0;
  for (let i = 0; i < n; i++) {
    const dx = points[i][0] - cx;
    const dy = points[i][1] - cy;
    s00 += u[i] * dx * dx;
    s01 += u[i] * dx * dy;
    s11 += u[i] * dy * dy;
  }

  // Scale covariance to get the bounding ellipse matrix
  // A = (1/d) * S^{-1}
  const det = s00 * s11 - s01 * s01;
  const scale = 1 / (d * det);

  return {
    A: [s11 * scale, -s01 * scale, s00 * scale], // [a00, a01, a11]
    c: [cx, cy],
  };
}

/**
 * Extract semi-axes lengths and rotation angle from the ellipse matrix A.
 * A = [a00, a01; a01, a11]
 * Eigenvalues of A give 1/semiAxis^2
 */
function extractEllipseParams(A: [number, number, number]): {
  semiMajor: number;
  semiMinor: number;
  angle: number;
} {
  const [a00, a01, a11] = A;

  // Eigenvalues of 2x2 symmetric matrix
  const trace = a00 + a11;
  const det = a00 * a11 - a01 * a01;
  const discriminant = Math.sqrt(Math.max(0, trace * trace / 4 - det));

  const lambda1 = trace / 2 + discriminant;
  const lambda2 = trace / 2 - discriminant;

  // Semi-axes are 1/sqrt(eigenvalue)
  const axis1 = lambda1 > 0 ? 1 / Math.sqrt(lambda1) : 0;
  const axis2 = lambda2 > 0 ? 1 / Math.sqrt(lambda2) : 0;

  const semiMajor = Math.max(axis1, axis2);
  const semiMinor = Math.min(axis1, axis2);

  // Angle of semi-major axis (eigenvector of smaller eigenvalue = longer axis)
  let angle: number;
  if (Math.abs(a01) < 1e-10) {
    angle = a00 < a11 ? 0 : Math.PI / 2;
  } else {
    const smallerLambda = semiMajor === axis1 ? lambda1 : lambda2;
    angle = Math.atan2(smallerLambda - a00, a01);
  }

  return { semiMajor, semiMinor, angle };
}

/**
 * Generate an array of LatLng points representing the ellipse boundary.
 * Useful for rendering the ellipse on the map.
 */
export function ellipseToPolygon(
  ellipse: FittedEllipse,
  numPoints = 64
): LatLng[] {
  const { center, semiMajorKm, semiMinorKm, angle } = ellipse;
  const kmPerDegLat = 111.32;
  const kmPerDegLng = 111.32 * Math.cos((center.lat * Math.PI) / 180);

  // Convert angle to radians (from azimuth back to math angle)
  const theta = ((90 - angle) * Math.PI) / 180;

  const points: LatLng[] = [];
  for (let i = 0; i < numPoints; i++) {
    const t = (2 * Math.PI * i) / numPoints;
    // Parametric ellipse in local frame
    const x = semiMajorKm * Math.cos(t);
    const y = semiMinorKm * Math.sin(t);
    // Rotate
    const rx = x * Math.cos(theta) - y * Math.sin(theta);
    const ry = x * Math.sin(theta) + y * Math.cos(theta);
    // Convert back to geographic
    points.push({
      lat: center.lat + rx / kmPerDegLat,
      lng: center.lng + ry / kmPerDegLng,
    });
  }

  return points;
}
