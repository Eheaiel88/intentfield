# Working application — September 24, 2026

The accepted launch-preview journey is implemented in Next.js, with Clerk website identity and private Convex storage. The complete book/workbook/checklist and thirty written lessons are published privately, and the Whop catalog is created. This remains a development deployment for review: Whop checkout/embedded identity and finished recordings are still pending.

## Member framework

| Route | Function |
| --- | --- |
| `/`, `/sample` | Accepted landing and original opening/PDF sample |
| `/checkout`, `/checkout/course`, `/checkout/audio`, `/checkout/complete` | Public sample book checkout, optional course/audio offers and final selection; no payments or grants |
| `/sign-in`, `/sign-up` | Clerk authentication |
| `/app/today` | Next incomplete lesson, chief aim and saved progress |
| `/app/course`, `/app/lesson/1` through `/app/lesson/30` | All thirty written V2.1 lessons, private answers, draft saving, completion and next lesson |
| `/app/lesson/N/complete` | Saved outcome and connection to the next lesson |
| Optional guide within lessons | Explain, reflect and rehearse; explicitly scripted; saves only approved member words |
| `/app/tools`, `/app/tool/:id` | Eight source-grounded tools with saved responses |
| `/app/profile` | Twelve separate self-image statements; blank remains different from zero |
| `/app/ledger`, `/app/review` | Daily/weekly drafts and dated receiving reflections; atomic, retry-safe entry creation |
| `/app/book`, `/app/book/workbook` | Eight-chapter book, index of 23 reusable practice pages, three protected PDF download links, original first-direction form and explicit copy to Day 1 |
| `/app/book/chapter/1` through `/app/book/chapter/8` | Full narrative chapters with an output, exercise, previous/next navigation and transition |
| `/app/book/worksheet/1` through `/app/book/worksheet/23` | Private saved workbook responses, including self-image ratings that distinguish blank from zero |
| `/app/audio`, `/app/audio/morning`, `/app/audio/evening` | Full AM/PM pilot scripts; native playback appears when an owner publishes a recording |
| `/app/purchases` | Product-specific access, without falsely claiming a payment receipt |
| `/app/settings` | Saved name, JSON export and explicitly confirmed deletion of one's own notes |
| `/app/admin` | Owner-only content studio: draft/publish teaching, upload/remove production PDF and audio |
| `/dev/review/*` | Earlier local Day 1 review remains development-only; 404 in deployed builds |
| `/experiences/[experienceId]/*` | Whop setup state; embedded authentication remains pending |

Each product is independently authorized. A book-only member can use the workbook; audio does not require the course. Owner status enables content editing, not reading another member's notes. New accounts receive no products automatically. A trusted operator may issue a clearly identified complimentary grant; it must not be represented as a Whop payment.

The confirmed owner review account now has separate complimentary grants for all three products and owner access to Content Studio. This was verified through normal Google/Clerk sign-in on the deployed preview: all products appeared included and the editor was accessible. No payment was created or charged.

The header offers Light and Dark appearance, saved in the current browser and synchronized across same-origin tabs. Both modes cover member pages, forms, dialogs, the owner editor and Clerk components. The default remains dark. Desktop and mobile navigation labels are 16px; the desktop sidebar is wider to keep labels readable.

Captions and status text now use a 14px minimum, with descriptions, controls and form text at least 16px on desktop and mobile. The Today dashboard uses the same six numbered stage cards and descriptions as the landing page. Container queries choose six, three, two or one column based on available space. Small decorative lettering on the book artwork remains unchanged.

My Products now uses the accepted launch-preview panels: book cover, large 30 and orange sun/moon, with equal-height desktop cards, aligned actions, the public sample download and responsive stacking. Private product links still require the relevant entitlement; PDF and recording messages reflect the published library. Warm orange appears in page labels, selected serif headings, day indicators, reflection anchors, utility icons and focus outlines. The original sidebar sequence and separation are restored on desktop and mobile: Today, course, tools, self-image, ledger, book, audio; then weekly review, settings and My Products. Content Studio remains in a separate owner area.

The landing page now opens the original sample sales journey, including book checkout, both optional upsells and the final illustrated selection page. The accept/decline paths total $19, $48, $98 or $127. Choices are display-only URL values, preserved through reload/back navigation and reset by restarting. All steps are public and clearly labeled as a simulation. No payment details are collected, no purchase or grant is written, and links into the member app retain normal Clerk/Convex checks. Browser checks cover all four paths, restart, reload and 320px layouts in addition to the automated checks.

## Content and storage

Full paid curriculum is seeded into the private Convex content table from the original workspace using `node scripts/seed-reference.mjs /path/to/IntentField`. The script inserts missing entries without overwriting subsequent editorial work. The public repository contains only code, cleared assets, the original public sample and the outline, not the private curriculum or supplied source materials.

