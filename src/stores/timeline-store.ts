import { create } from "zustand";

export type PlaybackSpeed = 1 | 2 | 5 | 10 | 30 | 60;

interface TimelineStoreState {
  /** Whether replay mode is active */
  isReplaying: boolean;
  /** Current playback position (ISO timestamp) */
  currentTime: string | null;
  /** Range start */
  rangeStart: string | null;
  /** Range end */
  rangeEnd: string | null;
  /** Playback speed multiplier */
  speed: PlaybackSpeed;
  /** Is currently playing */
  isPlaying: boolean;

  // Actions
  startReplay: (start: string, end: string) => void;
  stopReplay: () => void;
  setCurrentTime: (time: string) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  togglePlayback: () => void;
  setPlaying: (v: boolean) => void;
}

export const useTimelineStore = create<TimelineStoreState>((set) => ({
  isReplaying: false,
  currentTime: null,
  rangeStart: null,
  rangeEnd: null,
  speed: 1,
  isPlaying: false,

  startReplay: (start, end) =>
    set({
      isReplaying: true,
      rangeStart: start,
      rangeEnd: end,
      currentTime: start,
      isPlaying: false,
    }),

  stopReplay: () =>
    set({
      isReplaying: false,
      currentTime: null,
      rangeStart: null,
      rangeEnd: null,
      isPlaying: false,
    }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setSpeed: (speed) => set({ speed }),
  togglePlayback: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaying: (v) => set({ isPlaying: v }),
}));
