"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { CartButton } from "./cart-button";

const links = [
  ["New", "/shop?sort=newest"], ["Rings", "/category/rings"], ["Earrings", "/category/earrings"],
  ["Necklaces", "/category/necklaces"], ["Bracelets", "/category/bracelets"], ["Bridal", "/category/bridal-jewelry"],
  ["Collections", "/collections"]
];

export function SiteHeader({ announcement, logoUrl }: { announcement?: string; logoUrl?: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setScrolled(window.scrollY > 28));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("scroll", update); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", close);
    return () => { document.body.style.overflow = original; document.removeEventListener("keydown", close); };
  }, [open]);

  return (
    <>
      {announcement ? <div className="bg-gold px-4 py-2 text-center font-sans text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-emerald-ink">{announcement}</div> : null}
      <header data-scrolled={scrolled ? "true" : "false"} className="site-header-shell sticky top-0 z-50 border-b border-white/10 bg-emerald-ink/95 text-ivory shadow-lg backdrop-blur-md">
        <div className="site-header-row site-container flex h-[76px] items-center justify-between gap-4 md:h-[90px]">
          <button onClick={() => setOpen(true)} className="flex size-11 items-center justify-center rounded-full lg:hidden" aria-label="Open menu"><Menu className="size-5" /></button>
          <Link href="/" aria-label="Hassan Jewels home" className="shrink-0"><Logo logoUrl={logoUrl} className="site-header-logo h-14 w-[126px] md:h-[72px] md:w-[166px]" priority /></Link>
          <nav aria-label="Primary navigation" className="hidden items-center gap-5 xl:gap-7 lg:flex">
            {links.map(([label, href]) => <Link key={label} href={href} className="gold-line-link font-sans text-xs font-medium uppercase tracking-[0.14em] text-ivory/85 transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{label}</Link>)}
          </nav>
          <div className="flex items-center gap-1">
            <Link href="/search" aria-label="Search" className="flex size-11 items-center justify-center rounded-full transition hover:bg-white/10"><Search className="size-5" /></Link>
            <CartButton />
          </div>
        </div>
      </header>
      <div data-open={open ? "true" : "false"} aria-hidden={!open} className="mobile-menu-layer fixed inset-0 z-[70] text-ivory lg:hidden">
        <button tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} aria-label="Close menu" className="mobile-menu-backdrop absolute inset-0 bg-emerald-ink/70 backdrop-blur-sm" />
        <aside inert={!open} className="mobile-menu-panel absolute inset-y-0 left-0 flex w-[min(92vw,400px)] flex-col bg-emerald-ink shadow-2xl">
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-5"><Logo logoUrl={logoUrl} className="h-14 w-32" /><button onClick={() => setOpen(false)} className="flex size-11 items-center justify-center rounded-full hover:bg-white/10" aria-label="Close menu"><X /></button></div>
          <nav className="flex flex-col overflow-y-auto px-6 py-7" aria-label="Mobile navigation">
            {links.map(([label, href], index) => <Link key={label} href={href} onClick={() => setOpen(false)} style={{ "--menu-order": index } as React.CSSProperties} className="mobile-menu-item border-b border-white/10 py-4 font-display text-3xl text-ivory hover:text-gold">{label}</Link>)}
            <Link href="/about" onClick={() => setOpen(false)} style={{ "--menu-order": links.length } as React.CSSProperties} className="mobile-menu-item border-b border-white/10 py-4 font-display text-3xl hover:text-gold">Our Story</Link>
          </nav>
        </aside>
      </div>
    </>
  );
}
