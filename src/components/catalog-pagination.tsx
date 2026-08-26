import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function pageHref(pathname: string, values: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value && key !== "page") params.set(key, value);
  });
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function CatalogPagination({ pathname, values, page, pageCount }: { pathname: string; values: Record<string, string | undefined>; page: number; pageCount: number }) {
  if (pageCount <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, index) => start + index);
  return <nav aria-label="Catalog pages" className="mt-12 flex flex-wrap items-center justify-center gap-2">
    {page > 1 ? <Link prefetch={false} href={pageHref(pathname, values, page - 1)} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-emerald-deep/15 bg-white px-4 text-sm font-semibold text-emerald-deep"><ChevronLeft className="size-4"/>Previous</Link> : null}
    {pages.map((value) => <Link prefetch={false} key={value} href={pageHref(pathname, values, value)} aria-current={value === page ? "page" : undefined} className={`grid size-11 place-items-center rounded-full border text-sm font-semibold ${value === page ? "border-emerald-deep bg-emerald-deep text-white" : "border-emerald-deep/15 bg-white text-emerald-deep"}`}>{value}</Link>)}
    {page < pageCount ? <Link prefetch={false} href={pageHref(pathname, values, page + 1)} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-emerald-deep/15 bg-white px-4 text-sm font-semibold text-emerald-deep">Next<ChevronRight className="size-4"/></Link> : null}
  </nav>;
}
