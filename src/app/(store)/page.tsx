import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { getApprovedReviews, getCatalog } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-grid";
import { Logo } from "@/components/logo";
import { buttonClasses } from "@/components/ui/button";
import { NewsletterForm } from "@/components/newsletter-form";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let arrivals: Awaited<ReturnType<typeof getCatalog>> = [];
  let featured: Awaited<ReturnType<typeof getCatalog>> = [];
  let bestsellers: Awaited<ReturnType<typeof getCatalog>> = [];
  let reviews: Awaited<ReturnType<typeof getApprovedReviews>> = [];
  try { [arrivals, featured, bestsellers, reviews] = await Promise.all([getCatalog({ newArrival: true, limit: 4 }), getCatalog({ featured: true, limit: 4 }), getCatalog({ bestseller: true, limit: 4 }), getApprovedReviews(4)]); } catch { /* Setup state: database not migrated yet. */ }
  const categories = [
    { name: "Rings", slug: "rings", image: "/images/noor-ring.webp" },
    { name: "Earrings", slug: "earrings", image: "/images/meher-earrings.webp" },
    { name: "Necklaces", slug: "necklaces", image: "/images/hero-jewelry.webp" },
    { name: "Bridal", slug: "bridal-jewelry", image: "/images/bridal-collection.webp" }
  ];
  return <>
    <section className="relative min-h-[78svh] overflow-hidden bg-emerald-ink text-ivory md:min-h-[84svh]">
      <Image src="/images/hero-jewelry.webp" alt="Gold jewelry on deep emerald velvet" fill priority sizes="100vw" className="object-cover object-[64%_center]" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-ink via-emerald-ink/80 to-emerald-ink/5" />
      <div className="site-container relative z-10 flex min-h-[78svh] items-center py-16 md:min-h-[84svh]">
        <div className="max-w-2xl"><Logo className="mb-7 h-20 w-40 opacity-95 md:h-28 md:w-56" /><p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-champagne">The new signature collection</p><h1 className="display-heading text-[clamp(3.5rem,8vw,7.7rem)]">Jewelry made to be remembered.</h1><p className="mt-6 max-w-xl text-base leading-7 text-ivory/75 md:text-lg">Discover timeless pieces designed to make every moment extraordinary.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/shop" className={buttonClasses("gold", "lg")}>Explore the collection <ArrowRight className="size-4" /></Link><Link href="/shop?sort=newest" className={buttonClasses("outline", "lg")}>Shop new arrivals</Link></div></div>
      </div>
    </section>

    <section className="border-b border-emerald-deep/10 bg-white"><div className="site-container grid grid-cols-2 divide-x divide-y divide-emerald-deep/10 md:grid-cols-4 md:divide-y-0">{[[Gem,"Curated detail","Made with a jeweler's eye"],[Truck,"Across Pakistan","Secure 3–5 day delivery"],[ShieldCheck,"Shop with confidence","Verified payment handling"],[Sparkles,"Signature packaging","Ready for every celebration"]].map(([Icon,title,copy]) => { const I = Icon as typeof Gem; return <div key={String(title)} className="flex min-h-36 flex-col items-center justify-center px-3 text-center"><I className="mb-3 size-5 text-gold"/><p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-deep">{String(title)}</p><p className="mt-1 text-xs text-stone-500">{String(copy)}</p></div>; })}</div></section>

    <section className="section-pad bg-ivory"><div className="site-container"><div className="mb-10 flex items-end justify-between"><div><p className="eyebrow">Just arrived</p><h2 className="display-heading mt-2 text-5xl md:text-7xl">New arrivals</h2></div><Link href="/shop?sort=newest" className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-deep sm:flex">View all <ArrowRight className="size-4" /></Link></div><ProductGrid products={arrivals} /></div></section>

    {bestsellers.length ? <section className="section-pad bg-white"><div className="site-container"><div className="mb-10 flex items-end justify-between"><div><p className="eyebrow">Customer favorites</p><h2 className="display-heading mt-2 text-5xl md:text-7xl">Best sellers</h2></div><Link href="/shop?sort=featured" className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-deep sm:flex">Shop the edit <ArrowRight className="size-4" /></Link></div><ProductGrid products={bestsellers} /></div></section> : null}

    <section className="bg-emerald-deep text-ivory"><div className="grid min-h-[720px] lg:grid-cols-2"><div className="relative min-h-[520px] lg:min-h-full"><Image src="/images/bridal-collection.webp" alt="Hassan Jewels bridal necklace set" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div><div className="flex items-center px-7 py-20 sm:px-14 lg:px-[10%]"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-light">Bridal heirlooms</p><h2 className="display-heading mt-4 text-6xl md:text-8xl">For your most radiant chapter.</h2><p className="mt-7 text-base leading-8 text-ivory/70">Regal silhouettes, intricate details and luminous stones come together in a collection created for celebrations that become family stories.</p><Link href="/category/bridal-jewelry" className={`${buttonClasses("gold", "lg")} mt-9`}>Discover bridal <ArrowRight className="size-4" /></Link></div></div></div></section>

    <section className="section-pad bg-white"><div className="site-container"><div className="mb-12 text-center"><p className="eyebrow">Find your signature</p><h2 className="display-heading mt-2 text-5xl md:text-7xl">Shop by category</h2></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{categories.map((category, index) => <Link key={category.slug} href={`/category/${category.slug}`} className={`group relative overflow-hidden rounded-2xl ${index % 2 ? "mt-8" : "mb-8"}`}><div className="relative aspect-[3/4]"><Image src={category.image} alt={category.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /><div className="absolute inset-0 bg-gradient-to-t from-emerald-ink/80 via-transparent to-transparent"/><h3 className="absolute bottom-5 left-5 font-display text-3xl text-white md:text-4xl">{category.name}</h3></div></Link>)}</div></div></section>

    <section className="section-pad bg-ivory"><div className="site-container"><div className="mb-10"><p className="eyebrow">Loved most</p><h2 className="display-heading mt-2 text-5xl md:text-7xl">Signature pieces</h2></div><ProductGrid products={featured} /></div></section>

    <section className="bg-white"><div className="site-container grid items-center gap-10 py-20 lg:grid-cols-2 lg:py-28"><div className="relative aspect-[4/3] overflow-hidden rounded-3xl"><Image src="/images/noor-ring.webp" alt="The craftsmanship behind Hassan Jewels" fill sizes="(max-width:1024px) 100vw,50vw" className="object-cover"/></div><div className="max-w-xl lg:pl-12"><p className="eyebrow">Our story</p><h2 className="display-heading mt-3 text-6xl md:text-8xl">Beauty, considered in every detail.</h2><p className="mt-6 text-base leading-8 text-stone-600">Hassan Jewels brings a contemporary eye to graceful, celebratory jewelry. We believe the most memorable pieces feel personal from the first glance—and remain part of your story long after the occasion.</p><Link href="/about" className={`${buttonClasses("outline","lg")} mt-8 text-emerald-deep`}>Meet Hassan Jewels <ArrowRight className="size-4"/></Link></div></div></section>

    <section className="section-pad bg-emerald-ink text-ivory"><div className="site-container grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div className="lg:sticky lg:top-36"><p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-light">Client stories</p><h2 className="display-heading mt-4 text-6xl md:text-8xl">Made part of your moments.</h2><p className="mt-6 max-w-md text-sm leading-7 text-ivory/60">Every approved review comes from a completed Hassan Jewels order.</p></div><div className="grid gap-4 sm:grid-cols-2">{reviews.length ? reviews.map((review) => <blockquote key={review.id} className="rounded-2xl border border-white/10 bg-white/[.05] p-7"><div className="mb-5 text-gold" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}<span className="text-white/20">{"★".repeat(5-review.rating)}</span></div><p className="font-display text-2xl leading-snug">“{review.body}”</p><footer className="mt-5 text-xs font-semibold uppercase tracking-[.12em] text-ivory/50">{review.displayName}</footer></blockquote>) : <div className="rounded-2xl border border-white/10 p-8 text-ivory/60 sm:col-span-2">Approved customer stories will appear here after your first completed orders.</div>}</div></div></section>

    <section className="section-pad bg-ivory"><div className="site-container"><div className="mb-10 text-center"><p className="eyebrow">The Hassan Jewels edit</p><h2 className="display-heading mt-2 text-5xl md:text-7xl">From our social gallery</h2></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{["/images/hero-jewelry.webp","/images/meher-earrings.webp","/images/bridal-collection.webp","/images/noor-ring.webp"].map((image,index)=><div key={image} className={`relative overflow-hidden rounded-2xl ${index%2?"aspect-[4/5]":"aspect-square"}`}><Image src={image} alt={["Emerald velvet jewelry editorial","Pearl earrings close-up","Bridal jewelry campaign","Solitaire ring detail"][index]} fill sizes="(max-width:768px) 50vw,25vw" className="object-cover"/></div>)}</div></div></section>

    <section className="bg-emerald-rich px-5 py-20 text-center text-ivory md:py-28"><div className="mx-auto max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-light">Private access</p><h2 className="display-heading mt-3 text-5xl md:text-7xl">A little brilliance, in your inbox.</h2><p className="mt-5 text-sm leading-7 text-ivory/65">Be first to discover new collections, private previews and thoughtful jewelry notes.</p><NewsletterForm /></div></section>
  </>;
}
