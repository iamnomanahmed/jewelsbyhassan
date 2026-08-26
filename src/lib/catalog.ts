import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, asc, desc, eq, gte, ilike, inArray, lte, ne, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { assets, categories, collections, products, productVariants, reviews } from "@/db/schema";
import { CACHE_TAGS } from "./cache-invalidation";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  categoryId: string | null;
  newArrival: boolean;
  bestseller: boolean;
  limited: boolean;
  updatedAt: Date;
  imageUrl: string | null;
  imageAlt: string | null;
  categoryName: string | null;
};

export type CatalogOptions = {
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
  page?: number;
};

const cardSelection = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  sku: products.sku,
  price: products.price,
  salePrice: products.salePrice,
  stock: products.stock,
  categoryId: products.categoryId,
  newArrival: products.newArrival,
  bestseller: products.bestseller,
  limited: products.limited,
  updatedAt: products.updatedAt,
  imageUrl: assets.url,
  imageAlt: assets.alt,
  categoryName: categories.name
};

function catalogConditions(options: CatalogOptions) {
  const conditions = [eq(products.status, "PUBLISHED")];
  const search = options.search?.trim().slice(0, 100);
  if (search) conditions.push(or(ilike(products.name, `%${search}%`), ilike(products.sku, `%${search}%`), ilike(products.description, `%${search}%`))!);
  if (options.category) conditions.push(eq(categories.slug, options.category));
  if (options.collection) conditions.push(eq(collections.slug, options.collection));
  if (Number.isFinite(options.minPrice)) conditions.push(gte(products.price, options.minPrice!));
  if (Number.isFinite(options.maxPrice)) conditions.push(lte(products.price, options.maxPrice!));
  if (options.availability) conditions.push(gte(products.stock, 1));
  if (options.featured) conditions.push(eq(products.featured, true));
  if (options.newArrival) conditions.push(eq(products.newArrival, true));
  if (options.bestseller) conditions.push(eq(products.bestseller, true));
  return conditions;
}

function catalogOrder(options: CatalogOptions) {
  return options.sort === "price-asc" ? asc(products.price)
    : options.sort === "price-desc" ? desc(products.price)
      : options.sort === "newest" ? desc(products.createdAt)
        : desc(products.featured);
}

async function queryCatalog(options: CatalogOptions = {}): Promise<CatalogProduct[]> {
  const limit = Math.min(Math.max(options.limit ?? 24, 1), 120);
  const page = Math.max(options.page ?? 1, 1);
  return getDb().select(cardSelection).from(products)
    .leftJoin(assets, and(eq(assets.ownerType, "PRODUCT"), eq(assets.ownerId, products.id), eq(assets.primary, true)))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(collections, eq(collections.id, products.collectionId))
    .where(and(...catalogConditions(options)))
    .orderBy(catalogOrder(options), desc(products.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);
}

async function queryCatalogCount(options: CatalogOptions = {}) {
  const [row] = await getDb().select({ total: sql<number>`count(*)::int` }).from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(collections, eq(collections.id, products.collectionId))
    .where(and(...catalogConditions(options)));
  return row?.total ?? 0;
}

const cachedCatalog = unstable_cache(queryCatalog, ["catalog-v2"], { tags: [CACHE_TAGS.catalog], revalidate: 60 * 15 });
const cachedCatalogCount = unstable_cache(queryCatalogCount, ["catalog-count-v2"], { tags: [CACHE_TAGS.catalog], revalidate: 60 * 15 });

export function getCatalog(options: CatalogOptions = {}) {
  return cachedCatalog(options);
}

export async function getCatalogPage(options: CatalogOptions = {}) {
  const limit = Math.min(Math.max(options.limit ?? 24, 1), 48);
  const page = Math.max(options.page ?? 1, 1);
  const normalized = { ...options, limit, page };
  const [items, total] = await Promise.all([cachedCatalog(normalized), cachedCatalogCount(normalized)]);
  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / limit)), pageSize: limit };
}

