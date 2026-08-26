DROP INDEX "asset_owner_idx";--> statement-breakpoint
DROP INDEX "order_status_idx";--> statement-breakpoint
DROP INDEX "product_status_idx";--> statement-breakpoint
DROP INDEX "product_category_idx";--> statement-breakpoint
DROP INDEX "review_status_idx";--> statement-breakpoint
CREATE INDEX "asset_owner_primary_idx" ON "assets" USING btree ("owner_type","owner_id","primary","sort_order");--> statement-breakpoint
CREATE INDEX "customer_total_spent_idx" ON "customers" USING btree ("total_spent");--> statement-breakpoint
CREATE INDEX "order_created_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_status_created_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "product_status_created_idx" ON "products" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "product_status_category_idx" ON "products" USING btree ("status","category_id");--> statement-breakpoint
CREATE INDEX "product_status_collection_idx" ON "products" USING btree ("status","collection_id");--> statement-breakpoint
CREATE INDEX "review_status_featured_created_idx" ON "reviews" USING btree ("status","featured","created_at");--> statement-breakpoint
CREATE INDEX "review_created_idx" ON "reviews" USING btree ("created_at");