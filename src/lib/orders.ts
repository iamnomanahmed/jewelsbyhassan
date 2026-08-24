import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { addresses, assets, customers, orderItems, orders, paymentProofs, products, productVariants } from "@/db/schema";
import type { z } from "zod";
import type { checkoutSchema } from "./validation";
import type { uploadToR2 } from "./r2/upload";
import { getR2ObjectUrl } from "./r2/url";
import { normalizePakistanWhatsAppNumber } from "./whatsapp";

type Checkout = z.infer<typeof checkoutSchema>;
type Proof = Awaited<ReturnType<typeof uploadToR2>> | null;

export async function createOrder(input: Checkout, deliveryConfig: { fee: number; freeThreshold: number }, proof: Proof) {
  const db = getDb();
  const uniqueProductIds = [...new Set(input.items.map((item) => item.productId))];
  const uniqueVariantIds = [...new Set(input.items.map((item) => item.variantId).filter(Boolean))] as string[];
  const [productRows, variantRows, imageRows] = await Promise.all([
    db.select().from(products).where(and(inArray(products.id, uniqueProductIds), eq(products.status, "PUBLISHED"))),
    uniqueVariantIds.length ? db.select().from(productVariants).where(inArray(productVariants.id, uniqueVariantIds)) : Promise.resolve([]),
    db.select().from(assets).where(and(eq(assets.ownerType, "PRODUCT"), inArray(assets.ownerId, uniqueProductIds), eq(assets.primary, true)))
  ]);

  const authoritative = input.items.map((item) => {
    const product = productRows.find((row) => row.id === item.productId);
    if (!product) throw new Error("A product in your bag is no longer available");
    const variant = item.variantId ? variantRows.find((row) => row.id === item.variantId && row.productId === product.id) : null;
    if (item.variantId && !variant) throw new Error(`${product.name}: the selected option is unavailable`);
    const availableStock = variant?.stock ?? product.stock;
    if (availableStock < item.quantity) throw new Error(`${product.name}: only ${availableStock} available`);
    const unitPrice = variant?.salePrice ?? variant?.price ?? product.salePrice ?? product.price;
    const variantLabel = [variant?.size && `Size ${variant.size}`, variant?.color].filter(Boolean).join(" · ") || null;
    return { input: item, product, variant, unitPrice, variantLabel, imageUrl: imageRows.find((row) => row.ownerId === product.id)?.url ?? null };
  });
  const subtotal = authoritative.reduce((sum, item) => sum + item.unitPrice * item.input.quantity, 0);
  const deliveryFee = deliveryConfig.freeThreshold > 0 && subtotal >= deliveryConfig.freeThreshold ? 0 : deliveryConfig.fee;
  const total = subtotal + deliveryFee;

  const result = await db.transaction(async (tx) => {
    const normalizedWhatsApp = normalizePakistanWhatsAppNumber(input.customer.whatsapp);
    const [existing] = await tx.select().from(customers).where(eq(customers.phone, input.customer.phone)).limit(1);
    let customer;
    if (existing) {
      [customer] = await tx.update(customers).set({ fullName: input.customer.fullName, whatsapp: normalizedWhatsApp, email: input.customer.email || null, orderCount: sql`${customers.orderCount} + 1`, totalSpent: sql`${customers.totalSpent} + ${total}`, updatedAt: new Date() }).where(eq(customers.id, existing.id)).returning();
    } else {
      [customer] = await tx.insert(customers).values({ fullName: input.customer.fullName, phone: input.customer.phone, whatsapp: normalizedWhatsApp, email: input.customer.email || null, orderCount: 1, totalSpent: total }).returning();
    }
    await tx.insert(addresses).values({ customerId: customer.id, address: input.customer.address, area: input.customer.area, city: input.customer.city, postalCode: input.customer.postalCode || null });
    const [order] = await tx.insert(orders).values({
      orderNumber: `TMP-${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`, customerId: customer.id,
      addressSnapshot: { address: input.customer.address, area: input.customer.area, city: input.customer.city, postalCode: input.customer.postalCode || undefined },
      notes: input.customer.notes || null, subtotal, deliveryFee, total,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "EASYPAISA" ? "PENDING_VERIFICATION" : "UNPAID"
    }).returning();
    const orderNumber = `HJ-${order.sequence}`;
    await tx.update(orders).set({ orderNumber }).where(eq(orders.id, order.id));

    for (const item of authoritative) {
      const [stockedProduct] = await tx.update(products).set({ stock: sql`${products.stock} - ${item.input.quantity}`, updatedAt: new Date() }).where(and(eq(products.id, item.product.id), gte(products.stock, item.input.quantity))).returning({ id: products.id });
      if (!stockedProduct) throw new Error(`${item.product.name}: stock changed while checking out`);
      if (item.variant) {
        const [stockedVariant] = await tx.update(productVariants).set({ stock: sql`${productVariants.stock} - ${item.input.quantity}`, updatedAt: new Date() }).where(and(eq(productVariants.id, item.variant.id), gte(productVariants.stock, item.input.quantity))).returning({ id: productVariants.id });
        if (!stockedVariant) throw new Error(`${item.product.name}: selected option just sold out`);
      }
      await tx.insert(orderItems).values({ orderId: order.id, productId: item.product.id, variantId: item.variant?.id ?? null, productName: item.product.name, sku: item.variant?.sku ?? item.product.sku, variantLabel: item.variantLabel, imageUrl: item.imageUrl, quantity: item.input.quantity, unitPrice: item.unitPrice, totalPrice: item.unitPrice * item.input.quantity });
    }
    if (proof) await tx.insert(paymentProofs).values({ orderId: order.id, ...proof, url: `private:${proof.storageKey}` });
    return { id: order.id, orderNumber, customer, subtotal, deliveryFee, total, proofUrl: proof?.url ?? null, items: authoritative.map((item) => ({ productName: item.product.name, variantLabel: item.variantLabel, quantity: item.input.quantity, unitPrice: item.unitPrice })) };
  });
  return result;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = getDb();
  const [order] = await db.select({ order: orders, customer: customers }).from(orders).innerJoin(customers, eq(customers.id, orders.customerId)).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!order) return null;
  const [items, proof] = await Promise.all([db.select().from(orderItems).where(eq(orderItems.orderId, order.order.id)), db.select().from(paymentProofs).where(eq(paymentProofs.orderId, order.order.id)).limit(1)]);
  const secureProof = proof[0] ? { ...proof[0], url: await getR2ObjectUrl(proof[0].storageKey, 60 * 60) } : null;
  return { ...order, items, proof: secureProof };
}
