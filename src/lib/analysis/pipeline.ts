import type { NormalizedAlert, EngagementAnalysis } from "@/types";
import { EngagementClassification } from "@/types";
import { clusterByTime } from "./temporal-clustering";
import { clusterAlertsSpatially } from "./dbscan";
import { fitEllipse } from "./khachiyan";
import { classifyEngagement } from "./classifier";
import { computeBackTrace } from "./back-trace";
import { computeConfidence } from "./confidence";

interface PipelineOptions {
  /** Temporal clustering window in ms (default ±15s) */
  windowMs?: number;
  /** DBSCAN epsilon in km (default 25) */
  epsilonKm?: number;
  /** DBSCAN minimum points (default 3) */
  minPoints?: number;
  /** Minimum cluster size for ellipse fitting (default 5) */
  minClusterForEllipse?: number;
  /** Minimum eccentricity for ballistic classification (default 0.70) */
  minEccentricity?: number;
  /** Minimum semi-major axis in km (default 15) */
  minSemiMajorKm?: number;
}

/**
 * Full analysis pipeline: alerts → cluster → ellipse → classify → trace → score.
 *
 * 1. Group alerts by temporal window (±15s)
 * 2. Sub-cluster each window spatially via DBSCAN
 * 3. Fit minimum bounding ellipse to each spatial cluster
 * 4. Classify engagement type via decision tree
 * 5. For ballistic clusters, compute back-trace arc
 * 6. Score confidence
 */
export function runAnalysisPipeline(
  alerts: NormalizedAlert[],
  options: PipelineOptions = {}
): EngagementAnalysis[] {
  const {
    windowMs = 15000,
    epsilonKm = 25,
    minPoints = 3,
    minClusterForEllipse = 5,
  } = options;

  if (alerts.length === 0) return [];

  const results: EngagementAnalysis[] = [];

  // Step 1: Temporal clustering
  const windows = clusterByTime(alerts, windowMs);

  for (const window of windows) {
    // Step 2: Spatial sub-clustering
    const spatialClusters = clusterAlertsSpatially(
      window.alerts,
      window.id,
      epsilonKm,
      minPoints
    );

    for (const cluster of spatialClusters) {
      // Step 3: Ellipse fitting (requires minimum points)
      let ellipse = null;
      if (cluster.centroids.length >= minClusterForEllipse) {
        try {
          ellipse = fitEllipse(cluster.centroids);
        } catch {
          // Degenerate point configuration; skip ellipse
        }
      } else if (cluster.centroids.length >= 3) {
        // Try with fewer points but lower confidence
        try {
          ellipse = fitEllipse(cluster.centroids);
        } catch {
          // Skip
        }
      }

      // Step 4: Classification
      const { classification, munitionType, matchedMunition } =
        classifyEngagement(cluster, ellipse, cluster.alerts);

      // Step 5: Back-trace (only for ballistic)
      const trajectories = [];
      if (
        classification === EngagementClassification.BALLISTIC_MISSILE &&
        ellipse
      ) {
        const arc = computeBackTrace(ellipse, window.id, {
          munitionClass: munitionType,
          matchedMunition,
        });
        if (arc) {
          trajectories.push(arc);
        }
      }

      // Step 6: Confidence scoring
      const confidence = computeConfidence(
        cluster,
        ellipse,
        classification,
        munitionType,
        cluster.alerts
      );

      results.push({
        id: cluster.id,
        engagement: window,
        clusters: [cluster],
        ellipses: ellipse ? [ellipse] : [],
        classification,
        munitionType,
        trajectories,
        confidence,
        timestamp: window.windowStart,
      });
    }
  }

  return results;
}
