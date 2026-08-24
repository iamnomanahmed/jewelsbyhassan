import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonClasses } from "@/components/ui/button";
export default function NotFound(){return <main className="grid min-h-screen place-items-center bg-emerald-ink px-5 text-center text-ivory"><div><Logo className="mx-auto h-28 w-52"/><p className="mt-10 text-xs font-bold uppercase tracking-[.2em] text-gold-light">404 · Not found</p><h1 className="display-heading mt-3 text-6xl">This piece is no longer here.</h1><p className="mx-auto mt-4 max-w-md text-sm text-ivory/60">Return to the collection and discover something equally memorable.</p><Link href="/shop" className={`${buttonClasses("gold","lg")} mt-7`}>Explore jewelry</Link></div></main>}
