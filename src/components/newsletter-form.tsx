"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  return <form className="mx-auto mt-7 flex max-w-lg flex-col gap-3 sm:flex-row" onSubmit={async (event) => { event.preventDefault(); setState("loading"); const form = new FormData(event.currentTarget); const response = await fetch("/api/newsletter", { method: "POST", body: JSON.stringify({ email: form.get("email") }), headers: { "content-type": "application/json" } }); const body = await response.json(); setMessage(body.message); setState(response.ok ? "success" : "error"); }}>
    <label htmlFor="newsletter-email" className="sr-only">Email address</label>
    <input id="newsletter-email" name="email" required type="email" placeholder="Your email address" className="min-h-12 flex-1 border-b border-ivory/40 bg-transparent px-1 text-base text-ivory outline-none placeholder:text-ivory/40 focus:border-gold" />
    <button disabled={state === "loading" || state === "success"} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-6 text-sm font-bold text-emerald-ink transition hover:bg-gold-light disabled:opacity-70">{state === "success" ? <Check className="size-4" /> : <ArrowRight className="size-4" />}{state === "loading" ? "Joining…" : state === "success" ? "Joined" : "Join the list"}</button>
    {message ? <p aria-live="polite" className={`sm:absolute sm:mt-14 text-xs ${state === "error" ? "text-red-300" : "text-champagne"}`}>{message}</p> : null}
  </form>;
}

