import type { CatalogProduct } from "@/lib/catalog";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  if (!products.length) return <div className="rounded-2xl border border-emerald-deep/10 bg-white p-10 text-center"><h2 className="font-display text-3xl">No pieces found</h2><p className="mt-2 text-sm text-stone-500">Try adjusting your filters or explore the complete collection.</p></div>;
  return <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-14">{products.map((product) => <ProductCard product={product} key={product.id} />)}</div>;
}

