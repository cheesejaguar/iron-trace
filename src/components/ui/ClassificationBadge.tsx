"use client";

import { ThreatCategory } from "@/types";

const BADGE_CONFIG: Record<ThreatCategory, { bg: string; text: string; dot: string; label: string }> = {
  [ThreatCategory.MISSILES]: { bg: "bg-iron-ballistic/15", text: "text-iron-ballistic", dot: "bg-iron-ballistic", label: "Ballistic" },
  [ThreatCategory.HOSTILE_AIRCRAFT]: { bg: "bg-iron-cruise/15", text: "text-iron-cruise", dot: "bg-iron-cruise", label: "Aircraft" },
  [ThreatCategory.UAV]: { bg: "bg-iron-uav/15", text: "text-iron-uav", dot: "bg-iron-uav", label: "UAV" },
  [ThreatCategory.ROCKETS]: { bg: "bg-iron-rocket/15", text: "text-iron-rocket", dot: "bg-iron-rocket", label: "Rockets" },
  [ThreatCategory.UNKNOWN]: { bg: "bg-gray-500/15", text: "text-gray-400", dot: "bg-gray-400", label: "Unknown" },
};

export function ClassificationBadge({ category }: { category: ThreatCategory }) {
  const config = BADGE_CONFIG[category];

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      <span className="text-[10px] font-semibold uppercase tracking-wider leading-none">
        {config.label}
      </span>
    </span>
  );
}
