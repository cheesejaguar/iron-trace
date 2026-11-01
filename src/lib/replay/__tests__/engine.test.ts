import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ReplayEngine } from "../engine";
import type { NormalizedAlert } from "@/types";
import { ThreatCategory } from "@/types";

// Node has no requestAnimationFrame; emulate a ~60fps frame loop on top of
// (fake) timers so playback can be driven deterministically.
const FRAME_MS = 16;
vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
  return setTimeout(cb, FRAME_MS) as unknown as number;
});
vi.stubGlobal("cancelAnimationFrame", (id: number) => {
  clearTimeout(id);
});

const BASE = Date.parse("2024-01-01T00:00:00.000Z");

function makeAlerts(count: number, intervalMs = 10000): NormalizedAlert[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `alert-${i}`,
    timestamp: new Date(BASE + i * intervalMs).toISOString(),
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

  const emittedIds = () =>
    onAlert.mock.calls.map(([a]) => (a as NormalizedAlert).id);
  const lastSimTime = () =>
    Date.parse(onTimeUpdate.mock.calls[onTimeUpdate.mock.calls.length - 1][0]);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T12:00:00.000Z"));
    onAlert = vi.fn();
    onTimeUpdate = vi.fn();
    onComplete = vi.fn();
    engine = new ReplayEngine({ onAlert, onTimeUpdate, onComplete });
  });

  afterEach(() => {
    engine.stop();
    vi.useRealTimers();
  });

  it("loads alerts sorted by timestamp and replays them in order", () => {
    const alerts = makeAlerts(5);
    engine.load([alerts[3], alerts[0], alerts[4], alerts[1], alerts[2]]);

    engine.play(100);
    vi.advanceTimersByTime(1000); // 100s of simulated time

    expect(emittedIds()).toEqual([
      "alert-0",
      "alert-1",
      "alert-2",
      "alert-3",
      "alert-4",
    ]);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does nothing when playing with no alerts", () => {
    engine.load([]);
    engine.play(1);
    vi.advanceTimersByTime(1000);
    expect(onAlert).not.toHaveBeenCalled();
    expect(onTimeUpdate).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("emits alerts at their relative timing scaled by speed", () => {
    engine.load(makeAlerts(3, 10000));

    engine.play(1);
    // First alert is due at simulated t=0
    expect(emittedIds()).toEqual(["alert-0"]);

    vi.advanceTimersByTime(9000);
    expect(emittedIds()).toEqual(["alert-0"]);

    vi.advanceTimersByTime(1100);
    expect(emittedIds()).toEqual(["alert-0", "alert-1"]);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("plays faster at higher speed", () => {
    engine.load(makeAlerts(3, 10000));
    engine.play(10);
    vi.advanceTimersByTime(1100); // 11s simulated
    expect(emittedIds()).toEqual(["alert-0", "alert-1"]);
  });

  it("seekTo positions playback after the target and reports the time", () => {
    const alerts = makeAlerts(5, 10000);
    engine.load(alerts);

    engine.seekTo(alerts[2].timestamp);
    expect(onTimeUpdate).toHaveBeenCalledWith(alerts[2].timestamp);

    // Resuming from the seek point must not re-emit alerts 0-2 and must
    // continue from the seek time, so alert-3 arrives 10s later.
    engine.play(1);
    expect(onAlert).not.toHaveBeenCalled();
    expect(lastSimTime()).toBe(Date.parse(alerts[2].timestamp));

    vi.advanceTimersByTime(10100);
    expect(emittedIds()).toEqual(["alert-3"]);
  });

  it("setSpeed keeps simulated time continuous mid-playback", () => {
    engine.load(makeAlerts(3, 10000));
    engine.play(1);
    vi.advanceTimersByTime(5000); // simulated t≈5s
    const before = lastSimTime();

    engine.setSpeed(10);
    vi.advanceTimersByTime(FRAME_MS);

    // Simulated time must not jump ahead to the next alert (t=10s)
    expect(emittedIds()).toEqual(["alert-0"]);
    expect(lastSimTime() - before).toBeLessThanOrEqual(FRAME_MS * 10 + FRAME_MS);

    // ...but it now advances 10x faster: 5s more simulated ≈ 500ms real
    vi.advanceTimersByTime(520);
    expect(emittedIds()).toEqual(["alert-0", "alert-1"]);
  });

  it("pause stops emission and play resumes from the paused time", () => {
    engine.load(makeAlerts(3, 10000));
    engine.play(1);
    vi.advanceTimersByTime(5000);
    engine.pause();
    const pausedAt = lastSimTime();

    vi.advanceTimersByTime(60000);
    expect(emittedIds()).toEqual(["alert-0"]);

    engine.play(1);
    // Resumes where it paused (within one frame), not back at alert-0
    expect(lastSimTime() - pausedAt).toBeGreaterThanOrEqual(0);
    expect(lastSimTime() - pausedAt).toBeLessThanOrEqual(FRAME_MS);
    vi.advanceTimersByTime(5100);
    expect(emittedIds()).toEqual(["alert-0", "alert-1"]);
  });

  it("stop resets playback to the first alert", () => {
    engine.load(makeAlerts(3, 10000));
    engine.play(100);
    vi.advanceTimersByTime(1000);
    expect(onComplete).toHaveBeenCalledTimes(1);

    engine.stop();
    onAlert.mockClear();
    engine.play(1);
    expect(emittedIds()).toEqual(["alert-0"]);
  });

  it("getAlertsUpTo filters inclusively by timestamp", () => {
    const alerts = makeAlerts(10, 5000);
    engine.load(alerts);

    expect(engine.getAlertsUpTo(alerts[4].timestamp).map((a) => a.id)).toEqual([
      "alert-0",
      "alert-1",
      "alert-2",
      "alert-3",
      "alert-4",
    ]);

    const beforeFirst = new Date(BASE - 1000).toISOString();
    expect(engine.getAlertsUpTo(beforeFirst)).toEqual([]);
  });
});
