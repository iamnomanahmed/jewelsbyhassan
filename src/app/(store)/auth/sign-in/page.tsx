import type { Metadata } from "next";
import { CustomerAuthForm } from "@/components/customer-auth-form";
import { CustomerAuthShell } from "@/components/customer-auth-shell";
import { signInWithEmail } from "./actions";

export const metadata: Metadata = { title: "Customer Sign In", robots: { index: false, follow: false } };

export default function CustomerSignInPage() {
  return <CustomerAuthShell eyebrow="Welcome back" title="Sign in" description="Access your private customer account with the email and password you used at registration.">
    <CustomerAuthForm mode="sign-in" action={signInWithEmail}/>
  </CustomerAuthShell>;
}
