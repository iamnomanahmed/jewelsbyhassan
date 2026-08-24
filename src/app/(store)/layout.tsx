import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSettings } from "@/lib/settings";
import { BrandProvider } from "@/components/brand-provider";
import type { CSSProperties } from "react";
import { CartDrawer } from "@/components/cart-drawer";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const style={"--brand-primary":settings.colors.primary,"--brand-secondary":settings.colors.secondary,"--brand-gold":settings.colors.gold,"--brand-ivory":settings.colors.ivory} as CSSProperties;
  return <BrandProvider logoUrl={settings.logoUrl}><div style={style}><SiteHeader announcement={settings.announcement} /><main id="main-content" tabIndex={-1}>{children}</main><SiteFooter settings={settings} /><CartDrawer /></div></BrandProvider>;
}
