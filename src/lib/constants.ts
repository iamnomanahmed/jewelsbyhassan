import type { StoreSettingsShape } from "@/db/schema";

export const DEFAULT_SETTINGS: StoreSettingsShape = {
  storeName: "Hassan Jewels",
  email: "hello@hassanjewels.com",
  phone: "+92 300 1234567",
  address: "Lahore, Pakistan",
  announcement: "Complimentary delivery on orders over Rs. 15,000",
  logoUrl: "/brand/hassan-jewels-logo.webp",
  faviconUrl: "/brand/hassan-jewels-icon.png",
  colors: {
    primary: "#071C16",
    secondary: "#123A2D",
    gold: "#C89B3C",
    ivory: "#F8F5EE"
  },
  whatsapp: {
    number: process.env.WHATSAPP_NUMBER ?? "923001234567",
    displayNumber: "+92 300 1234567",
    productTemplate: "Assalam-o-Alaikum Hassan Jewels,\n\nI am interested in:\n\n{{productName}}\n\nPrice: {{price}}\nSelected Size: {{size}}\nSelected Color: {{color}}\n\n{{productUrl}}",
    orderTemplate: "Assalam-o-Alaikum Hassan Jewels,\n\nI would like to place an order.\n\n{{orderDetails}}",
    customerTemplate: "Assalam-o-Alaikum {{customerName}},\n\nThis is Hassan Jewels regarding your order {{orderNumber}}.\n\nPlease let us know if you need any assistance.\n\nThank you,\nHassan Jewels",
    paymentVerifiedTemplate: "Assalam-o-Alaikum {{customerName}},\n\nYour Easypaisa payment for Hassan Jewels order {{orderNumber}} has been verified successfully. ✨\n\nAmount: {{total}}\n\nThank you. Your order can now be confirmed.\n\nHassan Jewels",
    paymentIssueTemplate: "Assalam-o-Alaikum {{customerName}},\n\nWe were unable to verify the Easypaisa payment proof for your Hassan Jewels order {{orderNumber}}.\n\nPlease contact us or send a clearer payment screenshot so we can continue with your order.\n\nThank you,\nHassan Jewels",
    confirmationTemplate: "Assalam-o-Alaikum {{customerName}},\n\nYour Hassan Jewels order {{orderNumber}} has been confirmed. ✨\n\nOrder Total: {{total}}\n\nThank you for choosing Hassan Jewels.\n\nWe will contact you if any further information is required.\n\nHassan Jewels",
    cancellationTemplate: "Assalam-o-Alaikum {{customerName}},\n\nYour Hassan Jewels order {{orderNumber}} has been cancelled.\n\nIf you believe this is a mistake or would like assistance placing another order, please contact us.\n\nThank you,\nHassan Jewels",
    reviewTemplate: "Assalam-o-Alaikum {{customerName}},\n\nThank you for choosing Hassan Jewels. ✨\n\nYour order {{orderNumber}} has been completed.\n\nWe hope you love your jewelry.\n\nWe would really appreciate it if you could share your experience with us:\n\n{{reviewLink}}\n\nYour feedback helps us serve you better.\n\nThank you,\nHassan Jewels"
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

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export const PAYMENT_STATUSES = ["UNPAID", "PENDING_VERIFICATION", "VERIFIED", "REJECTED", "PAY_ON_DELIVERY", "PAID", "REFUNDED"] as const;
export const REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED", "HIDDEN"] as const;