async function queryProductBySlug(slug: string) {
  const [row] = await getDb().select({
    product: products,
    imageUrl: assets.url,
    imageAlt: assets.alt,
    categoryName: categories.name,
    collectionName: collections.name
  }).from(products)
    .leftJoin(assets, and(eq(assets.ownerType, "PRODUCT"), eq(assets.ownerId, products.id), eq(assets.primary, true)))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(collections, eq(collections.id, products.collectionId))
    .where(and(eq(products.slug, slug), eq(products.status, "PUBLISHED")))
    .limit(1);
  if (!row) return null;

  const [variants, images] = await Promise.all([
    getDb().select({
      id: productVariants.id,
      sku: productVariants.sku,
      size: productVariants.size,
      color: productVariants.color,
      price: productVariants.price,
      salePrice: productVariants.salePrice,
      stock: productVariants.stock,
      imageUrl: productVariants.imageUrl
    }).from(productVariants).where(eq(productVariants.productId, row.product.id)).orderBy(asc(productVariants.size), asc(productVariants.color)),
    getDb().select({ id: assets.id, url: assets.url, alt: assets.alt, primary: assets.primary, sortOrder: assets.sortOrder })
      .from(assets).where(and(eq(assets.ownerType, "PRODUCT"), eq(assets.ownerId, row.product.id))).orderBy(desc(assets.primary), asc(assets.sortOrder))
  ]);
  return { ...row.product, imageUrl: row.imageUrl, imageAlt: row.imageAlt, categoryName: row.categoryName, collectionName: row.collectionName, variants, images };
}

const cachedProductBySlug = unstable_cache(queryProductBySlug, ["product-by-slug-v2"], { tags: [CACHE_TAGS.catalog], revalidate: 60 * 5 });
export const getProductBySlug = cache((slug: string) => cachedProductBySlug(slug));

const queryCategories = () => getDb().select().from(categories).orderBy(asc(categories.name));
const queryCollections = () => getDb().select().from(collections).orderBy(asc(collections.name));
const cachedCategories = unstable_cache(queryCategories, ["categories-v1"], { tags: [CACHE_TAGS.taxonomy], revalidate: 60 * 60 });
const cachedCollections = unstable_cache(queryCollections, ["collections-v1"], { tags: [CACHE_TAGS.taxonomy], revalidate: 60 * 60 });

export function getCategories() {
  return cachedCategories();
}

export function getCollections() {
  return cachedCollections();
}

const cachedCategoryBySlug = unstable_cache(async (slug: string) => {
  const [row] = await getDb().select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ?? null;
}, ["category-by-slug-v1"], { tags: [CACHE_TAGS.taxonomy], revalidate: 60 * 60 });

const cachedCollectionBySlug = unstable_cache(async (slug: string) => {
  const [row] = await getDb().select().from(collections).where(eq(collections.slug, slug)).limit(1);
  return row ?? null;
}, ["collection-by-slug-v1"], { tags: [CACHE_TAGS.taxonomy], revalidate: 60 * 60 });

export const getCategoryBySlug = cache((slug: string) => cachedCategoryBySlug(slug));
export const getCollectionBySlug = cache((slug: string) => cachedCollectionBySlug(slug));

const cachedApprovedReviews = unstable_cache(async (limit: number) => getDb().select({
  id: reviews.id,
  rating: reviews.rating,
  displayName: reviews.displayName,
  title: reviews.title,
  body: reviews.body,
  imageUrl: reviews.imageUrl,
  featured: reviews.featured,
  createdAt: reviews.createdAt
}).from(reviews).where(eq(reviews.status, "APPROVED")).orderBy(desc(reviews.featured), desc(reviews.createdAt)).limit(limit), ["approved-reviews-v1"], { tags: [CACHE_TAGS.reviews], revalidate: 60 * 30 });

export function getApprovedReviews(limit = 8) {
  return cachedApprovedReviews(Math.min(Math.max(limit, 1), 24));
}

const cachedRelatedProducts = unstable_cache(async (categoryId: string, currentId: string) => getDb().select(cardSelection).from(products)
  .leftJoin(assets, and(eq(assets.ownerType, "PRODUCT"), eq(assets.ownerId, products.id), eq(assets.primary, true)))
  .leftJoin(categories, eq(categories.id, products.categoryId))
  .where(and(eq(products.status, "PUBLISHED"), eq(products.categoryId, categoryId), ne(products.id, currentId)))
  .orderBy(desc(products.featured), desc(products.createdAt)).limit(4), ["related-products-v2"], { tags: [CACHE_TAGS.catalog], revalidate: 60 * 15 });

export function getRelatedProducts(categoryId: string | null, currentId: string) {
  return categoryId ? cachedRelatedProducts(categoryId, currentId) : Promise.resolve([]);
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  return getDb().select().from(products).where(and(inArray(products.id, ids), eq(products.status, "PUBLISHED")));
}

const cachedSitemapProducts = unstable_cache(async () => getDb().select({ slug: products.slug, updatedAt: products.updatedAt })
  .from(products).where(eq(products.status, "PUBLISHED")).orderBy(asc(products.slug)), ["sitemap-products-v1"], { tags: [CACHE_TAGS.catalog], revalidate: 60 * 60 });

export function getPublishedProductSitemapEntries() {
  return cachedSitemapProducts();
}

export async function getCatalogCounts() {
  return cachedCatalogCount({});
}
