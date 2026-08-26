"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, CheckCircle2, ChevronDown, CircleAlert, Copy, MessageCircle, Send, X } from "lucide-react";
import type { orders } from "@/db/schema";
import { Button, buttonClasses } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { CopyButton } from "@/components/admin/copy-button";

type Status = typeof orders.$inferSelect.status;
type Payment = typeof orders.$inferSelect.paymentStatus;
type ComposeType = "customer" | "payment_verified" | "payment_issue" | "confirmation" | "completed" | "cancellation";
type Feedback = { kind: "success" | "error"; text: string } | null;

const statuses: Status[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
const transitions: Record<Status, Status[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: []
};

const statusSuccess: Record<Status, string> = {
  PENDING: "Order status updated.",
  CONFIRMED: "Order confirmed successfully.",
  COMPLETED: "Order marked as completed. The review invitation is ready.",
  CANCELLED: "Order cancelled successfully."
};

export function OrderActions({
  id,
  initialStatus,
  paymentMethod,
  initialPaymentStatus,
  hasProof,
  initialReviewUrl,
  generalMessageUrl
}: {
  id: string;
  initialStatus: Status;
  paymentMethod: "COD" | "EASYPAISA";
  initialPaymentStatus: Payment;
  hasProof: boolean;
  initialReviewUrl: string | null;
  generalMessageUrl: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [selectedStatus, setSelectedStatus] = useState<Status>(initialStatus);
  const [payment, setPayment] = useState(initialPaymentStatus);
  const [reviewUrl, setReviewUrl] = useState(initialReviewUrl ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [feedbackClosing, setFeedbackClosing] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Status | null>(null);

  const update = async (body: { status?: Status; paymentStatus?: "VERIFIED" | "REJECTED" }, action: string) => {
    setBusy(action);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Could not update the order.");
      if (result.order?.status) {
        setStatus(result.order.status);
        setSelectedStatus(result.order.status);
      }
      if (result.order?.paymentStatus) setPayment(result.order.paymentStatus);
      if (result.reviewUrl) setReviewUrl(result.reviewUrl);
      setFeedback({
        kind: "success",
        text: body.status ? statusSuccess[body.status] : body.paymentStatus === "VERIFIED" ? "Payment verified successfully." : "Payment proof rejected."
      });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: error instanceof Error ? error.message : "Could not update the order." });
    } finally {
      setBusy(null);
      setConfirmTarget(null);
    }
  };

  const requestStatusUpdate = (target: Status) => {
    if (target === "CANCELLED" || target === "COMPLETED") setConfirmTarget(target);
    else void update({ status: target }, `status-${target}`);
  };

  const compose = async (type: ComposeType) => {
    setBusy(`message-${type}`);
    setFeedback(null);
    const popup = window.open("", `hj-${type}`);
    if (popup) popup.opener = null;
    try {
      const response = await fetch(`/api/admin/orders/${id}/compose`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Could not prepare the WhatsApp message.");
      if (result.reviewUrl) setReviewUrl(result.reviewUrl);
      if (popup) popup.location.href = result.url;
      else window.open(result.url, "_blank", "noopener,noreferrer");
      setFeedback({ kind: "success", text: "WhatsApp opened with the message ready to review and send." });
      router.refresh();
    } catch (error) {
      popup?.close();
      setFeedback({ kind: "error", text: error instanceof Error ? error.message : "Could not prepare the WhatsApp message." });
    } finally {
      setBusy(null);
    }
  };

  const easypaisaNeedsVerification = paymentMethod === "EASYPAISA" && payment !== "VERIFIED";
  const allowed = transitions[status];
  const dismissFeedback = () => {
    setFeedbackClosing(true);
    window.setTimeout(() => { setFeedback(null); setFeedbackClosing(false); }, 220);
  };

  useEffect(() => {
    if (!feedback) return;
    let exitTimer = 0;
    const timer = window.setTimeout(() => {
      setFeedbackClosing(true);
      exitTimer = window.setTimeout(() => { setFeedback(null); setFeedbackClosing(false); }, 220);
    }, 4800);
    return () => { window.clearTimeout(timer); window.clearTimeout(exitTimer); };
  }, [feedback]);

  return <>
    <section aria-busy={Boolean(busy) || undefined} className="admin-card overflow-hidden !p-0">
      <div className="bg-emerald-ink px-5 py-5 text-white sm:px-6">
        <p className="text-[.66rem] font-bold uppercase tracking-[.16em] text-gold-light">Operational control</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <h2 className="font-display text-3xl font-semibold">Order actions</h2>
          <StatusBadge key={status} value={status}/>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.12em] text-stone-400">Recommended next step</p>
          <div className="mt-3 grid gap-2">
            {status === "PENDING" ? <>
              <Button disabled={Boolean(busy) || easypaisaNeedsVerification} loading={busy === "status-CONFIRMED"} loadingLabel="Confirming order…" onClick={() => requestStatusUpdate("CONFIRMED")}>
                <Check aria-hidden="true" className="size-4"/>Confirm order
              </Button>
              {easypaisaNeedsVerification ? <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Verify the Easypaisa payment before confirming this order.</p> : null}
            </> : null}
            {status === "CONFIRMED" ? <>
              <Button variant="gold" disabled={Boolean(busy)} loading={busy === "message-confirmation"} loadingLabel="Preparing confirmation…" onClick={() => void compose("confirmation")}><MessageCircle aria-hidden="true" className="size-4"/>Send confirmation on WhatsApp</Button>
              <Button disabled={Boolean(busy)} loading={busy === "status-COMPLETED"} loadingLabel="Completing order…" onClick={() => requestStatusUpdate("COMPLETED")}><CheckCircle2 aria-hidden="true" className="size-4"/>Mark as completed</Button>
            </> : null}
            {status === "COMPLETED" ? <>
              <Button variant="gold" disabled={Boolean(busy)} loading={busy === "message-completed"} loadingLabel="Generating review link…" onClick={() => void compose("completed")}><Send aria-hidden="true" className="size-4"/>Send thank you & review request</Button>
              {reviewUrl ? <CopyButton value={reviewUrl} label="Copy review link" className="state-reveal min-h-11 justify-center"/> : <Button variant="outline" disabled><Copy aria-hidden="true" className="size-4"/>Preparing review link…</Button>}
            </> : null}
            {status === "CANCELLED" ? <Button variant="outline" disabled={Boolean(busy)} loading={busy === "message-cancellation"} loadingLabel="Preparing cancellation…" onClick={() => void compose("cancellation")}><Ban aria-hidden="true" className="size-4"/>Send cancellation message</Button> : null}
            <a href={generalMessageUrl} target="_blank" rel="noreferrer" className={buttonClasses("outline", "md")}><MessageCircle aria-hidden="true" className="size-4"/>Message customer</a>
          </div>
        </div>

        {paymentMethod === "EASYPAISA" ? <div className="border-t border-emerald-deep/10 pt-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-stone-400">Payment verification</p><p className="mt-1 text-xs text-stone-500">Easypaisa proof {hasProof ? "is attached" : "is missing"}.</p></div><StatusBadge key={payment} value={payment}/></div>
          {payment === "PENDING_VERIFICATION" ? <div className="mt-4 grid grid-cols-2 gap-2">
            <Button disabled={Boolean(busy) || !hasProof} loading={busy === "verify-payment"} loadingLabel="Verifying payment…" onClick={() => void update({ paymentStatus: "VERIFIED" }, "verify-payment")}><Check aria-hidden="true" className="size-4"/>Verify payment</Button>
            <Button variant="danger" disabled={Boolean(busy) || !hasProof} loading={busy === "reject-payment"} loadingLabel="Rejecting payment…" onClick={() => void update({ paymentStatus: "REJECTED" }, "reject-payment")}><X aria-hidden="true" className="size-4"/>Reject payment</Button>
          </div> : null}
          {payment === "VERIFIED" ? <Button className="mt-4 w-full" variant="outline" disabled={Boolean(busy)} onClick={() => void compose("payment_verified")}><MessageCircle aria-hidden="true" className="size-4"/>Send payment verified message</Button> : null}
          {payment === "REJECTED" ? <Button className="mt-4 w-full" variant="outline" disabled={Boolean(busy)} onClick={() => void compose("payment_issue")}><CircleAlert aria-hidden="true" className="size-4"/>Send payment issue message</Button> : null}
        </div> : null}

        <div className="border-t border-emerald-deep/10 pt-5">
          <label htmlFor="order-status" className="text-xs font-bold uppercase tracking-[.12em] text-stone-400">Set order status</label>
          <div className="relative mt-2">
            <select id="order-status" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as Status)} disabled={Boolean(busy)} className="min-h-12 w-full cursor-pointer appearance-none rounded-xl border border-emerald-deep/15 bg-white px-4 pr-11 text-sm font-semibold text-emerald-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              {statuses.map((value) => <option key={value} value={value} disabled={value !== status && !allowed.includes(value)}>{value.replaceAll("_", " ")}</option>)}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-stone-400"/>
          </div>
          <Button className="mt-2 w-full" disabled={Boolean(busy) || selectedStatus === status} loading={Boolean(busy?.startsWith("status-"))} loadingLabel={selectedStatus === "COMPLETED" ? "Completing order…" : selectedStatus === "CONFIRMED" ? "Confirming order…" : "Updating order…"} onClick={() => requestStatusUpdate(selectedStatus)}>Update status</Button>
          <p className="mt-2 text-[.68rem] leading-5 text-stone-400">Status changes are saved only when you press Update status. Customer messages are never sent automatically.</p>
        </div>
      </div>
    </section>

    {feedback ? <div data-closing={feedbackClosing ? "true" : "false"} role={feedback.kind === "error" ? "alert" : "status"} className={`luxury-toast fixed bottom-5 right-5 z-[90] flex max-w-sm items-start gap-3 rounded-2xl border p-4 text-sm shadow-xl ${feedback.kind === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>
      {feedback.kind === "error" ? <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0"/> : <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0"/>}
      <p className="leading-6">{feedback.text}</p>
      <button type="button" onClick={dismissFeedback} aria-label="Dismiss notification" className="ml-auto flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-black/5"><X aria-hidden="true" className="size-4"/></button>
    </div> : null}

    {confirmTarget ? <div role="dialog" aria-modal="true" aria-labelledby="status-confirm-title" className="dialog-backdrop fixed inset-0 z-[100] grid place-items-center bg-emerald-ink/70 p-4 backdrop-blur-sm">
      <div className="dialog-panel w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <span className={`grid size-12 place-items-center rounded-2xl ${confirmTarget === "CANCELLED" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{confirmTarget === "CANCELLED" ? <Ban aria-hidden="true" className="size-5"/> : <CheckCircle2 aria-hidden="true" className="size-5"/>}</span>
        <h2 id="status-confirm-title" className="mt-5 font-display text-3xl font-semibold text-emerald-deep">{confirmTarget === "CANCELLED" ? "Cancel this order?" : "Mark order as completed?"}</h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">{confirmTarget === "CANCELLED" ? "The order will move to its final cancelled state. You can then notify the customer on WhatsApp." : "Use this only after the order has been fully fulfilled or delivered. A secure review invitation will be generated."}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={Boolean(busy)} onClick={() => { setConfirmTarget(null); setSelectedStatus(status); }}>Go back</Button>
          <Button autoFocus variant={confirmTarget === "CANCELLED" ? "danger" : "primary"} disabled={Boolean(busy)} loading={Boolean(busy)} loadingLabel={confirmTarget === "CANCELLED" ? "Cancelling order…" : "Completing order…"} onClick={() => void update({ status: confirmTarget }, `status-${confirmTarget}`)}>{confirmTarget === "CANCELLED" ? "Cancel order" : "Mark completed"}</Button>
        </div>
      </div>
    </div> : null}
  </>;
}
