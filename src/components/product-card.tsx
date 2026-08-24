import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { AddToCartButton } from "./add-to-cart";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const currentPrice = product.salePrice ?? product.price;
  return <article className="group min-w-0">
    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[#eee9df]">
      <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold" />
      {product.imageUrl ? <Image src={product.imageUrl} alt={product.imageAlt ?? product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition duration-500 group-hover:scale-[1.025]" /> : <div className="absolute inset-0 grid place-items-center text-sm text-stone-400">Image coming soon</div>}
      <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
        {product.newArrival ? <Badge>New</Badge> : null}{product.bestseller ? <Badge tone="gold">Bestseller</Badge> : null}{product.salePrice ? <Badge tone="red">Sale</Badge> : null}{product.limited ? <Badge tone="ivory">Limited</Badge> : null}
      </div>
      <div className="absolute inset-x-3 bottom-3 z-20 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <AddToCartButton className="w-full shadow-xl" item={{ productId: product.id, variantId: null, name: product.name, sku: product.sku, unitPrice: currentPrice, imageUrl: product.imageUrl, stock: product.stock }} label="Quick add" />
      </div>
    </div>
    <div className="pt-4"><p className="mb-1 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-emerald-rich/60">{product.categoryName ?? "Hassan Jewels"}</p><Link href={`/product/${product.slug}`} className="font-display text-2xl leading-tight text-emerald-ink hover:text-emerald-rich">{product.name}</Link><div className="mt-1.5 flex items-center gap-2 text-sm"><span className="font-semibold text-emerald-deep">{formatPrice(currentPrice)}</span>{product.salePrice ? <span className="text-stone-400 line-through">{formatPrice(product.price)}</span> : null}</div></div>
  </article>;
}

