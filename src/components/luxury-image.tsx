"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LUXURY_BLUR = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='50'%3E%3Crect width='100%25' height='100%25' fill='%23e8e4da'/%3E%3C/svg%3E";

export function LuxuryImage({ alt, className, onLoad, onError, placeholder = "blur", blurDataURL = LUXURY_BLUR, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (imageRef.current?.complete) setLoaded(true);
  }, []);
  return <Image
    {...props}
    ref={imageRef}
    alt={alt}
    placeholder={placeholder}
    blurDataURL={blurDataURL}
    data-loaded={loaded ? "true" : "false"}
    className={cn("luxury-image", className)}
    onLoad={(event) => { setLoaded(true); onLoad?.(event); }}
    onError={(event) => { setLoaded(true); onError?.(event); }}
  />;
}
