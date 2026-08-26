"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyButton({ value, label = "Copy", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <button type="button" onClick={copy} className={cn("inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-emerald-deep/12 px-3 text-xs font-semibold text-emerald-deep transition hover:border-gold hover:bg-gold/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold", className)} aria-label={`${label}: ${value}`}>
    {copied ? <Check aria-hidden="true" className="size-3.5"/> : <Copy aria-hidden="true" className="size-3.5"/>}
    <span aria-live="polite">{copied ? "Copied" : label}</span>
  </button>;
}
