import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getR2BucketForKey, getR2Client } from "./client";

export async function deleteFromR2(storageKey: string) {
  if (!storageKey || storageKey.startsWith("static/")) return { skipped: true };
  await getR2Client().send(new DeleteObjectCommand({ Bucket: getR2BucketForKey(storageKey), Key: storageKey }));
  return { skipped: false };
}
