import { Search } from "lucide-react";
import type { categories, collections } from "@/db/schema";

type Category = typeof categories.$inferSelect;
type Collection = typeof collections.$inferSelect;

export function CatalogFilters({ values, categories, collections }: { values: Record<string, string | undefined>; categories: Category[]; collections: Collection[] }) {
  return <form action="/shop" className="grid gap-4 rounded-2xl border border-emerald-deep/10 bg-white p-5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_.8fr_.8fr_auto] lg:items-end">
    <label><span className="field-label">Search</span><span className="relative block"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400"/><input name="q" defaultValue={values.q} placeholder="Search jewelry" className="min-h-11 w-full rounded-xl border border-emerald-deep/15 pl-10 pr-3 outline-none focus:border-gold" /></span></label>
    <label><span className="field-label">Category</span><select name="category" defaultValue={values.category ?? ""} className="min-h-11 w-full rounded-xl border border-emerald-deep/15 bg-white px-3 outline-none focus:border-gold"><option value="">All categories</option>{categories.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label>
    <label><span className="field-label">Collection</span><select name="collection" defaultValue={values.collection ?? ""} className="min-h-11 w-full rounded-xl border border-emerald-deep/15 bg-white px-3 outline-none focus:border-gold"><option value="">All collections</option>{collections.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label>
    <label><span className="field-label">Min price</span><input name="min" defaultValue={values.min} inputMode="numeric" placeholder="Rs. 0" className="min-h-11 w-full rounded-xl border border-emerald-deep/15 px-3 outline-none focus:border-gold" /></label>
    <label><span className="field-label">Max price</span><input name="max" defaultValue={values.max} inputMode="numeric" placeholder="Any" className="min-h-11 w-full rounded-xl border border-emerald-deep/15 px-3 outline-none focus:border-gold" /></label>
    <button className="min-h-11 cursor-pointer rounded-xl bg-emerald-deep px-6 text-sm font-semibold text-ivory hover:bg-emerald-rich">Apply</button>
    <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" name="available" value="1" defaultChecked={values.available === "1"} className="size-4 accent-emerald-deep"/> In stock only</label>
    <label className="sm:col-span-1 lg:col-start-5 lg:col-span-2"><span className="field-label">Sort by</span><select name="sort" defaultValue={values.sort ?? "featured"} className="min-h-11 w-full rounded-xl border border-emerald-deep/15 bg-white px-3 outline-none focus:border-gold"><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
  </form>;
}

