/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Hassan Jewels | Timeless Jewelry", template: "%s | Hassan Jewels" },
  description: "Premium rings, earrings, necklaces, bracelets and bridal jewelry with delivery across Pakistan.",
  alternates: { canonical: "/" },
  openGraph: { title: "Hassan Jewels", description: "Jewelry made to be remembered.", images: ["/brand/hassan-jewels-logo.png"], type: "website" },
  icons: { icon: "/brand/hassan-jewels-logo.png", apple: "/brand/hassan-jewels-logo.png" }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#071C16" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" /></head><body>
    <a href="#main-content" className="skip-link">Skip to main content</a><CartProvider>{children}</CartProvider>
    <SpeedInsights />
  </body></html>;
}
