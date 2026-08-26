import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant"
});

const sansFont = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Hassan Jewels | Timeless Jewelry", template: "%s | Hassan Jewels" },
  description: "Premium rings, earrings, necklaces, bracelets and bridal jewelry with delivery across Pakistan.",
  alternates: { canonical: "/" },
  openGraph: { title: "Hassan Jewels", description: "Jewelry made to be remembered.", images: ["/brand/hassan-jewels-logo.webp"], type: "website" },
  icons: { icon: "/brand/hassan-jewels-icon.png", apple: "/brand/hassan-jewels-icon.png" }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#071C16" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}><body>
    <a href="#main-content" className="skip-link">Skip to main content</a>{children}
    {process.env.VERCEL ? <SpeedInsights /> : null}
  </body></html>;
}
