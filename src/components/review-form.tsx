"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { Check, ImageUp, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input, Textarea } from "./ui/input";
import { LuxuryImage } from "./luxury-image";

export function ReviewForm({ token, defaultName }: { token: string; defaultName: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  if (state === "success") return <div role="status" className="success-sequence py-12 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-deep text-gold"><Check/></span><h2 className="display-heading mt-5 text-5xl">Thank you for your story.</h2><p className="mt-3 text-sm text-stone-500">Your review is with our team for moderation.</p></div>;

  return <form aria-busy={state === "loading" || undefined} onSubmit={async (event) => {
    event.preventDefault();
    setError("");
    if (!rating) { setError("Choose a star rating."); return; }
    setState("loading");
    try {
      const fields = new FormData(event.currentTarget);
      fields.set("token", token);
      fields.set("rating", String(rating));
      if (image) fields.set("image", image);
      const response = await fetch("/api/reviews", { method: "POST", body: fields });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not submit review");
      setState("success");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your review could not be submitted. Please try again.");
      setState("idle");
    }
  }}>
    <fieldset><legend className="field-label">Your rating *</legend><div className="flex gap-1" onMouseLeave={() => setHover(0)}>{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={`${value} star${value > 1 ? "s" : ""}`} aria-pressed={rating === value} onMouseEnter={() => setHover(value)} onClick={() => setRating(value)} className={`flex size-11 cursor-pointer items-center justify-center text-3xl transition ${(hover || rating) >= value ? "text-gold" : "text-stone-200"}`}>★</button>)}</div></fieldset>
    <div className="mt-5 grid gap-4"><label><span className="field-label">Display name *</span><Input name="displayName" required defaultValue={defaultName}/></label><label><span className="field-label">Review title</span><Input name="title" placeholder="A beautiful piece"/></label><label><span className="field-label">Your review *</span><Textarea name="body" required minLength={10} placeholder="Tell us what made your Hassan Jewels experience special."/></label><div>{preview ? <div className="relative aspect-video overflow-hidden rounded-xl bg-stone-100"><LuxuryImage src={preview} alt="Review image preview" fill unoptimized className="object-contain"/><button type="button" onClick={() => { if (preview) URL.revokeObjectURL(preview); setImage(null); setPreview(null); }} className="absolute right-2 top-2 flex size-11 cursor-pointer items-center justify-center rounded-full bg-emerald-ink text-white" aria-label="Remove review photo"><X className="size-4"/></button><p aria-live="polite" className="absolute inset-x-0 bottom-0 bg-emerald-ink/75 px-3 py-2 text-center text-xs font-semibold text-white">Photo ready to upload ✓</p></div> : <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-deep/25"><ImageUp className="size-5 text-gold"/><span className="mt-2 text-sm font-semibold">Add an optional photo</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={choose}/></label>}</div></div>
    {error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}
    <Button size="lg" className="mt-6 w-full" loading={state === "loading"} loadingLabel={image ? "Uploading photo & submitting…" : "Submitting review…"}>Submit review</Button>
  </form>;
}
