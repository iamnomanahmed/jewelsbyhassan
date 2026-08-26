import { cn } from "@/lib/utils";

export function LoadingIndicator({
  className,
  tone = "current"
}: {
  className?: string;
  tone?: "current" | "gold" | "ivory";
}) {
  return <span
    aria-hidden="true"
    className={cn(
      "luxury-loader-ring inline-block size-4 shrink-0 rounded-full",
      tone === "gold" && "text-gold",
      tone === "ivory" && "text-ivory",
      className
    )}
  />;
}
