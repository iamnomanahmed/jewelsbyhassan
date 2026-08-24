import { z } from "zod";

const postgresUrl = z.string().trim().min(1).refine((value) => {
  try { return ["postgres:", "postgresql:"].includes(new URL(value).protocol); } catch { return false; }
}, "must be a valid PostgreSQL connection URL");
const httpsUrl = z.string().trim().url().refine((value) => new URL(value).protocol === "https:", "must use HTTPS");
const bucketName = z.string().trim().regex(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/, "must be a valid R2 bucket name");

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function validated(name: string, schema: z.ZodType<string>, value = required(name)) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new Error(`${name} ${parsed.error.issues[0]?.message ?? "is invalid"}`);
  return parsed.data;
}

export function getDatabaseConfiguration() {
  const url = validated("DATABASE_URL", postgresUrl);
  const directUrl = validated("DATABASE_URL_UNPOOLED", postgresUrl, process.env.DATABASE_URL_UNPOOLED?.trim() || url);
  const hostname = new URL(url).hostname;
  const isNeon = hostname.endsWith(".neon.tech");
  const pooled = hostname.includes("-pooler.");
  if (process.env.NODE_ENV === "production" && isNeon && !pooled) throw new Error("DATABASE_URL must use Neon's pooled (-pooler) hostname in production");
  const configuredPoolSize = Number(process.env.DB_POOL_MAX ?? "1");
  const max = Number.isInteger(configuredPoolSize) && configuredPoolSize >= 1 && configuredPoolSize <= 10 ? configuredPoolSize : 1;
  return { url, directUrl, hostname, isNeon, pooled, max };
}

export function getR2Configuration() {
  const accountId = required("CLOUDFLARE_ACCOUNT_ID");
  const endpoint = validated("CLOUDFLARE_R2_ENDPOINT", httpsUrl, process.env.CLOUDFLARE_R2_ENDPOINT?.trim() || `https://${accountId}.r2.cloudflarestorage.com`);
  return {
    accountId,
    endpoint,
    accessKeyId: required("CLOUDFLARE_R2_ACCESS_KEY_ID"),
    secretAccessKey: required("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
    publicBucket: validated("CLOUDFLARE_R2_BUCKET", bucketName),
    privateBucket: validated("CLOUDFLARE_R2_PRIVATE_BUCKET", bucketName),
    publicUrl: validated("CLOUDFLARE_R2_PUBLIC_URL", httpsUrl).replace(/\/$/, "")
  };
}

export type ConfigurationCheck = {
  id: "database" | "database-direct" | "auth" | "site" | "r2-public" | "r2-private";
  label: string;
  configured: boolean;
  detail: string;
};

export function inspectProductionConfiguration(): ConfigurationCheck[] {
  let database: ConfigurationCheck;
  let directDatabase: ConfigurationCheck;
  try {
    const config = getDatabaseConfiguration();
    database = { id: "database", label: "Neon runtime database", configured: !config.isNeon || config.pooled, detail: config.isNeon ? `${config.hostname} · ${config.pooled ? "pooled" : "use the -pooler endpoint"}` : `${config.hostname} · PostgreSQL` };
    directDatabase = { id: "database-direct", label: "Migration database", configured: Boolean(process.env.DATABASE_URL_UNPOOLED), detail: process.env.DATABASE_URL_UNPOOLED ? new URL(config.directUrl).hostname : "DATABASE_URL_UNPOOLED is not set" };
  } catch (error) {
    database = { id: "database", label: "Neon runtime database", configured: false, detail: error instanceof Error ? error.message : "Database configuration is invalid" };
    directDatabase = { id: "database-direct", label: "Migration database", configured: false, detail: "Set a direct Neon connection for migrations" };
  }
  let r2Public: ConfigurationCheck;
  let r2Private: ConfigurationCheck;
  try {
    const config = getR2Configuration();
    r2Public = { id: "r2-public", label: "R2 public assets", configured: true, detail: `${config.publicBucket} · ${new URL(config.publicUrl).hostname}` };
    r2Private = { id: "r2-private", label: "R2 private payments", configured: config.privateBucket !== config.publicBucket, detail: config.privateBucket === config.publicBucket ? "Use a separate private bucket" : config.privateBucket };
  } catch (error) {
    r2Public = { id: "r2-public", label: "R2 public assets", configured: false, detail: error instanceof Error ? error.message : "R2 configuration is invalid" };
    r2Private = { id: "r2-private", label: "R2 private payments", configured: false, detail: "Configure a separate private bucket" };
  }
  const authSecret = process.env.AUTH_SECRET?.trim() ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const secureSite = httpsUrl.safeParse(siteUrl).success;
  return [
    database,
    directDatabase,
    { id: "auth", label: "Admin session secret", configured: authSecret.length >= 32, detail: authSecret.length >= 32 ? "Configured (value hidden)" : "AUTH_SECRET must be at least 32 characters" },
    { id: "site", label: "Canonical site URL", configured: secureSite, detail: secureSite ? new URL(siteUrl).origin : "Set an HTTPS NEXT_PUBLIC_SITE_URL" },
    r2Public,
    r2Private
  ];
}
