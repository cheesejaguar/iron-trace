import { describe, it, expect } from "vitest";
import { dbscan } from "../dbscan";
import type { LatLng } from "@/types";

describe("dbscan", () => {
  it("returns empty for empty input", () => {
    expect(dbscan([], 25, 3)).toEqual([]);
  });

  it("identifies a single dense cluster", () => {
    // Points within ~5km of each other in Tel Aviv area
    const points: LatLng[] = [
      { lat: 32.08, lng: 34.78 },
      { lat: 32.07, lng: 34.79 },
      { lat: 32.09, lng: 34.78 },
      { lat: 32.08, lng: 34.80 },
      { lat: 32.07, lng: 34.77 },
    ];
    const clusters = dbscan(points, 25, 3);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toHaveLength(5);
  });

  it("identifies two separate clusters", () => {
    // Cluster 1: Tel Aviv area
    const telAviv: LatLng[] = [
      { lat: 32.08, lng: 34.78 },
      { lat: 32.07, lng: 34.79 },
      { lat: 32.09, lng: 34.78 },
    ];
    // Cluster 2: Haifa area (~100km away)
    const haifa: LatLng[] = [
      { lat: 32.79, lng: 34.99 },
      { lat: 32.80, lng: 34.98 },
      { lat: 32.81, lng: 34.99 },
    ];
    const clusters = dbscan([...telAviv, ...haifa], 25, 3);
    expect(clusters).toHaveLength(2);
  });

  it("marks isolated points as noise", () => {
    const points: LatLng[] = [
      { lat: 32.08, lng: 34.78 },
      { lat: 32.07, lng: 34.79 },
      { lat: 32.09, lng: 34.78 },
      { lat: 29.5, lng: 34.9 }, // Eilat - far from others
    ];
    const clusters = dbscan(points, 25, 3);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toHaveLength(3);
    // Eilat point is noise, not in any cluster
  });

  it("respects minPoints parameter", () => {
    const points: LatLng[] = [
      { lat: 32.08, lng: 34.78 },
      { lat: 32.07, lng: 34.79 },
    ];
    // minPoints=3, only 2 close points = no cluster
    const clusters = dbscan(points, 25, 3);
    expect(clusters).toHaveLength(0);
  });
});
