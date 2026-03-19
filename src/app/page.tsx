"use client";

import { useState } from "react";
import DynamicMap from "@/components/map/DynamicMap";
import { TopBar } from "@/components/layout/TopBar";
import { LeftPanel } from "@/components/layout/LeftPanel";
import { RightPanel } from "@/components/layout/RightPanel";
import { BottomTimeline } from "@/components/layout/BottomTimeline";
import { MobileTabBar, type MobileTab } from "@/components/layout/MobileTabBar";
import { useAlertStream } from "@/hooks/useAlertStream";
import { useAnalysisPipeline } from "@/hooks/useAnalysisPipeline";
import { useAlertStore } from "@/stores/alert-store";
import { useAnalysisStore } from "@/stores/analysis-store";

export default function Home() {
  useAlertStream();
  useAnalysisPipeline();

  const [mobileTab, setMobileTab] = useState<MobileTab>("map");
  const alertCount = useAlertStore((s) => s.alerts.length);
  const analysisCount = useAnalysisStore((s) => s.analyses.length);

  return (
    <main className="w-screen h-screen-dvh relative overflow-hidden" style={{ height: "100dvh" }}>
      {/* Map is always rendered (behind sheets on mobile) */}
      <DynamicMap />

      {/* Desktop layout: top bar + side panels + bottom timeline */}
      <div className="hidden md:block">
        <TopBar />
        <LeftPanel />
        <RightPanel />
        <BottomTimeline />
      </div>

      {/* Mobile layout: compact top bar + tab-based bottom sheets */}
      <div className="md:hidden">
        <TopBar />

        {/* Mobile bottom sheet for alerts */}
        {mobileTab === "alerts" && (
          <div className="fixed inset-x-0 top-12 bottom-14 z-[1001] bg-iron-panel/95 backdrop-blur-md bottom-sheet-enter overflow-hidden flex flex-col safe-bottom">
            <LeftPanel mobile />
          </div>
        )}

        {/* Mobile bottom sheet for analysis */}
        {mobileTab === "analysis" && (
          <div className="fixed inset-x-0 top-12 bottom-14 z-[1001] bg-iron-panel/95 backdrop-blur-md bottom-sheet-enter overflow-hidden flex flex-col safe-bottom">
            <RightPanel mobile />
          </div>
        )}

        {/* Mobile timeline (compact, above tab bar) */}
        {mobileTab === "map" && (
          <BottomTimeline mobile />
        )}

        <MobileTabBar
          activeTab={mobileTab}
          onTabChange={setMobileTab}
          alertCount={alertCount}
          analysisCount={analysisCount}
        />
      </div>
    </main>
  );
}
