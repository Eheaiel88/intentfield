# Whop Integration Implementation Plan

Prepared 28 September 2026 from the AI Auditor's Developer Brief, verified against the live Whop account, the Midheaven reference implementation and current Whop documentation. Supersedes nothing; FOUNDATION-STATUS.md remains the record of what is built today.

## Architecture (from the brief, confirmed feasible)

IntentField remains our product on our hosting. Whop is (1) the payment processor for the website and (2) a second storefront whose buyers use the member area inside Whop's iframe. Access is always granted from our Convex records, never from live Whop lookups, so members keep access if Whop is down.

Verified platform facts this plan relies on:

- App `app_hA6Q15wmNvxibS` exists, unlisted, `base_url https://intentfield.vercel.app`, experience path `/experiences/[experienceId]`. No new app; no whop.site hosting. The in-Whop surface is Whop's app proxy (`2t0nb912b9ixcjc9z3ki.apps.whop.com`) rendering **our** deployment; buyers reach it from the Whop storefront (`whop.com` business route `intentfield`).
- Products/plans already exist and match `src/lib/whop-catalog.ts`: Book `prod_1Fjx6emesjwl5`/`plan_55mR1Gb7ydVaR` $19; Course `prod_PQjYan54CWXvv`/`plan_VBYHNxWOs9KQG` $79; Audio `prod_9CR6SscWISttH`/`plan_vjX3WRljDFF4B` $29. All one-time USD. They stay as-is: one product/plan per item, three entitlements.
- Whop Checkout Element (`@whop/elements-react`) processes **one plan per checkout**; there is no native order bump/upsell. `onComplete` is analytics-only; fulfillment comes from the `payment.succeeded` webhook. The legacy embedded checkout is not used anywhere in this plan.
- Both reference businesses confirm the add-on pattern. Midheaven: main membership plus a separate hidden credits product with its own checkout link. The AI Film School (the stepped-payment reference): every offer — Cinematography $97, Screenwriting Mini-Course $47, Phoenix Rising ebook $24.97 — is its own product/plan with its own checkout URL, sequenced by pages/links, with no combination plans or Whop-native upsell. Whop plans also support checkout styling (brand colors), plan images and custom CTAs, which IntentField can adopt.

### Funnel decision

Sequential single-plan checkouts, preserving the existing page flow:

1. `/checkout` — buy the Wealth Primer ($19) with a real Checkout Element.
2. `/checkout/course` — post-purchase offer: 30-day course ($79), its own checkout (card on file with Whop after purchase 1 keeps friction low).
3. `/checkout/audio` — post-purchase offer: affirmation audio ($29), same pattern.
4. `/checkout/complete` — order summary of what was actually purchased ($19 / $48 / $98 / $127 running total is display arithmetic over real orders, not a combined charge).

Declines skip forward; the restart path goes away once real charges exist (a completed purchase cannot be "restarted"). Course and audio remain purchasable later from `/app/purchases`.

## Phase 0 — Decisions and owner prerequisites

Blocked on Mark (dashboard/DNS work, not code):

- [ ] Whop payout identity verification + 2FA on `biz_xeSK2pOhE9Sxuk` (required before Whop will pay out).
- [ ] Clerk production instance for `myintentfield.com` (keep the dev instance for preview).
- [ ] Convex production deployment (currently only dev `rugged-nightingale-644`).
- [ ] DNS: point `myintentfield.com` at the Vercel project.
- [ ] Stripe account kept ready as fallback processor (no build work now; just keep it in good standing).

Decisions assumed by this plan (flag now if wrong):

