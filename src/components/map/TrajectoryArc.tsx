"use client";

import { Polyline, Polygon, Popup } from "react-leaflet";
import { useAnalysisStore } from "@/stores/analysis-store";
import { ThreatOrigin, type EngagementAnalysis, type TrajectoryArc } from "@/types";

const ARC_COLORS: Record<ThreatOrigin, string> = {
  [ThreatOrigin.IRAN]: "#C0392B",
  [ThreatOrigin.LEBANON]: "#E67E22",
  [ThreatOrigin.SYRIA]: "#E67E22",
  [ThreatOrigin.UNKNOWN]: "#8B8B8B",
};

function ArcOverlay({
  arc,
  analysis,
}: {
  arc: TrajectoryArc;
  analysis: EngagementAnalysis;
}) {
  const selectEngagement = useAnalysisStore((s) => s.selectEngagement);
  const color = ARC_COLORS[arc.estimatedOrigin];

  const arcPositions = arc.arcPoints.map(
    (p) => [p.lat, p.lng] as [number, number]
  );
  const conePositions = arc.uncertaintyCone.map(
    (p) => [p.lat, p.lng] as [number, number]
  );

  return (
    <>
      {/* Uncertainty cone */}
      <Polygon
        positions={conePositions}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 0,
        }}
      />

      {/* Main trajectory arc */}
      <Polyline
        positions={arcPositions}
        pathOptions={{
          color,
          weight: 2,
          opacity: 0.8,
          dashArray: "8,6",
        }}
        eventHandlers={{
          click: () => selectEngagement(analysis.id),
        }}
      >
        <Popup>
          <div className="text-sm">
            <div className="font-bold">
              Trajectory → {arc.estimatedOrigin}
            </div>
            <div>Back-azimuth: {arc.backAzimuth.toFixed(1)}°</div>
            <div>Distance: {arc.distanceKm.toFixed(0)} km</div>
            <div>Munition: {analysis.munitionType}</div>
            <div>
              Confidence: {(analysis.confidence.total * 100).toFixed(0)}%
            </div>
          </div>
        </Popup>
      </Polyline>
    </>
  );
}

export function TrajectoryArcs() {
  const analyses = useAnalysisStore((s) => s.analyses);
  const show = useAnalysisStore((s) => s.showTrajectories);

  if (!show) return null;

  return (
    <>
      {analyses.flatMap((analysis) =>
        analysis.trajectories.map((arc) => (
          <ArcOverlay key={arc.id} arc={arc} analysis={analysis} />
        ))
      )}
    </>
  );
}
