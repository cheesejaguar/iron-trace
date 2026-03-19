import { NextResponse } from "next/server";
import { alertStore } from "@/lib/alert-store";
import { OrefAlertsResponseSchema } from "@/lib/schemas";
import { normalizeOrefAlert } from "@/lib/alert-sources/normalize";

export const dynamic = "force-dynamic";

const OREF_URL =
  process.env.OREF_API_URL ??
  "https://www.oref.org.il/WarningMessages/alert/alerts.json";

/**
 * GET /api/alerts/ingest
 * Polls the upstream Pikud HaOref API, normalizes, and stores alerts.
 * Intended to be called by a Vercel Cron Job.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(OREF_URL, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Referer: "https://www.oref.org.il/",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${response.status}` },
        { status: 502 }
      );
    }

    const text = await response.text();
    // Handle BOM and empty responses
    const cleaned = text.replace(/^\uFEFF/, "").trim();
    const raw = cleaned ? JSON.parse(cleaned) : [];

    const parsed = OrefAlertsResponseSchema.parse(raw);
    let ingested = 0;

    for (const rawAlert of parsed) {
      const normalized = normalizeOrefAlert(rawAlert);
      if (alertStore.add(normalized)) {
        ingested++;
      }
    }

    return NextResponse.json({
      ingested,
      total: alertStore.size,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
