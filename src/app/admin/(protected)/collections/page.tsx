import { AdminPageHeader } from "@/components/admin/page-header";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { getCollections } from "@/lib/catalog";
export const dynamic="force-dynamic";export default async function CollectionsAdminPage(){const rows=await getCollections();return <><AdminPageHeader eyebrow="Catalog" title="Collections" description="Build editorial groups for campaigns and signature stories."/><TaxonomyManager type="collections" rows={rows}/></>}

