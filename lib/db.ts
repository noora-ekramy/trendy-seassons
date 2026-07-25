import { Pool, type QueryResultRow } from "pg";

const connectionString = process.env.DATABASE_URL ?? "";

export const isDatabaseConfigured = () =>
  !!connectionString && connectionString.startsWith("postgres");

declare global {
  // eslint-disable-next-line no-var
  var __trendyPgPool: Pool | undefined;
}

function getPool(): Pool | null {
  if (!isDatabaseConfigured()) return null;
  if (!global.__trendyPgPool) {
    global.__trendyPgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  return global.__trendyPgPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL is not configured");
  return pool.query<T>(text, params);
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] ?? null;
}

export async function queryAll<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}
