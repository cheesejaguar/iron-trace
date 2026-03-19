"use client";

import { EngagementEllipses } from "./EngagementEllipse";
import { TrajectoryArcs } from "./TrajectoryArc";
import { LaunchSiteMarkers } from "./LaunchSiteMarkers";
import { LaunchHeatmap } from "./LaunchHeatmap";

export function AnalysisOverlays() {
  return (
    <>
      <EngagementEllipses />
      <TrajectoryArcs />
      <LaunchSiteMarkers />
      <LaunchHeatmap />
    </>
  );
}
