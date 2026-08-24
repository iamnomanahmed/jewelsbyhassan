import type { StoreSettingsShape } from "@/db/schema";

export const DEFAULT_SETTINGS: StoreSettingsShape = {
  storeName: "Hassan Jewels",
  email: "hello@hassanjewels.com",
  phone: "+92 300 1234567",
  address: "Lahore, Pakistan",
  announcement: "Complimentary delivery on orders over Rs. 15,000",
  logoUrl: "/brand/hassan-jewels-logo.png",
  faviconUrl: "/brand/hassan-jewels-logo.png",
  colors: {
    primary: "#071C16",
    secondary: "#123A2D",
    gold: "#C89B3C",
    ivory: "#F8F5EE"
  },
  whatsapp: {
    number: process.env.WHATSAPP_NUMBER ?? "923001234567",
    displayNumber: "+92 300 1234567",
    floatingEnabled: true,
    greeting: "Assalam-o-Alaikum Hassan Jewels,\n\nI would like some help regarding your jewelry collection.",
    productTemplate: "Assalam-o-Alaikum Hassan Jewels,\n\nI am interested in:\n\n{{productName}}\n\nPrice: {{price}}\nSelected Size: {{size}}\nSelected Color: {{color}}\n\n{{productUrl}}",
    orderTemplate: "Assalam-o-Alaikum Hassan Jewels,\n\nI would like to place an order.\n\n{{orderDetails}}",
    confirmationTemplate: "Assalam-o-Alaikum {{customerName}},\n\nYour Hassan Jewels order {{orderNumber}} has been confirmed. ✨\n\nOrder Total: {{total}}\n\nWe are now preparing your order.\n\nThank you for choosing Hassan Jewels.",
    reviewTemplate: "Assalam-o-Alaikum {{customerName}},\n\nThank you for choosing Hassan Jewels. ✨\n\nYour order {{orderNumber}} has been completed.\n\nWe hope you love your jewelry.\n\nWe would really appreciate your feedback:\n\n{{reviewLink}}\n\nYour feedback helps us serve you better.\n\nThank you,\nHassan Jewels"
  },
  easypaisa: {
    enabled: true,
    accountTitle: "Hassan Jewels",
    number: process.env.EASYPAISA_NUMBER ?? "03001234567",
    instructions: "Send the exact order total, then upload a clear screenshot showing the transaction."
  },
  delivery: {
    fee: 250,
    freeThreshold: 15000,
    message: "Secure delivery throughout Pakistan in 3–5 working days."
  },
  reviews: { enabled: true, expiryDays: 30, moderation: true },
  social: { instagram: "", facebook: "", tiktok: "" }
};

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"] as const;
export const PAYMENT_STATUSES = ["UNPAID", "PENDING_VERIFICATION", "VERIFIED", "REJECTED", "PAID", "REFUNDED"] as const;
export const REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED", "HIDDEN"] as const;

