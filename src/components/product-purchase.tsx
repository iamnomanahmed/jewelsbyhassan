"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/utils";
import { generateProductInquiryMessage, generateWhatsAppUrl } from "@/lib/whatsapp";

type Variant = { id: string; sku: string; size: string | null; color: string | null; price: number | null; salePrice: number | null; stock: number; imageUrl: string | null };
type Props = { product: { id: string; name: string; sku: string; price: number; salePrice: number | null; stock: number; imageUrl: string | null; slug: string }; variants: Variant[]; whatsapp: { number: string; productTemplate: string } };

export function ProductPurchase({ product, variants, whatsapp }: Props) {
  const sizes = [...new Set(variants.map((item) => item.size).filter(Boolean))] as string[];
  const colors = [...new Set(variants.map((item) => item.color).filter(Boolean))] as string[];
  const [size, setSize] = useState(sizes[0] ?? ""); const [color, setColor] = useState(colors[0] ?? ""); const [quantity, setQuantity] = useState(1); const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const variant = useMemo(() => variants.find((item) => (!size || item.size === size) && (!color || item.color === color)), [variants, size, color]);
  const price = variant?.salePrice ?? variant?.price ?? product.salePrice ?? product.price; const stock = variant?.stock ?? product.stock;
  const cartItem = { productId: product.id, variantId: variant?.id ?? null, name: product.name, sku: variant?.sku ?? product.sku, variantLabel: [size && `Size ${size}`, color].filter(Boolean).join(" · "), unitPrice: price, imageUrl: variant?.imageUrl ?? product.imageUrl, stock };
  const inquiry = () => { const url = `${window.location.origin}/product/${product.slug}`; const message = generateProductInquiryMessage(whatsapp.productTemplate, { name: product.name, price, size, color, url }); window.open(generateWhatsAppUrl(whatsapp.number, message), "_blank", "noopener,noreferrer"); };
  return <div>
    {sizes.length ? <fieldset className="mb-6"><legend className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-emerald-deep">Size</legend><div className="flex flex-wrap gap-2">{sizes.map((value) => <button key={value} onClick={() => setSize(value)} aria-pressed={size === value} className={`min-h-11 min-w-11 cursor-pointer rounded-full border px-3 text-sm transition ${size === value ? "border-emerald-deep bg-emerald-deep text-white" : "border-emerald-deep/20 bg-white hover:border-gold"}`}>{value}</button>)}</div></fieldset> : null}
    {colors.length ? <fieldset className="mb-6"><legend className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-emerald-deep">Color</legend><div className="flex flex-wrap gap-2">{colors.map((value) => <button key={value} onClick={() => setColor(value)} aria-pressed={color === value} className={`min-h-11 cursor-pointer rounded-full border px-4 text-sm transition ${color === value ? "border-emerald-deep bg-emerald-deep text-white" : "border-emerald-deep/20 bg-white hover:border-gold"}`}>{value}</button>)}</div></fieldset> : null}
    <div className="mb-6 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[.12em] text-stone-500">Your selection</p><p className="mt-1 text-xl font-semibold text-emerald-deep">{formatPrice(price)}</p></div><div className="flex items-center rounded-full border border-emerald-deep/20 bg-white"><button aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex size-11 cursor-pointer items-center justify-center"><Minus className="size-4"/></button><span className="min-w-8 text-center text-sm">{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(Math.max(stock, 1), value + 1))} className="flex size-11 cursor-pointer items-center justify-center"><Plus className="size-4"/></button></div></div>
    <Button size="lg" className="w-full" disabled={stock < 1} onClick={() => { addItem(cartItem, quantity); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }}><ShoppingBag className="size-4"/>{stock < 1 ? "Sold out" : added ? "Added to bag" : "Add to bag"}</Button>
    <Button size="lg" variant="outline" className="mt-3 w-full text-emerald-deep" onClick={inquiry}><MessageCircle className="size-4"/>Ask on WhatsApp</Button>
    <p className="mt-4 text-center text-xs text-stone-500">{stock > 0 ? `${stock} available · Ready to dispatch` : "Currently unavailable"}</p>
  </div>;
}

