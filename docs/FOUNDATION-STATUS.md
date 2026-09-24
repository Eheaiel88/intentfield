# Working application — September 24, 2026

The accepted launch-preview journey is now implemented in Next.js, with Clerk website identity and private Convex storage. This is a working development deployment for product review, not the commercial launch. Whop checkout/embedded identity, the final book and finished recordings are separate remaining release work.

## Member framework

| Route | Function |
| --- | --- |
| `/`, `/sample`, `/checkout` | Accepted landing, original opening/PDF sample and truthful prelaunch offer |
| `/sign-in`, `/sign-up` | Clerk authentication |
| `/app/today` | Next incomplete lesson, chief aim and saved progress |
| `/app/course`, `/app/lesson/1` through `/app/lesson/30` | All thirty written V2.1 lessons, private answers, draft saving, completion and next lesson |
| `/app/lesson/N/complete` | Saved outcome and connection to the next lesson |
| Optional guide within lessons | Explain, reflect and rehearse; explicitly scripted; saves only approved member words |
| `/app/tools`, `/app/tool/:id` | Eight source-grounded tools with saved responses |
| `/app/profile` | Twelve separate self-image statements; blank remains different from zero |
| `/app/ledger`, `/app/review` | Daily/weekly drafts and dated receiving reflections; atomic, retry-safe entry creation |
| `/app/book`, `/app/book/workbook` | Original narrative opening, fictional example, eight worksheet fields, checklist and explicit copy to Day 1 |
| `/app/audio`, `/app/audio/morning`, `/app/audio/evening` | Full AM/PM pilot scripts; native playback appears when an owner publishes a recording |
| `/app/purchases` | Product-specific access, without falsely claiming a payment receipt |
| `/app/settings` | Saved name, JSON export and explicitly confirmed deletion of one's own notes |
| `/app/admin` | Owner-only content studio: draft/publish teaching, upload/remove production PDF and audio |
| `/dev/review/*` | Earlier local Day 1 review remains development-only; 404 in deployed builds |
| `/experiences/[experienceId]/*` | Whop setup state; embedded authentication remains pending |

Each product is independently authorized. A book-only member can use the workbook; audio does not require the course. Owner status enables content editing, not reading another member's notes. New accounts receive no products automatically. A trusted operator may issue a clearly identified complimentary grant; it must not be represented as a Whop payment.

## Content and storage

Full paid curriculum is seeded into the private Convex content table from the original workspace using `node scripts/seed-reference.mjs /path/to/IntentField`. The script inserts missing entries without overwriting subsequent editorial work. The public repository contains only code, cleared assets, the original public sample and the outline, not the private curriculum or supplied source materials.

The content studio edits plain text; it never executes authored HTML. Drafts remain owner-only until published. Revision checks reject stale updates. Member notes remain separate from teaching. Published media uses Convex storage, with access checked before its URL is returned. An entitled member can copy a downloaded file or its URL; this is ordinary protected delivery, not DRM. Replaced/removed files remain in storage for recovery and require a future retention policy.

Member forms use explicit save buttons, clear save/error status and an unsaved-change warning on reload or link navigation. They do not silently claim autosave or offline persistence. Concurrent edits are rejected with an instruction to copy one's words and reload. Weekly reflection creation and clearing its draft are one transaction.

## Services

- Convex project `intentfield`, development deployment `rugged-nightingale-644` in team `mark-198a2`.
- Clerk application `app_3Jl9HTB86RFhkocqo2A6WkgnzLG`, development instance `ins_3Jl9HSoA9KQbymEBdFfdzlPnf9N`; signed `convex` audience tokens.
- Vercel project `intentfield` in `marks-projects-fb2b2f72`, linked to the IntentField GitHub repository. Preview deployments use the existing development Clerk/Convex environment. Vercel deployment protection remains enabled.
- No DNS changes for `myintentfield.com`. No production Clerk/Convex environment or live sales configuration yet.
- Whop business `biz_xeSK2pOhE9Sxuk` was accessible. App/catalog/runtime credentials remain pending; the admin MCP connection is not an application runtime key.

## Verification

TypeScript, ESLint, production build and twelve backend tests pass. Backend checks cover authentication, independent product access, account isolation, revision conflict handling, answer bounds, valid completion, profile blank/zero handling, account-scoped export/deletion, atomic/idempotent ledger creation, owner permissions, private drafts and publication.

The comprehensive Clerk/Convex browser scenario passes locally: signed-out redirect, unentitled denial, Day 1 and Day 2 completion, guide save, workbook/tool persistence, twelve self-image inputs, ledger/review, all thirty lesson links, audio scripts, fresh-session resume, another account's empty workspace, book-only/audio restrictions, mobile overflow checks, navigation dialog, export and confirmed reset. Tests use reserved synthetic accounts and actual signed Clerk sessions; they do not verify a Whop charge. Temporary users are deleted and grants revoked; synthetic notes and audit records remain in the development database.

Owner content draft/publication and real PDF/audio upload, delivery/playback and removal passed browser checks both locally and on Vercel. The complete member scenario also passed against the protected Vercel deployment; `/dev/review/today` returned 404 there. A fresh browser context on this machine is not a test on a second physical device.

## Commercial release work

1. Finish/review final book, workbook and audio, then publish through Content Studio.
2. Configure production Clerk/Convex and `myintentfield.com`; keep identities distinct until an explicit migration/linking process is designed.
3. Register/verify the Whop embedded app and its independent identity adapter.
4. Configure the $19/$79/$29 Whop catalog and verified checkout/events, refunds, reconciliation and recovery on both surfaces.
5. Confirm access terms, policies, support, backups, monitoring and release checks before paid acquisition.

This framework does not claim that checkout, a live AI counselor, finished recordings or the final production PDF have already shipped.
