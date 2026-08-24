"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import type { CustomerAuthState } from "@/lib/auth/customer-types";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128)
});

export async function signInWithEmail(_previous: CustomerAuthState, formData: FormData): Promise<CustomerAuthState> {
  const parsed = schema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) {
    const fieldErrors: CustomerAuthState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if ((field === "email" || field === "password") && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { error: "Check the highlighted fields and try again.", fieldErrors };
  }

  try {
    const { error } = await auth.signIn.email(parsed.data);
    if (error) return { error: error.message || "The email or password is incorrect." };
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again." };
  }

  redirect("/account");
}
