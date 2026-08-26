import Link from "next/link";
import { Logo } from "./logo";
import type { StoreSettingsShape } from "@/db/schema";

export function SiteFooter({ settings }: { settings: StoreSettingsShape }) {
  return <footer className="bg-emerald-ink text-ivory">
    <div className="site-container grid gap-10 py-16 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:py-20">
      <div><Logo logoUrl={settings.logoUrl} className="mb-6 h-32 w-52" /><p className="max-w-sm text-sm leading-7 text-ivory/65">Timeless jewelry for the moments you will always remember. Designed in Pakistan with detail, grace and a modern point of view.</p></div>
      <div><h2 className="footer-heading">Shop</h2><div className="footer-links"><Link href="/shop">All Jewelry</Link><Link href="/shop?sort=newest">New Arrivals</Link><Link href="/category/bridal-jewelry">Bridal</Link><Link href="/collections">Collections</Link></div></div>
      <div><h2 className="footer-heading">Care</h2><div className="footer-links"><Link href="/contact">Contact</Link><Link href="/faq">FAQ</Link><Link href="/shipping">Shipping</Link><Link href="/returns">Returns</Link></div></div>
      <div><h2 className="footer-heading">Visit</h2><div className="space-y-3 text-sm leading-6 text-ivory/65"><p>{settings.address}</p><a href={`tel:${settings.phone}`}>{settings.phone}</a><a className="block" href={`mailto:${settings.email}`}>{settings.email}</a></div></div>
    </div>
    <div className="border-t border-white/10"><div className="site-container flex flex-col gap-2 py-5 text-xs text-ivory/45 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Hassan Jewels. All rights reserved.</p><p>Secure checkout · Crafted with care</p></div></div>
  </footer>;
}
