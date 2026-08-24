import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductEditor } from "@/components/admin/product-editor";
import { ProductImages } from "@/components/admin/product-images";
import { getAdminProduct } from "@/lib/admin-data";
import { getCategories,getCollections } from "@/lib/catalog";
export const dynamic="force-dynamic";
export default async function EditProductPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const [record,categories,collections]=await Promise.all([getAdminProduct(id),getCategories(),getCollections()]);if(!record)notFound();const {variants,images,...product}=record;return <><AdminPageHeader eyebrow="Catalog" title={product.name} description={`Editing ${product.sku}`}/><ProductEditor product={product} variants={variants} categories={categories} collections={collections}/><ProductImages productId={id} images={images}/></>}

