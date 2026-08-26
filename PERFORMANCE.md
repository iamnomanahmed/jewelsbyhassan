# Performance architecture

The storefront is optimized around a small browser workload and bounded database work.

## Budgets

- App-specific route JavaScript: under 400 KiB raw across the production build.
- Any single route chunk: under 40 KiB raw.
- Catalog pages: 24 products per database page.
- Admin pages: 20–50 records per database page.
- Public catalog cache: 15 minutes, invalidated by admin product/taxonomy/image changes and checkout stock changes.
- Product detail cache: 5 minutes, invalidated by product/image changes and checkout stock changes.
- Settings cache: 1 hour, invalidated immediately after an admin save.
- R2 production images: WebP, metadata removed, at most 1,600–2,400 px depending on purpose, 8 MB input limit and a 40 megapixel decode limit.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
npm run perf:budget
```

Run Lighthouse against a production build with mobile throttling for `/`, `/shop`, a real `/product/[slug]`, `/cart`, and `/checkout`. Authenticated admin routes should be profiled in a signed-in browser because synthetic unauthenticated runs only measure the login redirect.

## Guardrails

- Keep static content as Server Components.
- Add client boundaries only for direct interaction.
- Give every `next/image` a stable box and responsive `sizes`.
- Do not add `priority` outside the true first viewport.
- Invalidate the relevant cache tag in every new admin mutation.
- Run the budget after adding a client dependency or expanding an admin editor.
