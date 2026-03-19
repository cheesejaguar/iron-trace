import { create } from "zustand";
import type { EngagementAnalysis } from "@/types";

interface AnalysisStoreState {
  /** Computed engagement analyses */
  analyses: EngagementAnalysis[];
  /** Selected engagement ID for detail view */
  selectedEngagementId: string | null;
  /** Whether analysis is currently running */
  isAnalyzing: boolean;
  /** Show/hide overlay layers */
  showEllipses: boolean;
  showTrajectories: boolean;
  showHeatmap: boolean;
  showLaunchSites: boolean;

  // Actions
  setAnalyses: (analyses: EngagementAnalysis[]) => void;
  selectEngagement: (id: string | null) => void;
  setAnalyzing: (v: boolean) => void;
  toggleEllipses: () => void;
  toggleTrajectories: () => void;
  toggleHeatmap: () => void;
  toggleLaunchSites: () => void;
}

export const useAnalysisStore = create<AnalysisStoreState>((set) => ({
  analyses: [],
  selectedEngagementId: null,
  isAnalyzing: false,
  showEllipses: true,
  showTrajectories: true,
  showHeatmap: true,
  showLaunchSites: true,

  setAnalyses: (analyses) => set({ analyses }),
  selectEngagement: (id) => set({ selectedEngagementId: id }),
  setAnalyzing: (v) => set({ isAnalyzing: v }),
  toggleEllipses: () => set((s) => ({ showEllipses: !s.showEllipses })),
  toggleTrajectories: () => set((s) => ({ showTrajectories: !s.showTrajectories })),
  toggleHeatmap: () => set((s) => ({ showHeatmap: !s.showHeatmap })),
  toggleLaunchSites: () => set((s) => ({ showLaunchSites: !s.showLaunchSites })),
}));
