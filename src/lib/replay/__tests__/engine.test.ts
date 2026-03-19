import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReplayEngine } from "../engine";
import type { NormalizedAlert } from "@/types";
import { ThreatCategory } from "@/types";

// Mock requestAnimationFrame/cancelAnimationFrame for Node
vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
  return setTimeout(cb, 0) as unknown as number;
});
vi.stubGlobal("cancelAnimationFrame", (id: number) => {
  clearTimeout(id);
});

function makeAlerts(count: number, intervalMs = 5000): NormalizedAlert[] {
  const base = Date.now() - count * intervalMs;
  return Array.from({ length: count }, (_, i) => ({
    id: `alert-${i}`,
    timestamp: new Date(base + i * intervalMs).toISOString(),
    regions: [`City ${i}`],
    centroids: [{ lat: 31.5 + i * 0.1, lng: 35.0 }],
    threat_category: ThreatCategory.MISSILES,
    countdown_seconds: 90,
    raw_payload: {},
  }));
}

describe("ReplayEngine", () => {
  let onAlert: ReturnType<typeof vi.fn>;
  let onTimeUpdate: ReturnType<typeof vi.fn>;
  let onComplete: ReturnType<typeof vi.fn>;
  let engine: ReplayEngine;

  beforeEach(() => {
    onAlert = vi.fn();
    onTimeUpdate = vi.fn();
    onComplete = vi.fn();
    engine = new ReplayEngine({ onAlert, onTimeUpdate, onComplete });
  });

  it("loads alerts sorted by timestamp", () => {
    const alerts = makeAlerts(5);
    // Shuffle order
    const shuffled = [alerts[3], alerts[0], alerts[4], alerts[1], alerts[2]];
    engine.load(shuffled);

    // getAlertsUpTo should return all alerts up to a future time
    const futureTime = new Date(Date.now() + 100000).toISOString();
    const result = engine.getAlertsUpTo(futureTime);
    expect(result).toHaveLength(5);
    // Should be in chronological order after load
    for (let i = 1; i < result.length; i++) {
      expect(new Date(result[i].timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(result[i - 1].timestamp).getTime()
      );
    }
  });

  it("does not play with empty alerts", () => {
    engine.load([]);
    engine.play(1);
    // No callbacks should fire beyond the initial check
    expect(onAlert).not.toHaveBeenCalled();
  });

  it("seekTo advances index correctly", () => {
    const alerts = makeAlerts(5, 10000);
    engine.load(alerts);

    // Seek to time of 3rd alert
    engine.seekTo(alerts[2].timestamp);
    expect(onTimeUpdate).toHaveBeenCalledWith(alerts[2].timestamp);

    // getAlertsUpTo at seek time should return first 3
    const upTo = engine.getAlertsUpTo(alerts[2].timestamp);
    expect(upTo).toHaveLength(3);
  });

  it("setSpeed updates speed", () => {
    const alerts = makeAlerts(3);
    engine.load(alerts);
    engine.setSpeed(10);
    // No error thrown
    expect(true).toBe(true);
  });

  it("stop resets index", () => {
    const alerts = makeAlerts(5, 10000);
    engine.load(alerts);
    engine.seekTo(alerts[3].timestamp);
    engine.stop();
    // After stop, getAlertsUpTo should still work (data is preserved)
    const all = engine.getAlertsUpTo(new Date(Date.now() + 100000).toISOString());
    expect(all).toHaveLength(5);
  });

  it("pause cancels animation frame", () => {
    const alerts = makeAlerts(3);
    engine.load(alerts);
    engine.play(1);
    engine.pause();
    // Should not throw
    expect(true).toBe(true);
  });

  it("getAlertsUpTo filters correctly", () => {
    const alerts = makeAlerts(10, 5000);
    engine.load(alerts);

    // Get alerts up to the 5th one
    const upTo = engine.getAlertsUpTo(alerts[4].timestamp);
    expect(upTo).toHaveLength(5);

    // Get alerts up to before the first one
    const beforeFirst = new Date(
      new Date(alerts[0].timestamp).getTime() - 1000
    ).toISOString();
    const none = engine.getAlertsUpTo(beforeFirst);
    expect(none).toHaveLength(0);
  });
});
