import type { LatLng, SpatialCluster, NormalizedAlert } from "@/types";
import { haversineDistance } from "./haversine";

const NOISE = -1;

/**
 * DBSCAN clustering for geographic points.
 * Uses haversine distance for accurate geo-distance computation.
 *
 * @param points Array of LatLng points to cluster
 * @param epsilonKm Neighborhood radius in kilometers (default 25)
 * @param minPoints Minimum points to form a dense region (default 3)
 * @returns Array of clusters, each containing indices of points
 */
export function dbscan(
  points: LatLng[],
  epsilonKm = 25,
  minPoints = 3
): number[][] {
  const n = points.length;
  const labels = new Array<number>(n).fill(-2); // -2 = unvisited
  const clusters: number[][] = [];
  let clusterId = 0;

  for (let i = 0; i < n; i++) {
    if (labels[i] !== -2) continue; // Already processed

    const neighbors = regionQuery(points, i, epsilonKm);

    if (neighbors.length < minPoints) {
      labels[i] = NOISE;
      continue;
    }

    // Start new cluster
    const cluster: number[] = [];
    clusters.push(cluster);
    expandCluster(points, labels, i, neighbors, clusterId, epsilonKm, minPoints, cluster);
    clusterId++;
  }

  return clusters;
}

function expandCluster(
  points: LatLng[],
  labels: number[],
  pointIdx: number,
  neighbors: number[],
  clusterId: number,
  epsilonKm: number,
  minPoints: number,
  cluster: number[]
): void {
  labels[pointIdx] = clusterId;
  cluster.push(pointIdx);

  const queue = [...neighbors];
  let qi = 0;

  while (qi < queue.length) {
    const neighborIdx = queue[qi++];

    if (labels[neighborIdx] === NOISE) {
      // Change noise to border point
      labels[neighborIdx] = clusterId;
      cluster.push(neighborIdx);
      continue;
    }

    if (labels[neighborIdx] !== -2) continue; // Already assigned

    labels[neighborIdx] = clusterId;
    cluster.push(neighborIdx);

    const neighborNeighbors = regionQuery(points, neighborIdx, epsilonKm);
    if (neighborNeighbors.length >= minPoints) {
      // Add new neighbors to queue (core point expansion)
      for (const nn of neighborNeighbors) {
        if (labels[nn] === -2 || labels[nn] === NOISE) {
          queue.push(nn);
        }
      }
    }
  }
}

function regionQuery(
  points: LatLng[],
  pointIdx: number,
  epsilonKm: number
): number[] {
  const neighbors: number[] = [];
  const p = points[pointIdx];
  for (let i = 0; i < points.length; i++) {
    if (haversineDistance(p, points[i]) <= epsilonKm) {
      neighbors.push(i);
    }
  }
  return neighbors;
}

/**
 * Cluster alerts spatially within an engagement window.
 * Extracts all centroids, runs DBSCAN, and returns SpatialCluster objects.
 */
export function clusterAlertsSpatially(
  alerts: NormalizedAlert[],
  engagementId: string,
  epsilonKm = 25,
  minPoints = 3
): SpatialCluster[] {
  // Flatten all centroids with alert references
  const allPoints: { point: LatLng; alertIdx: number }[] = [];
  for (let i = 0; i < alerts.length; i++) {
    for (const centroid of alerts[i].centroids) {
      allPoints.push({ point: centroid, alertIdx: i });
    }
  }

  if (allPoints.length < minPoints) {
    // Not enough points; return single cluster with all points
    return [
      {
        id: `${engagementId}-cluster-0`,
        engagementId,
        centroids: allPoints.map((p) => p.point),
        alerts,
      },
    ];
  }

  const points = allPoints.map((p) => p.point);
  const clusters = dbscan(points, epsilonKm, minPoints);

  return clusters.map((indices, i) => {
    const alertIndices = new Set(indices.map((idx) => allPoints[idx].alertIdx));
    return {
      id: `${engagementId}-cluster-${i}`,
      engagementId,
      centroids: indices.map((idx) => points[idx]),
      alerts: [...alertIndices].map((idx) => alerts[idx]),
    };
  });
}
