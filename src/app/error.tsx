"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="grid min-h-[70vh] place-items-center bg-ivory px-5 text-center"><div><p className="eyebrow">Something went wrong</p><h1 className="display-heading mt-3 text-6xl text-emerald-deep">We lost a little sparkle.</h1><p className="mx-auto mt-4 max-w-md text-sm text-stone-500">Please try again. If the problem continues, our team can help on WhatsApp.</p><Button className="mt-7" onClick={reset}>Try again</Button></div></main>}
