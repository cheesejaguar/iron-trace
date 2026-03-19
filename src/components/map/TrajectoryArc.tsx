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
          color: "transparent",
          fillColor: color,
          fillOpacity: 0.06,
          weight: 0,
        }}
      />

      {/* Main trajectory arc */}
      <Polyline
        positions={arcPositions}
        pathOptions={{
          color,
          weight: 2,
          opacity: 0.75,
          dashArray: "8,6",
        }}
        eventHandlers={{
          click: () => selectEngagement(analysis.id),
        }}
      >
        <Popup>
          <div className="min-w-[160px]">
            <div className="font-bold text-sm mb-1.5" style={{ color }}>
              Trajectory &rarr; {arc.estimatedOrigin}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="opacity-50">Back-azimuth</span>
                <span className="font-mono">{arc.backAzimuth.toFixed(1)}&deg;</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">Distance</span>
                <span className="font-mono">{arc.distanceKm.toFixed(0)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">Munition</span>
                <span className="font-mono">{analysis.munitionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">Confidence</span>
                <span className="font-mono font-bold">{(analysis.confidence.total * 100).toFixed(0)}%</span>
              </div>
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
