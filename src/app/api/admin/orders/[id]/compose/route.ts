import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { customers, orders } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { ensureReviewInvitation } from "@/lib/reviews";
import { getSettings } from "@/lib/settings";
import {
  generateCancellationWhatsAppMessage,
  generateCompletedOrderWhatsAppMessage,
  generateConfirmationWhatsAppMessage,
  generateCustomerWhatsAppMessage,
  generatePaymentIssueWhatsAppMessage,
  generatePaymentVerifiedWhatsAppMessage,
  generateWhatsAppUrl
} from "@/lib/whatsapp";

const schema = z.object({
  type: z.enum(["customer", "payment_verified", "payment_issue", "confirmation", "completed", "cancellation"])
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid message type" }, { status: 400 });

  const db = getDb();
  const [record] = await db.select({ order: orders, customer: customers }).from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId)).where(eq(orders.id, id)).limit(1);
  if (!record) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const settings = await getSettings();
  const values = {
    customerName: record.customer.fullName,
    orderNumber: record.order.orderNumber,
    total: record.order.total,
    paymentMethod: record.order.paymentMethod
  };
  let message = "";
  let reviewUrl: string | undefined;

  switch (parsed.data.type) {
    case "customer":
      message = generateCustomerWhatsAppMessage(settings.whatsapp.customerTemplate, values);
      break;
    case "payment_verified":
      if (record.order.paymentMethod !== "EASYPAISA" || record.order.paymentStatus !== "VERIFIED") {
        return NextResponse.json({ error: "Verify this Easypaisa payment first." }, { status: 409 });
      }
      message = generatePaymentVerifiedWhatsAppMessage(settings.whatsapp.paymentVerifiedTemplate, values);
      break;
    case "payment_issue":
      if (record.order.paymentMethod !== "EASYPAISA" || record.order.paymentStatus !== "REJECTED") {
        return NextResponse.json({ error: "Reject the payment proof first." }, { status: 409 });
      }
      message = generatePaymentIssueWhatsAppMessage(settings.whatsapp.paymentIssueTemplate, values);
      break;
    case "confirmation":
      if (record.order.status !== "CONFIRMED") {
        return NextResponse.json({ error: "Confirm the order first." }, { status: 409 });
      }
      message = generateConfirmationWhatsAppMessage(settings.whatsapp.confirmationTemplate, values);
      await db.update(orders).set({ confirmationOpenedAt: new Date(), updatedAt: new Date() }).where(eq(orders.id, id));
      break;
    case "completed": {
      if (record.order.status !== "COMPLETED") {
        return NextResponse.json({ error: "Complete the order first." }, { status: 409 });
      }
      const invitation = await ensureReviewInvitation(id, settings.reviews.expiryDays);
      reviewUrl = invitation.reviewUrl;
      message = generateCompletedOrderWhatsAppMessage(settings.whatsapp.reviewTemplate, {
        customerName: record.customer.fullName,
        orderNumber: record.order.orderNumber,
        reviewLink: reviewUrl
      });
      await db.update(orders).set({ reviewRequestOpenedAt: new Date(), updatedAt: new Date() }).where(eq(orders.id, id));
      break;
    }
    case "cancellation":
      if (record.order.status !== "CANCELLED") {
        return NextResponse.json({ error: "Cancel the order first." }, { status: 409 });
      }
      message = generateCancellationWhatsAppMessage(settings.whatsapp.cancellationTemplate, values);
      break;
  }

  return NextResponse.json({ url: generateWhatsAppUrl(record.customer.whatsapp, message), reviewUrl });
}
