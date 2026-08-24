"use client";

import Link from "next/link";
import { Menu, Search, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
import { CartButton } from "./cart-button";

const links = [
  ["New", "/shop?sort=newest"], ["Rings", "/category/rings"], ["Earrings", "/category/earrings"],
  ["Necklaces", "/category/necklaces"], ["Bracelets", "/category/bracelets"], ["Bridal", "/category/bridal-jewelry"],
  ["Collections", "/collections"]
];

export function SiteHeader({ announcement }: { announcement?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {announcement ? <div className="bg-gold px-4 py-2 text-center font-sans text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-emerald-ink">{announcement}</div> : null}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-emerald-ink/95 text-ivory shadow-lg backdrop-blur-md">
        <div className="site-container flex h-[76px] items-center justify-between gap-4 md:h-[90px]">
          <button onClick={() => setOpen(true)} className="flex size-11 items-center justify-center rounded-full md:hidden" aria-label="Open menu"><Menu className="size-5" /></button>
          <Link href="/" aria-label="Hassan Jewels home" className="shrink-0"><Logo className="h-14 w-[126px] md:h-[72px] md:w-[166px]" priority /></Link>
          <nav aria-label="Primary navigation" className="hidden items-center gap-5 xl:gap-7 md:flex">
            {links.map(([label, href]) => <Link key={label} href={href} className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-ivory/85 transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{label}</Link>)}
          </nav>
          <div className="flex items-center gap-1">
            <Link href="/search" aria-label="Search" className="flex size-11 items-center justify-center rounded-full transition hover:bg-white/10"><Search className="size-5" /></Link>
            <Link href="/account" aria-label="Customer account" className="flex size-11 items-center justify-center rounded-full transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><UserRound aria-hidden="true" className="size-5" /></Link>
            <CartButton />
          </div>
        </div>
      </header>
      {open ? <div className="fixed inset-0 z-[70] bg-emerald-ink text-ivory md:hidden">
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5"><Logo className="h-14 w-32" /><button onClick={() => setOpen(false)} className="flex size-11 items-center justify-center" aria-label="Close menu"><X /></button></div>
        <nav className="flex flex-col px-6 py-8" aria-label="Mobile navigation">
          {links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)} className="border-b border-white/10 py-5 font-display text-3xl text-ivory transition hover:text-gold">{label}</Link>)}
          <Link href="/about" onClick={() => setOpen(false)} className="border-b border-white/10 py-5 font-display text-3xl">Our Story</Link>
        </nav>
      </div> : null}
    </>
  );
}
