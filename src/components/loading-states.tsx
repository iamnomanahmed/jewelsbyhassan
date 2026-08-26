import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("luxury-skeleton block", className)} />;
}

function LoadingRegion({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return <div role="status" aria-live="polite" aria-busy="true" className={className}>
    <span className="sr-only">{label}</span>
    <div aria-hidden="true">{children}</div>
  </div>;
}

export function ProductCardSkeleton() {
  return <article className="min-w-0">
    <Skeleton className="aspect-[4/5] rounded-[1.25rem]" />
    <div className="pt-4">
      <Skeleton className="h-2.5 w-24 rounded-full" />
      <Skeleton className="mt-3 h-7 w-4/5 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-24 rounded-full" />
    </div>
  </article>;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return <LoadingRegion label="Loading jewelry" className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-14">
    {Array.from({ length: count }, (_, index) => <ProductCardSkeleton key={index} />)}
  </LoadingRegion>;
}

export function CatalogPageSkeleton() {
  return <LoadingRegion label="Loading the jewelry collection" className="min-h-[70vh] bg-ivory">
    <section className="bg-emerald-deep px-5 py-16 text-center md:py-24">
      <Skeleton className="mx-auto h-3 w-32 rounded-full !bg-white/10" />
      <Skeleton className="mx-auto mt-5 h-16 w-full max-w-xl rounded-2xl !bg-white/10 md:h-20" />
      <Skeleton className="mx-auto mt-5 h-4 w-full max-w-md rounded-full !bg-white/10" />
    </section>
    <section className="section-pad"><div className="site-container">
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-12 rounded-xl" />)}
      </div>
      <ProductGridSkeleton />
    </div></section>
  </LoadingRegion>;
}

export function StorefrontSkeleton() {
  return <LoadingRegion label="Loading Hassan Jewels" className="bg-ivory">
    <section className="relative min-h-[620px] overflow-hidden bg-emerald-ink">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-ink via-emerald-ink/90 to-emerald-deep/60" />
      <div className="site-container relative flex min-h-[620px] items-center py-20"><div className="w-full max-w-2xl"><Skeleton className="h-3 w-40 rounded-full !bg-white/10" /><Skeleton className="mt-6 h-36 w-full rounded-2xl !bg-white/10" /><Skeleton className="mt-7 h-4 w-4/5 rounded-full !bg-white/10" /><Skeleton className="mt-8 h-12 w-44 rounded-full !bg-gold/30" /></div></div>
    </section>
    <section className="section-pad"><div className="site-container"><div className="mb-10 text-center"><Skeleton className="mx-auto h-3 w-32 rounded-full" /><Skeleton className="mx-auto mt-4 h-12 w-80 max-w-full rounded-xl" /></div><ProductGridSkeleton count={4} /></div></section>
  </LoadingRegion>;
}

export function ProductDetailsSkeleton() {
  return <LoadingRegion label="Loading product details" className="bg-ivory">
    <div className="site-container py-6"><Skeleton className="h-3 w-52 rounded-full" /></div>
    <div className="site-container grid gap-10 pb-20 lg:grid-cols-[1.18fr_.82fr] lg:gap-16">
      <div>
        <Skeleton className="aspect-[4/5] rounded-2xl" />
        <div className="mt-3 grid grid-cols-4 gap-3">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="aspect-square rounded-xl" />)}</div>
      </div>
      <div>
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="mt-5 h-16 w-4/5 rounded-xl" />
        <Skeleton className="mt-4 h-5 w-28 rounded-full" />
        <div className="my-8 space-y-3"><Skeleton className="h-3 w-full rounded-full" /><Skeleton className="h-3 w-11/12 rounded-full" /><Skeleton className="h-3 w-3/4 rounded-full" /></div>
        <Skeleton className="h-12 w-full rounded-full" />
        <Skeleton className="mt-3 h-12 w-full rounded-full" />
        <div className="mt-8 space-y-5 border-y border-emerald-deep/10 py-6">{Array.from({ length: 3 }, (_, index) => <div key={index} className="flex gap-4"><Skeleton className="size-10 shrink-0 rounded-xl" /><div className="flex-1"><Skeleton className="h-4 w-32 rounded-full" /><Skeleton className="mt-2 h-3 w-full rounded-full" /></div></div>)}</div>
      </div>
    </div>
  </LoadingRegion>;
}

