"use client";
import Link from "next/link";
import { usePathname,useRouter } from "next/navigation";
import { Boxes,ClipboardList,Download,LayoutDashboard,LogOut,MessageSquareQuote,ServerCog,Settings,ShoppingBag,Tags,UserCog,Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
const nav=[
  ["Overview","/admin",LayoutDashboard],
  ["Products","/admin/products",ShoppingBag],
  ["Categories","/admin/categories",Tags],
  ["Collections","/admin/collections",Boxes],
  ["Orders","/admin/orders",ClipboardList],
  ["Customers","/admin/customers",Users],
  ["Reviews","/admin/reviews",MessageSquareQuote],
  ["Imports / Exports","/admin/imports",Download],
  ["Settings","/admin/settings",Settings],
  ["System","/admin/system",ServerCog],
  ["Account","/admin/account",UserCog]
] as const;
export function AdminNav(){const path=usePathname();const router=useRouter();return <aside className="sticky top-0 z-50 flex w-full flex-col bg-emerald-ink text-ivory md:fixed md:inset-y-0 md:left-0 md:min-h-screen md:w-64"><div className="hidden border-b border-white/10 px-5 py-5 md:block"><Link href="/admin"><Logo className="h-20 w-40"/></Link></div><nav className="flex gap-1 overflow-x-auto p-2 md:flex-1 md:flex-col md:overflow-visible md:p-3" aria-label="Admin navigation">{nav.map(([label,href,Icon])=>{const active=href==="/admin"?path===href:path.startsWith(href);return <Link key={href} href={href} className={cn("flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-xs transition md:gap-3 md:text-sm",active?"bg-gold text-emerald-ink":"text-ivory/65 hover:bg-white/10 hover:text-ivory")}><Icon className="size-4"/><span>{label}</span></Link>})}</nav><button onClick={async()=>{await fetch("/api/admin/auth/logout",{method:"POST"});router.push("/admin/login");router.refresh()}} aria-label="Sign out" className="m-2 hidden min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm text-ivory/55 hover:bg-white/10 hover:text-ivory md:flex"><LogOut className="size-4"/>Sign out</button></aside>}
