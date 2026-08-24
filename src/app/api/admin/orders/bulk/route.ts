import { NextRequest, NextResponse } from "next/server";
import { count, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { customers, orders, paymentProofs, reviewInvitations, reviews } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2/delete";

const deleteOrdersSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(1000)
});

class OrderSelectionChangedError extends Error {}

export async function DELETE(request: NextRequest) {
  if (!await getAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = deleteOrdersSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Select between 1 and 1,000 valid orders to delete." }, { status: 400 });

  const ids = [...new Set(parsed.data.ids)];
  const db = getDb();

  try {
    const deletedData = await db.transaction(async (tx) => {
      const selectedOrders = await tx.select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerId: orders.customerId
      }).from(orders).where(inArray(orders.id, ids));

      if (selectedOrders.length !== ids.length) {
        throw new OrderSelectionChangedError("One or more selected orders no longer exist. Refresh and select them again.");
      }

      const proofRows = await tx.select({ storageKey: paymentProofs.storageKey })
        .from(paymentProofs).where(inArray(paymentProofs.orderId, ids));
      const reviewRows = await tx.select({ imageStorageKey: reviews.imageStorageKey })
        .from(reviews).where(inArray(reviews.orderId, ids));

      await tx.delete(reviews).where(inArray(reviews.orderId, ids));
      await tx.delete(reviewInvitations).where(inArray(reviewInvitations.orderId, ids));
      await tx.delete(paymentProofs).where(inArray(paymentProofs.orderId, ids));
      const deletedOrders = await tx.delete(orders).where(inArray(orders.id, ids)).returning({ id: orders.id });

      if (deletedOrders.length !== ids.length) {
        throw new OrderSelectionChangedError("The selected orders changed during deletion. No partial deletion was kept.");
      }

      const customerIds = [...new Set(selectedOrders.map((order) => order.customerId))];
      for (const customerId of customerIds) {
        const [totals] = await tx.select({
          orderCount: count(),
          totalSpent: sql<number>`coalesce(sum(${orders.total}), 0)::int`
        }).from(orders).where(eq(orders.customerId, customerId));

        await tx.update(customers).set({
          orderCount: totals?.orderCount ?? 0,
          totalSpent: totals?.totalSpent ?? 0,
          updatedAt: new Date()
        }).where(eq(customers.id, customerId));
      }

      return {
        deletedIds: deletedOrders.map((order) => order.id),
        orderNumbers: selectedOrders.map((order) => order.orderNumber),
        storageKeys: [
          ...proofRows.map((row) => row.storageKey),
          ...reviewRows.map((row) => row.imageStorageKey).filter((key): key is string => Boolean(key))
        ]
      };
    });

    let fileCleanupFailed = 0;
    for (const storageKey of [...new Set(deletedData.storageKeys)]) {
      try {
        await deleteFromR2(storageKey);
      } catch {
        fileCleanupFailed += 1;
      }
    }

    return NextResponse.json({
      deleted: deletedData.deletedIds.length,
      deletedIds: deletedData.deletedIds,
      orderNumbers: deletedData.orderNumbers,
      fileCleanupFailed
    });
  } catch (error) {
    if (error instanceof OrderSelectionChangedError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete the selected orders." }, { status: 500 });
  }
}
