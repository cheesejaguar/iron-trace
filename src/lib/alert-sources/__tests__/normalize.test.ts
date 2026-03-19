import { describe, it, expect } from "vitest";
import { normalizeOrefAlert } from "../normalize";
import { ThreatCategory } from "@/types";
import type { RawOrefAlert } from "@/types";

describe("normalize", () => {
  it("normalizes a missile alert with known localities", () => {
    const raw: RawOrefAlert = {
      id: "133456789",
      cat: "1",
      title: "ירי רקטות וטילים",
      data: ["תל אביב - מרכז העיר"],
      desc: "היכנסו למרחב המוגן",
    };
    const alert = normalizeOrefAlert(raw);
    expect(alert.threat_category).toBe(ThreatCategory.MISSILES);
    expect(alert.id).toBeTruthy();
    expect(alert.timestamp).toBeTruthy();
    expect(alert.regions).toEqual(["תל אביב - מרכז העיר"]);
    expect(alert.raw_payload).toEqual(raw);
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

  it("generates deterministic dedup IDs for same regions", () => {
    const raw: RawOrefAlert = {
      id: "1", cat: "1", title: "", data: ["A", "B"], desc: "",
    };
    // Same data produces IDs with same hash suffix (last segment after final '-')
    const a1 = normalizeOrefAlert(raw);
    const a2 = normalizeOrefAlert(raw);
    const hash1 = a1.id.slice(a1.id.lastIndexOf("-") + 1);
    const hash2 = a2.id.slice(a2.id.lastIndexOf("-") + 1);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBeGreaterThan(0);
  });
});
