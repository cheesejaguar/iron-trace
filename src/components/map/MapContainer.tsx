"use client";

import { MapContainer as LeafletMapContainer, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertMarkers } from "./AlertMarkers";
import { AnalysisOverlays } from "./AnalysisOverlays";
import { MapControls } from "./MapControls";
import { FlyToAlert } from "./FlyToAlert";

// Fix Leaflet default icon paths for Next.js
function FixLeafletIcons() {
  const map = useMap();
  useEffect(() => {
    const proto = L.Icon.Default.prototype;
    delete (proto as unknown as Record<string, unknown>)["_getIconUrl"];
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
    // Force a re-render
    map.invalidateSize();
  }, [map]);
  return null;
}

/** Tile layer configurations */
const TILE_LAYERS = {
  dark: {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OSM</a>',
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
};

export default function MapContainerComponent() {
  // Center on Israel
  const center: L.LatLngExpression = [31.5, 35.0];

  return (
    <LeafletMapContainer
      center={center}
      zoom={8}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={false}
    >
      <FixLeafletIcons />
      <TileLayer
        url={TILE_LAYERS.dark.url}
        attribution={TILE_LAYERS.dark.attribution}
        maxZoom={19}
      />
      <AlertMarkers />
      <AnalysisOverlays />
      <MapControls />
      <FlyToAlert />
    </LeafletMapContainer>
  );
}
