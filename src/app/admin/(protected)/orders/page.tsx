import { AdminPageHeader } from "@/components/admin/page-header";
import { OrdersTable } from "@/components/admin/orders-table";
import { getAdminOrders } from "@/lib/admin-data";
export const dynamic="force-dynamic";
export default async function OrdersPage(){const rows=await getAdminOrders();return <><AdminPageHeader eyebrow="Fulfilment" title="Orders" description="Verify payments, confirm orders, and mark fulfilled orders as completed."/><OrdersTable rows={rows}/></>}
