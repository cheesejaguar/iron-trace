"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { useAnalysisStore } from "@/stores/analysis-store";
import { LAUNCH_SITES } from "@/data/launch-sites";

export function LaunchSiteMarkers() {
  const show = useAnalysisStore((s) => s.showLaunchSites);

  if (!show) return null;

  return (
    <>
      {LAUNCH_SITES.map((site) => {
        const color = site.country === "Iran" ? "#C0392B" : "#E67E22";
        return (
          <CircleMarker
            key={site.name}
            center={[site.lat, site.lng]}
            radius={6}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.35,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-[170px]">
                <div className="font-bold text-sm" style={{ color }}>
                  {site.name}
                </div>
                <div className="text-xs opacity-50 mb-1.5">{site.country}</div>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="opacity-40 uppercase text-[10px] tracking-wider">Munitions</span>
                    <div className="mt-0.5 opacity-70">
                      {site.associated_munitions.join(", ")}
                    </div>
                  </div>
                  <div className="opacity-30 text-[10px]">
                    Source: {site.source}
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
