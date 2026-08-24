import type { Metadata } from "next";
import { CustomerAuthForm } from "@/components/customer-auth-form";
import { CustomerAuthShell } from "@/components/customer-auth-shell";
import { signUpWithEmail } from "./actions";

export const metadata: Metadata = { title: "Create Customer Account", robots: { index: false, follow: false } };

export default function CustomerSignUpPage() {
  return <CustomerAuthShell eyebrow="Join Hassan Jewels" title="Create account" description="Create a secure customer profile for a more personal shopping experience.">
    <CustomerAuthForm mode="sign-up" action={signUpWithEmail}/>
  </CustomerAuthShell>;
}
