# IntentField

The working Next.js application for IntentField, built from the accepted launch-preview design. Clerk handles website sign-in, Convex stores private content/member work, and Whop is the selected payment provider for both the website and future embedded Whop app.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000 and sign in at `/sign-in`. The complete authenticated application starts at `/app/today`. Existing product access is required; creating an account does not grant purchases. Earlier browser-only Day 1 review remains at `/dev/review/today` in development, and returns 404 in deployed builds.

Node 22.15.0/npm 11.5.2 were used. The optional Darwin Rolldown binding addresses an npm installation issue on the development Mac; other platforms skip it.

## Working framework

Today and progress, all thirty lessons, eight tools, workbook/checklist, self-image reflection, daily/weekly receiving ledger, optional scripted guide, product library, audio scripts/player, account notes/export/reset and an owner content studio. Save buttons persist work to Convex with account/product checks and revision conflict protection.

The interface keeps the accepted graphite/chartreuse design and six recurring stages: Desire, Discover, Align, Rehearse, Build and Receive. The book/workbook is $19, optional course/platform $79, and optional AM/PM audio $29, all one-time. Checkout is not yet open. Product access is not a payment receipt.

The landing page's book buttons now open a complete **sample sales walkthrough**: `/checkout` → `/checkout/course` → `/checkout/audio` → `/checkout/complete`. Accept or decline each upsell to review the $19, $48, $98 or $127 selection, then restart or revisit earlier steps. Choices stay in the URL for reload/back navigation; no sign-in, payment details or purchase mutation is needed. Final member links still require normal account/product access. The original mock-up folders remain unchanged.

Light and Dark controls in the header change the whole interface, including account screens and the owner editor. Dark remains the default. The choice is saved per browser/origin, applied before first paint and synchronized between tabs on the same origin. Sidebar and mobile navigation labels are 16px, with wider desktop navigation to accommodate them.

Interface captions and status labels use a 14px minimum; descriptions, controls and form text use at least 16px. Mobile styles retain those sizes. The Today dashboard and landing page share the same six-stage cards, with descriptions and a responsive layout that stacks on narrow screens. Smaller lettering is limited to decorative book-cover artwork.

My Products restores the launch-preview's book, Prosperity 30 and morning/evening artwork panels, with aligned actions and product-specific access. Media status follows published content. Orange headings, day labels, reflection anchors and focus outlines carry the mock-up's warm accents through both themes. The sidebar restores the original practice links, followed by weekly review, settings and My Products; owner tools have a separate area. Mobile navigation uses the same order.

## Configuration

- Copy `.env.example` to ignored local configuration. Link only the dedicated IntentField services.
- Clerk: `clerk env pull --instance dev`. Configure a `convex` JWT template with audience `convex` and set `CLERK_JWT_ISSUER_DOMAIN` on the matching Convex deployment.
- Convex: `npx convex dev --configure existing` for the correct project, then `npx convex dev` for development. Production provisioning remains a separate release step.
- Vercel: the dedicated project is `intentfield`; the working review app is https://intentfield.vercel.app/app/today. Both Preview and the main branch's Production target use the same development Clerk/Convex services for review. This target name does not mean commercial launch. Exact Vercel deployment/branch/project origins are admitted by session checks; custom deployment origins use `APP_ORIGIN`.
- Whop entry is intentionally outside Clerk's provider/proxy boundary. Do not merge different channel identities by email.

`grants.applyVerified` and `content.setOwner` are internal operator-only mutations, never browser APIs. Source identifiers must distinguish provider-backed purchases from expressly authorized complimentary access. A checkout return URL never establishes payment. Signed Whop events, ordering/reconciliation and live commerce are not implemented yet.

## Content authoring

The complete seven-day book is now published privately: eight chapters, 23 reusable workbook sections and three downloads (29-page book, 34-page workbook and two-page checklist). Read at `/app/book`, open a chapter at `/app/book/chapter/1`, or save workbook answers at `/app/book/worksheet/1`. All thirty course lessons include an explicit outcome and connection to the next lesson. The morning/evening recordings are still pending; their pilot scripts remain available.

An owner opens `/app/admin`, chooses a lesson, chapter, worksheet, download or audio entry, saves a draft, then publishes it. The book and companion downloads support PDFs; each audio practice supports a recording. Uploading a file publishes it to entitled members; removing it restores the script/sample state. Draft teaching does not appear in member queries. No paid source content belongs in public assets.

Initial content can be loaded from the separate original workspace:

```sh
node scripts/seed-reference.mjs /path/to/IntentField
```

This imports the original program into protected Convex records. It inserts missing entries only and never overwrites owner edits. The original workspace and all earlier previews remain unchanged.

## Validation

```sh
npx next typegen
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

E2E requires the running app, IntentField development credentials and authenticated Clerk/Convex CLIs. Install Chromium with `npx playwright install chromium`. It uses genuine signed sessions for reserved test users, synthetic grants and temporary media, then revokes grants/deletes users. Synthetic note/audit records remain for diagnosis. Set `TEST_BASE_URL` for hosted checks; protected previews accept an ignored temporary cookie file via `TEST_VERCEL_COOKIE_FILE`. Never commit cookies or browser state.

The three Whop products and fixed one-time plans are created with branded artwork, but remain hidden until purchase-to-access is connected and tested. The IntentField Whop app is registered as unlisted against the existing Vercel project. Public catalog identifiers are in `src/lib/whop-catalog.ts`; these are never access credentials or payment evidence. The admin MCP connection does not supply a persistent server runtime key or authorize app installation.

See [implementation status](docs/FOUNDATION-STATUS.md). `myintentfield.com`, production identities/database, Whop embedded entry/checkout and finished audio remain commercial-release work.

This repository is public. Keep source books, recordings, transcripts, full paid curriculum, research, credentials and member exports outside it.