export function CartContentSkeleton() {
  return <LoadingRegion label="Loading your shopping bag" className="grid gap-10 lg:grid-cols-[1.35fr_.65fr]">
    <div className="space-y-4">{Array.from({ length: 3 }, (_, index) => <div key={index} className="grid grid-cols-[96px_1fr] gap-4 rounded-2xl bg-white p-3 sm:grid-cols-[130px_1fr_auto]"><Skeleton className="aspect-square rounded-xl" /><div className="py-2"><Skeleton className="h-7 w-2/3 rounded-lg" /><Skeleton className="mt-3 h-3 w-24 rounded-full" /><Skeleton className="mt-5 h-10 w-28 rounded-full" /></div></div>)}</div>
    <Skeleton className="h-80 rounded-2xl !bg-emerald-deep/90" />
  </LoadingRegion>;
}

export function CartSkeleton() {
  return <div className="section-pad min-h-[70vh] bg-ivory"><div className="site-container">
    <Skeleton className="h-3 w-28 rounded-full" /><Skeleton className="mt-4 h-16 w-72 max-w-full rounded-xl" />
    <div className="mt-10"><CartContentSkeleton /></div>
  </div></div>;
}

export function CheckoutContentSkeleton() {
  return <LoadingRegion label="Loading secure checkout" className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,.95fr)] lg:gap-10 xl:gap-12">
    <div className="min-w-0 space-y-4 sm:space-y-6">{Array.from({ length: 2 }, (_, card) => <div key={card} className="rounded-2xl bg-white p-4 sm:p-6"><Skeleton className="h-8 w-40 max-w-full rounded-lg" /><div className="mt-6 grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <div key={index} className="min-w-0"><Skeleton className="h-3 w-20 max-w-full rounded-full" /><Skeleton className="mt-2 h-12 rounded-xl" /></div>)}</div></div>)}</div>
    <Skeleton className="h-[28rem] min-w-0 rounded-2xl !bg-emerald-deep/90 sm:h-[34rem]" />
  </LoadingRegion>;
}

export function CheckoutSkeleton() {
  return <div className="section-pad min-h-screen bg-ivory"><div className="site-container">
    <Skeleton className="h-3 w-28 rounded-full" /><Skeleton className="mt-4 h-16 w-96 max-w-full rounded-xl" />
    <div className="mt-10"><CheckoutContentSkeleton /></div>
  </div></div>;
}

export function DashboardCardSkeleton() {
  return <div className="rounded-2xl border border-emerald-deep/8 bg-white p-5"><Skeleton className="size-9 rounded-xl" /><Skeleton className="mt-5 h-8 w-24 rounded-lg" /><Skeleton className="mt-2 h-3 w-28 rounded-full" /></div>;
}

export function DashboardSkeleton() {
  return <LoadingRegion label="Loading the admin dashboard" className="space-y-7">
    <div><Skeleton className="h-3 w-32 rounded-full" /><Skeleton className="mt-3 h-12 w-80 max-w-full rounded-xl" /><Skeleton className="mt-3 h-4 w-full max-w-xl rounded-full" /></div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <DashboardCardSkeleton key={index} />)}</div>
    <OrderTableSkeleton compact />
  </LoadingRegion>;
}

export function OrderTableSkeleton({ compact = false }: { compact?: boolean }) {
  return <LoadingRegion label="Loading orders" className="overflow-hidden rounded-2xl border border-emerald-deep/8 bg-white shadow-sm">
    <div className="grid gap-3 border-b border-emerald-deep/8 p-4 sm:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-11 rounded-xl" />)}</div>
    <div className="overflow-hidden"><div className="h-12 bg-[#fafbf9]" />{Array.from({ length: compact ? 5 : 8 }, (_, row) => <div key={row} className="grid grid-cols-5 gap-6 border-t border-emerald-deep/6 px-5 py-4"><Skeleton className="h-4 rounded-full" /><Skeleton className="h-4 rounded-full" /><Skeleton className="h-4 rounded-full" /><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="ml-auto h-4 w-20 rounded-full" /></div>)}</div>
  </LoadingRegion>;
}

