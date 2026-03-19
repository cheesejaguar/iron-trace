"use client";

export type MobileTab = "map" | "alerts" | "analysis";

interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  alertCount: number;
  analysisCount: number;
}

const TABS: { id: MobileTab; label: string; icon: JSX.Element }[] = [
  {
    id: "map",
    label: "Map",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 5l5-2 4 2 5-2v12l-5 2-4-2-5 2V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 3v12M12 5v12" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L18 17H2L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 8v4M10 14v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "analysis",
    label: "Analysis",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

export function MobileTabBar({ activeTab, onTabChange, alertCount, analysisCount }: MobileTabBarProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1002] bg-iron-panel/95 backdrop-blur-md border-t border-white/[0.08] safe-bottom">
      <div className="flex items-stretch h-14">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const badge = tab.id === "alerts" ? alertCount : tab.id === "analysis" ? analysisCount : 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors duration-200 relative ${
                isActive
                  ? "text-iron-ballistic border-t-2 border-iron-ballistic"
                  : "text-iron-text/35 border-t-2 border-transparent"
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                {tab.icon}
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 rounded-full bg-iron-ballistic text-[9px] text-white font-bold flex items-center justify-center px-1">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
