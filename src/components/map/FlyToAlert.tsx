"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useAlertStore } from "@/stores/alert-store";

/**
 * Watches for alert selection changes and flies the map to the selected alert.
 */
export function FlyToAlert() {
  const map = useMap();
  const selectedId = useAlertStore((s) => s.selectedAlertId);
  const alerts = useAlertStore((s) => s.alerts);
  const prevSelectedId = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedId || selectedId === prevSelectedId.current) return;
    prevSelectedId.current = selectedId;

    const alert = alerts.find((a) => a.id === selectedId);
    if (!alert || alert.centroids.length === 0) return;

    const centroid = alert.centroids[0];
    map.flyTo([centroid.lat, centroid.lng], 11, { duration: 0.8 });
  }, [selectedId, alerts, map]);

  return null;
}
