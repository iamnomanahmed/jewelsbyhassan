import type { Metadata } from "next";
import { CatalogFilters } from "@/components/catalog-filters";
import { CatalogPagination } from "@/components/catalog-pagination";
import { ProductGrid } from "@/components/product-grid";
import { getCatalogPage, getCategories, getCollections } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop Jewelry", description: "Shop premium rings, earrings, necklaces, bracelets and bridal jewelry." };
type Params = Promise<Record<string, string | string[] | undefined>>;
export default async function ShopPage({ searchParams }: { searchParams: Params }) {
  const raw = await searchParams;
  const values = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])) as Record<string, string | undefined>;
  let catalog: Awaited<ReturnType<typeof getCatalogPage>> = { items: [], total: 0, page: 1, pageCount: 1, pageSize: 24 };
  let categoryRows: Awaited<ReturnType<typeof getCategories>> = [];
  let collectionRows: Awaited<ReturnType<typeof getCollections>> = [];
  try {
    [catalog, categoryRows, collectionRows] = await Promise.all([
      getCatalogPage({ search: values.q, category: values.category, collection: values.collection, minPrice: values.min ? Number(values.min.replace(/\D/g, "")) : undefined, maxPrice: values.max ? Number(values.max.replace(/\D/g, "")) : undefined, availability: values.available === "1", sort: (values.sort as "featured" | "newest" | "price-asc" | "price-desc") ?? "featured", page: Math.max(Number(values.page) || 1, 1), limit: 24 }),
      getCategories(), getCollections()
    ]);
  } catch { /* empty setup state */ }
  return <><section className="bg-emerald-deep px-5 py-16 text-center text-ivory md:py-24"><p className="text-xs font-bold uppercase tracking-[.22em] text-gold-light">The complete edit</p><h1 className="display-heading mt-3 text-6xl md:text-8xl">Discover your piece.</h1><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-ivory/65">Modern heirlooms for ordinary days, remarkable celebrations and every moment between.</p></section><section className="section-pad bg-ivory"><div className="site-container"><CatalogFilters values={values} categories={categoryRows} collections={collectionRows} /><p className="my-7 text-xs font-semibold uppercase tracking-[.12em] text-stone-500">{catalog.total} pieces</p><ProductGrid products={catalog.items} /><CatalogPagination pathname="/shop" values={values} page={catalog.page} pageCount={catalog.pageCount}/></div></section></>;
}
