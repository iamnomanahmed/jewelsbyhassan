"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Copy, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import type { getAdminProducts } from "@/lib/admin-data";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { LuxuryImage } from "@/components/luxury-image";
import { DownloadButton } from "./download-button";

type Row = Awaited<ReturnType<typeof getAdminProducts>>[number];

export function ProductTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const filtered = useMemo(() => rows.filter(({ product }) => `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);

  const bulk = async (action: "archive" | "restore" | "publish" | "unpublish") => {
    if (!selected.length || busy) return;
    setBusy(`bulk-${action}`);
    setError("");
    try {
      const response = await fetch("/api/admin/products/bulk", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: selected, action }) });
      if (!response.ok) throw new Error((await response.json()).error ?? "Products could not be updated.");
      setSelected([]);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Products could not be updated.");
    } finally {
      setBusy(null);
    }
  };

  const duplicate = async (id: string) => {
    if (busy) return;
    setBusy(`duplicate-${id}`);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${id}/duplicate`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The product could not be duplicated.");
      router.push(`/admin/products/${result.product.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The product could not be duplicated.");
      setBusy(null);
    }
  };

  const deleteProduct = async (id: string, name: string) => {
    const typed = prompt(`Permanently delete “${name}”?\n\nThis removes product, variants, image metadata and owned R2 files. Historical orders remain.\n\nType DELETE to continue.`);
    if (typed !== "DELETE" || busy) return;
    setBusy(`delete-${id}`);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The product could not be deleted.");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The product could not be deleted.");
    } finally {
      setBusy(null);
    }
  };

  const busyMessage = busy?.startsWith("delete-") ? "Deleting product and Cloudflare files…" : busy?.startsWith("duplicate-") ? "Duplicating product…" : busy?.startsWith("bulk-") ? "Updating selected products…" : "";

  return <div aria-busy={Boolean(busy) || undefined} className="rounded-2xl border border-emerald-deep/8 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-emerald-deep/8 p-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative max-w-sm flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or SKU" className="min-h-11 w-full rounded-xl border border-emerald-deep/15 pl-10 pr-3 text-sm outline-none focus:border-gold"/></label>
      {selected.length ? <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-stone-500">{selected.length} selected</span><Button size="sm" variant="outline" loading={busy === "bulk-archive"} loadingLabel="Archiving…" disabled={Boolean(busy)} onClick={() => void bulk("archive")}><Archive className="size-3.5"/>Archive</Button><Button size="sm" variant="outline" loading={busy === "bulk-restore"} loadingLabel="Restoring…" disabled={Boolean(busy)} onClick={() => void bulk("restore")}><RotateCcw className="size-3.5"/>Restore</Button><DownloadButton href={`/api/admin/export/products?ids=${selected.join(",")}`} label="Excel" filename="hassan-jewels-products.xlsx" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-emerald-deep px-4 text-xs font-semibold text-white"/></div> : null}
    </div>
    {busyMessage ? <p role="status" aria-live="polite" className="m-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900"><LoadingIndicator tone="gold"/>{busyMessage}</p> : null}
    {error ? <p role="alert" className="m-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error} Try again.</p> : null}
    <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
      <thead className="bg-[#fafbf9] text-[.65rem] uppercase tracking-[.1em] text-stone-400"><tr><th className="w-12 px-4 py-3"><input aria-label="Select all filtered products" type="checkbox" checked={filtered.length > 0 && filtered.every((row) => selected.includes(row.product.id))} onChange={(event) => setSelected(event.target.checked ? filtered.map((row) => row.product.id) : [])}/></th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
      <tbody>{filtered.map(({ product, imageUrl, categoryName }) => {
        const rowBusy = busy === `duplicate-${product.id}` || busy === `delete-${product.id}`;
        return <tr key={product.id} aria-busy={rowBusy || undefined} className="border-t border-emerald-deep/6">
          <td className="px-4 py-3"><input aria-label={`Select ${product.name}`} type="checkbox" disabled={Boolean(busy)} checked={selected.includes(product.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, product.id] : current.filter((id) => id !== product.id))}/></td>
          <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative size-12 overflow-hidden rounded-lg bg-stone-100">{imageUrl ? <LuxuryImage src={imageUrl} alt="" fill sizes="48px" className="object-cover"/> : null}</div><div><Link href={`/admin/products/${product.id}`} className="font-semibold text-emerald-deep hover:text-gold">{product.name}</Link><p className="text-xs text-stone-400">{product.sku}</p></div></div></td>
          <td className="px-4 py-3 text-stone-500">{categoryName ?? "—"}</td><td className="px-4 py-3 font-semibold">{formatPrice(product.salePrice ?? product.price)}</td><td className={`px-4 py-3 font-semibold ${product.stock <= 0 ? "text-red-700" : ""}`}>{product.stock}</td><td className="px-4 py-3"><StatusBadge value={product.status}/></td>
          <td className="px-4 py-3"><div className="flex justify-end gap-1"><Link href={`/admin/products/${product.id}`} aria-label={`Edit ${product.name}`} className="flex size-10 items-center justify-center rounded-full hover:bg-emerald-soft"><Pencil className="size-4"/></Link><button disabled={Boolean(busy)} aria-label={`Duplicate ${product.name}`} onClick={() => void duplicate(product.id)} className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-emerald-soft disabled:cursor-wait disabled:opacity-40">{busy === `duplicate-${product.id}` ? <LoadingIndicator tone="gold"/> : <Copy className="size-4"/>}</button>{product.status === "ARCHIVED" ? <button disabled={Boolean(busy)} aria-label={`Permanently delete ${product.name}`} onClick={() => void deleteProduct(product.id, product.name)} className="flex size-10 cursor-pointer items-center justify-center rounded-full text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-40">{busy === `delete-${product.id}` ? <LoadingIndicator/> : <Trash2 className="size-4"/>}</button> : null}</div></td>
        </tr>;
      })}</tbody>
    </table></div>
  </div>;
}
