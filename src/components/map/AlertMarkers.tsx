"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { useFilteredAlerts } from "@/stores/alert-store";
import { ThreatCategory, type NormalizedAlert } from "@/types";

/** Color mapping by threat category */
const THREAT_COLORS: Record<ThreatCategory, string> = {
  [ThreatCategory.MISSILES]: "#DC143C",
  [ThreatCategory.HOSTILE_AIRCRAFT]: "#FF8C00",
  [ThreatCategory.UAV]: "#FFD700",
  [ThreatCategory.ROCKETS]: "#8B8B8B",
  [ThreatCategory.UNKNOWN]: "#6B7280",
};

/** Radius by category (ballistic = larger) */
const THREAT_RADII: Record<ThreatCategory, number> = {
  [ThreatCategory.MISSILES]: 8,
  [ThreatCategory.HOSTILE_AIRCRAFT]: 6,
  [ThreatCategory.UAV]: 6,
  [ThreatCategory.ROCKETS]: 5,
  [ThreatCategory.UNKNOWN]: 5,
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function isRecent(timestamp: string, thresholdMs = 5 * 60 * 1000): boolean {
  return Date.now() - new Date(timestamp).getTime() < thresholdMs;
}

function AlertMarkerPopup({ alert }: { alert: NormalizedAlert }) {
  return (
    <Popup>
      <div className="text-sm min-w-[200px]">
        <div className="font-bold text-base mb-1">
          {alert.regions.slice(0, 3).join(", ")}
          {alert.regions.length > 3 && ` +${alert.regions.length - 3}`}
        </div>
        <div className="space-y-0.5 text-gray-700">
          <div>
            <span className="font-semibold">Category:</span>{" "}
            {alert.threat_category}
          </div>
          <div>
            <span className="font-semibold">Countdown:</span>{" "}
            {alert.countdown_seconds}s
          </div>
          <div>
            <span className="font-semibold">Time:</span>{" "}
            {formatTime(alert.timestamp)}
          </div>
          <div>
            <span className="font-semibold">Regions:</span>{" "}
            {alert.regions.length}
          </div>
        </div>
      </div>
    </Popup>
  );
}

export function AlertMarkers() {
  const alerts = useFilteredAlerts();

  return (
    <>
      {alerts.flatMap((alert) =>
        alert.centroids.map((centroid, i) => {
          const color = THREAT_COLORS[alert.threat_category];
          const radius = THREAT_RADII[alert.threat_category];
          const recent = isRecent(alert.timestamp);

          return (
            <CircleMarker
              key={`${alert.id}-${i}`}
              center={[centroid.lat, centroid.lng]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: recent ? 0.7 : 0.3,
                weight: recent ? 2 : 1,
                opacity: recent ? 1 : 0.5,
              }}
              className={recent ? "alert-marker-pulse" : ""}
            >
              <AlertMarkerPopup alert={alert} />
            </CircleMarker>
          );
        })
      )}
    </>
  );
}
