"use client";

import { useAlertStore } from "@/stores/alert-store";

export function BottomTimeline() {
  const alertCount = useAlertStore((s) => s.alerts.length);
  const lastUpdate = useAlertStore((s) => s.lastUpdate);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 z-[1001] bg-iron-panel backdrop-blur-sm border-t border-white/10 flex items-center px-4 gap-4">
      {/* Time range label */}
      <div className="text-xs text-iron-text/40">
        Timeline
      </div>

      {/* Timeline track */}
      <div className="flex-1 relative h-6 bg-white/5 rounded-full overflow-hidden">
        {/* Placeholder timeline bar */}
        <div
          className="absolute top-0 left-0 h-full bg-iron-ballistic/20 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, (alertCount / 50) * 100)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-iron-text/30">
          {alertCount > 0
            ? `${alertCount} alerts in session`
            : "Waiting for alerts..."}
        </div>
      </div>

      {/* Last update */}
      <div className="text-xs text-iron-text/40 font-mono whitespace-nowrap">
        {lastUpdate
          ? new Date(lastUpdate).toLocaleTimeString("en-IL", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
          : "--:--:--"}
      </div>
    </div>
  );
}
