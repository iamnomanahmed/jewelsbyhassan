"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { Banknote, Copy, ImageUp, LockKeyhole, Smartphone, X } from "lucide-react";
import type { StoreSettingsShape } from "@/db/schema";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input, Textarea } from "./ui/input";
import { Logo } from "./logo";
import { BlockingLoader, CheckoutContentSkeleton } from "./loading-states";
import { LuxuryImage } from "./luxury-image";

type CheckoutPhase = "idle" | "uploading" | "creating" | "uploaded" | "finalizing";

function Field({ label, name, required, type = "text", placeholder, autoComplete, inputMode }: { label: string; name: string; required?: boolean; type?: string; placeholder?: string; autoComplete?: string; inputMode?: "text" | "tel" | "email" | "numeric" | "decimal" | "search" | "url" | "none" }) { return <label className="min-w-0"><span className="field-label">{label}{required ? " *" : ""}</span><Input name={name} required={required} type={type} inputMode={inputMode} placeholder={placeholder} autoComplete={autoComplete}/></label>; }

export function CheckoutForm({ settings }: { settings: StoreSettingsShape }) {
  const { items, subtotal, hydrated, clear } = useCart(); const router = useRouter(); const [method, setMethod] = useState<"COD" | "EASYPAISA">("COD"); const [proof, setProof] = useState<File | null>(null); const [preview, setPreview] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false); const [phase, setPhase] = useState<CheckoutPhase>("idle"); const [slow, setSlow] = useState(false); const [error, setError] = useState(""); const [copied, setCopied] = useState("");
  const delivery = settings.delivery.freeThreshold > 0 && subtotal >= settings.delivery.freeThreshold ? 0 : settings.delivery.fee; const total = subtotal + delivery;
  const phaseMessage = phase === "uploading" ? "Uploading your payment proof…" : phase === "uploaded" ? "Payment proof uploaded ✓" : phase === "finalizing" ? "Finalizing your order…" : "Creating your Hassan Jewels order…";
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const copy = async (value: string, label: string) => { await navigator.clipboard.writeText(value); setCopied(label); window.setTimeout(() => setCopied(""), 1600); };
  const selectProof = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0] ?? null; if (preview) URL.revokeObjectURL(preview); setProof(file); setPreview(file ? URL.createObjectURL(file) : null); };
  if (!hydrated) return <CheckoutContentSkeleton />;
  if (!items.length) return <div className="grid min-h-80 place-items-center rounded-2xl bg-white p-5 text-center sm:p-12"><div><h2 className="font-display text-4xl">Your bag is empty.</h2><Button className="mt-6 w-full sm:w-auto" onClick={() => router.push("/shop")}>Return to shop</Button></div></div>;
  return <form aria-busy={submitting || undefined} onSubmit={async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    setSlow(false);
    setPhase(proof ? "uploading" : "creating");
    const slowTimer = window.setTimeout(() => setSlow(true), 7000);
    let popup: Window | null = null;
    try {
      popup = window.open("", "hassan-jewels-whatsapp");
      const data = new FormData(event.currentTarget);
      const payload = { customer: { fullName: data.get("fullName"), phone: data.get("phone"), whatsapp: data.get("whatsapp"), email: data.get("email"), address: data.get("address"), area: data.get("area"), city: data.get("city"), postalCode: data.get("postalCode"), notes: data.get("notes") }, paymentMethod: method, items: items.map((item) => ({ productId: item.productId, variantId: item.variantId ?? null, quantity: item.quantity })) };
      const body = new FormData();
      body.set("payload", JSON.stringify(payload));
      if (proof) body.set("proof", proof);
      const response = await fetch("/api/orders", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not place order");
      if (proof) {
        setPhase("uploaded");
        await new Promise((resolve) => window.setTimeout(resolve, 350));
      }
      setPhase("finalizing");
      clear();
      if (popup) popup.location.href = result.whatsappUrl;
      else window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      router.push(`/order/${result.orderNumber}/confirmation`);
    } catch (reason) {
      popup?.close();
      setError(reason instanceof Error ? reason.message : "Could not place order");
      setSubmitting(false);
      setPhase("idle");
    } finally {
      window.clearTimeout(slowTimer);
    }
  }} className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,.95fr)] lg:gap-10 xl:gap-12">
    {submitting ? <BlockingLoader message={phaseMessage} supportingText={slow ? "Still working — please don’t close this page." : "Please don’t close this page."} /> : null}
    <div className="min-w-0 space-y-4 sm:space-y-6"><div className="checkout-card min-w-0 rounded-2xl bg-white p-4 sm:p-7"><h2 className="font-display text-3xl text-emerald-deep">Your details</h2><p className="mt-1 text-xs leading-5 text-stone-500">We use these details only to prepare and deliver your order.</p><div className="mt-5 grid min-w-0 gap-4 sm:mt-6 sm:grid-cols-2"><Field label="Full name" name="fullName" required autoComplete="name"/><Field label="Phone" name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="03XXXXXXXXX"/><Field label="WhatsApp" name="whatsapp" required type="tel" inputMode="tel" autoComplete="tel" placeholder="03XXXXXXXXX"/><Field label="Email (optional)" name="email" type="email" inputMode="email" autoComplete="email"/><label className="min-w-0 sm:col-span-2"><span className="field-label">Delivery address *</span><Textarea name="address" required autoComplete="street-address"/></label><Field label="Area" name="area" required/><Field label="City" name="city" required autoComplete="address-level2"/><Field label="Postal code (optional)" name="postalCode" inputMode="numeric" autoComplete="postal-code"/><label className="min-w-0 sm:col-span-2"><span className="field-label">Order notes (optional)</span><Textarea name="notes" placeholder="Gift note, delivery landmark or anything we should know"/></label></div></div>
      <div className="checkout-card min-w-0 rounded-2xl bg-white p-4 sm:p-7"><h2 className="font-display text-3xl text-emerald-deep">Payment</h2><div className="mt-5 grid min-w-0 gap-3 sm:mt-6 sm:grid-cols-2"><button type="button" onClick={() => setMethod("COD")} aria-pressed={method === "COD"} className={`payment-choice min-h-24 min-w-0 cursor-pointer rounded-xl border p-4 text-left ${method === "COD" ? "border-gold bg-champagne/20 ring-1 ring-gold" : "border-emerald-deep/10"}`}><Banknote aria-hidden="true" className="size-5 text-gold"/><span className="mt-2 block text-sm font-semibold">Cash on Delivery</span><span className="text-xs leading-5 text-stone-500">Pay when your order arrives.</span></button><button type="button" disabled={!settings.easypaisa.enabled} onClick={() => setMethod("EASYPAISA")} aria-pressed={method === "EASYPAISA"} className={`payment-choice min-h-24 min-w-0 cursor-pointer rounded-xl border p-4 text-left disabled:cursor-not-allowed disabled:opacity-40 ${method === "EASYPAISA" ? "border-gold bg-champagne/20 ring-1 ring-gold" : "border-emerald-deep/10"}`}><Smartphone aria-hidden="true" className="size-5 text-gold"/><span className="mt-2 block text-sm font-semibold">Easypaisa</span><span className="text-xs leading-5 text-stone-500">Transfer and upload proof.</span></button></div>
      {method === "EASYPAISA" ? <div className="state-reveal mt-5 min-w-0 rounded-xl bg-emerald-soft/50 p-4 sm:p-5">
        <dl className="space-y-4 text-sm">
          <div className="min-w-0"><dt className="text-xs text-stone-500">Account title</dt><dd className="break-words font-semibold">{settings.easypaisa.accountTitle}</dd></div>
          <div className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><div className="min-w-0"><dt className="text-xs text-stone-500">Account number</dt><dd className="break-all font-semibold">{settings.easypaisa.number}</dd></div><button type="button" onClick={() => copy(settings.easypaisa.number,"number")} className="luxury-button flex min-h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-semibold sm:w-auto"><Copy aria-hidden="true" className="size-3.5"/>{copied === "number" ? "Copied" : "Copy"}</button></div>
          <div className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><div className="min-w-0"><dt className="text-xs text-stone-500">Exact amount</dt><dd className="font-semibold">{formatPrice(total)}</dd></div><button type="button" onClick={() => copy(String(total),"amount")} className="luxury-button flex min-h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-semibold sm:w-auto"><Copy aria-hidden="true" className="size-3.5"/>{copied === "amount" ? "Copied" : "Copy"}</button></div>
        </dl>
        <p className="mt-4 break-words text-xs leading-5 text-stone-600">{settings.easypaisa.instructions}</p>
        <div className="mt-5">{preview ? <div className="state-reveal relative overflow-hidden rounded-xl border border-emerald-deep/10 bg-white p-2"><div className="relative aspect-[16/10]"><LuxuryImage src={preview} alt="Easypaisa payment proof preview" fill unoptimized className="object-contain"/></div><button type="button" onClick={() => { if (preview) URL.revokeObjectURL(preview); setProof(null); setPreview(null); }} className="absolute right-3 top-3 flex size-11 cursor-pointer items-center justify-center rounded-full bg-emerald-ink text-white" aria-label="Remove payment proof"><X aria-hidden="true" className="size-4"/></button><p aria-live="polite" className="px-2 pb-1 pt-2 text-center text-xs font-semibold text-emerald-800">Payment proof ready to upload ✓</p></div> : <label className="upload-area flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-deep/30 bg-white p-4 text-center hover:border-gold sm:p-5"><ImageUp aria-hidden="true" className="size-6 text-gold"/><span className="mt-2 text-sm font-semibold">Upload payment screenshot</span><span className="mt-1 text-xs leading-5 text-stone-500">JPG, PNG or WEBP · max 8 MB</span><input className="sr-only" type="file" name="proof" accept="image/jpeg,image/png,image/webp" required onChange={selectProof}/></label>}</div>
      </div> : null}</div>
    </div>
    <aside className="h-fit min-w-0 rounded-2xl bg-emerald-deep p-4 text-ivory sm:p-7 lg:sticky lg:top-32">
      <Logo className="mb-5 h-16 w-28 sm:mb-6 sm:h-20 sm:w-36"/>
      <h2 className="font-display text-3xl">Order summary</h2>
      <div className="mt-5 space-y-4 lg:mt-6 lg:max-h-80 lg:overflow-auto lg:pr-1">{items.map((item) => <div key={item.key} className="flex min-w-0 items-start gap-3"><div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-white/10 sm:size-16">{item.imageUrl ? <LuxuryImage src={item.imageUrl} alt="" fill sizes="64px" className="object-cover"/>:null}<span className="absolute right-1 top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[.6rem] font-bold text-emerald-ink">{item.quantity}</span></div><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold leading-5">{item.name}</p>{item.variantLabel ? <p className="mt-1 break-words text-xs text-ivory/60">{item.variantLabel}</p> : null}</div><p className="shrink-0 whitespace-nowrap text-xs font-semibold sm:text-sm">{formatPrice(item.unitPrice*item.quantity)}</p></div>)}</div>
      <dl className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm"><div className="flex min-w-0 justify-between gap-4"><dt className="text-ivory/60">Subtotal</dt><dd className="shrink-0 font-medium">{formatPrice(subtotal)}</dd></div><div className="flex min-w-0 justify-between gap-4"><dt className="text-ivory/60">Delivery</dt><dd className="shrink-0 text-right font-medium">{delivery ? formatPrice(delivery) : "Complimentary"}</dd></div><div className="flex min-w-0 justify-between gap-4 border-t border-white/15 pt-4 text-lg font-semibold"><dt>Total</dt><dd className="shrink-0">{formatPrice(total)}</dd></div></dl>
      {error ? <div role="alert" className="state-reveal mt-5 break-words rounded-xl bg-red-950/50 p-3 text-sm text-red-100">{error}</div> : null}
      <Button type="submit" variant="gold" size="lg" className="mt-6 h-auto min-h-14 w-full !whitespace-normal px-4 py-3 text-center leading-5" loading={submitting} loadingLabel={phaseMessage}>Place order & continue to WhatsApp</Button>
      <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-ivory/60"><LockKeyhole aria-hidden="true" className="mt-0.5 size-3.5 shrink-0"/>Your order is saved before WhatsApp opens.</p>
    </aside>
  </form>;
}