export function AdminTableSkeleton({ label = "Loading records" }: { label?: string }) {
  return <LoadingRegion label={label} className="space-y-7">
    <div><Skeleton className="h-3 w-28 rounded-full" /><Skeleton className="mt-3 h-12 w-64 rounded-xl" /><Skeleton className="mt-3 h-4 w-full max-w-xl rounded-full" /></div>
    <OrderTableSkeleton />
  </LoadingRegion>;
}

export function OrderDetailsSkeleton() {
  return <LoadingRegion label="Loading order details" className="mx-auto max-w-[1500px]">
    <Skeleton className="mb-4 h-11 w-36 rounded-full" />
    <Skeleton className="h-64 rounded-3xl !bg-emerald-deep/90" />
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start">
      <div className="space-y-6">{Array.from({ length: 3 }, (_, index) => <div key={index} className="admin-card"><Skeleton className="h-9 w-48 rounded-lg" /><div className="mt-6 grid grid-cols-2 gap-4"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></div><Skeleton className="mt-4 h-24 rounded-2xl" /></div>)}</div>
      <div className="admin-card"><Skeleton className="h-12 rounded-xl !bg-emerald-deep/90" /><div className="mt-6 space-y-3"><Skeleton className="h-12 rounded-full" /><Skeleton className="h-12 rounded-full" /><Skeleton className="h-12 rounded-full" /></div></div>
    </div>
  </LoadingRegion>;
}

export function ReviewPageSkeleton() {
  return <LoadingRegion label="Loading your review invitation" className="min-h-screen bg-emerald-ink px-4 py-10">
    <div className="mx-auto max-w-xl">
      <Logo className="mx-auto h-24 w-48" />
      <div className="mt-8 rounded-3xl bg-ivory p-6 shadow-2xl sm:p-10">
        <Skeleton className="mx-auto h-3 w-44 rounded-full" />
        <Skeleton className="mx-auto mt-5 h-14 w-full max-w-md rounded-xl" />
        <Skeleton className="mx-auto mt-4 h-4 w-full max-w-sm rounded-full" />
        <div className="mt-8 space-y-5"><div className="flex gap-2">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="size-11 rounded-full" />)}</div>{Array.from({ length: 3 }, (_, index) => <div key={index}><Skeleton className="h-3 w-24 rounded-full" /><Skeleton className="mt-2 h-12 rounded-xl" /></div>)}<Skeleton className="h-12 rounded-full !bg-emerald-deep/90" /></div>
      </div>
    </div>
  </LoadingRegion>;
}

export function BrandedLoader({ message = "Preparing your experience…", className }: { message?: string; className?: string }) {
  return <div role="status" aria-live="polite" aria-busy="true" className={cn("grid min-h-[55vh] place-items-center bg-emerald-ink px-5 text-center text-ivory", className)}>
    <div>
      <Logo className="mx-auto h-24 w-44" />
      <span className="mx-auto mt-7 grid size-11 place-items-center rounded-full border border-gold/35 bg-gold/5"><LoadingIndicator tone="gold" className="size-5" /></span>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-ivory/70">{message}</p>
    </div>
  </div>;
}

export function BlockingLoader({ message, supportingText }: { message: string; supportingText?: string }) {
  return <div role="status" aria-live="polite" aria-busy="true" className="dialog-backdrop fixed inset-0 z-[120] grid place-items-center bg-emerald-ink/95 px-5 text-center text-ivory backdrop-blur-md">
    <div className="dialog-panel w-full max-w-md rounded-3xl border border-gold/20 bg-emerald-deep p-8 shadow-2xl sm:p-10">
      <Logo className="mx-auto h-24 w-44" />
      <span className="mx-auto mt-7 grid size-12 place-items-center rounded-full border border-gold/35 bg-gold/5"><LoadingIndicator tone="gold" className="size-5" /></span>
      <p className="mt-6 font-display text-3xl font-semibold">{message}</p>
      {supportingText ? <p className="mt-3 text-sm leading-6 text-ivory/60">{supportingText}</p> : null}
    </div>
  </div>;
}
