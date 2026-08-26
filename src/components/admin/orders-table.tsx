"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { getAdminOrders } from "@/lib/admin-data";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { DownloadButton } from "./download-button";

type Row = Awaited<ReturnType<typeof getAdminOrders>>[number];
type SortKey = "date" | "order" | "customer" | "items" | "payment" | "status" | "total";

const PAGE_SIZE = 20;

export function OrdersTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>("date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => rows.filter(({ order, customer }) => (
    (!query || `${order.orderNumber} ${customer.fullName} ${customer.phone} ${customer.whatsapp}`.toLowerCase().includes(query.toLowerCase()))
    && (!status || order.status === status)
    && (!payment || order.paymentMethod === payment)
  )), [rows, query, status, payment]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const values = {
      date: [a.order.createdAt.getTime(), b.order.createdAt.getTime()],
      order: [a.order.orderNumber, b.order.orderNumber],
      customer: [a.customer.fullName, b.customer.fullName],
      items: [a.itemCount, b.itemCount],
      payment: [a.order.paymentMethod, b.order.paymentMethod],
      status: [a.order.status, b.order.status],
      total: [a.order.total, b.order.total]
    }[sort];
    const comparison = typeof values[0] === "number"
      ? Number(values[0]) - Number(values[1])
      : String(values[0]).localeCompare(String(values[1]));
    return direction === "asc" ? comparison : -comparison;
  }), [filtered, sort, direction]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageIds = pageRows.map(({ order }) => order.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const allFilteredSelected = filtered.length > 0 && filtered.every(({ order }) => selected.includes(order.id));

  const resetPage = () => setPage(1);
  const changeSort = (key: SortKey) => {
    if (sort === key) setDirection((value) => value === "asc" ? "desc" : "asc");
    else {
      setSort(key);
      setDirection("asc");
    }
    resetPage();
  };
  const sortButton = (key: SortKey, label: string, align = "") => (
    <button type="button" onClick={() => changeSort(key)} className={`inline-flex min-h-11 cursor-pointer items-center gap-1 font-semibold ${align}`} aria-label={`Sort by ${label}`}>
      {label}<ArrowUpDown className="size-3" aria-hidden="true"/>
    </button>
  );

  return <div className="rounded-2xl border border-emerald-deep/8 bg-white shadow-sm">
    <div className="grid gap-3 border-b border-emerald-deep/8 p-4 sm:grid-cols-[1fr_auto_auto_auto]">
      <label className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"/>
        <input value={query} onChange={(event) => { setQuery(event.target.value); resetPage(); }} placeholder="Order, customer or phone" className="min-h-11 w-full rounded-xl border border-emerald-deep/15 pl-10 pr-3 text-sm"/>
      </label>
      <select aria-label="Filter order status" value={status} onChange={(event) => { setStatus(event.target.value); resetPage(); }} className="min-h-11 rounded-xl border border-emerald-deep/15 bg-white px-3 text-sm">
        <option value="">All statuses</option>
        {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((value) => <option key={value}>{value}</option>)}
      </select>
      <select aria-label="Filter payment method" value={payment} onChange={(event) => { setPayment(event.target.value); resetPage(); }} className="min-h-11 rounded-xl border border-emerald-deep/15 bg-white px-3 text-sm">
        <option value="">All payments</option><option>COD</option><option>EASYPAISA</option>
      </select>
      <DownloadButton href={`/api/admin/export/orders?ids=${selected.join(",")}&status=${status}&payment=${payment}`} label={selected.length ? `Export ${selected.length}` : "Export filtered"} filename="hassan-jewels-orders.xlsx" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-deep px-4 text-xs font-semibold text-white"/>
    </div>

    {selected.length ? <div className="flex min-h-12 flex-wrap items-center gap-3 border-b border-emerald-deep/8 bg-gold/8 px-4 text-xs">
      <strong>{selected.length} selected</strong>
      {!allFilteredSelected ? <button type="button" className="cursor-pointer font-semibold text-emerald-deep underline" onClick={() => setSelected(filtered.map(({ order }) => order.id))}>Select all {filtered.length} filtered orders</button> : <span>All filtered orders selected</span>}
      <button type="button" className="ml-auto cursor-pointer font-semibold text-stone-500 underline" onClick={() => setSelected([])}>Clear selection</button>
    </div> : null}

    <div className="overflow-x-auto"><table className="w-full min-w-[1080px] text-left text-sm">
      <thead className="bg-[#fafbf9] text-[.65rem] uppercase tracking-[.1em] text-stone-400"><tr>
        <th className="px-4 py-1"><input type="checkbox" aria-label="Select this page" checked={allPageSelected} onChange={(event) => setSelected((current) => event.target.checked ? Array.from(new Set([...current, ...pageIds])) : current.filter((id) => !pageIds.includes(id)))}/></th>
        <th className="px-4 py-1">{sortButton("order", "Order")}</th>
        <th className="px-4 py-1">{sortButton("customer", "Customer")}</th>
        <th className="px-4 py-1">Phone</th>
        <th className="px-4 py-1">{sortButton("date", "Date")}</th>
        <th className="px-4 py-1">{sortButton("items", "Items")}</th>
        <th className="px-4 py-1">{sortButton("payment", "Payment")}</th>
        <th className="px-4 py-1">{sortButton("status", "Status")}</th>
        <th className="px-4 py-1 text-right">{sortButton("total", "Total", "justify-end")}</th>
      </tr></thead>
      <tbody>{pageRows.map(({ order, customer, itemCount }) => <tr key={order.id} className="border-t border-emerald-deep/6">
        <td className="px-4 py-4"><input type="checkbox" aria-label={`Select ${order.orderNumber}`} checked={selected.includes(order.id)} onChange={(event) => setSelected((current) => event.target.checked ? Array.from(new Set([...current, order.id])) : current.filter((id) => id !== order.id))}/></td>
        <td className="px-4 py-4"><Link href={`/admin/orders/${order.id}`} className="font-bold text-emerald-deep hover:text-gold">{order.orderNumber}</Link></td>
        <td className="px-4 py-4">{customer.fullName}<p className="text-xs text-stone-400">{customer.whatsapp}</p></td>
        <td className="px-4 py-4 text-xs text-stone-500">{customer.phone}</td>
        <td className="px-4 py-4 text-xs text-stone-500">{order.createdAt.toLocaleString("en-PK")}</td>
        <td className="px-4 py-4">{itemCount}</td>
        <td className="px-4 py-4"><p>{order.paymentMethod}</p><p className="text-xs text-stone-400">{order.paymentStatus.replaceAll("_", " ")}</p></td>
        <td className="px-4 py-4"><StatusBadge value={order.status}/></td>
        <td className="px-4 py-4 text-right font-semibold">{formatPrice(order.total)}</td>
      </tr>)}</tbody>
    </table></div>

    <div className="flex flex-col gap-3 border-t border-emerald-deep/8 p-4 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
      <span>{sorted.length ? `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, sorted.length)} of ${sorted.length} orders` : "No matching orders"}</span>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Previous page" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="flex min-h-11 items-center gap-1 rounded-xl border border-emerald-deep/10 px-3 font-semibold text-emerald-deep disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft className="size-4"/>Previous</button>
        <span className="px-2">Page {safePage} of {pageCount}</span>
        <button type="button" aria-label="Next page" disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="flex min-h-11 items-center gap-1 rounded-xl border border-emerald-deep/10 px-3 font-semibold text-emerald-deep disabled:cursor-not-allowed disabled:opacity-35">Next<ChevronRight className="size-4"/></button>
      </div>
    </div>
  </div>;
}
