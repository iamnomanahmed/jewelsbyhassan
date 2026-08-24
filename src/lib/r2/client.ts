import { S3Client } from "@aws-sdk/client-s3";
import { getR2Configuration } from "@/lib/env";

const globalForR2 = globalThis as unknown as { r2?: S3Client };

export function getR2Client() {
  if (!globalForR2.r2) {
    const config = getR2Configuration();
    globalForR2.r2 = new S3Client({ region: "auto", endpoint: config.endpoint, credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey }, maxAttempts: 3 });
  }
  return globalForR2.r2;
}

export function getR2Bucket(scope: "public" | "private" = "public") {
  const config = getR2Configuration();
  return scope === "private" ? config.privateBucket : config.publicBucket;
}

export function getR2BucketForKey(storageKey: string) {
  return getR2Bucket(storageKey.startsWith("payments/") ? "private" : "public");
}
