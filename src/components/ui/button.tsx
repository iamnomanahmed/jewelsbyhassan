import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "gold" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

export function buttonClasses(variant: Props["variant"] = "primary", size: Props["size"] = "md") {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans text-sm font-semibold tracking-[0.02em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" && "bg-emerald-deep text-ivory hover:bg-emerald-rich",
    variant === "gold" && "bg-gold text-emerald-ink hover:bg-gold-light",
    variant === "outline" && "border border-current bg-transparent hover:bg-current/5",
    variant === "ghost" && "bg-transparent hover:bg-current/10",
    variant === "danger" && "bg-red-700 text-white hover:bg-red-800",
    size === "sm" && "min-h-10 px-4",
    size === "md" && "min-h-11 px-5",
    size === "lg" && "min-h-12 px-7 text-[0.82rem] uppercase tracking-[0.16em]",
    size === "icon" && "size-11 shrink-0 p-0"
  );
}

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return <button className={cn(buttonClasses(variant, size), className)} {...props} />;
}

