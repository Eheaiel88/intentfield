# IntentField brand

Approved September 24, 2026: **Field + Horizon type (2a)**. The mark is a 3×3 field of equal circles. Only the center circle is lime. The wordmark is uppercase Archivo Black, with off-white **INTENT** and lime **FIELD**.

| Role | Color |
| --- | --- |
| Near-black background | `#121412` |
| Eight field dots | `#3A3F38` |
| Center dot and FIELD | `#D4FF4A` |
| INTENT and cover title | `#EDF0E6` |

The shared `Brand` component appears in public navigation, the member sidebar, mobile navigation and footers. `BrandWordmark` also supplies the course checkout's workspace preview. The wordmark retains its near-black background in light mode so the approved lime and off-white colors remain readable.

## Assets

- `/assets/logo.svg`: wordmark with a near-black background, used in the interface.
- `/assets/intentfield-wordmark.svg`: transparent lockup for placement on dark artwork.
- `/assets/intentfield-mark.svg`: transparent field symbol.
- `/assets/intentfield-icon.svg` and `.png`: 512px app artwork.
- `/assets/intentfield-book-cover.svg`: shared book-cover artwork for the landing page, product library, reader and sales walkthrough.
- `src/app/icon.svg`, `favicon.ico` and `apple-icon.png`: browser and home-screen icons through Next.js metadata conventions.

Wordmark and cover-title lettering are vector outlines from [Archivo Black](https://github.com/google/fonts/tree/main/ofl/archivoblack), so their shape does not depend on a visitor's installed fonts. Its [SIL Open Font License](/assets/ArchivoBlack-OFL.txt) accompanies the artwork. Small cover labels use a monospace fallback.

Use `Brand` and `BookObject` rather than recreating the identity as styled text. Preserve the dot count, center highlight, proportions and two-tone lettering. Keep existing orange application accents and readable interface typography. This update replaces the earlier rising-bar logo; historical previews remain archived. The downloadable PDFs and external Whop catalog artwork require a separate artwork refresh before release.
