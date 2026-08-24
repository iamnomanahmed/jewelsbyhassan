import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { getR2Bucket, getR2Client } from "./client";
import { getR2ObjectUrl } from "./url";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export async function uploadToR2(file: File, folder: "branding" | "products" | "categories" | "collections" | "payments" | "reviews", owner = "upload") {
  const extension = MIME_EXTENSIONS[file.type];
  if (!extension) throw new Error("Only JPG, PNG and WEBP images are allowed");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image must be smaller than 8 MB");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isWebp = new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  if ((file.type === "image/jpeg" && !isJpeg) || (file.type === "image/png" && !isPng) || (file.type === "image/webp" && !isWebp)) throw new Error("The uploaded file does not match its image format");
  const cleanOwner = owner.replace(/[^a-zA-Z0-9_-]/g, "-");
  const storageKey = `${folder}/${cleanOwner}/${randomUUID()}.${extension}`;
  const isPrivate = folder === "payments";
  await getR2Client().send(new PutObjectCommand({
    Bucket: getR2Bucket(isPrivate ? "private" : "public"),
    Key: storageKey,
    Body: bytes,
    ContentType: file.type,
    CacheControl: folder === "payments" ? "private, no-store" : "public, max-age=31536000, immutable"
  }));
  return { storageKey, url: await getR2ObjectUrl(storageKey, 60 * 60), mimeType: file.type, size: file.size };
}
