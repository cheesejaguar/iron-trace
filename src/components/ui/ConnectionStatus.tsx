"use client";

import { useAlertStore } from "@/stores/alert-store";

export function ConnectionStatus() {
  const connected = useAlertStore((s) => s.connected);

  return (
    <div className="flex items-center gap-1.5" title={connected ? "Connected" : "Disconnected"}>
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          connected
            ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]"
            : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
        }`}
      />
      <span className="text-xs text-iron-text/60">
        {connected ? "Live" : "Offline"}
      </span>
    </div>
  );
}
