"use client";

import { useMap } from "react-leaflet";

export function MapControls() {
  const map = useMap();

  return (
    <div className="absolute top-16 right-4 z-[1000] flex flex-col gap-1">
      <button
        onClick={() => map.zoomIn()}
        className="w-8 h-8 rounded bg-iron-panel backdrop-blur-sm border border-white/10 text-iron-text flex items-center justify-center hover:bg-white/15 text-lg font-light"
        title="Zoom in"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-8 h-8 rounded bg-iron-panel backdrop-blur-sm border border-white/10 text-iron-text flex items-center justify-center hover:bg-white/15 text-lg font-light"
        title="Zoom out"
      >
        -
      </button>
      <button
        onClick={() => map.setView([31.5, 35.0], 8)}
        className="w-8 h-8 rounded bg-iron-panel backdrop-blur-sm border border-white/10 text-iron-text flex items-center justify-center hover:bg-white/15 text-xs"
        title="Reset view"
      >
        IL
      </button>
      <button
        onClick={() => map.setView([34.0, 44.0], 5)}
        className="w-8 h-8 rounded bg-iron-panel backdrop-blur-sm border border-white/10 text-iron-text flex items-center justify-center hover:bg-white/15 text-xs"
        title="View threat region"
      >
        IR
      </button>
    </div>
  );
}
