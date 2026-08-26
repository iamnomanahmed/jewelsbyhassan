CREATE TABLE "order_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"type" varchar(80) NOT NULL,
	"from_status" varchar(40),
	"to_status" varchar(40),
	"admin_user_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING'::text;--> statement-breakpoint
UPDATE "orders" SET "status" = 'CONFIRMED' WHERE "status" IN ('PROCESSING', 'SHIPPED');--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DEFAULT 'UNPAID'::text;--> statement-breakpoint
UPDATE "orders" SET "payment_status" = 'PAY_ON_DELIVERY' WHERE "payment_method" = 'COD' AND "payment_status" = 'UNPAID';--> statement-breakpoint
DROP TYPE "public"."payment_status";--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('UNPAID', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'PAY_ON_DELIVERY', 'PAID', 'REFUNDED');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DEFAULT 'UNPAID'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DATA TYPE "public"."payment_status" USING "payment_status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "size" varchar(40);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "color" varchar(60);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_verified_by" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_rejected_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "review_invitations" ADD COLUMN "token" varchar(128);--> statement-breakpoint
UPDATE "order_items" SET
	"size" = CASE
		WHEN "variant_label" LIKE 'Size % · %' THEN split_part(split_part("variant_label", ' · ', 1), 'Size ', 2)
		WHEN "variant_label" LIKE 'Size %' THEN substring("variant_label" from 6)
		ELSE NULL
	END,
	"color" = CASE WHEN "variant_label" LIKE '% · %' THEN split_part("variant_label", ' · ', 2) ELSE NULL END
WHERE "variant_label" IS NOT NULL;--> statement-breakpoint
UPDATE "orders" SET "payment_verified_at" = "updated_at" WHERE "payment_status" = 'VERIFIED' AND "payment_verified_at" IS NULL;--> statement-breakpoint
UPDATE "orders" SET "payment_rejected_at" = "updated_at" WHERE "payment_status" = 'REJECTED' AND "payment_rejected_at" IS NULL;--> statement-breakpoint
INSERT INTO "order_events" ("order_id", "type", "to_status", "created_at")
SELECT "id", 'ORDER_CREATED', 'PENDING', "created_at" FROM "orders";--> statement-breakpoint
INSERT INTO "order_events" ("order_id", "type", "from_status", "to_status", "created_at")
SELECT "id", 'PAYMENT_VERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', COALESCE("payment_verified_at", "updated_at") FROM "orders" WHERE "payment_status" = 'VERIFIED';--> statement-breakpoint
INSERT INTO "order_events" ("order_id", "type", "from_status", "to_status", "created_at")
SELECT "id", 'PAYMENT_REJECTED', 'PENDING_VERIFICATION', 'REJECTED', COALESCE("payment_rejected_at", "updated_at") FROM "orders" WHERE "payment_status" = 'REJECTED';--> statement-breakpoint
INSERT INTO "order_events" ("order_id", "type", "from_status", "to_status", "created_at")
SELECT "id", 'ORDER_CONFIRMED', 'PENDING', 'CONFIRMED', COALESCE("confirmed_at", "updated_at") FROM "orders" WHERE "status" IN ('CONFIRMED', 'COMPLETED');--> statement-breakpoint
INSERT INTO "order_events" ("order_id", "type", "from_status", "to_status", "created_at")
SELECT "id", 'ORDER_COMPLETED', 'CONFIRMED', 'COMPLETED', COALESCE("completed_at", "updated_at") FROM "orders" WHERE "status" = 'COMPLETED';--> statement-breakpoint
INSERT INTO "order_events" ("order_id", "type", "from_status", "to_status", "created_at")
SELECT "id", 'ORDER_CANCELLED', NULL, 'CANCELLED', COALESCE("cancelled_at", "updated_at") FROM "orders" WHERE "status" = 'CANCELLED';--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_event_order_idx" ON "order_events" USING btree ("order_id","created_at");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_verified_by_admin_users_id_fk" FOREIGN KEY ("payment_verified_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;
