import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-grid";
import { getCatalog, getCategoryBySlug } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const title = slug.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" "); return { title, alternates: { canonical: `/category/${slug}` } }; }
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; let products: Awaited<ReturnType<typeof getCatalog>> = []; let category: Awaited<ReturnType<typeof getCategoryBySlug>> = null;
  try { [category, products] = await Promise.all([getCategoryBySlug(slug), getCatalog({ category: slug, limit: 24 })]); if (!category) notFound(); } catch (error) { if ((error as { digest?: string }).digest?.startsWith("NEXT_NOT_FOUND")) throw error; }
  if (!category) notFound();
  return <><section className="bg-emerald-deep px-5 py-16 text-center text-ivory md:py-24"><p className="text-xs font-bold uppercase tracking-[.22em] text-gold-light">Hassan Jewels</p><h1 className="display-heading mt-3 text-6xl md:text-8xl">{category.name}</h1><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-ivory/65">{category.description ?? `Explore our considered edit of ${category.name.toLowerCase()}, selected for effortless radiance.`}</p></section><section className="section-pad bg-ivory"><div className="site-container"><ProductGrid products={products}/></div></section></>;
}
