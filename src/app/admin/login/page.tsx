import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/logo";
import { getAdmin } from "@/lib/auth";
export const metadata={title:"Admin Login"};
export default async function AdminLoginPage(){if(await getAdmin())redirect("/admin");return <main id="main-content" tabIndex={-1} className="relative grid min-h-screen place-items-center overflow-hidden bg-emerald-ink px-4 py-10 text-ivory"><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(200,155,60,.17),transparent_35%)]"/><div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[.055] p-7 shadow-2xl backdrop-blur-xl sm:p-10"><Logo className="mx-auto h-36 w-60" priority/><div className="my-8 text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-gold-light">Private administration</p><h1 className="display-heading mt-2 text-5xl">Welcome back.</h1><p className="mt-3 text-sm text-ivory/55">Sign in to manage Hassan Jewels.</p></div><LoginForm/><p className="mt-6 text-center text-[.65rem] text-ivory/35">Protected by an HTTP-only, expiring admin session.</p></div></main>}
