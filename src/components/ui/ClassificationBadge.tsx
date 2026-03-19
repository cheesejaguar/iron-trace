"use client";

import { ThreatCategory } from "@/types";

const BADGE_COLORS: Record<ThreatCategory, { bg: string; text: string }> = {
  [ThreatCategory.MISSILES]: { bg: "bg-iron-ballistic/20", text: "text-iron-ballistic" },
  [ThreatCategory.HOSTILE_AIRCRAFT]: { bg: "bg-iron-cruise/20", text: "text-iron-cruise" },
  [ThreatCategory.UAV]: { bg: "bg-iron-uav/20", text: "text-iron-uav" },
  [ThreatCategory.ROCKETS]: { bg: "bg-iron-rocket/20", text: "text-iron-rocket" },
  [ThreatCategory.UNKNOWN]: { bg: "bg-gray-500/20", text: "text-gray-400" },
};

const BADGE_LABELS: Record<ThreatCategory, string> = {
  [ThreatCategory.MISSILES]: "Ballistic",
  [ThreatCategory.HOSTILE_AIRCRAFT]: "Aircraft",
  [ThreatCategory.UAV]: "UAV",
  [ThreatCategory.ROCKETS]: "Rockets",
  [ThreatCategory.UNKNOWN]: "Unknown",
};

export function ClassificationBadge({ category }: { category: ThreatCategory }) {
  const colors = BADGE_COLORS[category];

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text}`}
    >
      {BADGE_LABELS[category]}
    </span>
  );
}
