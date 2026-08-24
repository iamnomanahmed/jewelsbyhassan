import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/settings";
export const dynamic="force-dynamic";
export default async function SettingsPage(){const settings=await getSettings();return <><AdminPageHeader eyebrow="Configuration" title="Settings" description="Store, branding, WhatsApp, Easypaisa, delivery, reviews and social links—without redeploying."/><SettingsForm settings={settings}/></>}

