import type { ReactNode } from "react";
export function AdminPageHeader({eyebrow,title,description,action}:{eyebrow:string;title:string;description?:string;action?:ReactNode}){return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[.68rem] font-bold uppercase tracking-[.16em] text-gold">{eyebrow}</p><h1 className="mt-1 font-display text-4xl font-semibold text-emerald-deep sm:text-5xl">{title}</h1>{description?<p className="mt-2 max-w-2xl text-sm text-stone-500">{description}</p>:null}</div>{action}</div>}

