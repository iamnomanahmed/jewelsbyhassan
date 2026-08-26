import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

const LUXURY_BLUR = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='50'%3E%3Crect width='100%25' height='100%25' fill='%23e8e4da'/%3E%3C/svg%3E";

export function LuxuryImage({ alt, className, placeholder = "blur", blurDataURL = LUXURY_BLUR, quality = 82, ...props }: ImageProps) {
  return <Image
    {...props}
    alt={alt}
    placeholder={placeholder}
    blurDataURL={blurDataURL}
    quality={quality}
    className={cn("luxury-image", className)}
  />;
}
