import bcrypt from "bcryptjs";
import { and, eq, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { adminUsers } from "@/db/schema";
import { createAdminSession, getAdmin } from "@/lib/auth";

const accountSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters").max(120),
  email: z.string().trim().email("Enter a valid email address").max(255),
  currentPassword: z.string().min(8).max(200),
  newPassword: z.union([z.literal(""), z.string().min(12, "New password must contain at least 12 characters").max(200)]),
  confirmPassword: z.string().max(200)
}).refine((value) => value.newPassword === value.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"]
});

export async function PUT(request: NextRequest) {
  const sessionAdmin = await getAdmin();
  if (!sessionAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = accountSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the account fields", field: parsed.error.issues[0]?.path[0] }, { status: 400 });
  }

  const db = getDb();
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, sessionAdmin.id)).limit(1);
  if (!admin || !(await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash))) {
    return NextResponse.json({ error: "Current password is incorrect", field: "currentPassword" }, { status: 403 });
  }
  const email = parsed.data.email.toLowerCase();
  const [duplicate] = await db.select({ id: adminUsers.id }).from(adminUsers)
    .where(and(eq(adminUsers.email, email), ne(adminUsers.id, admin.id))).limit(1);
  if (duplicate) return NextResponse.json({ error: "That email address is already assigned to another administrator", field: "email" }, { status: 409 });

  const passwordHash = parsed.data.newPassword ? await bcrypt.hash(parsed.data.newPassword, 12) : admin.passwordHash;
  const [updated] = await db.update(adminUsers).set({
    name: parsed.data.name,
    email,
    passwordHash,
    updatedAt: new Date()
  }).where(eq(adminUsers.id, admin.id)).returning({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name });
  await createAdminSession(updated);
  return NextResponse.json({ admin: updated });
}
