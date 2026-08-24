import bcrypt from "bcryptjs";
import { loadEnvConfig } from "@next/env";
import { and, eq } from "drizzle-orm";
import { getDb } from "../src/db";
import { adminUsers, assets, categories, collections, products, productVariants, storeSettings } from "../src/db/schema";
import { DEFAULT_SETTINGS } from "../src/lib/constants";

loadEnvConfig(process.cwd());

const categoryNames = ["Rings", "Earrings", "Necklaces", "Bracelets", "Bangles", "Pendants", "Bridal Jewelry"];
const collectionNames = ["Signature Collection", "Bridal Heirlooms", "Everyday Radiance"];

const seedProducts = [
  ["Noor Solitaire Ring", "HJ-RNG-001", "Rings", "Signature Collection", 4500, 3990, "/images/noor-ring.webp", true, true],
  ["Meher Pearl Earrings", "HJ-EAR-002", "Earrings", "Everyday Radiance", 3500, null, "/images/meher-earrings.webp", true, true],
  ["Zahra Tennis Bracelet", "HJ-BRC-003", "Bracelets", "Signature Collection", 7200, 6500, "/images/hero-jewelry.webp", true, false],
  ["Aira Celestial Pendant", "HJ-PND-004", "Pendants", "Everyday Radiance", 3200, null, "/images/hero-jewelry.webp", false, true],
  ["Mahnoor Bridal Necklace", "HJ-BRD-005", "Bridal Jewelry", "Bridal Heirlooms", 28500, 25900, "/images/bridal-collection.webp", true, false],
  ["Saira Drop Earrings", "HJ-EAR-006", "Earrings", "Signature Collection", 5200, null, "/images/meher-earrings.webp", false, true],
  ["Amara Gold Bangle", "HJ-BNG-007", "Bangles", "Signature Collection", 6800, 6200, "/images/hero-jewelry.webp", true, false],
  ["Haya Crystal Necklace", "HJ-NCK-008", "Necklaces", "Everyday Radiance", 8900, null, "/images/hero-jewelry.webp", false, false],
  ["Rania Halo Ring", "HJ-RNG-009", "Rings", "Signature Collection", 5900, 5400, "/images/noor-ring.webp", true, false],
  ["Inaya Pearl Pendant", "HJ-PND-010", "Pendants", "Everyday Radiance", 4100, null, "/images/meher-earrings.webp", false, true],
  ["Zoya Bridal Jhumka", "HJ-BRD-011", "Bridal Jewelry", "Bridal Heirlooms", 12500, 11900, "/images/bridal-collection.webp", true, false],
  ["Elaf Pavé Bracelet", "HJ-BRC-012", "Bracelets", "Signature Collection", 7600, null, "/images/hero-jewelry.webp", false, true]
] as const;

async function seed() {
  const db = getDb();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12) throw new Error("Set ADMIN_PASSWORD to at least 12 characters before seeding");

  await db.insert(adminUsers).values({
    email: (process.env.ADMIN_EMAIL ?? "admin@hassanjewels.com").toLowerCase(),
    name: process.env.ADMIN_NAME ?? "Hassan Jewels Admin",
    passwordHash: await bcrypt.hash(password, 12)
  }).onConflictDoNothing();

  const categoryMap = new Map<string, string>();
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const [record] = await db.insert(categories).values({ name, slug, featured: true }).onConflictDoUpdate({ target: categories.slug, set: { name } }).returning();
    categoryMap.set(name, record.id);
  }
  const collectionMap = new Map<string, string>();
  for (const name of collectionNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const [record] = await db.insert(collections).values({ name, slug, featured: true }).onConflictDoUpdate({ target: collections.slug, set: { name } }).returning();
    collectionMap.set(name, record.id);
  }

  for (const [name, sku, category, collection, price, salePrice, imageUrl, featured, newArrival] of seedProducts) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const [product] = await db.insert(products).values({
      name, sku, slug,
      shortDescription: "A refined Hassan Jewels piece designed for celebrations and everyday radiance.",
      description: `${name} brings together graceful proportion, hand-finished detail and a luminous finish. Presented in our signature packaging and made to become part of your story.`,
      categoryId: categoryMap.get(category), collectionId: collectionMap.get(collection),
      price, salePrice, costPrice: Math.round(price * 0.55), stock: 12,
      material: "Premium gold-plated alloy", weight: "Lightweight", status: "PUBLISHED",
      featured, newArrival, bestseller: featured && !newArrival, limited: category === "Bridal Jewelry",
      seoTitle: `${name} | Hassan Jewels`, seoDescription: `Shop ${name} at Hassan Jewels with delivery across Pakistan.`
    }).onConflictDoUpdate({ target: products.sku, set: { name, price, salePrice, stock: 12, status: "PUBLISHED", updatedAt: new Date() } }).returning();

    await db.delete(assets).where(and(eq(assets.ownerType, "PRODUCT"), eq(assets.ownerId, product.id)));
    await db.insert(assets).values({ ownerType: "PRODUCT", ownerId: product.id, storageKey: `static${imageUrl}`, url: imageUrl, mimeType: "image/webp", size: 0, alt: name, primary: true });

    if (category === "Rings") {
      for (const size of ["14", "15", "16", "17", "18", "19", "20"]) {
        await db.insert(productVariants).values({ productId: product.id, sku: `${sku}-${size}`, size, color: "Gold", stock: 4 }).onConflictDoUpdate({ target: productVariants.sku, set: { stock: 4, updatedAt: new Date() } });
      }
    }
  }

  await db.insert(storeSettings).values({ id: "main", data: DEFAULT_SETTINGS }).onConflictDoNothing();
  console.log(`Seeded ${seedProducts.length} products and admin ${process.env.ADMIN_EMAIL ?? "admin@hassanjewels.com"}`);
}

seed().catch((error) => { console.error(error); process.exit(1); });
