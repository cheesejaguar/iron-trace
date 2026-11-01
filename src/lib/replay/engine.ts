import type { NormalizedAlert } from "@/types";

/**
 * Replay engine: replays historical alert data at configurable speed.
 * Manages playback state and emits alerts at the correct relative timing.
 */
export class ReplayEngine {
  private alerts: NormalizedAlert[] = [];
  private currentIndex = 0;
  private startTime = 0;
  private playbackStartTime = 0;
  private speed = 1;
  private animFrameId: number | null = null;
  /** Simulated time to resume from (set by pause/seek, cleared by stop/load) */
  private simTime: number | null = null;
  private onAlert: (alert: NormalizedAlert) => void;
  private onTimeUpdate: (time: string) => void;
  private onComplete: () => void;

  constructor(callbacks: {
    onAlert: (alert: NormalizedAlert) => void;
    onTimeUpdate: (time: string) => void;
    onComplete: () => void;
  }) {
    this.onAlert = callbacks.onAlert;
    this.onTimeUpdate = callbacks.onTimeUpdate;
    this.onComplete = callbacks.onComplete;
  }

  /** Load alerts sorted by timestamp */
  load(alerts: NormalizedAlert[]): void {
    this.alerts = [...alerts].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    this.currentIndex = 0;
    this.simTime = null;
  }

  /** Start or resume playback */
  play(speed = 1): void {
    this.speed = speed;
    if (this.alerts.length === 0) return;

    // Resume from the current simulated time (after pause/seek), or from the
    // first alert when starting fresh.
    this.startTime =
      this.simTime ?? new Date(this.alerts[0].timestamp).getTime();
    this.playbackStartTime = Date.now();
    this.simTime = null;

    this.tick();
  }

  /** Pause playback */
  pause(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
      this.simTime = this.currentSimTime();
    }
  }

  /** Seek to a specific time */
  seekTo(isoTime: string): void {
    const targetTime = new Date(isoTime).getTime();
    this.currentIndex = 0;

    // Find the right position
    while (
      this.currentIndex < this.alerts.length &&
      new Date(this.alerts[this.currentIndex].timestamp).getTime() <= targetTime
    ) {
      this.currentIndex++;
    }

    this.simTime = targetTime;
    this.startTime = targetTime;
    this.playbackStartTime = Date.now();
    this.onTimeUpdate(isoTime);
  }

  /** Update playback speed */
  setSpeed(speed: number): void {
    // Recalibrate the time reference so simulated time stays continuous:
    // freeze the current simulated time, then advance from it at the new speed.
    if (this.animFrameId !== null) {
      this.startTime = this.currentSimTime();
      this.playbackStartTime = Date.now();
    }
    this.speed = speed;
  }

  /** Stop and reset */
  stop(): void {
    this.pause();
    this.currentIndex = 0;
    this.simTime = null;
  }

  /** Get alerts up to current time (for time-windowed display) */
  getAlertsUpTo(isoTime: string): NormalizedAlert[] {
    const targetTime = new Date(isoTime).getTime();
    return this.alerts.filter(
      (a) => new Date(a.timestamp).getTime() <= targetTime
    );
  }

  private currentSimTime(): number {
    return this.startTime + (Date.now() - this.playbackStartTime) * this.speed;
  }

  private tick = (): void => {
    this.animFrameId = null;
    if (this.currentIndex >= this.alerts.length) {
      this.onComplete();
      return;
    }

    const currentSimTime = this.currentSimTime();

    // Emit all alerts that should have occurred by now
    while (this.currentIndex < this.alerts.length) {
      const alertTime = new Date(
        this.alerts[this.currentIndex].timestamp
      ).getTime();

      if (alertTime <= currentSimTime) {
        this.onAlert(this.alerts[this.currentIndex]);
        this.currentIndex++;
      } else {
        break;
      }
    }

    this.onTimeUpdate(new Date(currentSimTime).toISOString());

    if (this.currentIndex < this.alerts.length) {
      this.animFrameId = requestAnimationFrame(this.tick);
    } else {
      this.onComplete();
    }
  };
}
