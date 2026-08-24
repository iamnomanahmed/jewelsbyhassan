import "server-only";
import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { getSqlClient } from "@/db";
import { getR2Configuration, inspectProductionConfiguration, type ConfigurationCheck } from "@/lib/env";
import { getR2Client } from "@/lib/r2/client";

export type LiveCheck = {
  id: "database-live" | "r2-public-live" | "r2-private-live";
  label: string;
  ok: boolean;
  detail: string;
  latencyMs?: number;
};

async function timed<T>(operation: () => Promise<T>, timeoutMs = 6_000) {
  const started = performance.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const value = await Promise.race([
      operation(),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Connection timed out")), timeoutMs); })
    ]);
    return { value, latencyMs: Math.round(performance.now() - started) };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function failure(id: LiveCheck["id"], label: string, error: unknown): LiveCheck {
  return { id, label, ok: false, detail: error instanceof Error ? error.message : "Connection failed" };
}

async function checkDatabase(): Promise<LiveCheck> {
  try {
    const { latencyMs } = await timed(() => getSqlClient().unsafe("select 1 as ok"));
    return { id: "database-live", label: "Neon connectivity", ok: true, detail: "Query completed", latencyMs };
  } catch (error) {
    return failure("database-live", "Neon connectivity", error);
  }
}

async function checkBucket(scope: "public" | "private"): Promise<LiveCheck> {
  const id = scope === "public" ? "r2-public-live" : "r2-private-live";
  const label = scope === "public" ? "Public R2 bucket" : "Private payment bucket";
  try {
    const config = getR2Configuration();
    const bucket = scope === "public" ? config.publicBucket : config.privateBucket;
    const { latencyMs } = await timed(() => getR2Client().send(new HeadBucketCommand({ Bucket: bucket })));
    return { id, label, ok: true, detail: `${bucket} is reachable`, latencyMs };
  } catch (error) {
    return failure(id, label, error);
  }
}

export async function getSystemStatus(): Promise<{ configuration: ConfigurationCheck[]; live: LiveCheck[] }> {
  const configuration = inspectProductionConfiguration();
  const live = await Promise.all([checkDatabase(), checkBucket("public"), checkBucket("private")]);
  return { configuration, live };
}
