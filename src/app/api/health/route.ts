import { NextResponse } from "next/server";
import { alertStore } from "@/lib/alert-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Liveness check: returns upstream status and alert store info.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    alertStore: {
      size: alertStore.size,
      subscribers: alertStore.subscriberCount,
    },
    source: process.env.ALERT_SOURCE ?? "demo",
  });
}
