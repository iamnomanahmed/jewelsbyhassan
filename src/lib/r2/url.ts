import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Configuration } from "@/lib/env";
import { getR2BucketForKey, getR2Client } from "./client";

export function getR2PublicUrl(storageKey: string) {
  if (storageKey.startsWith("payments/")) throw new Error("Private payment proofs cannot use a public URL");
  return `${getR2Configuration().publicUrl}/${storageKey}`;
}

export async function getR2ObjectUrl(storageKey: string, expiresIn = 15 * 60) {
  if (!storageKey.startsWith("payments/")) return getR2PublicUrl(storageKey);
  return getSignedUrl(getR2Client(), new GetObjectCommand({ Bucket: getR2BucketForKey(storageKey), Key: storageKey }), { expiresIn });
}
