"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useCart, type CartItem } from "./cart-provider";

export function AddToCartButton({ item, quantity = 1, label = "Add to bag", className }: { item: Omit<CartItem, "key" | "quantity">; quantity?: number; label?: string; className?: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  return <Button className={className} disabled={item.stock < 1} onClick={() => { addItem(item, quantity); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }}>
    {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />} {item.stock < 1 ? "Sold out" : added ? "Added" : label}
  </Button>;
}

