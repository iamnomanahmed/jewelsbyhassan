import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getDatabaseConfiguration } from "@/lib/env";

const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

function createClient() {
  const config = getDatabaseConfiguration();
  const connectTimeout = process.env.NEXT_PHASE === "phase-production-build" ? 3 : 15;
  return postgres(config.url, { prepare: false, max: config.max, idle_timeout: 20, connect_timeout: connectTimeout, max_lifetime: 60 * 30, ssl: config.isNeon ? "require" : undefined });
}

export function getSqlClient() {
  if (!globalForDb.sql) globalForDb.sql = createClient();
  return globalForDb.sql;
}

export function getDb() {
  return drizzle(getSqlClient(), { schema });
}
