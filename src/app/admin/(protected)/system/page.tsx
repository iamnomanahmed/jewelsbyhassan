import Link from "next/link";
import { CheckCircle2, ExternalLink, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonClasses } from "@/components/ui/button";
import { getSystemStatus } from "@/lib/system-status";

export const dynamic = "force-dynamic";

function StatusIcon({ ok }: { ok: boolean }) {
  return ok
    ? <CheckCircle2 aria-hidden="true" className="size-5 text-emerald-700"/>
    : <XCircle aria-hidden="true" className="size-5 text-red-700"/>;
}

export default async function SystemPage() {
  const status = await getSystemStatus();
  const ready = [...status.configuration.map((item) => item.configured), ...status.live.map((item) => item.ok)].every(Boolean);
  return <>
    <AdminPageHeader
      eyebrow="Production readiness"
      title="System"
      description="Safe configuration and live connectivity checks. Secret values never leave the server."
      action={<Link href="/admin/system" className={buttonClasses("outline")}><RefreshCw aria-hidden="true" className="size-4"/>Run checks</Link>}
    />
    <section className={`mb-6 flex items-start gap-3 rounded-2xl border p-5 ${ready ? "border-emerald-700/20 bg-emerald-50 text-emerald-950" : "border-amber-700/20 bg-amber-50 text-amber-950"}`}>
      {ready ? <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0"/> : <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0"/>}
      <div><h2 className="font-semibold">{ready ? "Production services are ready" : "Configuration needs attention"}</h2><p className="mt-1 text-sm leading-6">{ready ? "Neon database and customer auth, both R2 buckets, HTTPS, and admin session security passed." : "Review the failed items below, update Vercel environment variables, and redeploy before accepting orders."}</p></div>
    </section>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="admin-card"><h2 className="admin-card-title">Configuration</h2><div className="mt-5 divide-y divide-emerald-deep/8">{status.configuration.map((item) => <div key={item.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"><StatusIcon ok={item.configured}/><div className="min-w-0"><p className="font-semibold text-emerald-deep">{item.label}</p><p className="mt-1 [overflow-wrap:anywhere] text-xs leading-5 text-stone-500">{item.detail}</p></div></div>)}</div></section>
      <section className="admin-card"><h2 className="admin-card-title">Live connections</h2><div className="mt-5 divide-y divide-emerald-deep/8">{status.live.map((item) => <div key={item.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"><StatusIcon ok={item.ok}/><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-emerald-deep">{item.label}</p>{item.latencyMs !== undefined ? <span className="rounded-full bg-stone-100 px-2 py-1 text-[.65rem] font-semibold text-stone-500">{item.latencyMs} ms</span> : null}</div><p className="mt-1 [overflow-wrap:anywhere] text-xs leading-5 text-stone-500">{item.detail}</p></div></div>)}</div></section>
    </div>
    <section className="admin-card mt-6"><h2 className="admin-card-title">Provider consoles</h2><p className="mt-2 text-sm leading-6 text-stone-500">Rotate credentials, inspect usage, and configure backups in the provider dashboards. Infrastructure secrets cannot be edited here.</p><div className="mt-5 flex flex-wrap gap-3"><a href="https://console.neon.tech" target="_blank" rel="noreferrer" className={buttonClasses("outline")}><ExternalLink aria-hidden="true" className="size-4"/>Neon console</a><a href="https://dash.cloudflare.com/?to=/:account/r2" target="_blank" rel="noreferrer" className={buttonClasses("outline")}><ExternalLink aria-hidden="true" className="size-4"/>Cloudflare R2</a><a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className={buttonClasses("outline")}><ExternalLink aria-hidden="true" className="size-4"/>Vercel environment</a></div></section>
  </>;
}
