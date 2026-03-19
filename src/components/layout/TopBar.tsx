"use client";

import { useAlertStore } from "@/stores/alert-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { ThreatCategory, EngagementClassification } from "@/types";

const FILTER_BUTTONS: { category: ThreatCategory; label: string; color: string }[] = [
  { category: ThreatCategory.MISSILES, label: "Ballistic", color: "text-iron-ballistic" },
  { category: ThreatCategory.HOSTILE_AIRCRAFT, label: "Aircraft", color: "text-iron-cruise" },
  { category: ThreatCategory.UAV, label: "UAV", color: "text-iron-uav" },
  { category: ThreatCategory.ROCKETS, label: "Rockets", color: "text-iron-rocket" },
];

export function TopBar() {
  const alertCount = useAlertStore((s) => s.alerts.length);
  const activeFilters = useAlertStore((s) => s.activeFilters);
  const toggleFilter = useAlertStore((s) => s.toggleFilter);
  const analyses = useAnalysisStore((s) => s.analyses);

  const ballisticCount = analyses.filter(
    (a) => a.classification === EngagementClassification.BALLISTIC_MISSILE
  ).length;

  return (
    <header className="absolute top-0 left-0 right-0 h-12 z-[1001] bg-iron-panel backdrop-blur-sm border-b border-white/10 flex items-center px-4 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-iron-ballistic/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-iron-ballistic">
            <path
              d="M8 1L10 6H14L11 9L12 14L8 11L4 14L5 9L2 6H6L8 1Z"
              fill="currentColor"
              opacity="0.8"
            />
          </svg>
        </div>
        <span className="font-bold text-iron-text tracking-tight">
          Iron Trace
        </span>
        <span className="text-[10px] text-iron-text/40 font-mono">v1.0</span>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1 ml-2">
        {FILTER_BUTTONS.map((btn) => {
          const isActive = activeFilters.size === 0 || activeFilters.has(btn.category);
          return (
            <button
              key={btn.category}
              onClick={() => toggleFilter(btn.category)}
              className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${
                isActive
                  ? `bg-white/10 ${btn.color}`
                  : "bg-white/5 text-iron-text/20"
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Engagement count */}
      {ballisticCount > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-iron-ballistic/60">Engagements:</span>
          <span className="text-sm font-mono font-bold text-iron-ballistic">
            {ballisticCount}
          </span>
        </div>
      )}

      {/* Alert count */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-iron-text/60">Alerts:</span>
        <span className="text-sm font-mono font-bold text-iron-text">
          {alertCount}
        </span>
      </div>

      {/* Connection status */}
      <ConnectionStatus />
    </header>
  );
}
