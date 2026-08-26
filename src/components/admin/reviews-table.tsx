"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, EyeOff, Star, X } from "lucide-react";
import type { reviews } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { LuxuryImage } from "@/components/luxury-image";
import { StatusBadge } from "./status-badge";

type Review = typeof reviews.$inferSelect;

export function ReviewsTable({ rows }: { rows: Review[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const update = async (id: string, action: string, body: { status?: Review["status"]; featured?: boolean }) => {
    if (busy) return;
    setBusy(`${action}-${id}`);
    setError("");
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error((await response.json()).error ?? "The review could not be updated.");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The review could not be updated.");
    } finally {
      setBusy(null);
    }
  };

  return <div className="space-y-4">
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error} Try again.</p> : null}
    {rows.map((review) => {
      const reviewBusy = busy?.endsWith(`-${review.id}`) ?? false;
      return <article key={review.id} aria-busy={reviewBusy || undefined} className="admin-card">
        <div className="grid gap-5 md:grid-cols-[1fr_auto]">
          <div className="flex gap-4">{review.imageUrl ? <a href={review.imageUrl} target="_blank" rel="noreferrer" className="relative hidden size-24 shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:block"><LuxuryImage src={review.imageUrl} alt="Customer review" fill sizes="96px" className="object-cover"/></a> : null}<div><div className="flex flex-wrap items-center gap-2"><StatusBadge value={review.status}/>{review.featured ? <span className="text-xs font-bold text-gold">FEATURED</span> : null}</div><div className="mt-3 text-gold" aria-label={`${review.rating} stars`}>{"★".repeat(review.rating)}<span className="text-stone-200">{"★".repeat(5 - review.rating)}</span></div><h2 className="mt-2 font-display text-2xl font-semibold text-emerald-deep">{review.title || "Customer review"}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{review.body}</p><p className="mt-3 text-xs font-semibold text-stone-400">{review.displayName} · {review.createdAt.toLocaleDateString("en-PK")}</p></div></div>
          <div className="flex flex-wrap gap-2 md:max-w-48 md:flex-col">
            <Button size="sm" disabled={Boolean(busy)} loading={busy === `approve-${review.id}`} loadingLabel="Approving…" onClick={() => void update(review.id, "approve", { status: "APPROVED" })}><Check className="size-3.5"/>Approve</Button>
            <Button size="sm" variant="outline" disabled={Boolean(busy)} loading={busy === `feature-${review.id}`} loadingLabel={review.featured ? "Unfeaturing…" : "Featuring…"} onClick={() => void update(review.id, "feature", { featured: !review.featured })}><Star className="size-3.5"/>{review.featured ? "Unfeature" : "Feature"}</Button>
            <Button size="sm" variant="outline" disabled={Boolean(busy)} loading={busy === `hide-${review.id}`} loadingLabel="Hiding…" onClick={() => void update(review.id, "hide", { status: "HIDDEN" })}><EyeOff className="size-3.5"/>Hide</Button>
            <Button size="sm" variant="danger" disabled={Boolean(busy)} loading={busy === `reject-${review.id}`} loadingLabel="Rejecting…" onClick={() => void update(review.id, "reject", { status: "REJECTED" })}><X className="size-3.5"/>Reject</Button>
          </div>
        </div>
      </article>;
    })}
    {!rows.length ? <div className="admin-card py-16 text-center text-sm text-stone-400">No customer reviews yet.</div> : null}
  </div>;
}
