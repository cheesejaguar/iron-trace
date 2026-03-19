"use client";

import DynamicMap from "@/components/map/DynamicMap";
import { TopBar } from "@/components/layout/TopBar";
import { LeftPanel } from "@/components/layout/LeftPanel";
import { RightPanel } from "@/components/layout/RightPanel";
import { BottomTimeline } from "@/components/layout/BottomTimeline";
import { useAlertStream } from "@/hooks/useAlertStream";

export default function Home() {
  useAlertStream();

  return (
    <main className="w-screen h-screen relative overflow-hidden">
      {/* Full-viewport map */}
      <DynamicMap />

      {/* UI overlay layers */}
      <TopBar />
      <LeftPanel />
      <RightPanel />
      <BottomTimeline />
    </main>
  );
}
