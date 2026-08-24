import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { getSettings } from "@/lib/settings";
import { uploadToR2 } from "@/lib/r2/upload";
import { deleteFromR2 } from "@/lib/r2/delete";
import { createOrder } from "@/lib/orders";
import { generateOrderWhatsAppMessage, generateWhatsAppUrl } from "@/lib/whatsapp";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const limit = rateLimit(`checkout:${ip}`, 5, 10 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: `Too many attempts. Try again in ${limit.retryAfter} seconds.` }, { status: 429 });
  let proof: Awaited<ReturnType<typeof uploadToR2>> | null = null;
  try {
    const form = await request.formData();
    const raw = JSON.parse(String(form.get("payload") ?? "null"));
    const parsed = checkoutSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your checkout details" }, { status: 400 });
    const settings = await getSettings();
    if (parsed.data.paymentMethod === "EASYPAISA" && !settings.easypaisa.enabled) return NextResponse.json({ error: "Easypaisa is currently unavailable" }, { status: 400 });
    const file = form.get("proof");
    if (parsed.data.paymentMethod === "EASYPAISA") {
      if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "An Easypaisa payment screenshot is required" }, { status: 400 });
      proof = await uploadToR2(file, "payments", `checkout-${crypto.randomUUID()}`);
    }
    const order = await createOrder(parsed.data, settings.delivery, proof);
    const message = generateOrderWhatsAppMessage(settings.whatsapp.orderTemplate, { orderNumber: order.orderNumber, customerName: order.customer.fullName, phone: order.customer.phone, city: parsed.data.customer.city, address: parsed.data.customer.address, subtotal: order.subtotal, deliveryFee: order.deliveryFee, total: order.total, paymentMethod: parsed.data.paymentMethod, proofUrl: order.proofUrl, items: order.items });
    return NextResponse.json({ orderNumber: order.orderNumber, whatsappUrl: generateWhatsAppUrl(settings.whatsapp.number, message) }, { status: 201 });
  } catch (error) {
    if (proof) await deleteFromR2(proof.storageKey).catch(() => undefined);
    const message = error instanceof Error ? error.message : "Could not create your order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
