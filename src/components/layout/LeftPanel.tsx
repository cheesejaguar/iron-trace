"use client";

import { useAlertStore, useFilteredAlerts } from "@/stores/alert-store";
import { ClassificationBadge } from "@/components/ui/ClassificationBadge";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import type { NormalizedAlert } from "@/types";

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

function AlertItem({ alert }: { alert: NormalizedAlert }) {
  const selectAlert = useAlertStore((s) => s.selectAlert);
  const selectedId = useAlertStore((s) => s.selectedAlertId);
  const isSelected = selectedId === alert.id;

  return (
    <button
      onClick={() => selectAlert(alert.id)}
      className={`w-full text-left px-3 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors ${
        isSelected ? "bg-white/10" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-iron-text truncate">
            {alert.regions[0]}
          </div>
          {alert.regions.length > 1 && (
            <div className="text-xs text-iron-text/50 truncate">
              +{alert.regions.length - 1} more regions
            </div>
          )}
        </div>
        <ClassificationBadge category={alert.threat_category} />
      </div>
      <div className="flex items-center gap-3 mt-1 text-xs text-iron-text/40">
        <span>{formatTime(alert.timestamp)}</span>
        <span>{timeSince(alert.timestamp)}</span>
        <span>{alert.countdown_seconds}s shelter</span>
      </div>
    </button>
  );
}

export function LeftPanel() {
  const alerts = useFilteredAlerts();

  return (
    <CollapsiblePanel side="left" width={320}>
      <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-iron-text">Alert Feed</h2>
        <span className="text-xs text-iron-text/40 font-mono">
          {alerts.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto iron-scrollbar">
        {alerts.length === 0 ? (
          <div className="px-3 py-8 text-center text-iron-text/30 text-sm">
            No alerts yet. Waiting for data...
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))
        )}
      </div>
    </CollapsiblePanel>
  );
}
