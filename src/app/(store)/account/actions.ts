"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function signOutCustomer() {
  await auth.signOut();
  redirect("/");
}
