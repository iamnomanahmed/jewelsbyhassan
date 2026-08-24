import { CheckoutForm } from "@/components/checkout-form";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Secure Checkout" };
export default async function CheckoutPage() { const settings = await getSettings(); return <section className="section-pad bg-ivory"><div className="site-container"><div className="mb-10"><p className="eyebrow">Secure checkout</p><h1 className="display-heading mt-2 text-6xl md:text-8xl">Complete your order.</h1></div><CheckoutForm settings={settings}/></div></section>; }

