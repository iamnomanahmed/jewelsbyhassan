# Hassan Jewels Ecommerce

Production-oriented, full-stack jewelry ecommerce and administration platform built with Next.js 16, TypeScript, PostgreSQL/Drizzle, Cloudflare R2, Tailwind CSS, WhatsApp checkout, and Excel import/export.

The official supplied Hassan Jewels logo is kept at `public/brand/hassan-jewels-logo.png`. Store and admin defaults use a deep emerald, warm ivory, and restrained gold design system; branding can be updated from the admin without redeployment.

## Included workflows

- Storefront: homepage, catalog, search, categories, collections, product variants, persistent bag and drawer, checkout, order confirmation, Managed Neon customer accounts, customer-care pages, SEO sitemap/robots, and Product structured data.
- Payments: Cash on Delivery and Easypaisa with server-validated JPG/PNG/WEBP proof uploads to R2.
- Orders: authoritative server pricing, transactional stock decrement, unique `HJ-100001` numbers, saved-before-WhatsApp handoff, and historical item snapshots.
- Admin: secure HTTP-only JWT session, dashboard, product/variant/image management, archive/restore/permanent delete, R2 cleanup, taxonomies, customers, orders, payment verification, reviews, centralized settings, account/password rotation, and a secret-safe system readiness screen.
- Fulfilment: pending → confirmed → processing → shipped → completed, customer confirmation WhatsApp, secure review invitations, and review moderation.
- Data: true `.xlsx` template, validated preview-first product import, create/update modes, and products/orders/customers/reviews exports.

## Local setup

Requirements: Node.js 20.19+ and PostgreSQL 15+.

```bash
npm ci
cp .env.example .env
```

Generate separate, strong admin and customer-cookie secrets without printing their values:

```bash
npm run secrets:generate
```

Fill every other required value in `.env`, then initialize the database:

```bash
npm run db:migrate
ADMIN_PASSWORD='choose-a-unique-password-with-12-plus-characters' npm run db:seed
npm run dev
```

The seed is idempotent and creates 12 realistic products, categories, collections, default store settings, and the first admin user.

After signing in, use **Admin → Account** to rotate the initial password. Use **Admin → System** to verify the safe configuration summary and live Neon/R2 connectivity. Infrastructure credentials are intentionally never displayed or editable in the browser.

## Neon PostgreSQL

