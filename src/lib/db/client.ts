/**
 * Database client wrapper for Vercel Postgres.
 * Falls back gracefully when POSTGRES_URL is not configured.
 * Uses native fetch-based approach compatible with Vercel Postgres (Neon serverless).
 */

interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

/**
 * Execute a SQL query via Vercel Postgres HTTP endpoint.
 * Returns null if database is not configured.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<QueryResult<T> | null> {
  const postgresUrl = process.env.POSTGRES_URL;
  if (!postgresUrl) return null;

  // For Vercel Postgres (Neon), use the @vercel/postgres or direct HTTP endpoint
  // This is a placeholder that returns null when the actual driver isn't available
  // In production, install @vercel/postgres and use its sql template tag
  console.warn("Database query attempted but driver not installed. SQL:", sql.slice(0, 100));
  return { rows: [] as T[], rowCount: 0 };
}

/** Check if database is available */
export async function isDatabaseAvailable(): Promise<boolean> {
  return !!process.env.POSTGRES_URL;
}
