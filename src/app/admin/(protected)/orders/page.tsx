import { AdminPageHeader } from "@/components/admin/page-header";
import { OrdersTable } from "@/components/admin/orders-table";
import { getAdminOrders } from "@/lib/admin-data";
export const dynamic="force-dynamic";
export default async function OrdersPage(){const rows=await getAdminOrders();return <><AdminPageHeader eyebrow="Fulfilment" title="Orders" description="Confirm, verify, process, ship and complete customer orders."/><OrdersTable rows={rows}/></>}

