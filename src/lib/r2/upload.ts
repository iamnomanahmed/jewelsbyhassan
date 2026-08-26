import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { getR2Bucket, getR2Client } from "./client";
import { getR2ObjectUrl } from "./url";

const INPUT_FORMATS: Record<string, "jpeg" | "png" | "webp"> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp"
};

const PROFILES = {
  branding: { maxDimension: 1600, quality: 88 },
  products: { maxDimension: 2400, quality: 86 },
  categories: { maxDimension: 2200, quality: 84 },
  collections: { maxDimension: 2200, quality: 84 },
  payments: { maxDimension: 2000, quality: 80 },
  reviews: { maxDimension: 1600, quality: 82 }
};

export async function uploadToR2(file: File, folder: "branding" | "products" | "categories" | "collections" | "payments" | "reviews", owner = "upload") {
  const expectedFormat = INPUT_FORMATS[file.type];
  if (!expectedFormat) throw new Error("Only JPG, PNG and WEBP images are allowed");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image must be smaller than 8 MB");
  const input = Buffer.from(await file.arrayBuffer());
  const image = sharp(input, { failOn: "error", limitInputPixels: 40_000_000 });
  const metadata = await image.metadata();
  if (metadata.format !== expectedFormat) throw new Error("The uploaded file does not match its image format");
  if ((metadata.pages ?? 1) > 1) throw new Error("Animated images are not supported");
  if (!metadata.width || !metadata.height) throw new Error("The uploaded image dimensions could not be read");

  const profile = PROFILES[folder];
  const optimized = await image
    .rotate()
    .resize({ width: profile.maxDimension, height: profile.maxDimension, fit: "inside", withoutEnlargement: true })
    .webp({ quality: profile.quality, alphaQuality: 90, effort: 5, smartSubsample: true })
    .toBuffer();
  const cleanOwner = owner.replace(/[^a-zA-Z0-9_-]/g, "-");
  const storageKey = `${folder}/${cleanOwner}/${randomUUID()}.webp`;
  const isPrivate = folder === "payments";
  await getR2Client().send(new PutObjectCommand({
    Bucket: getR2Bucket(isPrivate ? "private" : "public"),
    Key: storageKey,
    Body: optimized,
    ContentType: "image/webp",
    CacheControl: folder === "payments" ? "private, no-store" : "public, max-age=31536000, immutable"
  }));
  return { storageKey, url: await getR2ObjectUrl(storageKey, 60 * 60), mimeType: "image/webp", size: optimized.byteLength };
}
