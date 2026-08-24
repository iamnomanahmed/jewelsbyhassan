import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("min-h-12 w-full rounded-xl border border-emerald-deep/20 bg-white px-4 text-base text-emerald-ink outline-none transition placeholder:text-stone-400 focus:border-gold focus:ring-2 focus:ring-gold/20", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 w-full rounded-xl border border-emerald-deep/20 bg-white px-4 py-3 text-base text-emerald-ink outline-none transition placeholder:text-stone-400 focus:border-gold focus:ring-2 focus:ring-gold/20", className)} {...props} />;
}

