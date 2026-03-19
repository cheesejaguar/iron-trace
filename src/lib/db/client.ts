/**
 * Database client wrapper for Vercel Postgres.
 * Falls back gracefully when POSTGRES_URL is not configured.
 */

interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

let pgPool: unknown = null;

async function getPool() {
  if (pgPool) return pgPool;

  const postgresUrl = process.env.POSTGRES_URL;
  if (!postgresUrl) {
    return null;
  }

  try {
    // Dynamic import to avoid bundling pg when not needed
    const { Pool } = await import("pg" as string);
    pgPool = new Pool({ connectionString: postgresUrl });
    return pgPool;
  } catch {
    console.warn("PostgreSQL client not available, persistence disabled");
    return null;
  }
}

/**
 * Execute a SQL query. Returns null if database is not configured.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<QueryResult<T> | null> {
  const pool = await getPool();
  if (!pool) return null;

  try {
    const result = await (pool as { query: (sql: string, params?: unknown[]) => Promise<QueryResult<T>> }).query(sql, params);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/** Check if database is available */
export async function isDatabaseAvailable(): Promise<boolean> {
  const pool = await getPool();
  return pool !== null;
}
