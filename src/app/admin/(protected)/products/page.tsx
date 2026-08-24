import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductTable } from "@/components/admin/product-table";
import { getAdminProducts } from "@/lib/admin-data";
import { buttonClasses } from "@/components/ui/button";
export const dynamic="force-dynamic";
export default async function ProductsPage(){const rows=await getAdminProducts();return <><AdminPageHeader eyebrow="Catalog" title="Products" description="Create, publish, archive, duplicate and safely remove catalog items." action={<Link href="/admin/products/new" className={buttonClasses("primary","md")}><Plus className="size-4"/>Add product</Link>}/><ProductTable rows={rows}/></>}

