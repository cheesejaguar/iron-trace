"use client";

import { useAlertStore, useFilteredAlerts } from "@/stores/alert-store";
import { ClassificationBadge } from "@/components/ui/ClassificationBadge";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import type { NormalizedAlert } from "@/types";
import { ThreatCategory } from "@/types";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function timeSince(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

/** Left colored stripe by threat level */
const SEVERITY_STRIPE: Record<ThreatCategory, string> = {
  [ThreatCategory.MISSILES]: "border-l-iron-ballistic",
  [ThreatCategory.HOSTILE_AIRCRAFT]: "border-l-iron-cruise",
  [ThreatCategory.UAV]: "border-l-iron-uav",
  [ThreatCategory.ROCKETS]: "border-l-iron-rocket",
  [ThreatCategory.UNKNOWN]: "border-l-gray-500",
};

function AlertItem({ alert }: { alert: NormalizedAlert }) {
  const selectAlert = useAlertStore((s) => s.selectAlert);
  const selectedId = useAlertStore((s) => s.selectedAlertId);
  const isSelected = selectedId === alert.id;
  const isRecent = Date.now() - new Date(alert.timestamp).getTime() < 5 * 60 * 1000;

  return (
    <button
      onClick={() => selectAlert(alert.id)}
      className={`alert-item-enter w-full text-left px-3 md:px-3 py-3 md:py-2.5 border-b border-white/[0.04] border-l-2 transition-all duration-150 min-h-[56px] ${
        SEVERITY_STRIPE[alert.threat_category]
      } ${
        isSelected
          ? "bg-white/[0.08] border-l-opacity-100"
          : "hover:bg-white/[0.04] border-l-opacity-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {isRecent && (
              <span className="w-2 h-2 rounded-full bg-iron-ballistic animate-pulse shrink-0" />
            )}
            <span className="text-sm font-medium text-iron-text truncate">
              {alert.regions[0]}
            </span>
          </div>
          {alert.regions.length > 1 && (
            <div className="text-[12px] md:text-[11px] text-iron-text/40 truncate mt-0.5 pl-3.5">
              +{alert.regions.length - 1} more regions
            </div>
          )}
        </div>
        <ClassificationBadge category={alert.threat_category} />
      </div>
      <div className="flex items-center gap-2.5 mt-1.5 text-[11px] md:text-[10px] text-iron-text/35 font-mono">
        <span>{formatTime(alert.timestamp)}</span>
        <span className="text-iron-text/20">|</span>
        <span>{timeSince(alert.timestamp)}</span>
        <span className="text-iron-text/20">|</span>
        <span className={alert.countdown_seconds <= 30 ? "text-iron-ballistic/60" : ""}>
          {alert.countdown_seconds}s shelter
        </span>
      </div>
    </button>
  );
}

function AlertList() {
  const alerts = useFilteredAlerts();

  return (
    <>
      <div className="px-3 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-iron-text/40">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h2 className="text-xs font-semibold text-iron-text uppercase tracking-wider">Alert Feed</h2>
        </div>
        <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
          alerts.length > 0 ? "bg-white/[0.06] text-iron-text/60" : "text-iron-text/30"
        }`}>
          {alerts.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto iron-scrollbar no-bounce">
        {alerts.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/[0.04] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-iron-text/20">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="10" cy="10" r="2" fill="currentColor" />
              </svg>
            </div>
            <p className="text-xs text-iron-text/25">Waiting for alerts...</p>
            <p className="text-[11px] text-iron-text/15 mt-1">Listening on SSE feed</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))
        )}
      </div>
    </>
  );
}

export function LeftPanel({ mobile }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="flex flex-col h-full">
        <AlertList />
      </div>
    );
  }

  return (
    <CollapsiblePanel side="left" width={320}>
      <AlertList />
    </CollapsiblePanel>
  );
}
