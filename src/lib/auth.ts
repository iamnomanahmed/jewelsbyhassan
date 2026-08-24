import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adminUsers } from "@/db/schema";

const COOKIE = "hj_admin";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be at least 32 characters");
    return new TextEncoder().encode("development-only-hassan-jewels-secret-change-me");
  }
  return new TextEncoder().encode(value);
}

export async function authenticateAdmin(email: string, password: string) {
  const [admin] = await getDb().select().from(adminUsers).where(eq(adminUsers.email, email.toLowerCase())).limit(1);
  if (!admin?.active || !(await bcrypt.compare(password, admin.passwordHash))) return null;
  await getDb().update(adminUsers).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(adminUsers.id, admin.id));
  return admin;
}

export async function createAdminSession(admin: { id: string; email: string; name: string }) {
  const token = await new SignJWT({ email: admin.email, name: admin.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function destroyAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function getAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const [admin] = await getDb().select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, active: adminUsers.active })
      .from(adminUsers).where(eq(adminUsers.id, payload.sub)).limit(1);
    return admin?.active ? admin : null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

