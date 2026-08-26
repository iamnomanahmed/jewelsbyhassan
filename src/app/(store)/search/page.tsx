import { Search } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { getCatalog } from "@/lib/catalog";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  let products: Awaited<ReturnType<typeof getCatalog>> = []; try { if (q) products = await getCatalog({ search: q, limit: 24 }); } catch {}
  return <section className="section-pad min-h-[70vh] bg-ivory"><div className="site-container"><p className="eyebrow">Find a piece</p><h1 className="display-heading mt-2 text-6xl md:text-8xl">Search</h1><form className="relative my-10 max-w-2xl"><Search className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-stone-400"/><label htmlFor="site-search" className="sr-only">Search Hassan Jewels</label><input id="site-search" name="q" defaultValue={q} autoFocus placeholder="Rings, pearls, bridal…" className="min-h-16 w-full rounded-full border border-emerald-deep/15 bg-white pl-14 pr-32 text-lg outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"/><button className="absolute right-2 top-2 min-h-12 cursor-pointer rounded-full bg-emerald-deep px-7 text-sm font-semibold text-white">Search</button></form>{q ? <><p className="mb-7 text-sm text-stone-500">{products.length} result{products.length === 1 ? "" : "s"} for “{q}”</p><ProductGrid products={products}/></> : <p className="text-stone-500">Enter a product, category or material to begin.</p>}</div></section>;
}
