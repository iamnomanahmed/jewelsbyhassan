import { formatPrice } from "./utils";

export function normalizePakistanWhatsAppNumber(input: string) {
  const digits = input.replace(/\D/g, "");
  if (/^03\d{9}$/.test(digits)) return `92${digits.slice(1)}`;
  if (/^923\d{9}$/.test(digits)) return digits;
  throw new Error("Enter a valid Pakistan WhatsApp number, for example 03001234567");
}

export function generateWhatsAppUrl(number: string, message: string) {
  return `https://wa.me/${normalizePakistanWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`;
}

function template(source: string, values: Record<string, string>) {
  return source.replace(/{{(\w+)}}/g, (_, key: string) => values[key] ?? "—");
}

type AdminMessageValues = {
  customerName: string;
  orderNumber: string;
  total: number;
  paymentMethod: "COD" | "EASYPAISA";
  reviewLink?: string;
};

function adminMessage(source: string, values: AdminMessageValues) {
  return template(source, {
    customerName: values.customerName,
    orderNumber: values.orderNumber,
    total: formatPrice(values.total),
    paymentMethod: values.paymentMethod === "COD" ? "Cash on Delivery" : "Easypaisa",
    reviewLink: values.reviewLink ?? "—"
  });
}

export function generateProductInquiryMessage(
  source: string,
  product: { name: string; price: number; size?: string; color?: string; url: string }
) {
  return template(source, {
    productName: product.name,
    price: formatPrice(product.price),
    size: product.size || "Not selected",
    color: product.color || "Not selected",
    productUrl: product.url
  });
}

type MessageOrder = {
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "COD" | "EASYPAISA";
  proofUrl?: string | null;
  items: { productName: string; variantLabel?: string | null; quantity: number; unitPrice: number }[];
};

export function generateOrderWhatsAppMessage(source: string, order: MessageOrder) {
  const items = order.items.map((item) => [
    `${item.quantity}x ${item.productName}`,
    item.variantLabel ? `Variant: ${item.variantLabel}` : null,
    `Price: ${formatPrice(item.unitPrice * item.quantity)}`
  ].filter(Boolean).join("\n")).join("\n\n");

  const payment = order.paymentMethod === "COD"
    ? "Method: Cash on Delivery"
    : `Method: Easypaisa\nStatus: Pending Verification\nAmount Paid: ${formatPrice(order.total)}\n\nPayment Proof:\n${order.proofUrl ?? "Uploaded"}`;

  const details = `Order #: ${order.orderNumber}\n\nCUSTOMER DETAILS\n\nName: ${order.customerName}\nPhone: ${order.phone}\nCity: ${order.city}\nAddress: ${order.address}\n\nORDER\n\n${items}\n\nSubtotal: ${formatPrice(order.subtotal)}\nDelivery: ${formatPrice(order.deliveryFee)}\n\nTOTAL: ${formatPrice(order.total)}\n\nPAYMENT\n\n${payment}\n\nThank you.`;
  return template(source, { orderDetails: details });
}

export function generateConfirmationWhatsAppMessage(source: string, values: { customerName: string; orderNumber: string; total: number }) {
  return template(source, { ...values, total: formatPrice(values.total) });
}

export function generateCompletedOrderWhatsAppMessage(source: string, values: { customerName: string; orderNumber: string; reviewLink: string }) {
  return template(source, values);
}

export function generateCustomerWhatsAppMessage(source: string, values: AdminMessageValues) {
  return adminMessage(source, values);
}

export function generatePaymentVerifiedWhatsAppMessage(source: string, values: AdminMessageValues) {
  return adminMessage(source, values);
}

export function generatePaymentIssueWhatsAppMessage(source: string, values: AdminMessageValues) {
  return adminMessage(source, values);
}

export function generateCancellationWhatsAppMessage(source: string, values: AdminMessageValues) {
  return adminMessage(source, values);
}
