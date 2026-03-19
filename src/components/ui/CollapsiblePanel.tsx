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
  const togglePosition = side === "left" ? "-right-7" : "-left-7";

  return (
    <div
      className={`absolute top-12 bottom-14 ${positionClass} z-[1000] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}
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
      <div
        className={`w-full h-full bg-iron-panel/95 backdrop-blur-md overflow-hidden flex flex-col ${
          side === "left"
            ? "border-r border-white/[0.06]"
            : "border-l border-white/[0.06]"
        }`}
      >
        {children}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`absolute top-1/2 ${togglePosition} -translate-y-1/2 w-7 h-14 bg-iron-panel/95 backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-iron-text/30 hover:text-iron-text/60 transition-all duration-200 ${
          side === "left" ? "rounded-r-md border-l-0" : "rounded-l-md border-r-0"
        }`}
        aria-label={`${open ? "Collapse" : "Expand"} ${side} panel`}
        aria-expanded={open}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform duration-300 ${
            (side === "left" && open) || (side === "right" && !open)
              ? "rotate-180"
              : ""
          }`}
        >
          <path
            d="M3 1L7 5L3 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