The September 24 product release expands the book through the continuing fictional Maya/Jordan stories and preserves the original manuscripts/previews. Eight chapters, 23 workbook sections and two companion-download records bring the private library to 75 published entries. Three PDFs are attached through owner-only media functions: a 29-page book, 34-page printable workbook and two-page checklist. The PDF workbook is printable; saved interactive answers live in the app. Every course lesson retains its existing teaching and adds an explicit outcome and next-lesson bridge. Morning/evening entries still contain pilot scripts without recordings.

The content studio edits plain text; it never executes authored HTML. Drafts remain owner-only until published. Revision checks reject stale updates. Member notes remain separate from teaching. Published media uses Convex storage, with access checked before its URL is returned. An entitled member can copy a downloaded file or its URL; this is ordinary protected delivery, not DRM. Replaced/removed files remain in storage for recovery and require a future retention policy.

Member forms use explicit save buttons, clear save/error status and an unsaved-change warning on reload or link navigation. They do not silently claim autosave or offline persistence. Concurrent edits are rejected with an instruction to copy one's words and reload. Weekly reflection creation and clearing its draft are one transaction.

## Services

- Convex project `intentfield`, development deployment `rugged-nightingale-644` in team `mark-198a2`.
- Clerk application `app_3Jl9HTB86RFhkocqo2A6WkgnzLG`, development instance `ins_3Jl9HSoA9KQbymEBdFfdzlPnf9N`; signed `convex` audience tokens.
- Vercel project `intentfield` in `marks-projects-fb2b2f72`, linked to the IntentField GitHub repository. The main review URL is https://intentfield.vercel.app/app/today. Both Preview and the main branch's Production target use the existing development Clerk/Convex environment; missing main-target variables were corrected after the first GitHub build. Vercel deployment protection settings remain unchanged.
- No DNS changes for `myintentfield.com`. No production Clerk/Convex environment or live sales configuration yet.
- Whop business `biz_xeSK2pOhE9Sxuk`: three hidden products and one-time USD plans, with branded covers and adaptive pricing disabled. Book `prod_1Fjx6emesjwl5` / `plan_55mR1Gb7ydVaR` ($19); course `prod_PQjYan54CWXvv` / `plan_VBYHNxWOs9KQG` ($79); audio `prod_9CR6SscWISttH` / `plan_vjX3WRljDFF4B` ($29). No charge, renewal or affiliate enrollment was created.
- Whop app `app_hA6Q15wmNvxibS` is registered as unlisted against `https://intentfield.vercel.app`, with `/experiences/[experienceId]` as the experience path. Registration also creates a separate app-product record; it is not a duplicate paid offer.
- App installation is pending: the MCP rejected experience creation for missing `app_authorization:create`. Runtime-key creation awaits the required browser confirmation. No checkout handler, verified Whop identity adapter or webhook/refund/reconciliation implementation is claimed. Whop also requires the owner to complete identity verification and 2FA for payouts.

## Verification

TypeScript, ESLint, production build and twenty tests pass. Backend checks cover authentication, independent product access, account isolation, revision conflict handling, answer bounds, valid completion, profile blank/zero handling, account-scoped export/deletion, atomic/idempotent ledger creation, owner permissions, private drafts and publication. New checks cover book-only chapter/workbook access, private saved workbook answers, worksheet bounds, zero/skipped ratings, owner-only PDF attachment, MIME validation, stale uploads and revoked download access. Walkthrough checks cover all four price combinations, URL persistence, restart and invalid query values.

The comprehensive Clerk/Convex browser scenario passes locally: signed-out redirect, unentitled denial, Day 1 and Day 2 completion, guide save, workbook/tool persistence, twelve self-image inputs, ledger/review, all thirty lesson links, audio scripts, fresh-session resume, another account's empty workspace, book-only/audio restrictions, mobile overflow checks, navigation dialog, export and confirmed reset. Tests use reserved synthetic accounts and actual signed Clerk sessions; they do not verify a Whop charge. Temporary users are deleted and grants revoked; synthetic notes and audit records remain in the development database.

Owner content draft/publication and real PDF/audio upload, delivery/playback and removal passed browser checks both locally and on Vercel. The complete member scenario also passed against the protected Vercel deployment; `/dev/review/today` returned 404 there. A fresh browser context on this machine is not a test on a second physical device.

## Commercial release work

1. Record and listen-review the morning/evening audio, then publish through Content Studio. The complete book, workbook, checklist and written course are available for owner review now.
2. Configure production Clerk/Convex and `myintentfield.com`; keep identities distinct until an explicit migration/linking process is designed.
3. Install/authorize the registered Whop app and implement its independent identity adapter.
4. Connect the existing $19/$79/$29 catalog to verified checkout/events, refunds, reconciliation and recovery on both surfaces; then test before making the offers public.
5. Confirm access terms, policies, support, backups, monitoring and release checks before paid acquisition.

This framework does not claim that paid checkout, a live AI counselor or finished recordings have shipped. The completed PDFs and written curriculum are delivered through the review application's protected member library.
