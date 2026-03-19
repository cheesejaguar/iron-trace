import { describe, it, expect, vi } from "vitest";
import { alertStore } from "../alert-store";
import type { NormalizedAlert } from "@/types";
import { ThreatCategory } from "@/types";

function makeAlert(id: string, timestampOffset = 0): NormalizedAlert {
  return {
    id,
    timestamp: new Date(Date.now() + timestampOffset).toISOString(),
    regions: [`Region ${id}`],
    centroids: [{ lat: 31.5, lng: 35.0 }],
    threat_category: ThreatCategory.MISSILES,
    countdown_seconds: 90,
    raw_payload: {},
  };
}

describe("AlertStore (singleton)", () => {
  it("adds and retrieves alerts", () => {
    const sizeBefore = alertStore.size;
    const alert = makeAlert(`singleton-${Date.now()}-1`);
    expect(alertStore.add(alert)).toBe(true);
    expect(alertStore.size).toBe(sizeBefore + 1);
  });

  it("deduplicates by ID", () => {
    const alert = makeAlert(`singleton-dedup-${Date.now()}`);
    alertStore.add(alert);
    const sizeBefore = alertStore.size;
    expect(alertStore.add(alert)).toBe(false);
    expect(alertStore.size).toBe(sizeBefore);
  });

  it("getRecent returns alerts sorted descending", () => {
    const id = Date.now();
    alertStore.add(makeAlert(`recent-a-${id}`, -3000));
    alertStore.add(makeAlert(`recent-b-${id}`, -1000));

    const recent = alertStore.getRecent(2);
    expect(recent.length).toBeGreaterThanOrEqual(2);
    // First should be more recent than second
    expect(new Date(recent[0].timestamp).getTime()).toBeGreaterThanOrEqual(
      new Date(recent[1].timestamp).getTime()
    );
  });

  it("getAll returns ascending order", () => {
    const all = alertStore.getAll();
    for (let i = 1; i < all.length; i++) {
      expect(new Date(all[i].timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(all[i - 1].timestamp).getTime()
      );
    }
  });

  it("subscribe and unsubscribe", () => {
    const listener = vi.fn();
    const unsub = alertStore.subscribe(listener);
    expect(alertStore.subscriberCount).toBeGreaterThanOrEqual(1);

    const alert = makeAlert(`sub-${Date.now()}`);
    alertStore.add(alert);
    expect(listener).toHaveBeenCalledWith(alert);

    unsub();
    const prevCount = listener.mock.calls.length;
    alertStore.add(makeAlert(`sub2-${Date.now()}`));
    expect(listener.mock.calls.length).toBe(prevCount);
  });

  it("removes broken listeners gracefully", () => {
    const bad = vi.fn(() => { throw new Error("broken"); });
    alertStore.subscribe(bad);
    // Adding an alert should remove the broken listener
    alertStore.add(makeAlert(`broken-${Date.now()}`));
    // Should not throw, and listener should be removed
  });

  it("filters by since in getRecent", () => {
    const since = new Date(Date.now() - 1000).toISOString();
    alertStore.add(makeAlert(`future-${Date.now()}`, 5000));
    const results = alertStore.getRecent(100, since);
    for (const r of results) {
      expect(new Date(r.timestamp).getTime()).toBeGreaterThan(new Date(since).getTime());
    }
  });
});
