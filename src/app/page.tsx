"use client";

import DynamicMap from "@/components/map/DynamicMap";
import { TopBar } from "@/components/layout/TopBar";
import { LeftPanel } from "@/components/layout/LeftPanel";
import { RightPanel } from "@/components/layout/RightPanel";
import { BottomTimeline } from "@/components/layout/BottomTimeline";
import { useAlertStream } from "@/hooks/useAlertStream";
import { useAnalysisPipeline } from "@/hooks/useAnalysisPipeline";

export default function Home() {
  useAlertStream();
  useAnalysisPipeline();

  return (
    <main className="w-screen h-screen relative overflow-hidden">
      <DynamicMap />
      <TopBar />
      <LeftPanel />
      <RightPanel />
      <BottomTimeline />
    </main>
  );
}
