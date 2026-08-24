"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  key: string;
  productId: string;
  variantId?: string | null;
  name: string;
  sku: string;
  variantLabel?: string;
  unitPrice: number;
  imageUrl?: string | null;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartItem, "key" | "quantity">, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "hassan-jewels-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen,setDrawerOpen]=useState(false);

  useEffect(() => {
    const timer=window.setTimeout(()=>{try { setItems(JSON.parse(localStorage.getItem(CART_KEY) ?? "[]")); } catch { setItems([]); }setHydrated(true)},0);
    return ()=>window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items)); }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "key" | "quantity">, quantity = 1) => {
    const key = `${item.productId}:${item.variantId ?? "base"}`;
    setItems((current) => {
      const existing = current.find((entry) => entry.key === key);
      if (existing) return current.map((entry) => entry.key === key ? { ...entry, quantity: Math.min(entry.quantity + quantity, Math.max(item.stock, 1)) } : entry);
      return [...current, { ...item, key, quantity: Math.min(quantity, Math.max(item.stock, 1)) }];
    });
    setDrawerOpen(true);
  }, []);
  const updateQuantity = useCallback((key: string, quantity: number) => setItems((current) => current.map((item) => item.key === key ? { ...item, quantity: Math.max(1, Math.min(quantity, Math.max(item.stock, 1))) } : item)), []);
  const removeItem = useCallback((key: string) => setItems((current) => current.filter((item) => item.key !== key)), []);
  const clear = useCallback(() => {setItems([]);setDrawerOpen(false)}, []);
  const openDrawer=useCallback(()=>setDrawerOpen(true),[]);const closeDrawer=useCallback(()=>setDrawerOpen(false),[]);
  const value = useMemo(() => ({ items, hydrated, drawerOpen, openDrawer, closeDrawer, addItem, updateQuantity, removeItem, clear, count: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) }), [items, hydrated, drawerOpen, openDrawer, closeDrawer, addItem, updateQuantity, removeItem, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
