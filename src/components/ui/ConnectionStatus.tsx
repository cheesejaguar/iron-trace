"use client";

import { useAlertStore } from "@/stores/alert-store";

export function ConnectionStatus() {
  const connected = useAlertStore((s) => s.connected);

  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-label={connected ? "Connected to live feed" : "Disconnected from live feed"}
    >
      <div className="relative">
        <div
          className={`w-2 h-2 rounded-full ${
            connected
              ? "bg-green-400 live-glow"
              : "bg-red-500"
          }`}
        />
        {connected && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping opacity-30" />
        )}
      </div>
      <span className={`text-[10px] font-medium uppercase tracking-wider ${
        connected ? "text-green-400/80" : "text-red-400/80"
      }`}>
        {connected ? "Live" : "Offline"}
      </span>
    </div>
  );
}
