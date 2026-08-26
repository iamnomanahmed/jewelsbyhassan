import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { getCatalog, getCollectionBySlug } from "@/lib/catalog";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const [collection, products] = await Promise.all([getCollectionBySlug(slug), getCatalog({ collection: slug, limit: 24 })]); if (!collection) notFound();
  return <><section className="bg-emerald-deep px-5 py-20 text-center text-ivory"><p className="text-xs font-bold uppercase tracking-[.22em] text-gold-light">A Hassan Jewels collection</p><h1 className="display-heading mt-3 text-6xl md:text-8xl">{collection.name}</h1><p className="mx-auto mt-5 max-w-xl text-sm text-ivory/65">{collection.description ?? "A distinct point of view, brought to life through graceful form and luminous detail."}</p></section><section className="section-pad bg-ivory"><div className="site-container"><ProductGrid products={products}/></div></section></>;
}
