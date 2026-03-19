"use client";

import { useAlertStore } from "@/stores/alert-store";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";

export function TopBar() {
  const alertCount = useAlertStore((s) => s.alerts.length);

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

      {/* Spacer */}
      <div className="flex-1" />

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
