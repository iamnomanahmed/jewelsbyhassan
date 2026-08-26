import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const productStatus = pgEnum("product_status", ["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const orderStatus = pgEnum("order_status", ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]);
export const paymentMethod = pgEnum("payment_method", ["COD", "EASYPAISA"]);
export const paymentStatus = pgEnum("payment_status", ["UNPAID", "PENDING_VERIFICATION", "VERIFIED", "REJECTED", "PAY_ON_DELIVERY", "PAID", "REFUNDED"]);
export const reviewStatus = pgEnum("review_status", ["PENDING", "APPROVED", "REJECTED", "HIDDEN"]);
export const assetOwner = pgEnum("asset_owner", ["BRANDING", "PRODUCT", "VARIANT", "CATEGORY", "COLLECTION", "PAYMENT", "REVIEW"]);

const audit = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
};

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  active: boolean("active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...audit
}, (table) => [uniqueIndex("admin_email_idx").on(table.email)]);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  storageKey: text("storage_key"),
  featured: boolean("featured").default(false).notNull(),
  ...audit
}, (table) => [uniqueIndex("category_slug_idx").on(table.slug)]);

export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  storageKey: text("storage_key"),
  featured: boolean("featured").default(false).notNull(),
  ...audit
}, (table) => [uniqueIndex("collection_slug_idx").on(table.slug)]);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull(),
  sku: varchar("sku", { length: 80 }).notNull(),
  shortDescription: text("short_description"),
  description: text("description").notNull(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  collectionId: uuid("collection_id").references(() => collections.id, { onDelete: "set null" }),
  price: integer("price").notNull(),
  salePrice: integer("sale_price"),
  costPrice: integer("cost_price"),
  stock: integer("stock").default(0).notNull(),
  material: varchar("material", { length: 120 }),
  weight: varchar("weight", { length: 80 }),
  status: productStatus("status").default("DRAFT").notNull(),
  featured: boolean("featured").default(false).notNull(),
  newArrival: boolean("new_arrival").default(false).notNull(),
  bestseller: boolean("bestseller").default(false).notNull(),
  limited: boolean("limited").default(false).notNull(),
  seoTitle: varchar("seo_title", { length: 180 }),
  seoDescription: varchar("seo_description", { length: 320 }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  ...audit
}, (table) => [
  uniqueIndex("product_slug_idx").on(table.slug),
  uniqueIndex("product_sku_idx").on(table.sku),
  index("product_status_created_idx").on(table.status, table.createdAt),
  index("product_status_category_idx").on(table.status, table.categoryId),
  index("product_status_collection_idx").on(table.status, table.collectionId)
]);

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerType: assetOwner("owner_type").notNull(),
  ownerId: uuid("owner_id").notNull(),
  storageKey: text("storage_key").notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  alt: varchar("alt", { length: 240 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  primary: boolean("primary").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("asset_owner_primary_idx").on(table.ownerType, table.ownerId, table.primary, table.sortOrder), index("asset_storage_idx").on(table.storageKey)]);

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 80 }).notNull(),
  size: varchar("size", { length: 40 }),
  color: varchar("color", { length: 60 }),
  price: integer("price"),
  salePrice: integer("sale_price"),
  stock: integer("stock").default(0).notNull(),
  imageUrl: text("image_url"),
  storageKey: text("storage_key"),
  ...audit
}, (table) => [uniqueIndex("variant_sku_idx").on(table.sku), index("variant_product_idx").on(table.productId)]);

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 40 }).notNull(),
  email: varchar("email", { length: 255 }),
  orderCount: integer("order_count").default(0).notNull(),
  totalSpent: integer("total_spent").default(0).notNull(),
  ...audit
}, (table) => [index("customer_phone_idx").on(table.phone), index("customer_total_spent_idx").on(table.totalSpent)]);

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  address: text("address").notNull(),
  area: varchar("area", { length: 120 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  postalCode: varchar("postal_code", { length: 30 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  sequence: integer("sequence").generatedAlwaysAsIdentity({ startWith: 100001 }).notNull(),
  orderNumber: varchar("order_number", { length: 24 }).notNull(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "restrict" }),
  addressSnapshot: jsonb("address_snapshot").$type<{ address: string; area: string; city: string; postalCode?: string }>().notNull(),
  notes: text("notes"),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  discount: integer("discount").default(0).notNull(),
  total: integer("total").notNull(),
  status: orderStatus("status").default("PENDING").notNull(),
  paymentMethod: paymentMethod("payment_method").notNull(),
  paymentStatus: paymentStatus("payment_status").default("UNPAID").notNull(),
  paymentVerifiedAt: timestamp("payment_verified_at", { withTimezone: true }),
  paymentVerifiedBy: uuid("payment_verified_by").references(() => adminUsers.id, { onDelete: "set null" }),
  paymentRejectedAt: timestamp("payment_rejected_at", { withTimezone: true }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  confirmationOpenedAt: timestamp("confirmation_opened_at", { withTimezone: true }),
  reviewRequestOpenedAt: timestamp("review_request_opened_at", { withTimezone: true }),
  ...audit
}, (table) => [uniqueIndex("order_number_idx").on(table.orderNumber), index("order_created_idx").on(table.createdAt), index("order_status_created_idx").on(table.status, table.createdAt)]);

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 180 }).notNull(),
  sku: varchar("sku", { length: 80 }).notNull(),
  variantLabel: varchar("variant_label", { length: 140 }),
  size: varchar("size", { length: 40 }),
  color: varchar("color", { length: 60 }),
  imageUrl: text("image_url"),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  totalPrice: integer("total_price").notNull()
}, (table) => [index("order_item_order_idx").on(table.orderId)]);

