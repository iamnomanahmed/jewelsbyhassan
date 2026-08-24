import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().trim().email().max(255) });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`newsletter:${ip}`, 5, 60_000).ok) return NextResponse.json({ message: "Please wait before trying again." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  try {
    await getDb().insert(newsletterSubscribers).values({ email: parsed.data.email.toLowerCase() }).onConflictDoUpdate({ target: newsletterSubscribers.email, set: { active: true } });
    return NextResponse.json({ message: "Welcome to the Hassan Jewels private list." });
  } catch {
    return NextResponse.json({ message: "We could not save your email. Please try again." }, { status: 500 });
  }
}

