import type { LaunchSite } from "@/types";

/**
 * Known and suspected launch sites compiled from satellite imagery analysis
 * (Planet Labs, Sentinel-2) and OSINT reports.
 */
export const LAUNCH_SITES: LaunchSite[] = [
  {
    name: "Tabriz Missile Base",
    country: "Iran",
    lat: 38.08,
    lng: 46.30,
    associated_munitions: ["Shahab-3", "Emad"],
    source: "CSIS Missile Threat",
  },
  {
    name: "Kermanshah TEL Garrison",
    country: "Iran",
    lat: 34.35,
    lng: 47.06,
    associated_munitions: ["Ghadr-110", "Fateh-313"],
    source: "Planet Labs imagery",
  },
  {
    name: "Isfahan Missile Complex",
    country: "Iran",
    lat: 32.65,
    lng: 51.68,
    associated_munitions: ["Kheibar Shekan", "Fattah-1"],
    source: "IISS / Janes",
  },
  {
    name: "Khorramabad Base",
    country: "Iran",
    lat: 33.49,
    lng: 48.35,
    associated_munitions: ["Emad", "Dezful"],
    source: "Sentinel-2 / OSINT",
  },
  {
    name: "Bekaa Valley (multiple)",
    country: "Lebanon",
    lat: 33.85,
    lng: 36.10,
    associated_munitions: ["Fateh-110 variants"],
    source: "IDF strike disclosures",
  },
  {
    name: "Hermel Region",
    country: "Lebanon",
    lat: 34.39,
    lng: 36.38,
    associated_munitions: ["Zelzal", "M-600"],
    source: "ACLED / media",
  },
];
