import { describe, it, expect, beforeEach } from "vitest";
import { useAlertStore, useFilteredAlerts } from "../alert-store";
import { useAnalysisStore } from "../analysis-store";
import { useTimelineStore } from "../timeline-store";
import { ThreatCategory } from "@/types";
import type { NormalizedAlert, EngagementAnalysis } from "@/types";

function makeAlert(id: string, category = ThreatCategory.MISSILES): NormalizedAlert {
  return {
    id,
    timestamp: new Date().toISOString(),
    regions: [`Region ${id}`],
    centroids: [{ lat: 31.5, lng: 35.0 }],
    threat_category: category,
    countdown_seconds: 90,
    raw_payload: {},
  };
}

describe("alert-store", () => {
  beforeEach(() => {
    useAlertStore.setState({
      alerts: [],
      connected: false,
      selectedAlertId: null,
      activeFilters: new Set(),
      lastUpdate: null,
    });
  });

  it("adds alert and updates lastUpdate", () => {
    const alert = makeAlert("a1");
    useAlertStore.getState().addAlert(alert);
    expect(useAlertStore.getState().alerts).toHaveLength(1);
    expect(useAlertStore.getState().lastUpdate).toBe(alert.timestamp);
  });

  it("deduplicates alerts by ID", () => {
    const alert = makeAlert("a1");
    useAlertStore.getState().addAlert(alert);
    useAlertStore.getState().addAlert(alert);
    expect(useAlertStore.getState().alerts).toHaveLength(1);
  });

  it("prepends new alerts (newest first)", () => {
    useAlertStore.getState().addAlert(makeAlert("a1"));
    useAlertStore.getState().addAlert(makeAlert("a2"));
    expect(useAlertStore.getState().alerts[0].id).toBe("a2");
  });

  it("caps at 500 alerts", () => {
    const alerts = Array.from({ length: 510 }, (_, i) => makeAlert(`a${i}`));
    useAlertStore.getState().setAlerts(alerts);
    expect(useAlertStore.getState().alerts).toHaveLength(500);
  });

  it("sets connected status", () => {
    useAlertStore.getState().setConnected(true);
    expect(useAlertStore.getState().connected).toBe(true);
  });

  it("selects alert", () => {
    useAlertStore.getState().selectAlert("a1");
    expect(useAlertStore.getState().selectedAlertId).toBe("a1");
    useAlertStore.getState().selectAlert(null);
    expect(useAlertStore.getState().selectedAlertId).toBeNull();
  });

  it("toggles filters on and off", () => {
    const store = useAlertStore.getState();
    store.toggleFilter(ThreatCategory.MISSILES);
    expect(useAlertStore.getState().activeFilters.has(ThreatCategory.MISSILES)).toBe(true);

    useAlertStore.getState().toggleFilter(ThreatCategory.MISSILES);
    expect(useAlertStore.getState().activeFilters.has(ThreatCategory.MISSILES)).toBe(false);
  });
});

describe("analysis-store", () => {
  beforeEach(() => {
    useAnalysisStore.setState({
      analyses: [],
      selectedEngagementId: null,
      isAnalyzing: false,
      showEllipses: true,
      showTrajectories: true,
      showHeatmap: true,
      showLaunchSites: true,
    });
  });

  it("sets analyses", () => {
    const mockAnalysis = { id: "eng-1" } as EngagementAnalysis;
    useAnalysisStore.getState().setAnalyses([mockAnalysis]);
    expect(useAnalysisStore.getState().analyses).toHaveLength(1);
  });

  it("selects engagement", () => {
    useAnalysisStore.getState().selectEngagement("eng-1");
    expect(useAnalysisStore.getState().selectedEngagementId).toBe("eng-1");
  });

  it("toggles layer visibility", () => {
    useAnalysisStore.getState().toggleEllipses();
    expect(useAnalysisStore.getState().showEllipses).toBe(false);
    useAnalysisStore.getState().toggleEllipses();
    expect(useAnalysisStore.getState().showEllipses).toBe(true);

    useAnalysisStore.getState().toggleTrajectories();
    expect(useAnalysisStore.getState().showTrajectories).toBe(false);

    useAnalysisStore.getState().toggleHeatmap();
    expect(useAnalysisStore.getState().showHeatmap).toBe(false);

    useAnalysisStore.getState().toggleLaunchSites();
    expect(useAnalysisStore.getState().showLaunchSites).toBe(false);
  });

  it("sets analyzing flag", () => {
    useAnalysisStore.getState().setAnalyzing(true);
    expect(useAnalysisStore.getState().isAnalyzing).toBe(true);
  });
});

describe("timeline-store", () => {
  beforeEach(() => {
    useTimelineStore.setState({
      isReplaying: false,
      currentTime: null,
      rangeStart: null,
      rangeEnd: null,
      speed: 1,
      isPlaying: false,
    });
  });

  it("starts replay with range", () => {
    const start = "2024-01-01T00:00:00Z";
    const end = "2024-01-01T01:00:00Z";
    useTimelineStore.getState().startReplay(start, end);

    const state = useTimelineStore.getState();
    expect(state.isReplaying).toBe(true);
    expect(state.rangeStart).toBe(start);
    expect(state.rangeEnd).toBe(end);
    expect(state.currentTime).toBe(start);
    expect(state.isPlaying).toBe(false);
  });

  it("stops replay and resets", () => {
    useTimelineStore.getState().startReplay("a", "b");
    useTimelineStore.getState().stopReplay();

    const state = useTimelineStore.getState();
    expect(state.isReplaying).toBe(false);
    expect(state.rangeStart).toBeNull();
    expect(state.currentTime).toBeNull();
  });

  it("toggles playback", () => {
    useTimelineStore.getState().togglePlayback();
    expect(useTimelineStore.getState().isPlaying).toBe(true);
    useTimelineStore.getState().togglePlayback();
    expect(useTimelineStore.getState().isPlaying).toBe(false);
  });

  it("sets speed", () => {
    useTimelineStore.getState().setSpeed(10);
    expect(useTimelineStore.getState().speed).toBe(10);
  });

  it("sets current time", () => {
    const time = "2024-06-15T12:00:00Z";
    useTimelineStore.getState().setCurrentTime(time);
    expect(useTimelineStore.getState().currentTime).toBe(time);
  });
});