- Sequential add-on checkouts, three plans unchanged (see Funnel decision).
- **Separate accounts per surface (owner decision, 28 Sep 2026, superseding the brief's Req 5):** the website (Clerk) and the Whop embedded surface keep entirely separate account records, progress and notes — no linking or merging, even on a matching email. AGENTS.md's "never merge by email" rule stands unchanged and now applies without exception. Consequence, accepted: progress does not follow a member between surfaces. Entitlements: a Whop payment is always owned by a Whop user (Whop is the processor on both surfaces), so a purchase entitles that Whop account inside Whop; a website checkout additionally entitles the signed-in Clerk member via the server-issued nonce. Same purchase, two independent surface accounts.

## Phase 1 — Whop identity inside the iframe — BUILT 29 Sep 2026, awaiting deploy + in-Whop test

Goal: a Whop buyer opens IntentField in the Whop sidebar and lands signed-in in the member area.

Spike findings (all verified against shipped code, not docs prose):

- `@whop/sdk` 2.0.0 still ships no `verifyUserToken`. The verification contract was taken from Whop's own published verifier in `@whop/api`: ES256 JWT in the `x-whop-user-token` header, issuer `urn:whopcom:exp-proxy`, `aud` = our app id, `sub` = Whop user id, static public P-256 JWK.
- Convex **rejects** a URN issuer in `auth.config.ts` ("Invalid provider domain URL"), so the raw Whop token cannot authenticate to Convex directly. Implemented the planned fallback: a server-side **token exchange**.

As built:

1. `src/lib/whop-auth.ts` — verifies `x-whop-user-token` with jose against Whop's public key (env-overridable for rotation); returns null for missing/forged/expired/wrong-app tokens. Then mints a 15-minute ES256 Convex identity token (issuer `https://myintentfield.com/whop`, audience `convex-whop`, subject = verified Whop user id) signed with `WHOP_CONVEX_SIGNING_KEY`. Unit-tested (8 cases) and exercised end-to-end against a running server with a stand-in proxy key.
2. `convex/auth.config.ts` — second `customJwt` provider (public key as data-URI JWKS in Convex env `WHOP_CONVEX_JWKS`; set on the dev deployment). Whop-surface principals are `https://myintentfield.com/whop|user_…` — permanently disjoint from Clerk principals. **The issuer string is permanent**: it is embedded in every Whop member's principal.
3. No `whopUsers` table after all: the codebase has no user tables anywhere — identity is the verified principal string on every record — so the Whop namespace works exactly like the Clerk one. Phase 3's webhook maps a Whop user id to its principal via `whopSurfacePrincipal()` in `src/lib/whop-surface.ts`.
4. `/api/whop/token` — same-origin exchange endpoint (the Whop proxy attaches a fresh header to every same-origin request); `/api/whop/jwks` — public half of the signing key, for reference. `src/components/whop-workspace.tsx` bridges it into `ConvexProviderWithAuth` with pre-expiry refresh.
5. `/experiences/[experienceId]/[[...screen]]` renders the full member area (`ConvexWorkspace embedded`) directly at `…/today`; without a valid token it renders an "opens inside Whop" notice. `experienceId` is routing only, never authorization. Embedded mode keeps the wordmark inside the member area and hides the website sample link; `read_user` remains the only scope.

Remaining to accept Phase 1: commit/deploy, then open the experience as a real Whop test user from the Whop sidebar (needs the app experience attached to a product — Phase 5 step 1 — or Whop's app preview) and confirm workspace, entitlement gating and no website chrome. `WHOP_CONVEX_SIGNING_KEY` is set on Vercel (production + preview) and in `.env.local`; `WHOP_CONVEX_JWKS` is set on the dev Convex deployment and must be set on the production deployment when it exists.

## Phase 2 — Two separate account databases (no linking) — DONE 29 Sep 2026

Goal: the website and the Whop surface each own their accounts, progress and notes; nothing merges.

Status: the separation is structural (Phase 1 principals), verified and documented. `convex/surface-isolation.test.ts` locks the invariant: same verified email on both surfaces → two independent workspaces and entitlements; a matching subject under a different issuer cannot collide; owner status does not cross. The backend contains no email usage at all (checked). Support posture and macros: `docs/SUPPORT.md`.

1. Two member namespaces in Convex: Clerk members (existing) and Whop members (`whopUsers`, keyed by verified `whopUserId`). Every progress, note, tool and ledger record belongs to exactly one member record on one surface.
2. No `accountLinks`, no email matching, no auto-link, no explicit link flow. A matching email between a Clerk account and a Whop account is a coincidence the system ignores. AGENTS.md's "never merge by email" stands without exception.
3. Entitlements are per-surface records derived from the same `purchases` table (Phase 3): the webhook's `whopUserId` entitles the Whop-surface member; the checkout nonce (website purchases only) additionally entitles the Clerk member. A Whop-storefront purchase with no nonce entitles only the Whop-surface member.
4. Support posture: "I bought on Whop, why can't I sign in on the website?" is answered by policy (access lives where you bought/opened it; website buyers use the website account they checked out with). Document this in the FAQ/support macros before launch.

Acceptance: same email on both surfaces yields two independent workspaces; no code path reads or writes across the namespace boundary; a website purchase unlocks the buyer's Clerk account and their Whop membership shows the app inside Whop with a fresh, separate workspace.

## Phase 3 — Purchases recorded in our database (webhooks) — BUILT 29 Sep 2026

Goal: our Convex records are the source of truth for access.

As built (differences from the sketch are noted):

1. The receiver is a **Convex HTTP action** at `<deployment>.convex.site/whop/webhook` (`convex/http.ts`), not a Next.js route: the raw body, the secret and the transaction all live in one place, and Vercel is not in the delivery path. `WHOP_WEBHOOK_SECRET` is Convex-deployment env.
2. Signature verification per Whop's documented Standard Webhooks contract in `src/lib/standard-webhooks.ts` (HMAC-SHA256 over `id.timestamp.body`, `ws_` secret used as-is, constant-time compare, 5-minute window, multi-signature headers for rotation). The docs still say the TS SDK helper "lands in the next release", so the manual procedure is the implementation, unit-tested against its own signer.
3. Idempotency and durability in one transaction (`convex/purchases.ts` `applyEvent`): the delivery id, the purchase row and the derived grant commit together; a redelivery returns `duplicate` and changes nothing. Out-of-order safety: a late `payment.succeeded` never reopens a refunded/disputed purchase; disputes suspend access and only a `won` outcome restores it; only `succeeded` refunds revoke.
4. `purchases` table as planned (plus `checkoutNonce` captured from payment metadata for Phase 4); `skuForPlan()` and `PURCHASE_ACCESS_DAYS = 365` in `whop-catalog.ts`. Grants carry `validUntil = paidAt + 365d`, matching the published 12-month term.
5. Grant per payment (`source = paymentId`) for the Whop-surface principal; refunding audio cannot touch book/course by construction. Unknown plans/users and unhandled events are recorded as `ignored:…` deliveries (returning 200 so Whop doesn't retry for 71 hours) for reconciliation review. Complimentary owner grants remain distinct sources.
6. Reconciliation is **partially deferred**: the recorded `ignored:` rows are the review queue, but the "recheck my access" member action and the scheduled Whop-vs-records comparison need a server API key on Convex and verified REST endpoints — tracked as Phase 3b, before launch.

Verified: 16 new tests including an end-to-end signed delivery through the HTTP route (bad signature 401, applied once, replay = duplicate), refund isolation, dispute lifecycle and access-term arithmetic. Whop-down resilience holds structurally: access reads only `grants` (`convex/access.ts` makes no external calls). Remaining to go live: create the webhook on the Whop business pointing at the Convex site URL, store its `ws_` secret via `npx convex env set WHOP_WEBHOOK_SECRET`, and send a test event.

## Phase 4 — Real checkout on the website — BUILT 30 Sep 2026, awaiting live test purchase

Goal: replace the simulation with Whop Checkout Element; buyer lands in the member area with purchases unlocked.

As built (one design change from the sketch):

1. `@whop/elements-react@1.1.0` Checkout Element per funnel page, one plan each; the simulation component, its URL-selection helpers and all "no payment is taken" copy are removed in the same change. `/sample` remains the free path.
2. **Client-passed metadata instead of server-created checkout configurations.** The element's `Checkout` handle officially accepts `metadata` ("read back on the payment"), so the signed-in member mints a single-use nonce via an authenticated Convex mutation (`convex/checkout.ts`) and the element carries `{checkout_nonce}` directly. This removed the REST dependency (and the wait on app authorization) without weakening the trust model: a nonce is random, product-bound, 24-hour-limited, single-use, and only ever grants to the principal that minted it — the webhook (`resolveNonce` in `convex/purchases.ts`) is still the only grantor. Server-created configurations remain a later hardening option; the permissions are already requested.
3. Buyer flow: every checkout page requires Clerk sign-in (redirect to `/sign-up?redirect_url=…`), so a member record always exists. Guest checkout stays out of scope.
4. One payment entitles both surface accounts: the webhook grants the Whop principal (source `pay_…`) and, via the nonce, the website principal (source `pay_…:site`); refunds and disputes move both grants together. Purchases store `sitePrincipal` once resolved.
5. Optimistic UX: `onComplete`/`returnUrl` land on the next step with `?confirming=<sku>` (wording only); the products page shows "confirming your purchase" until the reactive `access.mine` query flips when the webhook lands. Nothing is served from the pending state.
6. Member-area locked screens now link to the matching checkout step on the website; the embedded surface points to the Whop store instead (completed in Phase 5).

Verified: nonce lifecycle tests (auth required, single-use, product-bound, cross-payment reuse and forged values rejected, refund revokes both surface grants); 44 tests green; typecheck/lint/build clean. Remaining to accept: the live "done means" purchases — real $19 → book only; +$79 → course; +$29 → audio; same Clerk account sees them; a Whop account on the same email sees none — which require the deployed site and a real card.

## Phase 5 — Whop storefront surface — DONE 30 Sep 2026 (visibility flip and live test held for launch)

1. **App authorization completed via the documented install-link flow** — `https://whop.com/apps/app_hA6Q15wmNvxibS/install` → pick the business → approve the permission prompt (the dashboard "add app" browser only lists App Store apps, so an unlisted app must use its install link; per the permissions guide, the same flow re-runs whenever new permissions are added). The approval activated the app API key's four scopes (verified) and itself created and attached the app experience `exp_hJfgmqQDa2Fek0` across the products; a duplicate experience created manually during verification was deleted. Each product now carries exactly one IntentField experience, and the embedded surface accepts any experience id (routing only).
2. Product pages done: truthful descriptions with delivery statement ("delivered in the IntentField app right inside Whop") and the 12-month access term on all three; the audio product and plan copy corrected to say written practices now, recordings added to the same product when finished (none are produced yet). Covers were already uploaded; the new Field + Horizon mark is the app icon and business logo.
3. Plans aligned with the published term: `expiration_days = 365` set on all three (previously indefinite, which also conflicted with Whop Seller Terms); checkout styling set to graphite `#101312` / electric `#D5FF52`. A Whop membership now expires in step with our own grant's `validUntil`; the `membership.deactivated` event at expiry is deliberately unhandled (our grants expire independently).
4. Products remain **hidden** by owner decision until the full live acceptance run; the visibility flip is the last step.
5. Live test purchase through the Whop product page → IntentField in the sidebar (done-means #3) runs with the rest of the deferred live tests.

## Phase 6 — Whop pixel — BUILT 30 Sep 2026

1. Official loader (verbatim from the pixel guide) in `src/components/whop-pixel.tsx`, mounted through `PublicShell` so it renders exactly on the public funnel (landing, sample, checkout, not-found) and never in `/app/*` or `/experiences/*`. Scope `biz_xeSK2pOhE9Sxuk`; `page` tracked on mount and on client-side route changes; production builds only; wrapped so analytics can never break the page.
2. `lead` fires when a visitor downloads the free sample, with a per-browser-session `event_id` for dedupe and no personal data attached. **No purchase events** — Whop records its own checkouts server-side.
3. Remaining: run Whop's pixel checker against the deployed site (done-means #6), and re-verify after the myintentfield.com cutover.

## Phase 7 — Domain cutover and launch checklist

1. `myintentfield.com` live on Vercel; update Whop app `base_url` to it; re-test the embedded experience through the Whop proxy after the change.
2. Clerk production instance + Convex production deployment wired to the production domain; dev instances stay on preview.
3. Privacy policy + terms: name Whop as payment processor, disclose the Whop pixel; refund policy consistent across website, Whop product pages and actual support behavior.
4. Copy scrub: no income claims or promised financial results anywhere (Meta rejects them; also matches the V2.1 claims register).
5. Customer export verified: a repeatable export of members + purchases from Convex (and Whop's own export as secondary).
6. Full "done means" test matrix executed with real purchases and recorded evidence, including the Whop-blocked resilience test.

## Sequencing and rough effort

Phases 1→2→3→4 are ordered by dependency; 5 and 6 can run parallel to 4; 7 is last. Rough engineering effort: Phase 1: 2–4 days (spike included) · Phase 2: 2–3 · Phase 3: 3–5 · Phase 4: 3–5 · Phase 5: 1 + owner dashboard time · Phase 6: 0.5–1 · Phase 7: 1–2 + DNS/propagation. Content work (final PDFs in Content Studio, audio recordings, expanded landing page) proceeds independently and is not gated by any phase before 5.

## Out of scope (unchanged from the brief)

Stripe integration build-out (kept ready, not built), Whop Ads campaigns, subscriptions/Circle, the V2.1 blueprint's higher-tier offers, guest checkout, and any in-app purchase of add-ons from inside the Whop iframe (Whop policy expects Whop-processed payments there — the add-on offers inside the embedded surface link to the Whop product pages, mirroring Midheaven's credits pattern).
