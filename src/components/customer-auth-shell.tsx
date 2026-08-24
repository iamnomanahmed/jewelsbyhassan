import { Gem, ShieldCheck } from "lucide-react";

export function CustomerAuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <section className="relative overflow-hidden bg-ivory px-4 py-14 sm:py-20">
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(200,155,60,.14),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(10,42,32,.08),transparent_34%)]"/>
    <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-emerald-deep/10 bg-white shadow-[0_28px_90px_rgba(6,23,18,.12)] lg:grid-cols-[.9fr_1.1fr]">
      <div className="flex flex-col justify-between bg-emerald-ink p-7 text-ivory sm:p-10 lg:p-12">
        <div>
          <div className="flex size-12 items-center justify-center rounded-full border border-gold/35 bg-gold/10 text-gold-light"><Gem aria-hidden="true" className="size-5"/></div>
          <p className="mt-8 text-[.68rem] font-bold uppercase tracking-[.22em] text-gold-light">Private client access</p>
          <h2 className="display-heading mt-3 text-4xl sm:text-5xl">Your jewelry journey, remembered.</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-ivory/65">A secure Hassan Jewels account gives you one place for your profile and future personalized services.</p>
        </div>
        <p className="mt-12 flex items-center gap-2 text-xs leading-5 text-ivory/55"><ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-gold-light"/>Authentication is managed securely by Neon.</p>
      </div>
      <div className="p-7 sm:p-10 lg:p-12">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-heading mt-3 text-5xl text-emerald-deep sm:text-6xl">{title}</h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-stone-600">{description}</p>
        {children}
      </div>
    </div>
  </section>;
}
