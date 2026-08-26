import Image from "next/image";
<<<<<<< ours
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ReceiptText,
  UserRound
} from "lucide-react";
import { CopyButton } from "@/components/admin/copy-button";
import { OrderActions } from "@/components/admin/order-actions";
import { PaymentProofPreview } from "@/components/admin/payment-proof-preview";
import { StatusBadge } from "@/components/admin/status-badge";
import { buttonClasses } from "@/components/ui/button";
import { getAdminOrder } from "@/lib/admin-data";
import { ensureReviewInvitation } from "@/lib/reviews";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";
import { generateCustomerWhatsAppMessage, generateWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const eventLabels: Record<string, string> = {
  ORDER_CREATED: "Order created",
  PAYMENT_VERIFIED: "Payment verified",
  PAYMENT_REJECTED: "Payment proof rejected",
  ORDER_CONFIRMED: "Order confirmed",
  ORDER_COMPLETED: "Order completed",
  ORDER_CANCELLED: "Order cancelled"
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Karachi"
  }).format(value);
}

function paymentMethodLabel(value: "COD" | "EASYPAISA") {
  return value === "COD" ? "Cash on Delivery" : "Easypaisa";
}

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, settings] = await Promise.all([getAdminOrder(id), getSettings()]);
  if (!data) notFound();

  let reviewUrl = data.reviewUrl;
  if (data.order.status === "COMPLETED" && !reviewUrl) {
    reviewUrl = (await ensureReviewInvitation(id, settings.reviews.expiryDays)).reviewUrl;
  }

  const address = [
    data.order.addressSnapshot.address,
    data.order.addressSnapshot.area,
    data.order.addressSnapshot.city,
    data.order.addressSnapshot.postalCode
  ].filter(Boolean).join(", ");
  const generalMessage = generateCustomerWhatsAppMessage(settings.whatsapp.customerTemplate, {
    customerName: data.customer.fullName,
    orderNumber: data.order.orderNumber,
    total: data.order.total,
    paymentMethod: data.order.paymentMethod
  });
  const generalMessageUrl = generateWhatsAppUrl(data.customer.whatsapp, generalMessage);
  const timeline = data.events.length ? data.events : [{ id: "created", type: "ORDER_CREATED", createdAt: data.order.createdAt }];
  const submittedReview = data.review?.review ?? null;

  return <div className="mx-auto max-w-[1500px]">
    <Link href="/admin/orders" className="mb-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full text-xs font-semibold text-stone-500 transition hover:text-emerald-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><ArrowLeft aria-hidden="true" className="size-4"/>Back to orders</Link>

    <header className="overflow-hidden rounded-3xl bg-emerald-ink text-white shadow-lg">
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-start lg:p-9">
        <div>
          <p className="text-[.68rem] font-bold uppercase tracking-[.18em] text-gold-light">Order details</p>
          <div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl font-semibold sm:text-5xl">Order {data.order.orderNumber}</h1><StatusBadge value={data.order.status}/></div>
          <p className="mt-3 flex items-center gap-2 text-sm text-white/60"><CalendarDays aria-hidden="true" className="size-4"/>Placed {formatDateTime(data.order.createdAt)}</p>
        </div>
        <a href={generalMessageUrl} target="_blank" rel="noreferrer" className={buttonClasses("gold", "lg")}><MessageCircle aria-hidden="true" className="size-4"/>Message customer on WhatsApp</a>
      </div>

      <dl className="grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Customer", data.customer.fullName],
          ["WhatsApp", data.customer.whatsapp],
          ["Payment method", paymentMethodLabel(data.order.paymentMethod)],
          ["Grand total", formatPrice(data.order.total)]
        ].map(([label, value]) => <div key={label} className="border-b border-white/10 px-5 py-4 last:border-b-0 sm:px-7 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"><dt className="text-[.62rem] font-bold uppercase tracking-[.14em] text-white/40">{label}</dt><dd className="mt-1 text-sm font-semibold text-white">{value}</dd></div>)}
      </dl>
      <div className="grid border-t border-white/10 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-7"><span className="text-[.62rem] font-bold uppercase tracking-[.14em] text-white/40">Order status</span><StatusBadge value={data.order.status}/></div>
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:border-l sm:border-t-0 sm:px-7"><span className="text-[.62rem] font-bold uppercase tracking-[.14em] text-white/40">Payment status</span><StatusBadge value={data.order.paymentStatus}/></div>
      </div>
    </header>

    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start">
      <div className="order-1 xl:col-start-2 xl:row-start-1">
        <OrderActions id={id} initialStatus={data.order.status} paymentMethod={data.order.paymentMethod} initialPaymentStatus={data.order.paymentStatus} hasProof={Boolean(data.proof)} initialReviewUrl={reviewUrl} generalMessageUrl={generalMessageUrl}/>
      </div>

      <section className="admin-card order-2 xl:col-start-1 xl:row-start-1" aria-labelledby="customer-title">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-soft text-emerald-deep"><UserRound aria-hidden="true" className="size-5"/></span><div><p className="text-[.65rem] font-bold uppercase tracking-[.14em] text-gold">Customer</p><h2 id="customer-title" className="admin-card-title">Customer details</h2></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#f7f8f5] p-4"><p className="text-[.64rem] font-bold uppercase tracking-[.12em] text-stone-400">Full name</p><p className="mt-1 font-semibold text-emerald-deep">{data.customer.fullName}</p></div>
          <div className="rounded-2xl bg-[#f7f8f5] p-4"><p className="flex items-center gap-1.5 text-[.64rem] font-bold uppercase tracking-[.12em] text-stone-400"><Phone aria-hidden="true" className="size-3.5"/>Phone</p><p className="mt-1 break-all text-sm font-semibold text-emerald-deep">{data.customer.phone}</p><CopyButton value={data.customer.phone} label="Copy phone" className="mt-3"/></div>
          <div className="rounded-2xl bg-[#f7f8f5] p-4"><p className="flex items-center gap-1.5 text-[.64rem] font-bold uppercase tracking-[.12em] text-stone-400"><MessageCircle aria-hidden="true" className="size-3.5"/>WhatsApp</p><p className="mt-1 break-all text-sm font-semibold text-emerald-deep">{data.customer.whatsapp}</p><CopyButton value={data.customer.whatsapp} label="Copy WhatsApp" className="mt-3"/></div>
          <div className="rounded-2xl bg-[#f7f8f5] p-4"><p className="flex items-center gap-1.5 text-[.64rem] font-bold uppercase tracking-[.12em] text-stone-400"><Mail aria-hidden="true" className="size-3.5"/>Email</p><p className="mt-1 break-all text-sm font-semibold text-emerald-deep">{data.customer.email || "Not provided"}</p></div>
        </div>
        <div className="mt-4 rounded-2xl border border-emerald-deep/8 p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="flex items-center gap-1.5 text-[.64rem] font-bold uppercase tracking-[.12em] text-stone-400"><MapPin aria-hidden="true" className="size-3.5"/>Delivery address</p><p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-emerald-deep">{data.order.addressSnapshot.address}</p><p className="text-sm leading-6 text-stone-500">{data.order.addressSnapshot.area}, {data.order.addressSnapshot.city}{data.order.addressSnapshot.postalCode ? ` ${data.order.addressSnapshot.postalCode}` : ""}</p></div><CopyButton value={address} label="Copy address" className="shrink-0"/></div></div>
        {data.order.notes ? <div className="mt-4 rounded-2xl border border-gold/25 bg-gold/5 p-4"><p className="text-[.64rem] font-bold uppercase tracking-[.12em] text-amber-800">Customer notes</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">{data.order.notes}</p></div> : null}
      </section>

      <section className="admin-card order-3 xl:col-start-1 xl:row-start-2" aria-labelledby="items-title">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-soft text-emerald-deep"><Package aria-hidden="true" className="size-5"/></span><div><p className="text-[.65rem] font-bold uppercase tracking-[.14em] text-gold">Historical snapshots</p><h2 id="items-title" className="admin-card-title">Order items</h2></div></div>
        <div className="mt-6 divide-y divide-emerald-deep/8">
          {data.items.map((item) => <article key={item.id} className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">{item.imageUrl ? <Image src={item.imageUrl} alt={item.productName} fill sizes="88px" className="object-cover"/> : <div className="grid h-full place-items-center text-[.6rem] text-stone-400">No image</div>}</div>
            <div className="min-w-0"><h3 className="font-display text-xl font-semibold leading-tight text-emerald-deep sm:text-2xl">{item.productName}</h3><p className="mt-1 text-xs font-semibold uppercase tracking-[.08em] text-stone-400">SKU {item.sku}</p><dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-xs sm:grid-cols-4"><div><dt className="text-stone-400">Size</dt><dd className="font-semibold text-stone-700">{item.size || "—"}</dd></div><div><dt className="text-stone-400">Color</dt><dd className="font-semibold text-stone-700">{item.color || "—"}</dd></div><div><dt className="text-stone-400">Quantity</dt><dd className="font-semibold text-stone-700">{item.quantity}</dd></div><div><dt className="text-stone-400">Unit price</dt><dd className="font-semibold text-stone-700">{formatPrice(item.unitPrice)}</dd></div></dl></div>
            <div className="col-start-2 border-t border-emerald-deep/8 pt-3 text-left sm:col-start-auto sm:border-0 sm:pl-5 sm:text-right"><p className="text-[.62rem] font-bold uppercase tracking-[.12em] text-stone-400">Line total</p><p className="mt-1 font-semibold text-emerald-deep">{formatPrice(item.totalPrice)}</p></div>
          </article>)}
        </div>
      </section>

      <section className="admin-card order-4 xl:col-start-2 xl:row-start-2" aria-labelledby="payment-title">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-amber-50 text-amber-800"><CreditCard aria-hidden="true" className="size-5"/></span><div><p className="text-[.65rem] font-bold uppercase tracking-[.14em] text-gold">Payment</p><h2 id="payment-title" className="admin-card-title">{data.order.paymentMethod === "EASYPAISA" ? "Payment verification" : "Payment details"}</h2></div></div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-[#f7f8f5] p-3"><dt className="text-[.62rem] font-bold uppercase tracking-[.1em] text-stone-400">Method</dt><dd className="mt-1 font-semibold text-emerald-deep">{paymentMethodLabel(data.order.paymentMethod)}</dd></div>
          <div className="rounded-xl bg-[#f7f8f5] p-3"><dt className="text-[.62rem] font-bold uppercase tracking-[.1em] text-stone-400">Amount</dt><dd className="mt-1 font-semibold text-emerald-deep">{formatPrice(data.order.total)}</dd></div>
          <div className="col-span-2 flex items-center justify-between rounded-xl bg-[#f7f8f5] p-3"><dt className="text-[.62rem] font-bold uppercase tracking-[.1em] text-stone-400">Payment status</dt><dd><StatusBadge value={data.order.paymentStatus}/></dd></div>
          {data.order.paymentMethod === "EASYPAISA" ? <div className="col-span-2 rounded-xl bg-[#f7f8f5] p-3"><dt className="text-[.62rem] font-bold uppercase tracking-[.1em] text-stone-400">Uploaded</dt><dd className="mt-1 font-semibold text-emerald-deep">{data.proof ? formatDateTime(data.proof.createdAt) : "Not uploaded"}</dd></div> : null}
        </dl>
        {data.order.paymentMethod === "EASYPAISA" ? <div className="mt-5">{data.proof ? <PaymentProofPreview url={data.proof.url} alt={`Easypaisa payment proof for ${data.order.orderNumber}`}/> : <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-6 text-center text-sm font-semibold text-amber-900">No payment screenshot uploaded.</div>}</div> : <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">Payment is due when the order is delivered.</p>}
      </section>

      <section className="admin-card order-5 xl:col-start-1 xl:row-start-3" aria-labelledby="totals-title">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-soft text-emerald-deep"><ReceiptText aria-hidden="true" className="size-5"/></span><div><p className="text-[.65rem] font-bold uppercase tracking-[.14em] text-gold">Financial summary</p><h2 id="totals-title" className="admin-card-title">Order totals</h2></div></div>
        <dl className="ml-auto mt-6 max-w-md space-y-3 text-sm"><div className="flex justify-between gap-5"><dt className="text-stone-500">Subtotal</dt><dd className="font-semibold text-emerald-deep">{formatPrice(data.order.subtotal)}</dd></div><div className="flex justify-between gap-5"><dt className="text-stone-500">Delivery fee</dt><dd className="font-semibold text-emerald-deep">{formatPrice(data.order.deliveryFee)}</dd></div>{data.order.discount > 0 ? <div className="flex justify-between gap-5 text-emerald-700"><dt>Discount</dt><dd className="font-semibold">−{formatPrice(data.order.discount)}</dd></div> : null}<div className="flex items-end justify-between gap-5 border-t border-emerald-deep/10 pt-4"><dt className="font-display text-2xl font-semibold text-emerald-deep">Grand total</dt><dd className="text-xl font-bold text-emerald-deep">{formatPrice(data.order.total)}</dd></div></dl>
      </section>

      <section className="admin-card order-6 xl:col-start-2 xl:row-start-3" aria-labelledby="history-title">
        <p className="text-[.65rem] font-bold uppercase tracking-[.14em] text-gold">Audit trail</p><h2 id="history-title" className="admin-card-title">Order history</h2>
        <ol className="mt-6 space-y-0">{timeline.map((event, index) => <li key={event.id} className="relative grid grid-cols-[18px_1fr] gap-3 pb-6 last:pb-0"><span className={`relative z-10 mt-1 size-3 rounded-full ring-4 ring-white ${event.type.includes("CANCEL") || event.type.includes("REJECT") ? "bg-red-600" : index === timeline.length - 1 ? "bg-gold" : "bg-emerald-deep"}`}/>{index < timeline.length - 1 ? <span className="absolute bottom-0 left-[5px] top-3 w-px bg-emerald-deep/15"/> : null}<div><p className="text-sm font-semibold text-emerald-deep">{eventLabels[event.type] ?? event.type.replaceAll("_", " ").toLowerCase()}</p><time className="mt-0.5 block text-xs text-stone-400">{formatDateTime(event.createdAt)}</time></div></li>)}</ol>
        {data.order.status === "COMPLETED" ? <div className="mt-6 border-t border-emerald-deep/10 pt-5"><p className="text-[.64rem] font-bold uppercase tracking-[.12em] text-stone-400">Review state</p><dl className="mt-3 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-stone-500">Review invitation</dt><dd className="font-semibold text-emerald-deep">{reviewUrl ? "Generated" : "Not generated"}</dd></div><div className="flex justify-between gap-3"><dt className="text-stone-500">Review</dt><dd className="font-semibold text-emerald-deep">{submittedReview ? `Submitted ${"★".repeat(submittedReview.rating)}` : "Not submitted"}</dd></div></dl></div> : null}
      </section>
    </div>
  </div>;
}
=======
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderActions } from "@/components/admin/order-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminOrder } from "@/lib/admin-data";
import { formatPrice } from "@/lib/utils";
export const dynamic="force-dynamic";
export default async function AdminOrderPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const data=await getAdminOrder(id);if(!data)notFound();return <><AdminPageHeader eyebrow="Order details" title={data.order.orderNumber} description={`Placed ${data.order.createdAt.toLocaleString("en-PK")}`}/><div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]"><div className="space-y-6"><section className="admin-card"><div className="flex items-start justify-between"><div><h2 className="admin-card-title">Customer</h2><p className="mt-3 font-semibold text-emerald-deep">{data.customer.fullName}</p><p className="text-sm text-stone-500">{data.customer.phone} · WhatsApp {data.customer.whatsapp}</p>{data.customer.email?<p className="text-sm text-stone-500">{data.customer.email}</p>:null}</div><StatusBadge value={data.order.status}/></div><div className="mt-5 rounded-xl bg-[#f7f8f5] p-4 text-sm leading-6"><p>{data.order.addressSnapshot.address}</p><p>{data.order.addressSnapshot.area}, {data.order.addressSnapshot.city} {data.order.addressSnapshot.postalCode}</p></div>{data.order.notes?<p className="mt-4 rounded-xl border border-gold/20 bg-champagne/15 p-4 text-sm"><strong>Note:</strong> {data.order.notes}</p>:null}</section><section className="admin-card"><h2 className="admin-card-title">Items</h2><div className="mt-5 divide-y divide-emerald-deep/8">{data.items.map(item=><div key={item.id} className="flex items-center gap-4 py-4"><div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">{item.imageUrl?<Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover"/>:null}</div><div className="min-w-0 flex-1"><p className="font-semibold text-emerald-deep">{item.quantity} × {item.productName}</p><p className="text-xs text-stone-400">{item.sku}{item.variantLabel?` · ${item.variantLabel}`:""}</p></div><p className="font-semibold">{formatPrice(item.totalPrice)}</p></div>)}</div><dl className="ml-auto mt-5 max-w-sm space-y-2 border-t border-emerald-deep/10 pt-5 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(data.order.subtotal)}</dd></div><div className="flex justify-between"><dt>Delivery</dt><dd>{formatPrice(data.order.deliveryFee)}</dd></div><div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatPrice(data.order.total)}</dd></div></dl></section>{data.proof?<section className="admin-card"><h2 className="admin-card-title">Easypaisa proof</h2><a href={data.proof.url} target="_blank" rel="noreferrer" className="relative mt-5 block aspect-video overflow-hidden rounded-xl bg-stone-100"><Image src={data.proof.url} alt={`Payment proof for ${data.order.orderNumber}`} fill sizes="700px" className="object-contain"/></a></section>:null}</div><OrderActions id={id} initialStatus={data.order.status} initialPaymentStatus={data.order.paymentStatus} hasProof={Boolean(data.proof)}/></div></>}

>>>>>>> theirs
