"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Input, Textarea } from "@/components/ui/input";

type Row = { id: string; name: string; slug: string; description: string | null; featured: boolean };

export function TaxonomyManager({ type, rows }: { type: "categories" | "collections"; rows: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const singular = type === "categories" ? "category" : "collection";

  return <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
    <form aria-busy={busy === "create" || undefined} className="admin-card h-fit" onSubmit={async (event) => {
      event.preventDefault();
      if (busy) return;
      setBusy("create");
      setError("");
      const form = event.currentTarget;
      try {
        const data = Object.fromEntries(new FormData(form));
        const response = await fetch(`/api/admin/taxonomy/${type}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, featured: data.featured === "on" }) });
        if (!response.ok) throw new Error((await response.json()).error ?? `The ${singular} could not be created.`);
        form.reset();
        router.refresh();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : `The ${singular} could not be created.`);
      } finally {
        setBusy(null);
      }
    }}>
      <h2 className="admin-card-title">Add {singular}</h2>
      <div className="mt-5 grid gap-4"><label><span className="field-label">Name</span><Input name="name" required/></label><label><span className="field-label">Slug (optional)</span><Input name="slug"/></label><label><span className="field-label">Description</span><Textarea name="description"/></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" className="size-4 accent-emerald-deep"/>Featured</label></div>
      {error ? <p role="alert" className="mt-4 text-sm text-red-700">{error} Try again.</p> : null}
      <Button className="mt-5" loading={busy === "create"} loadingLabel={`Adding ${singular}…`}><Plus className="size-4"/>Add</Button>
    </form>
    <div className="admin-card"><h2 className="admin-card-title">All {type}</h2><div className="mt-5 divide-y divide-emerald-deep/8">{rows.map((row) => <div key={row.id} aria-busy={busy === `delete-${row.id}` || undefined} className="flex items-center justify-between gap-4 py-4"><div><p className="font-semibold text-emerald-deep">{row.name}</p><p className="text-xs text-stone-400">/{row.slug}{row.featured ? " · Featured" : ""}</p></div><button disabled={Boolean(busy)} onClick={async () => {
      if (!confirm(`Delete ${row.name}? Products will be kept and unassigned.`) || busy) return;
      setBusy(`delete-${row.id}`);
      setError("");
      try {
        const response = await fetch(`/api/admin/taxonomy/${type}?id=${row.id}`, { method: "DELETE" });
        if (!response.ok) throw new Error((await response.json()).error ?? `The ${singular} could not be deleted.`);
        router.refresh();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : `The ${singular} could not be deleted.`);
      } finally {
        setBusy(null);
      }
    }} aria-label={`Delete ${row.name}`} className="flex size-11 cursor-pointer items-center justify-center rounded-full text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-40">{busy === `delete-${row.id}` ? <LoadingIndicator/> : <Trash2 className="size-4"/>}</button></div>)}</div></div>
  </div>;
}
