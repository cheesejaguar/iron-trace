"use client";

import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("./MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a1628] gap-4">
      <div className="map-loader" />
      <div className="text-center">
        <div className="text-iron-text/50 text-sm font-medium">Loading map</div>
        <div className="text-iron-text/20 text-[10px] mt-1 font-mono">Initializing Leaflet tiles...</div>
      </div>
    </div>
  ),
});

export default function DynamicMap() {
  return <MapContainer />;
}
