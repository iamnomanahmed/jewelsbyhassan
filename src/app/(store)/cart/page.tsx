import { CartPageContent } from "@/components/cart-page";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Your Bag" };
export default async function CartPage() { const settings = await getSettings(); return <section className="section-pad min-h-[70vh] bg-ivory"><div className="site-container"><div className="mb-10"><p className="eyebrow">Your selection</p><h1 className="display-heading mt-2 text-6xl md:text-8xl">Shopping bag</h1></div><CartPageContent deliveryFee={settings.delivery.fee} freeThreshold={settings.delivery.freeThreshold}/></div></section>; }

