import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";

loadEnvConfig(process.cwd());

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required");

  const started = performance.now();
  const sql = neon(url);
  const [result] = await sql`select 1 as ok`;
  if (Number(result?.ok) !== 1) throw new Error("Neon returned an unexpected result");

  console.log(`PASS  Neon direct connection: SELECT 1 (${Math.round(performance.now() - started)} ms)`);
}

main().catch((error) => {
  console.error(`FAIL  Neon direct connection: ${error instanceof Error ? error.message : "connection failed"}`);
  process.exitCode = 1;
});
