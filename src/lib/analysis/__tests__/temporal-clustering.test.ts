import { describe, it, expect } from "vitest";
import { clusterByTime } from "../temporal-clustering";
import { ThreatCategory, type NormalizedAlert } from "@/types";

function makeAlert(timestampMs: number, id?: string): NormalizedAlert {
  return {
    id: id ?? `alert-${timestampMs}`,
    timestamp: new Date(timestampMs).toISOString(),
    regions: ["Test Region"],
    centroids: [{ lat: 32.0, lng: 34.8 }],
    threat_category: ThreatCategory.MISSILES,
    countdown_seconds: 90,
    raw_payload: null,
  };
}

describe("clusterByTime", () => {
  it("returns empty array for empty input", () => {
    expect(clusterByTime([])).toEqual([]);
  });

  it("groups single alert into one window", () => {
    const windows = clusterByTime([makeAlert(1000)]);
    expect(windows).toHaveLength(1);
    expect(windows[0].alerts).toHaveLength(1);
  });

  it("groups alerts within ±15s into same window", () => {
    const base = Date.now();
    const alerts = [
      makeAlert(base, "a1"),
      makeAlert(base + 5000, "a2"),
      makeAlert(base + 10000, "a3"),
      makeAlert(base + 14000, "a4"),
    ];
    const windows = clusterByTime(alerts, 15000);
    expect(windows).toHaveLength(1);
    expect(windows[0].alerts).toHaveLength(4);
  });

  it("separates alerts into different windows when gap > threshold", () => {
    const base = Date.now();
    const alerts = [
      makeAlert(base, "a1"),
      makeAlert(base + 5000, "a2"),
      makeAlert(base + 60000, "a3"), // 60s later = new window
      makeAlert(base + 62000, "a4"),
    ];
    const windows = clusterByTime(alerts, 15000);
    expect(windows).toHaveLength(2);
    expect(windows[0].alerts).toHaveLength(2);
    expect(windows[1].alerts).toHaveLength(2);
  });

  it("handles out-of-order alerts", () => {
    const base = Date.now();
    const alerts = [
      makeAlert(base + 10000, "a3"),
      makeAlert(base, "a1"),
      makeAlert(base + 5000, "a2"),
    ];
    const windows = clusterByTime(alerts, 15000);
    expect(windows).toHaveLength(1);
    expect(windows[0].alerts).toHaveLength(3);
  });
});
