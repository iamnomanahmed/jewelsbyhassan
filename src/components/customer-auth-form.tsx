"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomerAuthState } from "@/lib/auth/customer-types";

type Props = {
  mode: "sign-in" | "sign-up";
  action: (previous: CustomerAuthState, formData: FormData) => Promise<CustomerAuthState>;
};

const initialState: CustomerAuthState = {};

export function CustomerAuthForm({ mode, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const signingUp = mode === "sign-up";

  return <form action={formAction} className="mt-8" noValidate>
    {state.error ? <div role="alert" tabIndex={-1} className="mb-5 rounded-xl border border-red-800/15 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">{state.error}</div> : null}

    {signingUp ? <label className="block" htmlFor="customer-name">
      <span className="field-label">Full name</span>
      <span className="relative block">
        <UserRound aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-emerald-deep/45"/>
        <Input id="customer-name" name="name" type="text" required autoComplete="name" minLength={2} maxLength={100} aria-invalid={Boolean(state.fieldErrors?.name)} aria-describedby={state.fieldErrors?.name ? "customer-name-error" : undefined} className="pl-11"/>
      </span>
      {state.fieldErrors?.name ? <span id="customer-name-error" className="mt-1.5 block text-xs font-medium text-red-800">{state.fieldErrors.name}</span> : null}
    </label> : null}

    <label className={signingUp ? "mt-5 block" : "block"} htmlFor="customer-email">
      <span className="field-label">Email address</span>
      <span className="relative block">
        <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-emerald-deep/45"/>
        <Input id="customer-email" name="email" type="email" inputMode="email" required autoComplete="email" maxLength={254} aria-invalid={Boolean(state.fieldErrors?.email)} aria-describedby={state.fieldErrors?.email ? "customer-email-error" : undefined} className="pl-11"/>
      </span>
      {state.fieldErrors?.email ? <span id="customer-email-error" className="mt-1.5 block text-xs font-medium text-red-800">{state.fieldErrors.email}</span> : null}
    </label>

    <label className="mt-5 block" htmlFor="customer-password">
      <span className="field-label">Password</span>
      <span className="relative block">
        <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-emerald-deep/45"/>
        <Input id="customer-password" name="password" type={showPassword ? "text" : "password"} required minLength={8} maxLength={128} autoComplete={signingUp ? "new-password" : "current-password"} aria-invalid={Boolean(state.fieldErrors?.password)} aria-describedby={state.fieldErrors?.password ? "customer-password-error" : signingUp ? "customer-password-help" : undefined} className="pl-11 pr-14"/>
        <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-emerald-deep/55 transition hover:bg-emerald-deep/5 hover:text-emerald-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          {showPassword ? <EyeOff aria-hidden="true" className="size-4"/> : <Eye aria-hidden="true" className="size-4"/>}
        </button>
      </span>
      {state.fieldErrors?.password ? <span id="customer-password-error" className="mt-1.5 block text-xs font-medium text-red-800">{state.fieldErrors.password}</span> : signingUp ? <span id="customer-password-help" className="mt-1.5 block text-xs text-stone-500">Use at least 8 characters. Password managers and paste are supported.</span> : null}
    </label>

    <Button type="submit" size="lg" className="mt-7 w-full" disabled={isPending}>
      {isPending ? (signingUp ? "Creating account…" : "Signing in…") : (signingUp ? "Create account" : "Sign in securely")}
    </Button>

    <p className="mt-6 text-center text-sm text-stone-600">
      {signingUp ? "Already have an account?" : "New to Hassan Jewels?"}{" "}
      <Link href={signingUp ? "/auth/sign-in" : "/auth/sign-up"} className="font-semibold text-emerald-deep underline decoration-gold/60 underline-offset-4 transition hover:text-emerald-rich focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
        {signingUp ? "Sign in" : "Create one"}
      </Link>
    </p>
  </form>;
}
