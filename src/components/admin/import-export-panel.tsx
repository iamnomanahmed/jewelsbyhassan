"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, Search, Trash2, Upload } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { DownloadButton } from "@/components/admin/download-button";

type Preview = {
  rows: {
    rowNumber: number;
    sku: string;
    name: string;
    price: number;
    stock: number;
    status: string;
    errors: string[];
  }[];
  valid: number;
  invalid: number;
};

const ORDER_PAGE_SIZE = 20;

export type DeletableOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  createdAt: string;
  status: string;
  total: number;
};

export function ImportExportPanel({ initialOrders }: { initialOrders: DeletableOrder[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [mode, setMode] = useState("create");
  const [busy, setBusy] = useState<"preview" | "import" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [orderRows, setOrderRows] = useState(initialOrders);
  const [orderQuery, setOrderQuery] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deletionError, setDeletionError] = useState("");
  const [deletionMessage, setDeletionMessage] = useState("");

  const filteredOrders = useMemo(() => {
    const query = orderQuery.trim().toLowerCase();
    return orderRows.filter((order) => (
      (!query || `${order.orderNumber} ${order.customerName}`.toLowerCase().includes(query))
      && (!orderStatus || order.status === orderStatus)
    ));
  }, [orderRows, orderQuery, orderStatus]);

  const selectedOrders = useMemo(
    () => orderRows.filter((order) => selectedOrderIds.includes(order.id)),
    [orderRows, selectedOrderIds]
  );
  const orderPageCount = Math.max(1, Math.ceil(filteredOrders.length / ORDER_PAGE_SIZE));
  const safeOrderPage = Math.min(orderPage, orderPageCount);
  const visibleOrders = filteredOrders.slice((safeOrderPage - 1) * ORDER_PAGE_SIZE, safeOrderPage * ORDER_PAGE_SIZE);

  const toggleOrder = (id: string, checked: boolean) => {
    setSelectedOrderIds((current) => checked
      ? Array.from(new Set([...current, id]))
      : current.filter((orderId) => orderId !== id));
    setConfirmingDeletion(false);
    setConfirmationText("");
    setDeletionError("");
    setDeletionMessage("");
  };

  const send = async (importing: boolean) => {
    if (!file) return;
    setBusy(importing ? "import" : "preview");
    setError("");
    setMessage("");
    const body = new FormData();
    body.set("file", file);
    if (importing) body.set("mode", mode);
    else body.set("preview", "1");
    try {
      const response = await fetch("/api/admin/import/products", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error);
        if (result.rows) setPreview(result);
        return;
      }
      if (importing) {
        setMessage(`Import complete: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped${result.errors.length ? `, ${result.errors.length} errors` : ""}.`);
      } else setPreview(result);
    } catch {
      setError(importing ? "Products could not be imported. Please try again." : "The workbook could not be validated. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const deleteSelectedOrders = async () => {
    if (!selectedOrderIds.length || confirmationText !== "DELETE") return;
    setDeleting(true);
    setDeletionError("");
    setDeletionMessage("");
    try {
      const response = await fetch("/api/admin/orders/bulk", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: selectedOrderIds })
      });
      const result = await response.json();
      if (!response.ok) {
        setDeletionError(result.error ?? "Could not delete the selected orders.");
        return;
      }
      const deleted = new Set<string>(result.deletedIds);
      setOrderRows((current) => current.filter((order) => !deleted.has(order.id)));
      setSelectedOrderIds([]);
      setConfirmingDeletion(false);
      setConfirmationText("");
      setDeletionMessage(`${result.deleted} selected order${result.deleted === 1 ? "" : "s"} permanently deleted from the main database.${result.fileCleanupFailed ? ` ${result.fileCleanupFailed} attached file${result.fileCleanupFailed === 1 ? "" : "s"} could not be removed from R2 and may require manual cleanup.` : ""}`);
    } catch {
      setDeletionError("Could not reach the server. No deletion confirmation was received.");
    } finally {
      setDeleting(false);
    }
  };

  return <>
    <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
      <section aria-busy={Boolean(busy) || undefined} className="admin-card">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-emerald-soft text-emerald-deep"><Upload aria-hidden="true" className="size-5"/></span>
          <div><h2 className="admin-card-title">Product import</h2><p className="text-xs text-stone-500">Upload, preview, validate, then choose an explicit import mode.</p></div>
        </div>
        <label className="mt-6 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-deep/20 bg-[#fafbf9] text-center hover:border-gold">
          <FileSpreadsheet aria-hidden="true" className="size-7 text-gold"/>
          <span className="mt-2 text-sm font-semibold">{file ? file.name : "Choose an .xlsx workbook"}</span>
          <span className="text-xs text-stone-400">Maximum 10 MB</span>
          <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="sr-only" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setPreview(null); setMessage(""); }}/>
        </label>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <Button type="button" disabled={!file || Boolean(busy)} loading={busy === "preview"} loadingLabel="Validating workbook…" onClick={() => send(false)}>Preview & validate</Button>
          <label><span className="field-label">Import mode</span><select value={mode} onChange={(event) => setMode(event.target.value)} className="min-h-11 rounded-xl border border-emerald-deep/15 bg-white px-3 text-sm"><option value="create">Create only</option><option value="update">Update existing by SKU</option><option value="upsert">Create + update</option></select></label>
          <Button type="button" variant="gold" disabled={!preview || preview.invalid > 0 || Boolean(busy)} loading={busy === "import"} loadingLabel="Importing products…" onClick={() => send(true)}>Import validated rows</Button>
        </div>
        {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {message ? <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}
        {preview ? <div className="mt-6">
          <div className="mb-3 flex gap-4 text-xs"><span className="font-semibold text-emerald-700">{preview.valid} valid</span><span className={preview.invalid ? "font-semibold text-red-700" : "text-stone-400"}>{preview.invalid} invalid</span></div>
          <div className="max-h-96 overflow-auto rounded-xl border border-emerald-deep/10"><table className="w-full min-w-[700px] text-left text-xs"><thead className="sticky top-0 bg-emerald-deep text-white"><tr><th className="p-3">Row</th><th className="p-3">SKU</th><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Validation</th></tr></thead><tbody>{preview.rows.map((row) => <tr key={row.rowNumber} className="border-t border-emerald-deep/8"><td className="p-3">{row.rowNumber}</td><td className="p-3">{row.sku}</td><td className="p-3">{row.name}</td><td className="p-3">{row.price}</td><td className="p-3">{row.stock}</td><td className={`p-3 ${row.errors.length ? "text-red-700" : "text-emerald-700"}`}>{row.errors.length ? row.errors.join("; ") : "Ready"}</td></tr>)}</tbody></table></div>
        </div> : null}
      </section>

      <aside className="space-y-6">
        <section className="admin-card"><h2 className="admin-card-title">Start with the template</h2><p className="mt-3 text-sm leading-6 text-stone-500">Headers, a realistic example and formatting instructions are included.</p><Link href="/api/admin/export/template" className={`${buttonClasses("primary", "md")} mt-5`}><Download aria-hidden="true" className="size-4"/>Download Excel template</Link></section>
        <section className="admin-card"><h2 className="admin-card-title">Export data</h2><p className="mt-3 text-sm text-stone-500">Download live operational records as true .xlsx workbooks.</p><div className="mt-5 grid gap-2">{["products", "orders", "customers", "reviews"].map((type) => <DownloadButton key={type} href={`/api/admin/export/${type}`} label={type} loadingLabel={`Exporting ${type}…`} filename={`hassan-jewels-${type}.xlsx`} className="flex min-h-11 items-center justify-between rounded-xl border border-emerald-deep/10 px-4 text-sm font-semibold capitalize text-emerald-deep hover:border-gold"/>)}</div></section>
      </aside>
    </div>

    <section className="admin-card mt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-700"><Trash2 aria-hidden="true" className="size-5"/></span>
          <div><h2 className="admin-card-title">Delete order data</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-stone-500">Select individual orders to permanently remove them and their related order records from the main database. Customer profiles and product inventory are preserved.</p></div>
        </div>
        <Button type="button" variant="danger" disabled={!selectedOrderIds.length || deleting} onClick={() => { setConfirmingDeletion(true); setConfirmationText(""); setDeletionError(""); setDeletionMessage(""); }}><Trash2 aria-hidden="true" className="size-4"/>Delete selected ({selectedOrderIds.length})</Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="relative">
          <span className="sr-only">Search orders to delete</span>
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"/>
          <input value={orderQuery} onChange={(event) => { setOrderQuery(event.target.value); setOrderPage(1); }} placeholder="Search order number or customer" className="min-h-11 w-full rounded-xl border border-emerald-deep/15 pl-10 pr-3 text-sm"/>
        </label>
        <select aria-label="Filter deletable orders by status" value={orderStatus} onChange={(event) => { setOrderStatus(event.target.value); setOrderPage(1); }} className="min-h-11 rounded-xl border border-emerald-deep/15 bg-white px-3 text-sm">
          <option value="">All statuses</option>
          {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>

      {selectedOrderIds.length ? <div className="mt-4 flex min-h-11 items-center gap-3 rounded-xl bg-amber-50 px-4 text-xs text-amber-950"><strong>{selectedOrderIds.length} selected</strong><button type="button" className="ml-auto min-h-11 cursor-pointer font-semibold underline" onClick={() => { setSelectedOrderIds([]); setConfirmingDeletion(false); setConfirmationText(""); }}>Clear selection</button></div> : null}

      <div className="mt-4 max-h-[32rem] overflow-auto rounded-xl border border-emerald-deep/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#fafbf9] text-[.65rem] uppercase tracking-[.1em] text-stone-400"><tr><th className="w-16 px-4 py-3">Select</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th></tr></thead>
          <tbody>{visibleOrders.map((order) => <tr key={order.id} className={`border-t border-emerald-deep/6 ${selectedOrderIds.includes(order.id) ? "bg-red-50/60" : ""}`}>
            <td className="px-4 py-1"><label className="flex min-h-11 cursor-pointer items-center"><span className="sr-only">Select {order.orderNumber}</span><input type="checkbox" checked={selectedOrderIds.includes(order.id)} onChange={(event) => toggleOrder(order.id, event.target.checked)} className="size-4 accent-red-700"/></label></td>
            <td className="px-4 py-3 font-bold text-emerald-deep">{order.orderNumber}</td>
            <td className="px-4 py-3">{order.customerName}</td>
            <td className="px-4 py-3 text-xs text-stone-500">{new Date(order.createdAt).toLocaleString("en-PK")}</td>
            <td className="px-4 py-3 text-xs font-semibold">{order.status}</td>
            <td className="px-4 py-3 text-right font-semibold">{formatPrice(order.total)}</td>
          </tr>)}</tbody>
        </table>
        {!filteredOrders.length ? <p className="p-8 text-center text-sm text-stone-400">{orderRows.length ? "No orders match these filters." : "There are no orders to delete."}</p> : null}
      </div>

      {filteredOrders.length ? <div className="mt-3 flex flex-col gap-3 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
        <span>{(safeOrderPage - 1) * ORDER_PAGE_SIZE + 1}–{Math.min(safeOrderPage * ORDER_PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length} orders</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={safeOrderPage === 1} onClick={() => setOrderPage((current) => Math.max(1, current - 1))} className="flex min-h-11 cursor-pointer items-center gap-1 rounded-xl border border-emerald-deep/10 px-3 font-semibold text-emerald-deep disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft aria-hidden="true" className="size-4"/>Previous</button>
          <span className="px-2">Page {safeOrderPage} of {orderPageCount}</span>
          <button type="button" disabled={safeOrderPage === orderPageCount} onClick={() => setOrderPage((current) => Math.min(orderPageCount, current + 1))} className="flex min-h-11 cursor-pointer items-center gap-1 rounded-xl border border-emerald-deep/10 px-3 font-semibold text-emerald-deep disabled:cursor-not-allowed disabled:opacity-35">Next<ChevronRight aria-hidden="true" className="size-4"/></button>
        </div>
      </div> : null}

      {confirmingDeletion && selectedOrders.length ? <div role="region" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5" aria-labelledby="delete-orders-title">
        <h3 id="delete-orders-title" className="font-semibold text-red-950">Confirm permanent deletion</h3>
        <p className="mt-2 text-sm leading-6 text-red-900">This will permanently delete {selectedOrders.length} selected order{selectedOrders.length === 1 ? "" : "s"} from the main database, including order items, payment-proof records, review invitations, and reviews. This cannot be undone.</p>
        <div className="mt-3 max-h-28 overflow-auto rounded-xl border border-red-200 bg-white px-4 py-2 text-xs text-red-950">{selectedOrders.map((order) => <p key={order.id} className="py-1"><strong>{order.orderNumber}</strong> · {order.customerName}</p>)}</div>
        <label className="mt-4 block max-w-md"><span className="field-label !text-red-950">Type DELETE to confirm</span><input autoFocus value={confirmationText} onChange={(event) => setConfirmationText(event.target.value)} autoComplete="off" className="min-h-11 w-full rounded-xl border border-red-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"/></label>
        <div className="mt-4 flex flex-wrap gap-2"><Button type="button" variant="danger" disabled={confirmationText !== "DELETE"} loading={deleting} loadingLabel="Deleting order data…" onClick={deleteSelectedOrders}>{`Permanently delete ${selectedOrders.length}`}</Button><Button type="button" variant="outline" disabled={deleting} onClick={() => { setConfirmingDeletion(false); setConfirmationText(""); }}>Cancel</Button></div>
      </div> : null}

      {deletionError ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{deletionError}</p> : null}
      {deletionMessage ? <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{deletionMessage}</p> : null}
    </section>
  </>;
}
