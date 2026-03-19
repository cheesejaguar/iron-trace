import { NextRequest, NextResponse } from "next/server";
import { alertStore } from "@/lib/alert-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/alerts/recent
 * Returns last N alerts from the in-memory store.
 * Query params: limit (default 100), since (ISO timestamp)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get("limit") ?? "100", 10);
  const since = searchParams.get("since") ?? undefined;

  const alerts = alertStore.getRecent(limit, since);

  return NextResponse.json({
    alerts,
    count: alerts.length,
    total: alertStore.size,
  });
}
