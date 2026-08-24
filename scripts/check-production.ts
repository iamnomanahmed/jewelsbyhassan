import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { loadEnvConfig } from "@next/env";
import { getSqlClient } from "../src/db";
import { getR2Configuration, inspectProductionConfiguration } from "../src/lib/env";
import { getR2Client } from "../src/lib/r2/client";

loadEnvConfig(process.cwd());

async function main() {
  const checks = inspectProductionConfiguration();
  for (const check of checks) console.log(`${check.configured ? "PASS" : "FAIL"}  ${check.label}: ${check.detail}`);
  let failed = checks.some((check) => !check.configured);

  let sql: ReturnType<typeof getSqlClient> | null = null;
  try {
    sql = getSqlClient();
    try {
      const started = performance.now();
      await sql.unsafe("select 1 as ok");
      console.log(`PASS  Neon connectivity: ${Math.round(performance.now() - started)} ms`);
    } catch (error) {
      failed = true;
      console.error(`FAIL  Neon connectivity: ${error instanceof Error ? error.message : "connection failed"}`);
    }

    try {
      const r2 = getR2Configuration();
      for (const [label, bucket] of [["R2 public assets", r2.publicBucket], ["R2 private payments", r2.privateBucket]] as const) {
        try {
          const bucketStarted = performance.now();
          await getR2Client().send(new HeadBucketCommand({ Bucket: bucket }));
          console.log(`PASS  ${label}: ${bucket} (${Math.round(performance.now() - bucketStarted)} ms)`);
        } catch (error) {
          failed = true;
          console.error(`FAIL  ${label}: ${error instanceof Error ? error.message : "connection failed"}`);
        }
      }
    } catch {
      console.log("SKIP  R2 live checks: credentials or buckets are not fully configured");
    }
  } finally {
    if (sql) await sql.end({ timeout: 5 });
  }
  if (failed) throw new Error("Production readiness checks failed");
}

main().catch((error) => {
  console.error(`FAIL  ${error instanceof Error ? error.message : "Production check failed"}`);
  process.exitCode = 1;
});
