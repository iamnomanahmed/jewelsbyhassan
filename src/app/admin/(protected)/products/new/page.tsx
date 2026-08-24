import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductEditor } from "@/components/admin/product-editor";
import { getCategories,getCollections } from "@/lib/catalog";
export const dynamic="force-dynamic";
export default async function NewProductPage(){const [categories,collections]=await Promise.all([getCategories(),getCollections()]);return <><AdminPageHeader eyebrow="Catalog" title="New product" description="Save product details first, then add R2-hosted images."/><ProductEditor categories={categories} collections={collections}/></>}

