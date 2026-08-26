"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Field = "name" | "email" | "currentPassword" | "newPassword" | "confirmPassword";

export function AccountForm({ admin }: { admin: { name: string; email: string } }) {
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<{ message: string; field?: Field } | null>(null);
  const [success, setSuccess] = useState("");

  const errorFor = (field: Field) => error?.field === field ? error.message : undefined;
  return <form ref={formRef} onSubmit={async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess("");
    const data = new FormData(event.currentTarget);
    const body = Object.fromEntries(data.entries());
    if (body.newPassword !== body.confirmPassword) {
      setBusy(false);
      setError({ message: "New passwords do not match", field: "confirmPassword" });
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    try {
      const response = await fetch("/api/admin/account", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) {
        setError({ message: result.error ?? "Could not update the administrator account", field: result.field });
        requestAnimationFrame(() => errorRef.current?.focus());
        return;
      }
      const form = formRef.current;
      if (form) {
        (form.elements.namedItem("currentPassword") as HTMLInputElement).value = "";
        (form.elements.namedItem("newPassword") as HTMLInputElement).value = "";
        (form.elements.namedItem("confirmPassword") as HTMLInputElement).value = "";
      }
      setSuccess("Administrator account updated successfully.");
    } catch {
      setError({ message: "The server could not be reached. Please try again" });
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setBusy(false);
    }
  }} className="max-w-3xl space-y-6">
    {error ? <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 outline-none focus:ring-2 focus:ring-red-700"><strong>We could not save your account.</strong><p className="mt-1">{error.message}. Correct the highlighted field and try again.</p></div> : null}
    {success ? <div aria-live="polite" className="flex items-center gap-2 rounded-xl border border-emerald-700/20 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 aria-hidden="true" className="size-5"/>{success}</div> : null}

    <section className="admin-card">
      <h2 className="admin-card-title">Administrator identity</h2>
      <p className="mt-2 text-sm leading-6 text-stone-500">This name appears in the admin header. The email is used to sign in.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label htmlFor="admin-name"><span className="field-label">Name *</span><Input id="admin-name" name="name" defaultValue={admin.name} required minLength={2} aria-invalid={Boolean(errorFor("name"))} aria-describedby={errorFor("name") ? "admin-name-error" : undefined}/>{errorFor("name") ? <span id="admin-name-error" className="mt-1 block text-xs text-red-700">{errorFor("name")}</span> : null}</label>
        <label htmlFor="admin-email"><span className="field-label">Email *</span><Input id="admin-email" name="email" type="email" defaultValue={admin.email} required autoComplete="username" aria-invalid={Boolean(errorFor("email"))} aria-describedby={errorFor("email") ? "admin-email-error" : undefined}/>{errorFor("email") ? <span id="admin-email-error" className="mt-1 block text-xs text-red-700">{errorFor("email")}</span> : null}</label>
      </div>
    </section>

    <section className="admin-card">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="admin-card-title">Password</h2><p className="mt-2 text-sm leading-6 text-stone-500">Enter your current password to authorize any account change. Leave the new-password fields empty to keep it.</p></div><button type="button" aria-pressed={showPasswords} onClick={() => setShowPasswords((value) => !value)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-emerald-deep/15 px-4 text-xs font-semibold text-emerald-deep">{showPasswords ? <EyeOff aria-hidden="true" className="size-4"/> : <Eye aria-hidden="true" className="size-4"/>}{showPasswords ? "Hide passwords" : "Show passwords"}</button></div>
      <div className="mt-5 grid gap-4">
        <label htmlFor="current-password"><span className="field-label">Current password *</span><Input id="current-password" name="currentPassword" type={showPasswords ? "text" : "password"} required minLength={8} autoComplete="current-password" aria-invalid={Boolean(errorFor("currentPassword"))} aria-describedby={errorFor("currentPassword") ? "current-password-error" : undefined}/>{errorFor("currentPassword") ? <span id="current-password-error" className="mt-1 block text-xs text-red-700">{errorFor("currentPassword")}</span> : null}</label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="new-password"><span className="field-label">New password</span><Input id="new-password" name="newPassword" type={showPasswords ? "text" : "password"} minLength={12} autoComplete="new-password" aria-invalid={Boolean(errorFor("newPassword"))} aria-describedby="new-password-help"/><span id="new-password-help" className={`mt-1 block text-xs ${errorFor("newPassword") ? "text-red-700" : "text-stone-500"}`}>{errorFor("newPassword") ?? "At least 12 characters; a password manager is recommended."}</span></label>
          <label htmlFor="confirm-password"><span className="field-label">Confirm new password</span><Input id="confirm-password" name="confirmPassword" type={showPasswords ? "text" : "password"} autoComplete="new-password" aria-invalid={Boolean(errorFor("confirmPassword"))} aria-describedby={errorFor("confirmPassword") ? "confirm-password-error" : undefined}/>{errorFor("confirmPassword") ? <span id="confirm-password-error" className="mt-1 block text-xs text-red-700">{errorFor("confirmPassword")}</span> : null}</label>
        </div>
      </div>
    </section>
    <Button type="submit" size="lg" loading={busy} loadingLabel="Saving account…"><Save aria-hidden="true" className="size-4"/>Save account</Button>
  </form>;
}
