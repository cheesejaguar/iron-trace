"use client";

import { useAlertStore } from "@/stores/alert-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { ThreatCategory, EngagementClassification } from "@/types";

const FILTER_BUTTONS: { category: ThreatCategory; label: string; color: string; activeColor: string }[] = [
  { category: ThreatCategory.MISSILES, label: "Ballistic", color: "text-iron-ballistic", activeColor: "bg-iron-ballistic/15 border-iron-ballistic/40 text-iron-ballistic" },
  { category: ThreatCategory.HOSTILE_AIRCRAFT, label: "Aircraft", color: "text-iron-cruise", activeColor: "bg-iron-cruise/15 border-iron-cruise/40 text-iron-cruise" },
  { category: ThreatCategory.UAV, label: "UAV", color: "text-iron-uav", activeColor: "bg-iron-uav/15 border-iron-uav/40 text-iron-uav" },
  { category: ThreatCategory.ROCKETS, label: "Rockets", color: "text-iron-rocket", activeColor: "bg-iron-rocket/15 border-iron-rocket/40 text-iron-rocket" },
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
    <header className="absolute top-0 left-0 right-0 h-12 z-[1001] bg-iron-panel/95 backdrop-blur-md border-b border-white/[0.06] flex items-center px-4 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-iron-ballistic/30 to-iron-ballistic/10 border border-iron-ballistic/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-iron-ballistic">
            <path
              d="M8 1L10 6H14L11 9L12 14L8 11L4 14L5 9L2 6H6L8 1Z"
              fill="currentColor"
              opacity="0.9"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-iron-text text-sm tracking-tight leading-none">
            Iron Trace
          </span>
          <span className="text-[9px] text-iron-text/30 font-mono leading-none mt-0.5">
            OSINT v1.0
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/[0.08]" />

      {/* Category filters */}
      <div className="flex items-center gap-1.5">
        {FILTER_BUTTONS.map((btn) => {
          const isActive = activeFilters.size === 0 || activeFilters.has(btn.category);
          return (
            <button
              key={btn.category}
              onClick={() => toggleFilter(btn.category)}
              className={`text-[10px] px-2.5 py-1 rounded-md font-medium transition-all duration-200 border ${
                isActive
                  ? btn.activeColor
                  : "bg-transparent border-white/[0.06] text-iron-text/20 hover:text-iron-text/40 hover:border-white/10"
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
        <div className="flex items-center gap-2 bg-iron-ballistic/10 border border-iron-ballistic/20 rounded-md px-2.5 py-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-iron-ballistic/70">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="6" cy="6" r="2" fill="currentColor" />
          </svg>
          <span className="text-[10px] text-iron-ballistic/70 uppercase tracking-wider font-medium">
            Engagements
          </span>
          <span className="text-sm font-mono font-bold text-iron-ballistic">
            {ballisticCount}
          </span>
        </div>
      )}

      {/* Alert count */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-iron-text/40 uppercase tracking-wider">Alerts</span>
        <span className={`text-sm font-mono font-bold ${alertCount > 0 ? "text-iron-text" : "text-iron-text/30"}`}>
          {alertCount}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/[0.08]" />

      {/* Connection status */}
      <ConnectionStatus />
    </header>
  );
}
