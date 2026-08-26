import * as React from "react";
import { cn } from "@/lib/utils";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "gold" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  loadingLabel?: string;
};

export function buttonClasses(variant: Props["variant"] = "primary", size: Props["size"] = "md") {
  return cn(
    "luxury-button inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans text-sm font-semibold tracking-[0.02em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" && "primary-contrast bg-emerald-deep text-ivory hover:bg-emerald-rich",
    variant === "gold" && "gold-contrast bg-gold text-emerald-ink hover:bg-gold-light",
    variant === "outline" && "border border-current bg-transparent hover:bg-current/5",
    variant === "ghost" && "bg-transparent hover:bg-current/10",
    variant === "danger" && "bg-red-700 text-white hover:bg-red-800",
    size === "sm" && "min-h-10 px-4",
    size === "md" && "min-h-11 px-5",
    size === "lg" && "min-h-12 px-7 text-[0.82rem] uppercase tracking-[0.16em]",
    size === "icon" && "size-11 shrink-0 p-0"
  );
}

export function Button({ className, variant = "primary", size = "md", loading = false, loadingLabel, children, disabled, ...props }: Props) {
  return <button
    className={cn(buttonClasses(variant, size), className)}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...props}
  >
    {loading ? <><LoadingIndicator tone={variant === "gold" ? "current" : "gold"} />{loadingLabel ?? children}</> : children}
  </button>;
}
