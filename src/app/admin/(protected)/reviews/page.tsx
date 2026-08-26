import { count, desc } from "drizzle-orm";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ReviewsTable } from "@/components/admin/reviews-table";
import { getDb } from "@/db";
import { reviews } from "@/db/schema";
import { CatalogPagination } from "@/components/catalog-pagination";
export const dynamic="force-dynamic";
export default async function ReviewsPage({searchParams}:{searchParams:Promise<{page?:string}>}){const values=await searchParams;const page=Math.max(Number(values.page)||1,1);const db=getDb();const [rows,totalRow]=await Promise.all([db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(20).offset((page-1)*20),db.select({total:count()}).from(reviews)]);const total=totalRow[0]?.total??0;return <><AdminPageHeader eyebrow="Social proof" title="Reviews" description="Approve, reject, hide and feature verified customer feedback."/><ReviewsTable rows={rows}/><CatalogPagination pathname="/admin/reviews" values={values} page={page} pageCount={Math.max(1,Math.ceil(total/20))}/></>}
