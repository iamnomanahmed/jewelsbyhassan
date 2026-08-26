"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Grip, ImagePlus, Star, Trash2 } from "lucide-react";
import type { assets } from "@/db/schema";
import { LuxuryImage } from "@/components/luxury-image";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

type Asset = typeof assets.$inferSelect;

export function ProductImages({ productId, images }: { productId: string; images: Asset[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length || busy) return;
    setBusy("uploading");
    setError("");
    setStatus(`Uploading ${files.length} image${files.length === 1 ? "" : "s"}…`);
    try {
      const queued = Array.from(files);
      for (const [index, file] of queued.entries()) {
        setStatus(`Uploading image ${index + 1} of ${queued.length}…`);
        const body = new FormData();
        body.set("file", file);
        body.set("ownerType", "PRODUCT");
        body.set("ownerId", productId);
        body.set("folder", "products");
        body.set("alt", file.name.replace(/\.[^.]+$/, ""));
        const response = await fetch("/api/admin/uploads", { method: "POST", body });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "An image could not be uploaded.");
      }
      setStatus("Images uploaded successfully ✓");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Images could not be uploaded.");
      setStatus("");
    } finally {
      setBusy(null);
    }
  };

  const persistOrder = async (ordered: Asset[]) => {
    setBusy("reordering");
    setStatus("Updating image order…");
    setError("");
    try {
      const responses = await Promise.all(ordered.map((image, index) => fetch(`/api/admin/assets/${image.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ sortOrder: index }) })));
      if (responses.some((response) => !response.ok)) throw new Error("The image order could not be saved.");
      setStatus("Image order updated ✓");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The image order could not be saved.");
      setStatus("");
    } finally {
      setBusy(null);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length || busy) return;
    const ordered = [...images];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    await persistOrder(ordered);
  };

  const makePrimary = async (image: Asset) => {
    if (busy) return;
    setBusy(`primary-${image.id}`);
    setStatus("Updating the primary image…");
    setError("");
    try {
      const response = await fetch(`/api/admin/assets/${image.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ primary: true }) });
      if (!response.ok) throw new Error((await response.json()).error ?? "The primary image could not be updated.");
      setStatus("Primary image updated ✓");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The primary image could not be updated.");
      setStatus("");
    } finally {
      setBusy(null);
    }
  };

  const deleteImage = async (image: Asset) => {
    if (busy || !confirm("Delete this image from Cloudflare R2?")) return;
    setBusy(`delete-${image.id}`);
    setStatus("Deleting Cloudflare file…");
    setError("");
    try {
      const response = await fetch(`/api/admin/assets/${image.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).error ?? "The image could not be deleted.");
      setStatus("Cloudflare file deleted ✓");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The image could not be deleted.");
      setStatus("");
    } finally {
      setBusy(null);
    }
  };

  return <section aria-busy={Boolean(busy) || undefined} className="admin-card mt-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="admin-card-title">Product images</h2><p className="mt-1 text-xs text-stone-500">Drag to reorder, use arrow controls for keyboard access, and choose a primary image.</p></div>
      <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-emerald-deep px-4 text-xs font-semibold text-white has-[:disabled]:cursor-wait has-[:disabled]:opacity-65">
        {busy === "uploading" ? <LoadingIndicator tone="gold" /> : <ImagePlus className="size-4"/>}
        {busy === "uploading" ? "Uploading images…" : "Add images"}
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={Boolean(busy)} onChange={(event) => void upload(event.target.files)}/>
      </label>
    </div>
    {status ? <p role="status" aria-live="polite" className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{busy ? <LoadingIndicator tone="gold" /> : null}{status}</p> : null}
    {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {images.map((image, index) => <div key={image.id} draggable={!busy} onDragStart={() => setDragging(image.id)} onDragOver={(event) => event.preventDefault()} onDrop={async () => { if (!dragging || dragging === image.id || busy) return; const from = images.findIndex((item) => item.id === dragging); const ordered = [...images]; const [moved] = ordered.splice(from, 1); ordered.splice(index, 0, moved); setDragging(null); await persistOrder(ordered); }} className="group relative aspect-square overflow-hidden rounded-xl bg-stone-100">
        <LuxuryImage src={image.url} alt={image.alt ?? "Product image"} fill sizes="160px" className="object-cover"/>
        <span className="absolute right-2 top-2 flex size-9 cursor-grab items-center justify-center rounded-full bg-white/90 text-emerald-deep shadow"><Grip className="size-4"/></span>
        {image.primary ? <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-1 text-[.6rem] font-bold text-emerald-ink">PRIMARY</span> : null}
        {busy === `delete-${image.id}` || busy === `primary-${image.id}` ? <span className="absolute inset-0 z-10 grid place-items-center bg-emerald-ink/70"><LoadingIndicator tone="gold" className="size-5"/></span> : null}
        <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <button disabled={Boolean(busy) || index === 0} onClick={() => void move(index, -1)} aria-label="Move image left" className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-emerald-deep shadow disabled:opacity-40"><ArrowLeft className="size-4"/></button>
          <button disabled={Boolean(busy) || index === images.length - 1} onClick={() => void move(index, 1)} aria-label="Move image right" className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-emerald-deep shadow disabled:opacity-40"><ArrowRight className="size-4"/></button>
          <button disabled={Boolean(busy)} onClick={() => void makePrimary(image)} aria-label="Make primary" className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-emerald-deep shadow disabled:opacity-40"><Star className="size-4"/></button>
          <button disabled={Boolean(busy)} onClick={() => void deleteImage(image)} aria-label="Delete image" className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-red-700 shadow disabled:opacity-40"><Trash2 className="size-4"/></button>
        </div>
      </div>)}
      {!images.length ? <div className="col-span-full rounded-xl border border-dashed border-emerald-deep/15 p-8 text-center text-sm text-stone-400">No images yet.</div> : null}
    </div>
  </section>;
}
