"use client";

import { Polygon, Polyline, Popup } from "react-leaflet";
import { useAnalysisStore } from "@/stores/analysis-store";
import { EngagementClassification, type EngagementAnalysis } from "@/types";
import { ellipseToPolygon } from "@/lib/analysis/khachiyan";

function EllipseOverlay({ analysis }: { analysis: EngagementAnalysis }) {
  const selectEngagement = useAnalysisStore((s) => s.selectEngagement);
  const isBallistic =
    analysis.classification === EngagementClassification.BALLISTIC_MISSILE;

  return (
    <>
      {analysis.ellipses.map((ellipse, i) => {
        const polygon = ellipseToPolygon(ellipse);
        const positions = polygon.map((p) => [p.lat, p.lng] as [number, number]);

        return (
          <Polygon
            key={`${analysis.id}-ellipse-${i}`}
            positions={positions}
            pathOptions={{
              color: isBallistic ? "#DC143C" : "#8B8B8B",
              fillColor: isBallistic ? "#DC143C" : "#8B8B8B",
              fillOpacity: isBallistic ? 0.15 : 0.08,
              weight: isBallistic ? 2 : 1,
              dashArray: isBallistic ? undefined : "5,5",
            }}
            eventHandlers={{
              click: () => selectEngagement(analysis.id),
            }}
          >
            <Popup>
              <div className="min-w-[160px]">
                <div className="font-bold text-sm mb-1.5" style={{ color: isBallistic ? "#DC143C" : "#8B8B8B" }}>
                  {analysis.classification.replace(/_/g, " ")}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-50">Eccentricity</span>
                    <span className="font-mono">{ellipse.eccentricity.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-50">Semi-major</span>
                    <span className="font-mono">{ellipse.semiMajorKm.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-50">Azimuth</span>
                    <span className="font-mono">{ellipse.angle.toFixed(1)}&deg;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-50">Confidence</span>
                    <span className="font-mono font-bold">{(analysis.confidence.total * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Polygon>
        );
      })}

      {/* Semi-major axis arrow for ballistic ellipses */}
      {isBallistic &&
        analysis.ellipses.map((ellipse, i) => {
          const kmPerDegLat = 111.32;
          const kmPerDegLng =
            111.32 * Math.cos((ellipse.center.lat * Math.PI) / 180);
          const theta = ((90 - ellipse.angle) * Math.PI) / 180;

          const dx = ellipse.semiMajorKm * Math.cos(theta);
          const dy = ellipse.semiMajorKm * Math.sin(theta);

          const arrow: [number, number][] = [
            [
              ellipse.center.lat - dx / kmPerDegLat,
              ellipse.center.lng - dy / kmPerDegLng,
            ],
            [
              ellipse.center.lat + dx / kmPerDegLat,
              ellipse.center.lng + dy / kmPerDegLng,
            ],
          ];

          return (
            <Polyline
              key={`${analysis.id}-axis-${i}`}
              positions={arrow}
              pathOptions={{
                color: "#DC143C",
                weight: 2.5,
                opacity: 0.7,
                dashArray: "6,4",
              }}
            />
          );
        })}
    </>
  );
}

export function EngagementEllipses() {
  const analyses = useAnalysisStore((s) => s.analyses);
  const show = useAnalysisStore((s) => s.showEllipses);

  if (!show) return null;

  return (
    <>
      {analyses
        .filter((a) => a.ellipses.length > 0)
        .map((analysis) => (
          <EllipseOverlay key={analysis.id} analysis={analysis} />
        ))}
    </>
  );
}
