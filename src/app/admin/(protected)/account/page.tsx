import { AccountForm } from "@/components/admin/account-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const admin = await requireAdmin();
  return <>
    <AdminPageHeader eyebrow="Administrator security" title="Account" description="Update the administrator identity and rotate the sign-in password without reseeding the database."/>
    <AccountForm admin={{ name: admin.name, email: admin.email }}/>
  </>;
}
