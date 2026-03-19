import { create } from "zustand";
import type { NormalizedAlert, ThreatCategory } from "@/types";

interface AlertStoreState {
  /** All alerts currently in the buffer */
  alerts: NormalizedAlert[];
  /** SSE connection status */
  connected: boolean;
  /** Currently selected alert (for detail panel) */
  selectedAlertId: string | null;
  /** Active threat category filters (empty = show all) */
  activeFilters: Set<ThreatCategory>;
  /** Last update timestamp */
  lastUpdate: string | null;

  // Actions
  addAlert: (alert: NormalizedAlert) => void;
  setAlerts: (alerts: NormalizedAlert[]) => void;
  setConnected: (connected: boolean) => void;
  selectAlert: (id: string | null) => void;
  toggleFilter: (category: ThreatCategory) => void;
}

export const useAlertStore = create<AlertStoreState>((set, get) => ({
  alerts: [],
  connected: false,
  selectedAlertId: null,
  activeFilters: new Set(),
  lastUpdate: null,

  addAlert: (alert) =>
    set((state) => {
      // Dedup
      if (state.alerts.some((a) => a.id === alert.id)) return state;
      // Keep max 500 alerts in client buffer
      const alerts = [alert, ...state.alerts].slice(0, 500);
      return { alerts, lastUpdate: alert.timestamp };
    }),

  setAlerts: (alerts) =>
    set({
      alerts: alerts.slice(0, 500),
      lastUpdate: alerts[0]?.timestamp ?? null,
    }),

  setConnected: (connected) => set({ connected }),

  selectAlert: (id) => set({ selectedAlertId: id }),

  toggleFilter: (category) =>
    set((state) => {
      const filters = new Set(state.activeFilters);
      if (filters.has(category)) {
        filters.delete(category);
      } else {
        filters.add(category);
      }
      return { activeFilters: filters };
    }),
}));

/** Selector: filtered alerts based on active category filters */
export function useFilteredAlerts(): NormalizedAlert[] {
  const alerts = useAlertStore((s) => s.alerts);
  const filters = useAlertStore((s) => s.activeFilters);
  if (filters.size === 0) return alerts;
  return alerts.filter((a) => filters.has(a.threat_category));
}
