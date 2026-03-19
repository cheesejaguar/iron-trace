"use client";

import { useState, type ReactNode } from "react";

interface CollapsiblePanelProps {
  side: "left" | "right";
  width: number;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsiblePanel({
  side,
  width,
  children,
  defaultOpen = true,
}: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  const positionClass = side === "left" ? "left-0" : "right-0";
  const togglePosition = side === "left" ? "-right-8" : "-left-8";
  const toggleIcon = side === "left"
    ? (open ? "\u25C0" : "\u25B6")
    : (open ? "\u25B6" : "\u25C0");

  return (
    <div
      className={`absolute top-12 bottom-16 ${positionClass} z-[1000] transition-transform duration-300 ease-in-out`}
      style={{
        width: `${width}px`,
        transform: open
          ? "translateX(0)"
          : side === "left"
          ? `translateX(-${width}px)`
          : `translateX(${width}px)`,
      }}
    >
      {/* Panel content */}
      <div className="w-full h-full bg-iron-panel backdrop-blur-sm border-r border-white/10 overflow-hidden flex flex-col"
        style={side === "right" ? { borderRight: "none", borderLeft: "1px solid rgba(255,255,255,0.1)" } : undefined}
      >
        {children}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`absolute top-1/2 ${togglePosition} -translate-y-1/2 w-8 h-12 bg-iron-panel backdrop-blur-sm border border-white/10 flex items-center justify-center text-iron-text/60 hover:text-iron-text transition-colors rounded-r`}
        style={side === "right" ? { borderRadius: "4px 0 0 4px" } : undefined}
      >
        <span className="text-xs">{toggleIcon}</span>
      </button>
    </div>
  );
}
