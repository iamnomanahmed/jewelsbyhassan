import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductTable } from "@/components/admin/product-table";
import { getAdminProductCount, getAdminProducts } from "@/lib/admin-data";
import { buttonClasses } from "@/components/ui/button";
import { CatalogPagination } from "@/components/catalog-pagination";
export const dynamic="force-dynamic";
export default async function ProductsPage({searchParams}:{searchParams:Promise<{page?:string}>}){const values=await searchParams;const page=Math.max(Number(values.page)||1,1);const [rows,total]=await Promise.all([getAdminProducts(page),getAdminProductCount()]);return <><AdminPageHeader eyebrow="Catalog" title="Products" description="Create, publish, archive, duplicate and safely remove catalog items." action={<Link href="/admin/products/new" className={buttonClasses("primary","md")}><Plus className="size-4"/>Add product</Link>}/><ProductTable rows={rows}/><CatalogPagination pathname="/admin/products" values={values} page={page} pageCount={Math.max(1,Math.ceil(total/50))}/></>}
