import { AdminPageHeader } from "@/components/admin/page-header";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { getCategories } from "@/lib/catalog";
export const dynamic="force-dynamic";export default async function CategoriesPage(){const rows=await getCategories();return <><AdminPageHeader eyebrow="Catalog" title="Categories" description="Organize product discovery and storefront navigation."/><TaxonomyManager type="categories" rows={rows}/></>}

