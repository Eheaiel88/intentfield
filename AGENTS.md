# IntentField contributor guide

- Next.js + Convex; standalone at myintentfield.com and an embedded Whop surface.
- Whop handles payments on both surfaces. One-time offers: book/workbook $19, additional course/platform $79, additional audio $29.
- Preserve the accepted launch-preview style: bridge imagery, graphite/chartreuse, bold sans typography. Six recurring stages, thirty lessons; do not turn them into sequential five-day chapters.
- The full member framework and owner content studio are implemented. Current deployment status and remaining integration steps: README.md and docs/FOUNDATION-STATUS.md.
- No private research, supplied books/audio, transcripts, credentials or member exports in this public repository. Only original public sample text and the course outline belong in source. Full paid content is in authorized Convex content records; keep it out of static bundles.
- Every private Convex function must verify identity, product access and ownership. Never merge by email or trust purchase return URLs. No public access-grant mutation.
- Local /dev/review routes must return 404 in production. They are browser-only review storage, not verified member sessions or cloud persistence.
- Run npm run typecheck, npm run lint, npm test and npm run build for application/backend changes. Verify responsive UI against the accepted preview.
- Website sign-in uses Clerk; its development integration is configured. Whop identity is a separate adapter and remains pending. Never add a bypass to unblock member access.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
