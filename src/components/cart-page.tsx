"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/utils";
import { buttonClasses } from "./ui/button";
import { LuxuryImage } from "./luxury-image";
import { CartContentSkeleton } from "./loading-states";

export function CartPageContent({ deliveryFee, freeThreshold }: { deliveryFee: number; freeThreshold: number }) {
  const { items, hydrated, subtotal, updateQuantity, removeItem } = useCart();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const updateItem = (key: string, action: () => void) => {
    if (updatingKey) return;
    setUpdatingKey(key);
    window.setTimeout(() => {
      action();
      window.setTimeout(() => setUpdatingKey(null), 220);
    }, 100);
  };

  if (!hydrated) return <CartContentSkeleton />;
  if (!items.length) return <div className="rounded-3xl bg-white px-6 py-20 text-center">
    <ShoppingBag className="mx-auto size-10 text-gold"/>
    <h2 className="display-heading mt-5 text-5xl">Your bag is waiting.</h2>
    <p className="mt-3 text-sm text-stone-500">Discover a piece to make part of your story.</p>
    <Link href="/shop" className={`${buttonClasses("primary", "lg")} mt-7`}>Explore jewelry</Link>
  </div>;

  const delivery = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : deliveryFee;
  return <div className="grid gap-10 lg:grid-cols-[1.35fr_.65fr]">
    <div className="space-y-4">
      {items.map((item) => {
        const updating = updatingKey === item.key;
        return <article key={item.key} aria-busy={updating || undefined} className="relative grid grid-cols-[96px_1fr] gap-4 rounded-2xl bg-white p-3 sm:grid-cols-[130px_1fr_auto] sm:p-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">{item.imageUrl ? <LuxuryImage src={item.imageUrl} alt="" fill sizes="130px" className="object-cover"/> : null}</div>
          <div className="min-w-0 py-1">
            <h2 className="font-display text-2xl text-emerald-deep">{item.name}</h2>
            {item.variantLabel ? <p className="mt-1 text-xs text-stone-500">{item.variantLabel}</p> : null}
            <p className="mt-2 text-sm font-semibold">{formatPrice(item.unitPrice)}</p>
            <div className="mt-4 inline-flex items-center rounded-full border border-emerald-deep/15">
              <button disabled={updating} aria-label="Decrease quantity" onClick={() => updateItem(item.key, () => updateQuantity(item.key, item.quantity - 1))} className="flex size-10 cursor-pointer items-center justify-center disabled:cursor-wait disabled:opacity-40"><Minus className="size-3.5"/></button>
              <span className="w-7 text-center text-sm">{item.quantity}</span>
              <button disabled={updating} aria-label="Increase quantity" onClick={() => updateItem(item.key, () => updateQuantity(item.key, item.quantity + 1))} className="flex size-10 cursor-pointer items-center justify-center disabled:cursor-wait disabled:opacity-40"><Plus className="size-3.5"/></button>
            </div>
            {updating ? <p role="status" aria-live="polite" className="mt-2 text-xs font-semibold text-emerald-700">Updating your cart…</p> : null}
          </div>
          <button disabled={updating} onClick={() => updateItem(item.key, () => removeItem(item.key))} aria-label={`Remove ${item.name}`} className="col-start-2 flex size-11 cursor-pointer items-center justify-center self-start justify-self-end rounded-full text-stone-400 hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-40 sm:col-start-3 sm:row-start-1"><Trash2 className="size-4"/></button>
        </article>;
      })}
    </div>
    <aside className="h-fit rounded-2xl bg-emerald-deep p-6 text-ivory lg:sticky lg:top-32">
      <h2 className="font-display text-3xl">Order summary</h2>
      <dl className="mt-7 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-ivory/60">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div><div className="flex justify-between"><dt className="text-ivory/60">Delivery</dt><dd>{delivery ? formatPrice(delivery) : "Complimentary"}</dd></div><div className="mt-5 flex justify-between border-t border-white/15 pt-5 text-base font-semibold"><dt>Total</dt><dd>{formatPrice(subtotal + delivery)}</dd></div></dl>
      {delivery > 0 && freeThreshold > 0 ? <p className="mt-5 text-xs leading-5 text-ivory/55">Add {formatPrice(Math.max(freeThreshold - subtotal, 0))} more for complimentary delivery.</p> : null}
      <Link href="/checkout" className={`${buttonClasses("gold", "lg")} mt-7 w-full`}>Continue to checkout</Link>
      <Link href="/shop" className="mt-4 block text-center text-xs font-semibold uppercase tracking-[.12em] text-ivory/60 hover:text-gold-light">Continue shopping</Link>
    </aside>
  </div>;
}
