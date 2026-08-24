"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import type { CustomerAuthState } from "@/lib/auth/customer-types";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(254),
  password: z.string().min(8, "Use at least 8 characters").max(128)
});

export async function signUpWithEmail(_previous: CustomerAuthState, formData: FormData): Promise<CustomerAuthState> {
  const parsed = schema.safeParse({ name: formData.get("name"), email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) {
    const fieldErrors: CustomerAuthState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if ((field === "name" || field === "email" || field === "password") && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { error: "Check the highlighted fields and try again.", fieldErrors };
  }

  try {
    const { error } = await auth.signUp.email(parsed.data);
    if (error) return { error: error.message || "We could not create your account." };
  } catch {
    return { error: "Account creation is temporarily unavailable. Please try again." };
  }

  redirect("/account");
}
