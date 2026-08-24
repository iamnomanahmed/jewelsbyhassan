import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, createAdminSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const limit = rateLimit(`admin-login:${ip}`, 5, 15 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.` }, { status: 429 });
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  try {
    const admin = await authenticateAdmin(parsed.data.email, parsed.data.password);
    if (!admin) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    await createAdminSession(admin);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Admin login is unavailable. Check the database setup." }, { status: 503 });
  }
}

