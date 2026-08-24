import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { assets, categories, collections, products, productVariants, reviews } from "@/db/schema";

export type CatalogProduct = typeof products.$inferSelect & {
  imageUrl: string | null;
  imageAlt: string | null;
  categoryName: string | null;
  collectionName: string | null;
};

type CatalogOptions = {
  search?: string;
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: boolean;
  sort?: "featured" | "newest" | "price-asc" | "price-desc";
  featured?: boolean;
  newArrival?: boolean;
  bestseller?: boolean;
  limit?: number;
};

export async function getCatalog(options: CatalogOptions = {}): Promise<CatalogProduct[]> {
  const db = getDb();
  const conditions = [eq(products.status, "PUBLISHED")];
  if (options.search) conditions.push(or(ilike(products.name, `%${options.search}%`), ilike(products.description, `%${options.search}%`))!);
  if (options.category) conditions.push(eq(categories.slug, options.category));
  if (options.collection) conditions.push(eq(collections.slug, options.collection));
  if (Number.isFinite(options.minPrice)) conditions.push(gte(products.price, options.minPrice!));
  if (Number.isFinite(options.maxPrice)) conditions.push(lte(products.price, options.maxPrice!));
  if (options.availability) conditions.push(gte(products.stock, 1));
  if (options.featured) conditions.push(eq(products.featured, true));
  if (options.newArrival) conditions.push(eq(products.newArrival, true));
  if (options.bestseller) conditions.push(eq(products.bestseller, true));

  const order = options.sort === "price-asc" ? asc(products.price)
    : options.sort === "price-desc" ? desc(products.price)
      : options.sort === "newest" ? desc(products.createdAt)
        : desc(products.featured);

  return db.select({
    id: products.id, name: products.name, slug: products.slug, sku: products.sku,
    shortDescription: products.shortDescription, description: products.description,
    categoryId: products.categoryId, collectionId: products.collectionId,
    price: products.price, salePrice: products.salePrice, costPrice: products.costPrice,
    stock: products.stock, material: products.material, weight: products.weight,
    status: products.status, featured: products.featured, newArrival: products.newArrival,
    bestseller: products.bestseller, limited: products.limited,
    seoTitle: products.seoTitle, seoDescription: products.seoDescription,
    archivedAt: products.archivedAt, createdAt: products.createdAt, updatedAt: products.updatedAt,
    imageUrl: assets.url, imageAlt: assets.alt,
    categoryName: categories.name, collectionName: collections.name
  }).from(products)
    .leftJoin(assets, and(eq(assets.ownerType, "PRODUCT"), eq(assets.ownerId, products.id), eq(assets.primary, true)))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(collections, eq(collections.id, products.collectionId))
    .where(and(...conditions))
    .orderBy(order, desc(products.createdAt))
    .limit(options.limit ?? 120);
}

export async function getProductBySlug(slug: string) {
  const [product] = await getCatalog({ limit: 120 }).then((items) => items.filter((item) => item.slug === slug));
  if (!product) return null;
  const db = getDb();
  const [variants, images] = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, product.id)).orderBy(asc(productVariants.size), asc(productVariants.color)),
    db.select().from(assets).where(and(eq(assets.ownerType, "PRODUCT"), eq(assets.ownerId, product.id))).orderBy(desc(assets.primary), asc(assets.sortOrder))
  ]);
  return { ...product, variants, images };
}

export async function getCategories() {
  return getDb().select().from(categories).orderBy(asc(categories.name));
}

export async function getCollections() {
  return getDb().select().from(collections).orderBy(asc(collections.name));
}

export async function getApprovedReviews(limit = 8) {
  return getDb().select().from(reviews).where(eq(reviews.status, "APPROVED")).orderBy(desc(reviews.featured), desc(reviews.createdAt)).limit(limit);
}

export async function getRelatedProducts(categoryId: string | null, currentId: string) {
  if (!categoryId) return [];
  const rows = await getCatalog({ limit: 24 });
  return rows.filter((item) => item.categoryId === categoryId && item.id !== currentId).slice(0, 4);
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  return getDb().select().from(products).where(and(inArray(products.id, ids), eq(products.status, "PUBLISHED")));
}

export async function getCatalogCounts() {
  const [row] = await getDb().select({ total: sql<number>`count(*)::int` }).from(products).where(eq(products.status, "PUBLISHED"));
  return row?.total ?? 0;
}
