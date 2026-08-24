import { createNeonAuth } from "@neondatabase/auth/next/server";

function required(name: "NEON_AUTH_BASE_URL" | "NEON_AUTH_COOKIE_SECRET") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

const cookieSecret = required("NEON_AUTH_COOKIE_SECRET");
if (cookieSecret.length < 32) throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters");

export const auth = createNeonAuth({
  baseUrl: required("NEON_AUTH_BASE_URL"),
  cookies: { secret: cookieSecret },
  logLevel: process.env.NODE_ENV === "production" ? "warn" : "debug"
});
