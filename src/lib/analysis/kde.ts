import type { LatLng, TrajectoryArc } from "@/types";

/**
 * Kernel Density Estimation for trajectory arc intersections.
 * Computes intersection points between pairs of arcs, then applies
 * a Gaussian kernel to produce a heatmap intensity grid.
 */

interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
}

/**
 * Find approximate intersection points between trajectory arcs.
 * Uses pairwise segment intersection tests on arc polylines.
 */
export function findArcIntersections(arcs: TrajectoryArc[]): LatLng[] {
  const intersections: LatLng[] = [];

  for (let i = 0; i < arcs.length; i++) {
    for (let j = i + 1; j < arcs.length; j++) {
      const points = findPolylineIntersections(
        arcs[i].arcPoints,
        arcs[j].arcPoints
      );
      intersections.push(...points);
    }
  }

  return intersections;
}

/** Find intersections between two polylines (approximate, segment-based) */
function findPolylineIntersections(
  lineA: LatLng[],
  lineB: LatLng[]
): LatLng[] {
  const results: LatLng[] = [];
  // Sample every 10th segment for performance
  const stepA = Math.max(1, Math.floor(lineA.length / 20));
  const stepB = Math.max(1, Math.floor(lineB.length / 20));

  for (let i = 0; i < lineA.length - stepA; i += stepA) {
    for (let j = 0; j < lineB.length - stepB; j += stepB) {
      const inter = segmentIntersection(
        lineA[i],
        lineA[Math.min(i + stepA, lineA.length - 1)],
        lineB[j],
        lineB[Math.min(j + stepB, lineB.length - 1)]
      );
      if (inter) {
        results.push(inter);
      }
    }
  }

  return results;
}

/** 2D segment intersection (treating lat/lng as planar for local areas) */
function segmentIntersection(
  a1: LatLng,
  a2: LatLng,
  b1: LatLng,
  b2: LatLng
): LatLng | null {
  const dx1 = a2.lat - a1.lat;
  const dy1 = a2.lng - a1.lng;
  const dx2 = b2.lat - b1.lat;
  const dy2 = b2.lng - b1.lng;

  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-10) return null; // Parallel

  const t = ((b1.lat - a1.lat) * dy2 - (b1.lng - a1.lng) * dx2) / denom;
  const u = ((b1.lat - a1.lat) * dy1 - (b1.lng - a1.lng) * dx1) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      lat: a1.lat + t * dx1,
      lng: a1.lng + t * dy1,
    };
  }

  return null;
}

/**
 * Compute KDE heat points from intersection points.
 * Uses Gaussian kernel with configurable bandwidth.
 *
 * @param points Intersection points
 * @param confidenceWeights Weight per arc pair (optional)
 * @param bandwidthKm Kernel bandwidth in km (default 50)
 * @returns Array of [lat, lng, intensity] for leaflet.heat
 */
export function computeKDE(
  points: LatLng[],
  bandwidthKm = 50
): HeatPoint[] {
  if (points.length === 0) return [];

  // For simplicity, use the intersection points directly as heat points
  // with intensity based on local density
  const heatPoints: HeatPoint[] = [];
  const bandwidthDeg = bandwidthKm / 111.32; // Approximate conversion

  for (const p of points) {
    // Count nearby points within bandwidth
    let density = 0;
    for (const q of points) {
      const dist = Math.sqrt((p.lat - q.lat) ** 2 + (p.lng - q.lng) ** 2);
      // Gaussian kernel
      density += Math.exp(-(dist * dist) / (2 * bandwidthDeg * bandwidthDeg));
    }

    heatPoints.push({
      lat: p.lat,
      lng: p.lng,
      intensity: density / points.length,
    });
  }

  // Normalize intensities to [0, 1]
  const maxIntensity = Math.max(...heatPoints.map((p) => p.intensity), 1e-6);
  for (const p of heatPoints) {
    p.intensity /= maxIntensity;
  }

  return heatPoints;
}

/**
 * Generate heat points from trajectory arcs.
 * Combines arc intersections and arc endpoints near known threat regions.
 */
export function generateHeatmap(arcs: TrajectoryArc[]): HeatPoint[] {
  if (arcs.length === 0) return [];

  // Method 1: Arc-arc intersections
  const intersections = findArcIntersections(arcs);

  // Method 2: Arc endpoints (estimated launch sites)
  const endpoints = arcs.map((arc) => arc.arcPoints[arc.arcPoints.length - 1]);

  // Combine both sets
  const allPoints = [...intersections, ...endpoints];

  return computeKDE(allPoints);
}
