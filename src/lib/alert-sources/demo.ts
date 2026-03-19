import { ThreatCategory, type NormalizedAlert, type LatLng } from "@/types";
import { GAZETTEER } from "@/data/gazetteer";

let demoCounter = 0;

/** Simulated engagement scenarios for demo mode */
const SCENARIOS = [
  {
    name: "Iran MRBM salvo - Central Israel",
    category: ThreatCategory.MISSILES,
    // Elongated cluster along NE-SW axis (back-azimuth toward Iran)
    regionIndices: [0, 7, 9, 10, 11, 12, 13, 31, 32], // Tel Aviv metro
    countdown: 90,
    delayMs: 0,
  },
  {
    name: "Lebanon SRBM - Northern Israel",
    category: ThreatCategory.MISSILES,
    regionIndices: [24, 25, 26, 41, 42, 43, 44], // Upper Galilee
    countdown: 15,
    delayMs: 5000,
  },
  {
    name: "Rocket barrage - Gaza envelope",
    category: ThreatCategory.ROCKETS,
    regionIndices: [46, 47, 48, 86, 87, 88], // Western Negev
    countdown: 15,
    delayMs: 10000,
  },
  {
    name: "UAV alert - single point",
    category: ThreatCategory.UAV,
    regionIndices: [2], // Haifa
    countdown: 60,
    delayMs: 15000,
  },
  {
    name: "Iran ballistic - Haifa corridor",
    category: ThreatCategory.MISSILES,
    regionIndices: [2, 36, 37, 38, 39, 72, 73], // Haifa metro
    countdown: 60,
    delayMs: 20000,
  },
];

/** Generate a single demo alert for a scenario */
function createDemoAlert(
  scenario: (typeof SCENARIOS)[number],
  batchId: number
): NormalizedAlert {
  const regions: string[] = [];
  const centroids: LatLng[] = [];

  for (const idx of scenario.regionIndices) {
    const entry = GAZETTEER[idx % GAZETTEER.length];
    regions.push(entry.name_he);
    // Add slight random jitter to make clusters more realistic
    centroids.push({
      lat: entry.lat + (Math.random() - 0.5) * 0.01,
      lng: entry.lng + (Math.random() - 0.5) * 0.01,
    });
  }

  return {
    id: `demo-${batchId}-${demoCounter++}`,
    timestamp: new Date().toISOString(),
    regions,
    centroids,
    threat_category: scenario.category,
    countdown_seconds: scenario.countdown,
    raw_payload: { demo: true, scenario: scenario.name },
  };
}

/**
 * Demo alert generator. Cycles through scenarios and yields alerts
 * with realistic timing patterns.
 */
export class DemoAlertSource {
  private scenarioIndex = 0;
  private batchCounter = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: ((alert: NormalizedAlert) => void)[] = [];

  onAlert(listener: (alert: NormalizedAlert) => void): void {
    this.listeners.push(listener);
  }

  start(intervalMs = 8000): void {
    this.intervalId = setInterval(() => {
      const scenario = SCENARIOS[this.scenarioIndex % SCENARIOS.length];
      const alert = createDemoAlert(scenario, this.batchCounter++);
      for (const listener of this.listeners) {
        listener(alert);
      }
      this.scenarioIndex++;
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /** Generate a single batch immediately (for testing) */
  generateBatch(): NormalizedAlert {
    const scenario = SCENARIOS[this.scenarioIndex % SCENARIOS.length];
    this.scenarioIndex++;
    return createDemoAlert(scenario, this.batchCounter++);
  }
}
