import type { NormalizedAlert, EngagementWindow } from "@/types";

/**
 * Groups alerts into engagement windows.
 * Alerts within ±windowMs of each other are grouped together.
 * Uses a greedy sweep: sort by time, then extend window while next alert
 * falls within threshold of the window boundary.
 */
export function clusterByTime(
  alerts: NormalizedAlert[],
  windowMs = 15000
): EngagementWindow[] {
  if (alerts.length === 0) return [];

  // Sort by timestamp
  const sorted = [...alerts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const windows: EngagementWindow[] = [];
  let currentAlerts: NormalizedAlert[] = [sorted[0]];
  let windowEnd = new Date(sorted[0].timestamp).getTime() + windowMs;

  for (let i = 1; i < sorted.length; i++) {
    const alertTime = new Date(sorted[i].timestamp).getTime();

    if (alertTime <= windowEnd) {
      // Within current window
      currentAlerts.push(sorted[i]);
      // Extend window end
      windowEnd = Math.max(windowEnd, alertTime + windowMs);
    } else {
      // Close current window, start new one
      windows.push(makeWindow(currentAlerts, windows.length));
      currentAlerts = [sorted[i]];
      windowEnd = alertTime + windowMs;
    }
  }

  // Close final window
  if (currentAlerts.length > 0) {
    windows.push(makeWindow(currentAlerts, windows.length));
  }

  return windows;
}

function makeWindow(
  alerts: NormalizedAlert[],
  index: number
): EngagementWindow {
  const timestamps = alerts.map((a) => new Date(a.timestamp).getTime());
  return {
    id: `eng-${index}-${Math.min(...timestamps)}`,
    windowStart: new Date(Math.min(...timestamps)).toISOString(),
    windowEnd: new Date(Math.max(...timestamps)).toISOString(),
    alerts,
  };
}
