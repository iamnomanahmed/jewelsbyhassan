import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { orderEvents, orders, paymentProofs } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/constants";
import { ensureReviewInvitation } from "@/lib/reviews";
import { getSettings } from "@/lib/settings";

const updateSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(["VERIFIED", "REJECTED"]).optional()
}).refine((value) => Number(Boolean(value.status)) + Number(Boolean(value.paymentStatus)) === 1, {
  message: "Update either the order status or payment status."
});

type OrderStatus = typeof ORDER_STATUSES[number];
const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: []
};

const eventType: Record<Exclude<OrderStatus, "PENDING">, string> = {
  CONFIRMED: "ORDER_CONFIRMED",
  COMPLETED: "ORDER_COMPLETED",
  CANCELLED: "ORDER_CANCELLED"
};

class ConcurrentOrderUpdateError extends Error {}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update" }, { status: 400 });

  const db = getDb();
  const [current] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  try {
    if (parsed.data.status) {
      const target = parsed.data.status;
      let order = current;

      if (target !== current.status) {
        if (!transitions[current.status].includes(target)) {
          return NextResponse.json({ error: `Cannot move an order from ${current.status} to ${target}.` }, { status: 409 });
        }
        if (target === "CONFIRMED" && current.paymentMethod === "EASYPAISA" && current.paymentStatus !== "VERIFIED") {
          return NextResponse.json({ error: "Verify the Easypaisa payment before confirming this order." }, { status: 409 });
        }

        const now = new Date();
        order = await db.transaction(async (tx) => {
          const timestamps = target === "CONFIRMED" ? { confirmedAt: now }
            : target === "COMPLETED" ? { completedAt: now }
              : target === "CANCELLED" ? { cancelledAt: now }
                : {};
          const [updated] = await tx.update(orders).set({ status: target, ...timestamps, updatedAt: now })
            .where(and(eq(orders.id, id), eq(orders.status, current.status))).returning();
          if (!updated) throw new ConcurrentOrderUpdateError();
          await tx.insert(orderEvents).values({
            orderId: id,
            type: eventType[target as Exclude<OrderStatus, "PENDING">],
            fromStatus: current.status,
            toStatus: target,
            adminUserId: admin.id
          });
          return updated;
        });
      }

      let reviewUrl: string | undefined;
      if (target === "COMPLETED") {
        const settings = await getSettings();
        reviewUrl = (await ensureReviewInvitation(id, settings.reviews.expiryDays)).reviewUrl;
      }
      return NextResponse.json({ order, reviewUrl });
    }

    const target = parsed.data.paymentStatus!;
    if (current.paymentMethod !== "EASYPAISA") {
      return NextResponse.json({ error: "Only Easypaisa payments require manual verification." }, { status: 409 });
    }
    if (target === current.paymentStatus) return NextResponse.json({ order: current });
    if (target === "REJECTED" && current.paymentStatus !== "PENDING_VERIFICATION") {
      return NextResponse.json({ error: "Only a payment pending verification can be rejected." }, { status: 409 });
    }
    if (target === "VERIFIED" && !["PENDING_VERIFICATION", "REJECTED"].includes(current.paymentStatus)) {
      return NextResponse.json({ error: "This payment cannot be verified from its current state." }, { status: 409 });
    }
    const [proof] = await db.select({ id: paymentProofs.id }).from(paymentProofs).where(eq(paymentProofs.orderId, id)).limit(1);
    if (!proof) return NextResponse.json({ error: "No payment screenshot is attached to this order." }, { status: 409 });

    const now = new Date();
    const order = await db.transaction(async (tx) => {
      const verification = target === "VERIFIED"
        ? { paymentVerifiedAt: now, paymentVerifiedBy: admin.id, paymentRejectedAt: null }
        : { paymentRejectedAt: now, paymentVerifiedAt: null, paymentVerifiedBy: null };
      const [updated] = await tx.update(orders).set({ paymentStatus: target, ...verification, updatedAt: now })
        .where(and(eq(orders.id, id), eq(orders.paymentStatus, current.paymentStatus))).returning();
      if (!updated) throw new ConcurrentOrderUpdateError();
      await tx.insert(orderEvents).values({
        orderId: id,
        type: target === "VERIFIED" ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
        fromStatus: current.paymentStatus,
        toStatus: target,
        adminUserId: admin.id
      });
      return updated;
    });
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof ConcurrentOrderUpdateError) {
      const [latest] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
      if (parsed.data.status && latest?.status === parsed.data.status) {
        const reviewUrl = latest.status === "COMPLETED"
          ? (await ensureReviewInvitation(id, (await getSettings()).reviews.expiryDays)).reviewUrl
          : undefined;
        return NextResponse.json({ order: latest, reviewUrl });
      }
      if (parsed.data.paymentStatus && latest?.paymentStatus === parsed.data.paymentStatus) {
        return NextResponse.json({ order: latest });
      }
      return NextResponse.json({ error: "This order changed in another session. Refresh and try again." }, { status: 409 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update the order." }, { status: 500 });
  }
}
