"use client";

import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("./MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a1628]">
      <div className="text-iron-text text-lg animate-pulse">
        Loading map...
      </div>
    </div>
  ),
});

export default function DynamicMap() {
  return <MapContainer />;
}
