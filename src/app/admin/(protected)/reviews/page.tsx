import { desc } from "drizzle-orm";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ReviewsTable } from "@/components/admin/reviews-table";
import { getDb } from "@/db";
import { reviews } from "@/db/schema";
export const dynamic="force-dynamic";
export default async function ReviewsPage(){const rows=await getDb().select().from(reviews).orderBy(desc(reviews.createdAt));return <><AdminPageHeader eyebrow="Social proof" title="Reviews" description="Approve, reject, hide and feature verified customer feedback."/><ReviewsTable rows={rows}/></>}

