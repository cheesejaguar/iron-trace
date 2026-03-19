import { NextRequest, NextResponse } from "next/server";
import { query, isDatabaseAvailable } from "@/lib/db/client";

/**
 * GET /api/alerts/history
 * Queries Vercel Postgres for historical alerts.
 * Supports date range, region filter, classification filter.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      {
        error: "Database not configured",
        hint: "Set POSTGRES_URL environment variable",
      },
      { status: 503 }
    );
  }

  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") ?? "100", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  let sql = "SELECT * FROM alerts WHERE 1=1";
  const params: unknown[] = [];
  let paramIdx = 1;

  if (from) {
    sql += ` AND timestamp >= $${paramIdx++}`;
    params.push(from);
  }
  if (to) {
    sql += ` AND timestamp <= $${paramIdx++}`;
    params.push(to);
  }
  if (category) {
    sql += ` AND threat_category = $${paramIdx++}`;
    params.push(category);
  }

  sql += ` ORDER BY timestamp DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
  params.push(limit, offset);

  const result = await query(sql, params);

  return NextResponse.json({
    alerts: result?.rows ?? [],
    count: result?.rowCount ?? 0,
  });
}
