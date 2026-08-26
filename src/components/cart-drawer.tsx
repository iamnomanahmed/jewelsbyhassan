"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/utils";
import { buttonClasses } from "./ui/button";
import { LuxuryImage } from "./luxury-image";

export function CartDrawer() {
  const { drawerOpen, closeDrawer, items, subtotal, updateQuantity, removeItem } = useCart();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") closeDrawer(); };
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = original; document.removeEventListener("keydown", escape); };
  }, [drawerOpen, closeDrawer]);

  const updateItem = (key: string, action: () => void) => {
    if (updatingKey) return;
    setUpdatingKey(key);
    window.setTimeout(() => {
      action();
      window.setTimeout(() => setUpdatingKey(null), 220);
    }, 100);
  };

  return <div data-open={drawerOpen ? "true" : "false"} aria-hidden={!drawerOpen} className="cart-drawer-layer fixed inset-0 z-[80]">
    <button tabIndex={drawerOpen ? 0 : -1} onClick={closeDrawer} aria-label="Close shopping bag" className="cart-drawer-backdrop absolute inset-0 cursor-default bg-emerald-ink/65 backdrop-blur-sm"/>
    <aside inert={!drawerOpen} role="dialog" aria-modal={drawerOpen || undefined} aria-labelledby="cart-drawer-title" className="cart-drawer-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivory shadow-2xl">
      <header className="flex min-h-20 items-center justify-between border-b border-emerald-deep/10 px-5"><div><p className="text-[.65rem] font-bold uppercase tracking-[.16em] text-gold">Your selection</p><h2 id="cart-drawer-title" className="font-display text-3xl text-emerald-deep">Shopping bag</h2></div><button onClick={closeDrawer} className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-emerald-soft" aria-label="Close bag"><X className="size-5"/></button></header>
      {items.length ? <>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">{items.map((item) => {
          const updating = updatingKey === item.key;
          return <article key={item.key} aria-busy={updating || undefined} className="state-reveal grid grid-cols-[80px_1fr_auto] gap-3 rounded-xl bg-white p-3">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">{item.imageUrl ? <LuxuryImage src={item.imageUrl} alt="" fill sizes="80px" className="object-cover"/> : null}</div>
            <div className="min-w-0"><h3 className="truncate font-display text-xl text-emerald-deep">{item.name}</h3><p className="text-[.68rem] text-stone-400">{item.variantLabel}</p><p className="mt-1 text-xs font-semibold">{formatPrice(item.unitPrice)}</p><div className="mt-2 inline-flex items-center rounded-full border border-emerald-deep/15"><button disabled={updating} onClick={() => updateItem(item.key, () => updateQuantity(item.key, item.quantity - 1))} aria-label="Decrease quantity" className="flex size-9 cursor-pointer items-center justify-center disabled:cursor-wait disabled:opacity-40"><Minus className="size-3"/></button><span className="w-6 text-center text-xs">{item.quantity}</span><button disabled={updating} onClick={() => updateItem(item.key, () => updateQuantity(item.key, item.quantity + 1))} aria-label="Increase quantity" className="flex size-9 cursor-pointer items-center justify-center disabled:cursor-wait disabled:opacity-40"><Plus className="size-3"/></button></div>{updating ? <p role="status" aria-live="polite" className="mt-2 text-[.68rem] font-semibold text-emerald-700">Updating your cart…</p> : null}</div>
            <button disabled={updating} onClick={() => updateItem(item.key, () => removeItem(item.key))} aria-label={`Remove ${item.name}`} className="flex size-10 cursor-pointer items-center justify-center rounded-full text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-40"><Trash2 className="size-4"/></button>
          </article>;
        })}</div>
        <footer className="border-t border-emerald-deep/10 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"><div className="mb-4 flex justify-between text-sm"><span className="text-stone-500">Subtotal</span><strong className="text-emerald-deep">{formatPrice(subtotal)}</strong></div><Link onClick={closeDrawer} href="/checkout" className={`${buttonClasses("primary", "lg")} w-full !text-white`}>Checkout</Link><Link onClick={closeDrawer} href="/cart" className="mt-3 block min-h-11 py-3 text-center text-xs font-bold uppercase tracking-[.12em] text-emerald-deep">View full bag</Link></footer>
      </> : <div className="grid flex-1 place-items-center p-8 text-center"><div><ShoppingBag className="mx-auto size-9 text-gold"/><p className="mt-4 font-display text-4xl text-emerald-deep">Your bag is empty.</p><Link onClick={closeDrawer} href="/shop" className={`${buttonClasses("primary", "md")} mt-6`}>Explore jewelry</Link></div></div>}
    </aside>
  </div>;
}
