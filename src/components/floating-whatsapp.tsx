import { MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import type { StoreSettingsShape } from "@/db/schema";

export function FloatingWhatsApp({ settings }: { settings: StoreSettingsShape["whatsapp"] }) {
  if (!settings.floatingEnabled) return null;
  let href = "#";
  try { href = generateWhatsAppUrl(settings.number, settings.greeting); } catch { return null; }
  return <a href={href} target="_blank" rel="noreferrer" aria-label="Chat with Hassan Jewels on WhatsApp" className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 flex size-14 items-center justify-center rounded-full border border-gold/50 bg-emerald-deep text-ivory shadow-2xl transition hover:-translate-y-1 hover:bg-emerald-rich focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"><MessageCircle className="size-6" aria-hidden="true" /></a>;
}

