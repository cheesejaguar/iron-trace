import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AlertStore } from "../alert-store";
import type { NormalizedAlert } from "@/types";
import { ThreatCategory } from "@/types";

const NOW = Date.parse("2025-06-01T12:00:00.000Z");

function makeAlert(id: string, timestampOffset = 0): NormalizedAlert {
  return {
    id,
    timestamp: new Date(NOW + timestampOffset).toISOString(),
    regions: [`Region ${id}`],
    centroids: [{ lat: 31.5, lng: 35.0 }],
    threat_category: ThreatCategory.MISSILES,
    countdown_seconds: 90,
    raw_payload: {},
  };
}

describe("AlertStore", () => {
  let store: AlertStore;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    store = new AlertStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds and retrieves alerts", () => {
    const alert = makeAlert("a1");
    expect(store.add(alert)).toBe(true);
    expect(store.size).toBe(1);
    expect(store.getAll()).toEqual([alert]);
  });

  it("deduplicates by ID", () => {
    const alert = makeAlert("a1");
    store.add(alert);
    expect(store.add({ ...alert, regions: ["Other"] })).toBe(false);
    expect(store.size).toBe(1);
    expect(store.getAll()[0].regions).toEqual(["Region a1"]);
  });

  it("getRecent returns newest first and honours the limit", () => {
    store.add(makeAlert("old", -3000));
    store.add(makeAlert("newest", -1000));
    store.add(makeAlert("mid", -2000));

    expect(store.getRecent().map((a) => a.id)).toEqual(["newest", "mid", "old"]);
    expect(store.getRecent(2).map((a) => a.id)).toEqual(["newest", "mid"]);
  });

  it("getRecent only returns alerts strictly after `since`", () => {
    store.add(makeAlert("before", -5000));
    store.add(makeAlert("at", -1000));
    store.add(makeAlert("after", 2000));

    const since = new Date(NOW - 1000).toISOString();
    expect(store.getRecent(100, since).map((a) => a.id)).toEqual(["after"]);
  });

  it("getAll returns ascending order", () => {
    store.add(makeAlert("c", 3000));
    store.add(makeAlert("a", 1000));
    store.add(makeAlert("b", 2000));
    expect(store.getAll().map((a) => a.id)).toEqual(["a", "b", "c"]);
  });

  it("broadcasts new alerts to subscribers until they unsubscribe", () => {
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    expect(store.subscriberCount).toBe(1);

    const alert = makeAlert("s1");
    store.add(alert);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(alert);

    // Duplicates are not re-broadcast
    store.add(alert);
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
    expect(store.subscriberCount).toBe(0);
    store.add(makeAlert("s2"));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("removes listeners that throw without affecting others", () => {
    const bad = vi.fn(() => {
      throw new Error("broken");
    });
    const good = vi.fn();
    store.subscribe(bad);
    store.subscribe(good);

    expect(() => store.add(makeAlert("b1"))).not.toThrow();
    expect(store.subscriberCount).toBe(1);
    expect(good).toHaveBeenCalledTimes(1);

    store.add(makeAlert("b2"));
    expect(bad).toHaveBeenCalledTimes(1);
    expect(good).toHaveBeenCalledTimes(2);
  });

  it("expires alerts after the TTL", () => {
    const ttlStore = new AlertStore(60_000);
    ttlStore.add(makeAlert("old"));

    vi.advanceTimersByTime(30_000);
    ttlStore.add(makeAlert("young"));
    expect(ttlStore.getAll().map((a) => a.id)).toEqual(["old", "young"]);

    vi.advanceTimersByTime(30_000);
    // "old" is expired: hidden from reads...
    expect(ttlStore.getAll().map((a) => a.id)).toEqual(["young"]);
    expect(ttlStore.getRecent().map((a) => a.id)).toEqual(["young"]);
    expect(ttlStore.size).toBe(2);

    // ...and evicted on the next write
    ttlStore.add(makeAlert("fresh"));
    expect(ttlStore.size).toBe(2);
    // An expired ID can be re-added after eviction
    expect(ttlStore.add(makeAlert("old"))).toBe(true);
  });
});
