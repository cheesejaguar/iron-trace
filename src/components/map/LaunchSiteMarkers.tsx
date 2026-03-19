"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { useAnalysisStore } from "@/stores/analysis-store";
import { LAUNCH_SITES } from "@/data/launch-sites";

/**
 * Diamond-shaped markers for known launch sites from the OSINT reference database.
 * Shown with tooltips describing site name, associated munitions, and source.
 */
export function LaunchSiteMarkers() {
  const show = useAnalysisStore((s) => s.showLaunchSites);

  if (!show) return null;

  return (
    <>
      {LAUNCH_SITES.map((site) => (
        <CircleMarker
          key={site.name}
          center={[site.lat, site.lng]}
          radius={6}
          pathOptions={{
            color: site.country === "Iran" ? "#C0392B" : "#E67E22",
            fillColor: site.country === "Iran" ? "#C0392B" : "#E67E22",
            fillOpacity: 0.4,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm min-w-[180px]">
              <div className="font-bold text-base">{site.name}</div>
              <div className="text-gray-600">{site.country}</div>
              <div className="mt-1">
                <span className="font-semibold text-xs">Munitions:</span>
                <div className="text-xs text-gray-500">
                  {site.associated_munitions.join(", ")}
                </div>
              </div>
              <div className="mt-1 text-[10px] text-gray-400">
                Source: {site.source}
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}
