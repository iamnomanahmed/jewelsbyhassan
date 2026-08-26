import { CheckoutForm } from "@/components/checkout-form";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Secure Checkout" };
export default async function CheckoutPage() { const settings = await getSettings(); return <section className="min-h-screen bg-ivory py-10 sm:py-14 lg:py-20"><div className="site-container max-w-7xl"><div className="mb-7 sm:mb-10"><p className="eyebrow">Secure checkout</p><h1 className="display-heading mt-2 max-w-4xl text-5xl sm:text-6xl md:text-8xl">Complete your order.</h1></div><CheckoutForm settings={settings}/></div></section>; }
