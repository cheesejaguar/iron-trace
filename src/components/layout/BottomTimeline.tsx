"use client";

import { useAlertStore } from "@/stores/alert-store";
import { useTimelineStore, type PlaybackSpeed } from "@/stores/timeline-store";

const SPEEDS: PlaybackSpeed[] = [1, 2, 5, 10, 30, 60];

function formatTimeShort(iso: string | null): string {
  if (!iso) return "--:--:--";
  return new Date(iso).toLocaleTimeString("en-IL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function BottomTimeline() {
  const alerts = useAlertStore((s) => s.alerts);
  const lastUpdate = useAlertStore((s) => s.lastUpdate);

  const isReplaying = useTimelineStore((s) => s.isReplaying);
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const rangeStart = useTimelineStore((s) => s.rangeStart);
  const rangeEnd = useTimelineStore((s) => s.rangeEnd);
  const speed = useTimelineStore((s) => s.speed);
  const setSpeed = useTimelineStore((s) => s.setSpeed);
  const togglePlayback = useTimelineStore((s) => s.togglePlayback);
  const startReplay = useTimelineStore((s) => s.startReplay);
  const stopReplay = useTimelineStore((s) => s.stopReplay);
  const setCurrentTime = useTimelineStore((s) => s.setCurrentTime);

  // Compute timeline progress
  let progress = 0;
  if (isReplaying && rangeStart && rangeEnd && currentTime) {
    const start = new Date(rangeStart).getTime();
    const end = new Date(rangeEnd).getTime();
    const current = new Date(currentTime).getTime();
    const range = end - start;
    progress = range > 0 ? ((current - start) / range) * 100 : 0;
  } else if (alerts.length > 0) {
    progress = Math.min(100, (alerts.length / 100) * 100);
  }

  const handleStartReplay = () => {
    if (alerts.length < 2) return;
    const sorted = [...alerts].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    startReplay(sorted[0].timestamp, sorted[sorted.length - 1].timestamp);
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isReplaying || !rangeStart || !rangeEnd) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const start = new Date(rangeStart).getTime();
    const end = new Date(rangeEnd).getTime();
    const time = new Date(start + (end - start) * pct).toISOString();
    setCurrentTime(time);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 z-[1001] bg-iron-panel backdrop-blur-sm border-t border-white/10 flex items-center px-4 gap-3">
      {/* Replay controls */}
      <div className="flex items-center gap-2">
        {!isReplaying ? (
          <button
            onClick={handleStartReplay}
            disabled={alerts.length < 2}
            className="text-xs px-2 py-1 rounded bg-white/10 text-iron-text/60 hover:text-iron-text hover:bg-white/15 transition-colors disabled:opacity-30"
            title="Start replay"
          >
            Replay
          </button>
        ) : (
          <>
            <button
              onClick={togglePlayback}
              className="w-7 h-7 rounded bg-white/10 text-iron-text flex items-center justify-center hover:bg-white/15 transition-colors"
            >
              {isPlaying ? "\u23F8" : "\u25B6"}
            </button>
            <button
              onClick={stopReplay}
              className="text-xs px-2 py-1 rounded bg-white/10 text-iron-text/60 hover:text-iron-text transition-colors"
            >
              Stop
            </button>
          </>
        )}
      </div>

      {/* Speed selector (only in replay mode) */}
      {isReplaying && (
        <div className="flex items-center gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                speed === s
                  ? "bg-iron-ballistic/30 text-iron-ballistic"
                  : "text-iron-text/30 hover:text-iron-text/60"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      )}

      {/* Time range */}
      <div className="text-xs text-iron-text/40 font-mono whitespace-nowrap">
        {formatTimeShort(isReplaying ? rangeStart : alerts.length > 0 ? alerts[alerts.length - 1]?.timestamp : null)}
      </div>

      {/* Timeline track */}
      <div
        className="flex-1 relative h-6 bg-white/5 rounded-full overflow-hidden cursor-pointer"
        onClick={handleScrub}
      >
        <div
          className="absolute top-0 left-0 h-full bg-iron-ballistic/20 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
        {/* Scrubber handle */}
        {isReplaying && (
          <div
            className="absolute top-0 h-full w-1 bg-iron-ballistic rounded"
            style={{ left: `${Math.min(100, progress)}%` }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-iron-text/30">
          {isReplaying
            ? `Replaying at ${speed}x`
            : alerts.length > 0
            ? `${alerts.length} alerts in session`
            : "Waiting for alerts..."}
        </div>
      </div>

      {/* Current time */}
      <div className="text-xs text-iron-text/40 font-mono whitespace-nowrap">
        {formatTimeShort(isReplaying ? currentTime : lastUpdate)}
      </div>
    </div>
  );
}
