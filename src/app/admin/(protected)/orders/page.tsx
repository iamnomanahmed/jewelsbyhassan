import { AdminPageHeader } from "@/components/admin/page-header";
import { OrdersTable } from "@/components/admin/orders-table";
import { getAdminOrderCount, getAdminOrders } from "@/lib/admin-data";
import { CatalogPagination } from "@/components/catalog-pagination";
export const dynamic="force-dynamic";
export default async function OrdersPage({searchParams}:{searchParams:Promise<{page?:string}>}){const values=await searchParams;const page=Math.max(Number(values.page)||1,1);const [rows,total]=await Promise.all([getAdminOrders(page),getAdminOrderCount()]);return <><AdminPageHeader eyebrow="Fulfilment" title="Orders" description="Confirm, verify, process, ship and complete customer orders."/><OrdersTable rows={rows}/><CatalogPagination pathname="/admin/orders" values={values} page={page} pageCount={Math.max(1,Math.ceil(total/50))}/></>}
