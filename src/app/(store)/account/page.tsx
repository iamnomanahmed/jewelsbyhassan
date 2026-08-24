import type { Metadata } from "next";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/server";
import { signOutCustomer } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

export default async function CustomerAccountPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  return <section className="section-pad bg-ivory">
    <div className="site-container max-w-4xl">
      <p className="eyebrow">Private client account</p>
      <h1 className="display-heading mt-3 text-5xl text-emerald-deep sm:text-7xl">Welcome, {session.user.name || "valued client"}.</h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600">Your profile is securely stored with your Hassan Jewels database and isolated with the production branch.</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-deep/10 bg-white p-6 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-full bg-emerald-deep/8 text-emerald-deep"><UserRound aria-hidden="true" className="size-5"/></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-stone-500">Name</p>
          <p className="mt-2 font-semibold text-emerald-deep">{session.user.name || "Not provided"}</p>
        </div>
        <div className="rounded-2xl border border-emerald-deep/10 bg-white p-6 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-full bg-emerald-deep/8 text-emerald-deep"><Mail aria-hidden="true" className="size-5"/></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-stone-500">Email</p>
          <p className="mt-2 break-all font-semibold text-emerald-deep">{session.user.email}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gold/20 bg-gold/8 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-3 text-sm leading-6 text-emerald-deep"><ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0"/>Your session uses an HTTP-only signed cookie. Sign out on shared devices.</p>
        <form action={signOutCustomer}><Button type="submit" variant="outline" className="w-full sm:w-auto">Sign out</Button></form>
      </div>
    </div>
  </section>;
}
