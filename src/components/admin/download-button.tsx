"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { cn } from "@/lib/utils";

function filenameFrom(response: Response, fallback: string) {
  const disposition = response.headers.get("content-disposition") ?? "";
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plain = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  return decodeURIComponent(encoded ?? plain ?? fallback);
}

export function DownloadButton({ href, label, loadingLabel = "Exporting Excel…", filename = "hassan-jewels-export.xlsx", className }: { href: string; label: string; loadingLabel?: string; filename?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const download = async () => {
    if (state === "loading") return;
    setState("loading");
    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error("Export failed");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filenameFrom(response, filename);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setState("idle");
    } catch {
      setState("error");
    }
  };

  return <button type="button" onClick={() => void download()} disabled={state === "loading"} aria-busy={state === "loading" || undefined} className={cn("cursor-pointer disabled:cursor-wait", state === "error" && "!border-red-300 !text-red-700", className)}>
    {state === "loading" ? <LoadingIndicator tone="gold" /> : <Download aria-hidden="true" className="size-4"/>}
    <span>{state === "loading" ? loadingLabel : state === "error" ? "Export failed — retry" : label}</span>
  </button>;
}
