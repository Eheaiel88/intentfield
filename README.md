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

Light and Dark controls in the header change the whole interface, including account screens and the owner editor. Dark remains the default. The choice is saved per browser/origin, applied before first paint and synchronized between tabs on the same origin. Sidebar and mobile navigation labels are 16px, with wider desktop navigation to accommodate them.

Interface captions and status labels use a 14px minimum; descriptions, controls and form text use at least 16px. Mobile styles retain those sizes. The Today dashboard and landing page share the same six-stage cards, with descriptions and a responsive layout that stacks on narrow screens. Smaller lettering is limited to decorative book-cover artwork.

## Configuration

- Copy `.env.example` to ignored local configuration. Link only the dedicated IntentField services.
- Clerk: `clerk env pull --instance dev`. Configure a `convex` JWT template with audience `convex` and set `CLERK_JWT_ISSUER_DOMAIN` on the matching Convex deployment.
- Convex: `npx convex dev --configure existing` for the correct project, then `npx convex dev` for development. Production provisioning remains a separate release step.
- Vercel: the dedicated project is `intentfield`; the working review app is https://intentfield.vercel.app/app/today. Both Preview and the main branch's Production target use the same development Clerk/Convex services for review. This target name does not mean commercial launch. Exact Vercel deployment/branch/project origins are admitted by session checks; custom deployment origins use `APP_ORIGIN`.
- Whop entry is intentionally outside Clerk's provider/proxy boundary. Do not merge different channel identities by email.

`grants.applyVerified` and `content.setOwner` are internal operator-only mutations, never browser APIs. Source identifiers must distinguish provider-backed purchases from expressly authorized complimentary access. A checkout return URL never establishes payment. Signed Whop events, ordering/reconciliation and live commerce are not implemented yet.

## Content authoring

An owner opens `/app/admin`, chooses an existing lesson/book/audio entry, saves a draft, then publishes it. The book supports a PDF and each audio practice supports a recording. Uploading a file publishes it to entitled members; removing it restores the script/sample state. Draft teaching does not appear in member queries. No paid source content belongs in public assets.

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

See [implementation status](docs/FOUNDATION-STATUS.md). `myintentfield.com`, production identities/database, Whop embedded entry/checkout and final media are pending commercial-release work.

This repository is public. Keep source books, recordings, transcripts, full paid curriculum, research, credentials and member exports outside it.
