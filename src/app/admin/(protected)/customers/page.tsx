import { desc } from "drizzle-orm";
import Link from "next/link";
import { Download } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getDb } from "@/db";
import { customers } from "@/db/schema";
import { formatPrice } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
export const dynamic="force-dynamic";export default async function CustomersPage(){const rows=await getDb().select().from(customers).orderBy(desc(customers.totalSpent));return <><AdminPageHeader eyebrow="Relationships" title="Customers" description="Customer totals are calculated from saved orders." action={<Link href="/api/admin/export/customers" className={buttonClasses("primary","md")}><Download className="size-4"/>Export Excel</Link>}/><div className="overflow-x-auto rounded-2xl bg-white shadow-sm"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-[#fafbf9] text-[.65rem] uppercase tracking-[.1em] text-stone-400"><tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">WhatsApp</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3 text-right">Total spent</th></tr></thead><tbody>{rows.map(row=><tr key={row.id} className="border-t border-emerald-deep/6"><td className="px-5 py-4 font-semibold text-emerald-deep">{row.fullName}<p className="text-xs font-normal text-stone-400">{row.email||"No email"}</p></td><td className="px-5 py-4">{row.phone}</td><td className="px-5 py-4">{row.whatsapp}</td><td className="px-5 py-4">{row.orderCount}</td><td className="px-5 py-4 text-right font-semibold">{formatPrice(row.totalSpent)}</td></tr>)}</tbody></table></div></>}
