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

## Phase 2 — Two separate account databases (no linking)

Goal: the website and the Whop surface each own their accounts, progress and notes; nothing merges.

1. Two member namespaces in Convex: Clerk members (existing) and Whop members (`whopUsers`, keyed by verified `whopUserId`). Every progress, note, tool and ledger record belongs to exactly one member record on one surface.
2. No `accountLinks`, no email matching, no auto-link, no explicit link flow. A matching email between a Clerk account and a Whop account is a coincidence the system ignores. AGENTS.md's "never merge by email" stands without exception.
3. Entitlements are per-surface records derived from the same `purchases` table (Phase 3): the webhook's `whopUserId` entitles the Whop-surface member; the checkout nonce (website purchases only) additionally entitles the Clerk member. A Whop-storefront purchase with no nonce entitles only the Whop-surface member.
4. Support posture: "I bought on Whop, why can't I sign in on the website?" is answered by policy (access lives where you bought/opened it; website buyers use the website account they checked out with). Document this in the FAQ/support macros before launch.

Acceptance: same email on both surfaces yields two independent workspaces; no code path reads or writes across the namespace boundary; a website purchase unlocks the buyer's Clerk account and their Whop membership shows the app inside Whop with a fresh, separate workspace.

## Phase 3 — Purchases recorded in our database (webhooks)

Goal: our Convex records are the source of truth for access.

1. Webhook endpoint (Next.js route handler → Convex): subscribe to payment success, refund, dispute and membership lifecycle events for the company in the Whop dashboard.
2. Verify signatures on the raw body (Standard Webhooks); reject unsigned/expired/wrong-company deliveries. Confirm the currently shipped helper in the pinned SDK — the docs have flagged helper churn here before; implement the documented signature procedure if the helper is missing.
3. Idempotency: persist the delivery id with a unique constraint before processing; a duplicate delivery changes nothing twice. Out-of-order arrival is handled by re-reading current state, not by trusting event order.
4. `purchases` table: provider payment id, whopUserId, plan id, product id, amount, currency, status (`settled`/`refunded`/`disputed`), timestamps. Maps `planId → entitlement key` from one config (extend `whop-catalog.ts`).
5. Entitlement grants/revocations are derived from `purchases`. Refund of audio never touches book/course. Existing complimentary grants (owner review) remain a distinct, clearly-labeled grant type.
6. Reconciliation: a manual "recheck my access" support action + a scheduled comparison of Whop memberships vs our records, flagging drift. A missed webhook must not permanently strand a buyer.

Acceptance: replayed webhook = no double grant; refund revokes exactly one entitlement; with Whop API calls blocked (env flag in a test), existing members retain full access.

## Phase 4 — Real checkout on the website

Goal: replace the simulation with Whop Checkout Element; buyer lands in the member area with purchases unlocked.

1. `@whop/elements-react` Checkout Element per funnel page, one plan each (see Funnel decision). No legacy embedded checkout.
2. Server-created checkout configurations carrying `metadata` that ties the session to the signed-in Clerk user (a server-issued signed nonce, not a bare user id). The webhook resolves the nonce → member record. Metadata is an attribution hint; the grant itself only ever comes from the verified webhook payload.
3. Buyer flow: sign-in (or account-creation step) before/with checkout so there is always a member record to attach the purchase to. Guest checkout → post-payment claim flows are explicitly out of scope (they re-open the return-URL trust hole).
4. Optimistic unlock: after `onComplete`/return, show the member area with the purchased item in a "confirming your purchase…" state driven by our own pending-purchase record; flip to unlocked when the webhook lands (normally seconds). No content is served from the pending state that the webhook could contradict — the pending state gates on the first webhook for new buyers, and in the common case it resolves before the member navigates anywhere.
5. Remove all "sample walkthrough / no payment is taken" copy in the same change that enables real charges — never half-and-half.
6. Keep `/sample` and the free sample download as the no-payment path.

Acceptance ("done means" #1–2; the brief's #4 is superseded by the separate-accounts decision): real $19 purchase unlocks book only; add course → course unlocks; add audio → audio unlocks; signing back in to the same Clerk account shows the purchases and progress; a different account — including a Whop account on the same email — sees none of them.

## Phase 5 — Whop storefront surface

1. Attach the app as the experience on all three products (prior API attempt failed on `app_authorization:create`; do it from the dashboard if the API still refuses).
2. Product pages: accurate descriptions, cover art (already uploaded), delivery statement ("digital access in the IntentField app inside Whop"), access term, refund policy. No income claims.
3. Flip products from hidden → visible only after Phase 1–4 acceptance passes.
4. Test purchase through the Whop product page → open IntentField in the Whop sidebar → correct items unlocked (done-means #3).

## Phase 6 — Whop pixel

1. Manual snippet in the website `<head>` (all funnel pages): `whop.setScope("biz_xeSK2pOhE9Sxuk"); whop.track("page")`.
2. Send `lead` (with `event_id` for dedupe) on free sample signup. **No purchase events** — Whop records its own checkouts server-side; sending our own would double count.
3. Do not attach member practice data, entitlement state or anything from the private app to pixel events. Pixel loads on the public website only, not inside `/app/*` or `/experiences/*`.
4. Verify with Whop's pixel checker (done-means #6).

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