export const orderEvents = pgTable("order_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 80 }).notNull(),
  fromStatus: varchar("from_status", { length: 40 }),
  toStatus: varchar("to_status", { length: 40 }),
  adminUserId: uuid("admin_user_id").references(() => adminUsers.id, { onDelete: "set null" }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("order_event_order_idx").on(table.orderId, table.createdAt)]);

export const paymentProofs = pgTable("payment_proofs", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  storageKey: text("storage_key").notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [uniqueIndex("proof_order_idx").on(table.orderId)]);

export const reviewInvitations = pgTable("review_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 128 }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [uniqueIndex("review_token_hash_idx").on(table.tokenHash), uniqueIndex("review_invite_order_idx").on(table.orderId)]);

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  invitationId: uuid("invitation_id").notNull().references(() => reviewInvitations.id, { onDelete: "restrict" }),
  rating: integer("rating").notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  title: varchar("title", { length: 140 }),
  body: text("body").notNull(),
  imageUrl: text("image_url"),
  imageStorageKey: text("image_storage_key"),
  status: reviewStatus("status").default("PENDING").notNull(),
  featured: boolean("featured").default(false).notNull(),
  ...audit
}, (table) => [uniqueIndex("review_invitation_idx").on(table.invitationId), index("review_status_featured_created_idx").on(table.status, table.featured, table.createdAt), index("review_created_idx").on(table.createdAt)]);

export type StoreSettingsShape = {
  storeName: string;
  email: string;
  phone: string;
  address: string;
  announcement: string;
  logoUrl: string;
  faviconUrl: string;
  colors: { primary: string; secondary: string; gold: string; ivory: string };
  whatsapp: {
    number: string;
    displayNumber: string;
    productTemplate: string;
    orderTemplate: string;
    customerTemplate: string;
    paymentVerifiedTemplate: string;
    paymentIssueTemplate: string;
    confirmationTemplate: string;
    cancellationTemplate: string;
    reviewTemplate: string;
  };
  easypaisa: { enabled: boolean; accountTitle: string; number: string; instructions: string };
  delivery: { fee: number; freeThreshold: number; message: string };
  reviews: { enabled: boolean; expiryDays: number; moderation: boolean };
  social: { instagram: string; facebook: string; tiktok: string };
};

export const storeSettings = pgTable("store_settings", {
  id: varchar("id", { length: 32 }).primaryKey().default("main"),
  data: jsonb("data").$type<StoreSettingsShape>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [uniqueIndex("newsletter_email_idx").on(table.email)]);

export const contactInquiries = pgTable("contact_inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  subject: varchar("subject", { length: 180 }).notNull(),
  message: text("message").notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
