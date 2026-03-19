"use client";

import DynamicMap from "@/components/map/DynamicMap";
import { useAlertStream } from "@/hooks/useAlertStream";

export default function Home() {
  useAlertStream();

  return (
    <main className="w-screen h-screen relative overflow-hidden">
      <DynamicMap />
    </main>
  );
}