Create a Neon project in the [Neon Console](https://console.neon.tech), select a region close to the Vercel function region, and copy both connection strings from **Connect**:

- `DATABASE_URL`: enable connection pooling. The hostname must contain `-pooler`.
- `DATABASE_URL_UNPOOLED`: disable connection pooling. This direct URL is reserved for Drizzle migrations.

Both URLs should include `sslmode=require`. Keep `DB_POOL_MAX=1` unless load testing demonstrates a reason to raise it; the application reuses one client per warm serverless instance and Neon handles global pooling.

The Neon CLI configures project context and agent onboarding. If the current `neon@4.0.0`/`neonctl@4.0.0` publish reports a missing `@neon/config@1.0.2`, use the verified prior release:

```bash
npx -y neon@3.6.0 init
```

Apply migrations through the direct URL after filling `.env.local`:

```bash
npm run db:migrate
```

## Managed Neon Auth

Customer registration, sign-in, signed sessions, and `/account` route protection use Managed Neon Auth. Admin access remains separate at `/admin/login` and is never granted by creating a customer account.

Enable Auth for the selected Neon branch, refresh its environment variables, then generate the application-owned cookie secret:

```bash
CI= npx -y neon@3.6.0 neon-auth enable --project-id YOUR_PROJECT_ID --output json
CI= npx -y neon@3.6.0 env pull
npm run secrets:generate
```

The required production variables are `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL`, and a unique `NEON_AUTH_COOKIE_SECRET` of at least 32 characters. Managed Neon Auth is currently a Neon beta feature; review Neon’s release notes before treating its API surface as permanently stable.

## Cloudflare R2

Create two R2 buckets and one bucket-scoped API token with object read/write/delete access to both:

- `hassan-jewels-assets`: public product, branding, category, collection, and approved-review imagery.
- `hassan-jewels-payments`: private Easypaisa proofs. Do not enable an `r2.dev` URL or custom public domain for this bucket.

For the public assets bucket, connect `assets.hassanjewels.com` under **R2 → Bucket → Settings → Custom Domains**. A custom domain provides Cloudflare caching and production controls; the `r2.dev` URL is intended for development traffic. Configure:

- `CLOUDFLARE_R2_ENDPOINT`, usually `https://<account-id>.r2.cloudflarestorage.com`
- access key ID and secret
- public and private bucket names
- the public bucket's custom delivery URL

Uploads are server-only and use these folders:

```text
branding/
products/
categories/
collections/
payments/
reviews/
```

Apply the checked-in read-only CORS policy to the public bucket after replacing the origins in `config/r2-cors.json` if the final domain differs:

```bash
npx wrangler r2 bucket cors set hassan-jewels-assets --file config/r2-cors.json
npx wrangler r2 bucket cors list hassan-jewels-assets
```

The database stores each R2 `storageKey`, URL marker, MIME type, size, owner, and timestamps. Public assets use the custom domain. Payment proofs are written to the separate private bucket and are shown only through short-lived signed URLs generated server-side. Archiving never deletes objects. Permanent product deletion checks shared references, removes owned R2 objects first, and preserves historical order snapshots.

The checkout WhatsApp handoff receives a one-hour signed proof URL. Admin order views generate a fresh 15-minute link. Treat signed URLs as temporary bearer credentials and do not paste them into logs or analytics.

## Vercel deployment

1. Create a Vercel project from this repository.
2. Add all `.env.example` values in Project Settings → Environment Variables. Use the Neon pooled URL for `DATABASE_URL`, the direct URL for `DATABASE_URL_UNPOOLED`, and copy the locally generated `AUTH_SECRET` and `NEON_AUTH_COOKIE_SECRET` as encrypted values.
3. Create the two R2 buckets, connect the public custom domain, apply `config/r2-cors.json`, and add the bucket-scoped S3 credentials.
4. Run `npm run check:production` locally with production variables, then run `npm run db:migrate` before enabling traffic.
5. Run the seed once with a strong `ADMIN_PASSWORD`, then remove that seed-only environment variable if desired.
6. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin.
7. Point the R2 public/custom domain at the configured bucket and add it to `next.config.ts` if it is not `*.r2.dev` or `assets.hassanjewels.com`.
8. Deploy. Vercel uses `npm run build`; `vercel.json` selects the Singapore region for proximity to Pakistan.

## Verification commands

```bash
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
npm run check:database # direct Neon SELECT 1
npm run check:production # requires live production credentials
```

The generated migration is in `drizzle/`. Regenerate after schema changes with `npm run db:generate` and review the SQL before applying it.

## Security notes

- Admin passwords use bcrypt with cost 12; no plaintext password is stored.
- Admin cookies are HTTP-only, secure in production, SameSite=Lax, and expire after eight hours.
- Customer sessions are handled by Managed Neon Auth with an application-owned 256-bit-plus cookie secret; customer accounts never authorize admin routes.
- Administrators can rotate their email, display name, and bcrypt password from Admin → Account; the current password is always required.
- Order totals and stock are fetched and validated server-side inside a database transaction.
- Uploads are allow-listed by MIME type, size, and file signature before R2 upload.
- Easypaisa proofs use a separate private R2 bucket and expiring signed read URLs.
- Review URLs use 256-bit random tokens; only SHA-256 token hashes are stored.
- WhatsApp compose openings are tracked, never message delivery.
- Excel formula-like user strings are escaped on export.
- Public forms and login have request-rate limits. For multi-instance deployments with sustained hostile traffic, replace the in-memory limiter with a shared Redis/KV rate limiter.

## Generated visual assets

The campaign and seed-product photography in `public/images/` was generated specifically for this project. The supplied official logo was not redrawn, edited, or used as an image-generation reference. Optimized WebP copies are the production references; original PNG generations remain available in the same folder.
