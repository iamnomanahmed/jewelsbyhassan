import { LuxuryImage } from "./luxury-image";
import { cn } from "@/lib/utils";

export function Logo({ className, priority = false, logoUrl = "/brand/hassan-jewels-logo.webp" }: { className?: string; priority?: boolean; logoUrl?: string }) {
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <LuxuryImage src={logoUrl} alt="Hassan Jewels — Jewels by Hassan" fill sizes="(max-width: 768px) 140px, 190px" className="object-contain" preload={priority} fetchPriority={priority ? "high" : undefined} quality={88} />
    </span>
  );
}
