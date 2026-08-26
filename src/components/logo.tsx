"use client";
import { LuxuryImage } from "./luxury-image";
import { cn } from "@/lib/utils";
import { useBrand } from "./brand-provider";

export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  const {logoUrl}=useBrand();
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <LuxuryImage src={logoUrl} alt="Hassan Jewels — Jewels by Hassan" fill sizes="(max-width: 768px) 140px, 190px" className="object-contain" priority={priority} />
    </span>
  );
}
