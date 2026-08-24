import { AdminPageHeader } from "@/components/admin/page-header";
import { ImportExportPanel } from "@/components/admin/import-export-panel";
import { getAdminOrders } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function ImportsPage() {
  const rows = await getAdminOrders();
  const initialOrders = rows.map(({ order, customer }) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: customer.fullName,
    createdAt: order.createdAt.toISOString(),
    status: order.status,
    total: order.total
  }));

  return <>
    <AdminPageHeader eyebrow="Data tools" title="Imports & exports" description="Preview product imports, export live records, or selectively remove specific order records."/>
    <ImportExportPanel initialOrders={initialOrders}/>
  </>;
}
