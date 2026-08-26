import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSettings } from "@/lib/settings";
import type { CSSProperties } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { MotionProvider } from "@/components/motion-provider";
import { CartProvider } from "@/components/cart-provider";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const style={"--brand-primary":settings.colors.primary,"--brand-secondary":settings.colors.secondary,"--brand-gold":settings.colors.gold,"--brand-ivory":settings.colors.ivory} as CSSProperties;
  return <CartProvider><MotionProvider><div style={style}><SiteHeader announcement={settings.announcement} logoUrl={settings.logoUrl} /><main id="main-content" tabIndex={-1}>{children}</main><SiteFooter settings={settings} /><CartDrawer /></div></MotionProvider></CartProvider>;
}
