import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";
export default async function ProtectedAdminLayout({children}:{children:React.ReactNode}){const admin=await requireAdmin();return <div className="min-h-screen bg-[#f1f3ef]"><AdminNav/><div className="md:pl-64"><header className="flex min-h-16 items-center justify-between border-b border-emerald-deep/10 bg-white px-4 sm:px-7"><div><p className="text-xs text-stone-400">Hassan Jewels</p><p className="text-sm font-semibold text-emerald-deep">{admin.name}</p></div><Link href="/" target="_blank" className="flex min-h-10 items-center gap-2 rounded-full border border-emerald-deep/15 px-4 text-xs font-semibold text-emerald-deep hover:border-gold">View store <ExternalLink className="size-3.5"/></Link></header><main id="main-content" tabIndex={-1} className="p-4 sm:p-7 lg:p-9">{children}</main></div></div>}
