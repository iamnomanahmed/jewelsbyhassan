import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, tone = "green", className }: { children: ReactNode; tone?: "green" | "gold" | "ivory" | "red"; className?: string }) {
  return <span className={cn("inline-flex min-h-6 items-center rounded-full px-2.5 py-1 font-sans text-[0.65rem] font-bold uppercase tracking-[0.14em]", tone === "green" && "bg-emerald-deep text-ivory", tone === "gold" && "bg-gold text-emerald-ink", tone === "ivory" && "bg-ivory text-emerald-deep", tone === "red" && "bg-red-100 text-red-800", className)}>{children}</span>;
}

