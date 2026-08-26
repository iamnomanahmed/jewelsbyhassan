"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useCart, type CartItem } from "./cart-provider";

export function AddToCartButton({ item, quantity = 1, label = "Add to bag", className }: { item: Omit<CartItem, "key" | "quantity">; quantity?: number; label?: string; className?: string }) {
  const { addItem } = useCart();
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");
  const add = () => {
    setState("adding");
    window.setTimeout(() => {
      addItem(item, quantity);
      setState("added");
      window.setTimeout(() => setState("idle"), 1800);
    }, 140);
  };
  return <Button data-state={state} className={`${state === "added" ? "state-reveal " : ""}${className ?? ""}`} disabled={item.stock < 1 || state !== "idle"} loading={state === "adding"} loadingLabel="Adding…" onClick={add}>
    {state === "added" ? <Check className="size-4" /> : <ShoppingBag className="size-4" />} {item.stock < 1 ? "Sold out" : state === "added" ? "Added" : label}
  </Button>;
}
