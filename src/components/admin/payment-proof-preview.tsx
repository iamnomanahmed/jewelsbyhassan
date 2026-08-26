"use client";

import { LuxuryImage } from "@/components/luxury-image";
import { ExternalLink, ImageOff, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

export function PaymentProofPreview({ url, alt }: { url: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [expanded]);

  if (!url || failed) return <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-red-200 bg-red-50/60 p-6 text-center text-sm text-red-800">
    <div><ImageOff aria-hidden="true" className="mx-auto mb-3 size-7"/><p className="font-semibold">Payment proof could not be loaded.</p><p className="mt-1 text-xs text-red-700/75">The private file may have expired or become unavailable.</p></div>
  </div>;

  return <>
    <button type="button" onClick={() => setExpanded(true)} className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-emerald-deep/10 bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
      <LuxuryImage src={url} alt={alt} fill sizes="(max-width: 1280px) 100vw, 380px" className="object-contain" onError={() => setFailed(true)}/>
      <span className="absolute bottom-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-emerald-ink/90 px-4 text-xs font-semibold text-white shadow-lg transition group-hover:bg-emerald-deep"><Maximize2 aria-hidden="true" className="size-4"/>Click to enlarge</span>
    </button>
    <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-emerald-deep/15 px-4 text-xs font-semibold text-emerald-deep transition hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Open full image <ExternalLink aria-hidden="true" className="size-4"/></a>

    {expanded ? <div role="dialog" aria-modal="true" aria-label="Enlarged payment proof" className="dialog-backdrop fixed inset-0 z-[100] grid place-items-center bg-emerald-ink/90 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setExpanded(false); }}>
      <div className="dialog-panel relative h-[min(84vh,900px)] w-full max-w-5xl overflow-hidden rounded-2xl bg-black/20 shadow-2xl">
        <LuxuryImage src={url} alt={alt} fill sizes="100vw" className="object-contain" onError={() => { setFailed(true); setExpanded(false); }}/>
        <button autoFocus type="button" onClick={() => setExpanded(false)} aria-label="Close enlarged payment proof" className="absolute right-3 top-3 flex size-12 cursor-pointer items-center justify-center rounded-full bg-white text-emerald-ink shadow-lg transition hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><X aria-hidden="true" className="size-5"/></button>
      </div>
    </div> : null}
  </>;
}
