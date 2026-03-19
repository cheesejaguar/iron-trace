"use client";

import { useMap } from "react-leaflet";

const controls = [
  {
    label: "+",
    title: "Zoom in",
    action: (map: L.Map) => map.zoomIn(),
    className: "text-lg font-light",
  },
  {
    label: "-",
    title: "Zoom out",
    action: (map: L.Map) => map.zoomOut(),
    className: "text-lg font-light",
  },
  {
    label: "IL",
    title: "Center on Israel",
    action: (map: L.Map) => map.setView([31.5, 35.0], 8),
    className: "text-[10px] font-bold",
  },
  {
    label: "IR",
    title: "View threat region (Iran)",
    action: (map: L.Map) => map.setView([34.0, 44.0], 5),
    className: "text-[10px] font-bold",
  },
];

export function MapControls() {
  const map = useMap();

  return (
    <div className="absolute top-16 right-4 z-[1000] flex flex-col gap-1">
      {controls.map((ctrl) => (
        <button
          key={ctrl.title}
          onClick={() => ctrl.action(map)}
          className={`w-8 h-8 rounded-md bg-iron-panel/90 backdrop-blur-md border border-white/[0.08] text-iron-text/60 flex items-center justify-center hover:bg-white/[0.12] hover:text-iron-text hover:border-white/[0.15] active:scale-95 transition-all duration-150 ${ctrl.className}`}
          title={ctrl.title}
          aria-label={ctrl.title}
        >
          {ctrl.label}
        </button>
      ))}
    </div>
  );
}
