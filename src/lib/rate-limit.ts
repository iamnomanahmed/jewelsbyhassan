type Entry = { count: number; resetAt: number };
const globalLimit = globalThis as unknown as { hjRateLimits?: Map<string, Entry> };
const limits = globalLimit.hjRateLimits ?? new Map<string, Entry>();
if (process.env.NODE_ENV !== "production") globalLimit.hjRateLimits = limits;

export function rateLimit(key: string, maximum = 8, windowMs = 60_000) {
  const now = Date.now();
  const entry = limits.get(key);
  if (!entry || entry.resetAt <= now) {
    limits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  entry.count += 1;
  return { ok: entry.count <= maximum, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
}

