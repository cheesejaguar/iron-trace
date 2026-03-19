import { NextRequest, NextResponse } from "next/server";
import { query, isDatabaseAvailable } from "@/lib/db/client";

/**
 * GET /api/trajectories
 * Returns persisted trajectory estimates.
 * Supports date range and confidence threshold filter.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const minConfidence = parseFloat(
    searchParams.get("minConfidence") ?? "0"
  );
  const origin = searchParams.get("origin");
  const limit = parseInt(searchParams.get("limit") ?? "100", 10);

  let sql = "SELECT t.*, e.classification, e.munition_type FROM trajectories t JOIN engagements e ON t.engagement_id = e.id WHERE 1=1";
  const params: unknown[] = [];
  let paramIdx = 1;

  if (from) {
    sql += ` AND t.created_at >= $${paramIdx++}`;
    params.push(from);
  }
  if (to) {
    sql += ` AND t.created_at <= $${paramIdx++}`;
    params.push(to);
  }
  if (minConfidence > 0) {
    sql += ` AND t.confidence_score >= $${paramIdx++}`;
    params.push(minConfidence);
  }
  if (origin) {
    sql += ` AND t.estimated_origin_region = $${paramIdx++}`;
    params.push(origin);
  }

  sql += ` ORDER BY t.created_at DESC LIMIT $${paramIdx++}`;
  params.push(limit);

  const result = await query(sql, params);

  return NextResponse.json({
    trajectories: result?.rows ?? [],
    count: result?.rowCount ?? 0,
  });
}

/**
 * POST /api/trajectories
 * Persists a new trajectory estimate from client-side analysis.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      id,
      engagement_id,
      back_azimuth,
      arc_geojson,
      uncertainty_cone,
      confidence_score,
      estimated_origin_region,
      distance_km,
      munition_class,
      matched_munition,
    } = body;

    const sql = `
      INSERT INTO trajectories (
        id, engagement_id, back_azimuth, arc_geojson, uncertainty_cone,
        confidence_score, estimated_origin_region, distance_km,
        munition_class, matched_munition
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        back_azimuth = EXCLUDED.back_azimuth,
        arc_geojson = EXCLUDED.arc_geojson,
        confidence_score = EXCLUDED.confidence_score,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await query(sql, [
      id,
      engagement_id,
      back_azimuth,
      JSON.stringify(arc_geojson),
      JSON.stringify(uncertainty_cone),
      confidence_score,
      estimated_origin_region,
      distance_km,
      munition_class,
      matched_munition,
    ]);

    return NextResponse.json({
      trajectory: result?.rows[0] ?? null,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
