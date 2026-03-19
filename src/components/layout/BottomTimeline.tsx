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
    <div className="absolute bottom-0 left-0 right-0 h-14 z-[1001] bg-iron-panel/95 backdrop-blur-md border-t border-white/[0.06] flex items-center px-4 gap-3">
      {/* Replay controls */}
      <div className="flex items-center gap-1.5">
        {!isReplaying ? (
          <button
            onClick={handleStartReplay}
            disabled={alerts.length < 2}
            className="text-[10px] px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.06] text-iron-text/50 hover:text-iron-text/80 hover:bg-white/[0.1] transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed font-medium uppercase tracking-wider"
            title="Start replay"
            aria-label="Start replay"
          >
            Replay
          </button>
        ) : (
          <>
            <button
              onClick={togglePlayback}
              className="w-8 h-8 rounded-md bg-white/[0.08] border border-white/[0.08] text-iron-text/70 flex items-center justify-center hover:bg-white/[0.12] hover:text-iron-text transition-all duration-150"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <span className="text-sm">{isPlaying ? "\u23F8" : "\u25B6"}</span>
            </button>
            <button
              onClick={stopReplay}
              className="text-[10px] px-2.5 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.06] text-iron-text/40 hover:text-iron-text/70 transition-all duration-150 font-medium uppercase tracking-wider"
              aria-label="Stop replay"
            >
              Stop
            </button>
          </>
        )}
      </div>

      {/* Speed selector */}
      {isReplaying && (
        <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-md p-0.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-all duration-150 ${
                speed === s
                  ? "bg-iron-ballistic/20 text-iron-ballistic font-bold"
                  : "text-iron-text/25 hover:text-iron-text/50"
              }`}
              aria-label={`Set speed to ${s}x`}
            >
              {s}x
            </button>
          ))}
        </div>
      )}

      {/* Time range start */}
      <div className="text-[10px] text-iron-text/30 font-mono whitespace-nowrap tabular-nums">
        {formatTimeShort(isReplaying ? rangeStart : alerts.length > 0 ? alerts[alerts.length - 1]?.timestamp : null)}
      </div>

      {/* Timeline track */}
      <div
        className="flex-1 relative h-7 bg-white/[0.03] rounded-md overflow-hidden cursor-pointer border border-white/[0.04] group"
        onClick={handleScrub}
        role="slider"
        aria-label="Timeline"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Fill */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-iron-ballistic/15 to-iron-ballistic/25 transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
        {/* Tick marks for visual texture */}
        <div className="absolute inset-0 flex items-end px-1 pb-0.5 pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="flex-1 mx-px"
              style={{ height: `${8 + Math.random() * 12}px` }}
            >
              <div className="w-full h-full bg-white/[0.04] rounded-sm" />
            </div>
          ))}
        </div>
        {/* Scrubber handle */}
        {isReplaying && (
          <div
            className="absolute top-0 h-full w-0.5 bg-iron-ballistic shadow-[0_0_6px_rgba(220,20,60,0.4)] transition-all duration-100"
            style={{ left: `${Math.min(100, progress)}%` }}
          />
        )}
        {/* Label */}
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-iron-text/20 font-medium pointer-events-none">
          {isReplaying
            ? `Replaying at ${speed}x`
            : alerts.length > 0
            ? `${alerts.length} alerts in session`
            : "Waiting for alerts..."}
        </div>
      </div>

      {/* Current time */}
      <div className="text-[10px] text-iron-text/30 font-mono whitespace-nowrap tabular-nums">
        {formatTimeShort(isReplaying ? currentTime : lastUpdate)}
      </div>
    </div>
  );
}
