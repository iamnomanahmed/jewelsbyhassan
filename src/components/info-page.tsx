import type { ReactNode } from "react";

export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return <><section className="bg-emerald-deep px-5 py-16 text-center text-ivory md:py-24"><p className="text-xs font-bold uppercase tracking-[.22em] text-gold-light">{eyebrow}</p><h1 className="display-heading mx-auto mt-3 max-w-4xl text-6xl md:text-8xl">{title}</h1><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-ivory/65">{intro}</p></section><section className="section-pad bg-ivory"><div className="prose prose-stone mx-auto max-w-3xl text-base leading-8 text-stone-600 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-4xl [&_h2]:font-medium [&_h2]:text-emerald-deep [&_h3]:mt-7 [&_h3]:font-semibold [&_h3]:text-emerald-deep [&_li]:mb-2">{children}</div></section></>;
}

