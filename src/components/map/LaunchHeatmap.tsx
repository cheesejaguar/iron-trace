"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useAnalysisStore } from "@/stores/analysis-store";
import { generateHeatmap } from "@/lib/analysis/kde";

/**
 * Renders KDE heatmap from trajectory arc intersections.
 * Uses leaflet.heat plugin (loaded dynamically).
 */
export function LaunchHeatmap() {
  const map = useMap();
  const analyses = useAnalysisStore((s) => s.analyses);
  const show = useAnalysisStore((s) => s.showHeatmap);

  useEffect(() => {
    if (!show || !map) return;

    // Collect all trajectory arcs
    const arcs = analyses.flatMap((a) => a.trajectories);
    if (arcs.length < 2) return; // Need at least 2 arcs for intersections

    const heatPoints = generateHeatmap(arcs);
    if (heatPoints.length === 0) return;

    // Dynamically import leaflet.heat
    let heatLayer: L.Layer | null = null;

    import("leaflet.heat").then((heatModule) => {
      const L = require("leaflet");
      const data = heatPoints.map((p) => [p.lat, p.lng, p.intensity] as [number, number, number]);

      heatLayer = (L as typeof import("leaflet") & {
        heatLayer: (data: [number, number, number][], options?: Record<string, unknown>) => L.Layer;
      }).heatLayer(data, {
        radius: 30,
        blur: 20,
        maxZoom: 12,
        max: 1.0,
        gradient: {
          0.0: "transparent",
          0.3: "#FFD700",
          0.6: "#FF8C00",
          0.9: "#DC143C",
          1.0: "#FF0000",
        },
      });

      if (heatLayer) {
        heatLayer.addTo(map);
      }
    }).catch(() => {
      // leaflet.heat not available, skip
    });

    return () => {
      if (heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, analyses, show]);

  return null;
}
