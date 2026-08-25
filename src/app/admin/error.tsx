"use client";

import Link from "next/link";
import { AlertTriangle, LayoutDashboard, RefreshCw } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-[#f1f3ef] px-5 py-10">
      <section role="alert" className="w-full max-w-xl rounded-3xl border border-amber-700/20 bg-white p-7 shadow-sm sm:p-10">
        <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-800">
          <AlertTriangle aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-gold">Administration</p>
        <h1 className="display-heading mt-2 text-5xl text-emerald-deep">This admin page could not load.</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-stone-600">
          Retry the request. If it continues to fail, review the System page and the deployment environment variables.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button onClick={reset}>
            <RefreshCw aria-hidden="true" className="size-4" />
            Try again
          </Button>
          <Link href="/admin" className={buttonClasses("outline")}>
            <LayoutDashboard aria-hidden="true" className="size-4" />
            Admin dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
