"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";

export function CartButton() {
  const { count, hydrated,openDrawer } = useCart();
  return (
    <button type="button" onClick={openDrawer} aria-label={`Shopping bag with ${hydrated ? count : 0} items`} className="relative flex size-11 cursor-pointer items-center justify-center rounded-full transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
      <ShoppingBag aria-hidden="true" className="size-5" />
      {hydrated && count > 0 ? <span key={count} className="cart-count absolute right-0 top-0 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.65rem] font-bold text-emerald-ink">{count}</span> : null}
    </button>
  );
}
