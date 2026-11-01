import { describe, it, expect, vi } from "vitest";
import { normalizeOrefAlert } from "../normalize";
import { ThreatCategory } from "@/types";
import type { RawOrefAlert } from "@/types";

describe("normalize", () => {
  it("normalizes a missile alert with known localities", () => {
    const raw: RawOrefAlert = {
      id: "133456789",
      cat: "1",
      title: "ירי רקטות וטילים",
      data: ["חיפה", "אשדוד"],
      desc: "היכנסו למרחב המוגן",
    };
    const alert = normalizeOrefAlert(raw);
    expect(alert.threat_category).toBe(ThreatCategory.MISSILES);
    expect(alert.regions).toEqual(["חיפה", "אשדוד"]);
    // Centroids come from the gazetteer, in region order
    expect(alert.centroids).toEqual([
      { lat: 32.794, lng: 34.9896 },
      { lat: 31.804, lng: 34.6553 },
    ]);
    // Mean of Haifa (60s) and Ashdod (45s), rounded
    expect(alert.countdown_seconds).toBe(53);
    expect(Number.isNaN(Date.parse(alert.timestamp))).toBe(false);
    expect(alert.id.startsWith(`${alert.timestamp}-`)).toBe(true);
    expect(alert.raw_payload).toEqual(raw);
  });

  it("resolves English locality names case-insensitively", () => {
    const alert = normalizeOrefAlert({
      id: "1", cat: "1", title: "", data: ["haifa"], desc: "",
    });
    expect(alert.centroids).toEqual([{ lat: 32.794, lng: 34.9896 }]);
    expect(alert.countdown_seconds).toBe(60);
  });

  it("maps category codes correctly", () => {
    const cases: [string, ThreatCategory][] = [
      ["1", ThreatCategory.MISSILES],
      ["2", ThreatCategory.HOSTILE_AIRCRAFT],
      ["3", ThreatCategory.UAV],
      ["4", ThreatCategory.ROCKETS],
      ["99", ThreatCategory.UNKNOWN],
    ];

    for (const [cat, expected] of cases) {
      const alert = normalizeOrefAlert({
        id: "1", cat, title: "", data: [], desc: "",
      });
      expect(alert.threat_category).toBe(expected);
    }
  });

  it("uses default countdown when no locality matches", () => {
    const alert = normalizeOrefAlert({
      id: "1", cat: "1", title: "", data: ["Unknown Place XYZ"], desc: "",
    });
    expect(alert.countdown_seconds).toBe(90);
    expect(alert.centroids).toEqual([]);
  });

  it("generates the same dedup ID for the same regions regardless of order", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T12:00:00.000Z"));
    try {
      const a = normalizeOrefAlert({ id: "1", cat: "1", title: "", data: ["A", "B"], desc: "" });
      const b = normalizeOrefAlert({ id: "2", cat: "1", title: "", data: ["B", "A"], desc: "" });
      const c = normalizeOrefAlert({ id: "3", cat: "1", title: "", data: ["A", "C"], desc: "" });
      expect(a.id).toBe(b.id);
      expect(a.id).not.toBe(c.id);
      expect(a.id.startsWith("2025-06-01T12:00:00.000Z-")).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not reorder the source regions when computing the ID", () => {
    const raw: RawOrefAlert = {
      id: "1", cat: "1", title: "", data: ["Zeta", "Alpha"], desc: "",
    };
    const alert = normalizeOrefAlert(raw);
    expect(alert.regions).toEqual(["Zeta", "Alpha"]);
    expect(raw.data).toEqual(["Zeta", "Alpha"]);
  });
});
