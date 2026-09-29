# Build Log — agritani

Record only durable implementation changes, validation evidence, and gotchas that the next maintainer needs. Temporary task narration belongs in neither this file nor global memory.

## 2026-09-29 — Development contract initialized

- Added repository-local project context files.
- Bootstrap source state: repository contract only.
- Selected stack: `Web App / Dashboard`; database: `not selected`; authentication:
  `not selected`; deployment target: `not selected`.
- Stack corrected to a static content site (Astro 7, Tailwind 4, Pagefind); see DEC-004.
- Capability selections are not operational claims. Their implementation and
  verification remain future requirement-linked work.

## 2026-09-29 — Pre-development contract audit (development-kit / design-taste)

- Design tokens: measured WCAG contrast from hex values. The old accent CTA (white on `#C27803`) was 3.5:1 and `--color-text-subtle` was 4.6:1, both below REQ-08's 7:1. Tokens were replaced in `DESIGN.md` §3.1; rendered contrast is still unverified until T-15.
- Stack facts from `npm view`: astro 7.3.5, tailwindcss 4.3.3, pagefind 1.5.2, @astrojs/sitemap 3.7.4. The Astro 5 `type: 'content'` / `src/content/config.ts` pattern and `tailwind.config.mjs` are obsolete.
- Google FAQ rich results are limited to government and health sites, and HowTo is discontinued (Search Central, 2023-09-14). REQ-07 was re-scoped (DEC-007).
- `docs/research/scientific-validation.md` names institutions but no paper-level citation or DOI, so REQ-05 is blocked on T-16 / OQ-3.
- Visual direction is PROVISIONAL: no references have been inspected yet (T-00).

## 2026-09-29 — Four-pillar scope, brand, and Alat Tani specs (docs only)

- Scope set by the owner: Jurnal Tani, Alat Tani, Konsultasi, and company profile; products are reference, B2B is secondary. Catalogue is exactly four products (Aussie, BENSU, Kojien, Saratoga).
- Logo "Tunas A" was built as outlined SVG from Plus Jakarta Sans 800 (OFL) with `docs/brand/logo/build-logo.py` (fontTools + uharfbuzz, run in a throwaway venv). Rendered and checked at large size, reversed, mono, and 16px.
- BMKG public forecast API was tested on 2026-09-29. It returned `access-control-allow-origin: *` and `max-age=3600`, and per-slot fields include `tp` (rain). Browser-direct fetch is viable (DEC-014).
- The `ongkipro/agrimarket` repo was mapped read-only. Its planting-calendar matrices are national-only, the spec table and the code disagree, and the 2026/2027 climate "telemetry" is hand-typed. Only non-personal agronomic fields are reused, and they need review (DEC-015, OQ-11).
- The impeccable craft-floor pass on the spec removed kickers/eyebrows and sequence numbers on non-sequences, and added themed browser surfaces.

## 2026-09-29 — T-01: Foundation Astro 7 + Tailwind 4 + Tokens + Fonts (PASS)

- Initialized Astro 7.3.5 with `@tailwindcss/vite` 4.3.3 and `@astrojs/sitemap` 3.7.4.
- Setup `src/styles/global.css` with `@theme` design tokens from DESIGN §3.1–3.3.
- Downloaded 6 self-hosted woff2 font files (Plus Jakarta Sans 400, 400 italic, 600, 800; Newsreader 600, 600 italic) to `public/fonts/`. Total font size: 95.9 KB (budget ≤ 130 KB).
- Implemented `scripts/check-contrast.mjs` verifying all text token pairs (≥ 7.0:1) and UI indicators (≥ 3.0:1).
- Built dev-only specimen route `/spesimen/` in `src/dev/spesimen.astro` via `injectRoute` in `astro.config.mjs`; verified absent in `dist/` production build.
- Visual evidence captured at 390px and 1440px via `agritani-shot.cjs` on port 4330.
- Checks passed: `npm run check:contrast`, `npm test`, `npx astro check`, `npm run build`.

## 2026-09-29 — T-02: Content Config 6 Collections + Content Integrity (READY - PENDING INDEPENDENT REVIEW)

- Implemented `src/content.config.ts` covering 6 collections: commodities, articles, products, symptoms, cropCalendars, pages using Astro 7 `defineCollection` and `glob`/`file` loaders.
- Created data fixtures: `src/data/commodities.json`, `src/data/products.json`, `src/data/symptoms.json`, `src/data/crop-calendars.json`, `src/data/spray-thresholds.json`.
- Implemented `src/lib/content-integrity.ts` (`assertContentIntegrity()`, `isReviewed()`) with 9 table-driven tests in `src/lib/content-integrity.test.ts`.
- Verification passed: `npm test` (9/9 pass in 5.5ms), `npx astro check`, `npm run build`, `npm run check:contrast`. Boundary check requires independent review (R2 schema). Stopped for review.

## 2026-09-29 — T-23: GitHub Actions CI Workflow (READY - PENDING INDEPENDENT REVIEW)

- Created `.github/workflows/ci.yml` with Node 24, checkout@v4, setup-node@v4, read-only permissions, and steps for check, test, contrast, and build.
- Verification passed: YAML syntax valid, CI commands mirror local checks. Boundary check requires independent review (R3 CI workflow). Stopped for review.

## 2026-09-29 — T-04: Global Framework, Navbar, Footer, Breadcrumb, 404, waLink (REVISED - READY, PENDING INDEPENDENT REVIEW)

- Implemented `src/lib/whatsapp.ts`: `DEFAULT_WA_PHONE = ''`, throws error on production build when empty, falls back to `62000000000` only in dev/test/preview. Unit tests in `src/lib/whatsapp.test.ts`.
- Updated `src/components/Footer.astro` to DESIGN §4.2.1 baris 4a:
  - 5 columns: Alat Tani (4 tools), Jurnal Tani (6 topics), Produk (4 products), Perusahaan (5 links), and Kontak.
  - Eliminated fictitious address and phone; displays explicit placeholders `[Nomor WhatsApp menyusul - OQ-1]` and `[Alamat menyusul - OQ-7]`.
  - Replaced all text opacity classes (`text-white/60`, `/70`, `/80`) with full solid `text-white` (7.29:1 contrast, WCAG AAA compliant).
  - Removed top border line over copyright text per DESIGN §3.3; relies on vertical padding.
  - Standardized nav label to "Konsultasi".
- Updated `src/components/Navbar.astro`:
  - Increased "Ajukan Kemitraan" button font size to `text-sm` (14px).
  - Removed text opacity classes on brand.
- Updated `src/pages/404.astro`:
  - Removed "Galat 404" kicker pill per DESIGN §3.4.
  - Updated links to Diagnosa Gejala, Jelajahi Jurnal Tani, and Beranda.
- Added global `:focus-visible` ring styles in `src/styles/global.css` (`--color-brand-strong` on light, `--color-harvest` on brand).
- Extended `scripts/check-contrast.mjs` to explicitly test white text on brand for footer text and links.
- Impeccable review pass: visual hierarchy verified, touch targets ≥ 44px, no divider lines, 2px radius.
- Captured UI proof at 390px and 1440px on port 4330 via `agritani-shot.cjs`: `notfound-390.png` and `notfound-1440.png`.
- Verification passed: `npm run check:contrast`, `npm test` (38/38 pass), `npx astro check` (0 errors), `npm run build`. Boundary check requires independent review (R2 boundary). Stopped for review.

## 2026-09-29 — T-03: Frontmatter Normalization for 150 Articles (READY - PENDING INDEPENDENT REVIEW)

- Normalized frontmatter in place for all 150 articles in `docs/content/articles/*.md` following ARCHITECTURE §3.0 specification:
  - `meta_title` -> `metaTitle` (30–60 chars, 0 duplicates)
  - `meta_description` -> `description` (120–160 chars, 0 duplicates)
  - `published_date` -> `pubDate`
  - `author: "Arif Prabowo"`
  - `category` (47 variants) mapped into 6 canonical topics
  - `commodities` mapped into validated commodity slugs from `commodities.json`
  - Removed deprecated `reading_time` and `source` fields
  - Removed duplicate `# <Title>` from top of body in all 150 articles
  - Retained `draft: true` on all 150 articles
- Topic distribution (all 6 topics filled):
  - `budidaya`: 54
  - `proteksi-tanaman`: 35
  - `tanah-nutrisi`: 29
  - `pascapanen-agribisnis`: 14
  - `air-irigasi`: 9
  - `sains-tanaman`: 9
  - Total: 150
- Commodity occurrences:
  - `padi`: 60
  - `sayuran-daun`: 45
  - `cabai`: 44
  - `tomat`: 29
  - `kelapa-sawit`: 19
  - `jagung`: 18
  - `kopi`: 18
  - `melon`: 17
  - `mangga`: 13
  - `bawang-merah`: 10
  - `jeruk`: 9
  - `durian`: 8
  - `kedelai`: 7
  - `semangka`: 7
  - `kakao`: 6
  - `alpukat`: 4
  - `cengkeh`: 2
- Publication readiness audit:
  - 150/150 articles currently require `answer` (Short Answer, 40-60 words) and verified `references` before being transitioned from `draft: true` to `draft: false` (tracked for T-16 / T-25).
- Checks passed: `npm test` (22/22 pass), `npx astro check` (0 errors), `npm run build` (150 articles synced in content layer), `npm run check:contrast`. Boundary check requires independent review (R3 scale). Stopped for review.

## 2026-09-29 — T-05: ArticleLayout, TOC, Journal Index, and Topic/Commodity Hubs (READY - PENDING INDEPENDENT REVIEW)

- Implemented `src/lib/reading-time.ts` calculating reading time (~200 wpm) from clean word count.
- Built UI components: `AuthorByline.astro`, `AuthorBio.astro`, `ShortAnswer.astro`, `SymptomCompare.astro`, `ArticleToc.astro` (sticky on >=1024px with <1 KB scrollspy, collapsible `<details>` on mobile), `ArticleRow.astro`.
- Created `src/layouts/ArticleLayout.astro` adhering strictly to DESIGN §4.3 (17-block anatomy canvas, 68ch prose measure, no horizontal overflow).
- Created journal routes:
  - `src/pages/jurnal/index.astro` (main index with 6 topic filters, commodity hubs, first 30 articles, pagination controls)
  - `src/pages/jurnal/halaman/[n].astro` (static pagination pages 2..N, 30 items per page)
  - `src/pages/jurnal/[slug].astro` (article detail calling `assertContentIntegrity()`)
  - `src/pages/jurnal/topik/[topik].astro` (6 canonical topic hubs with tool pairings)
  - `src/pages/jurnal/komoditas/[komoditas].astro` (commodity hubs built strictly for >= 3 published/visible articles)
- Added markdown intro pages for 6 canonical topics in `src/content/pages/topik-*.md`.
- UI validation evidence captured at 390px and 1440px on port 4330 via `agritani-shot.cjs`:
  - `jurnal-index-390.png`, `jurnal-index-1440.png`
  - `article-detail-390.png`, `article-detail-1440.png`
  - `topic-hub-390.png`, `topic-hub-1440.png`
  - `commodity-hub-390.png`, `commodity-hub-1440.png`
- Verified:
  - Prose measure at 1440px is 621px (~71ch, within 65–72ch target).
  - No horizontal scrollbar at 320px viewport (`scrollWidth === 320px`).
  - Production build (`npm run build`) builds 8 pages and excludes draft articles.
  - Draft preview build (`PUBLIC_INCLUDE_DRAFTS=true npm run build`) builds 178 pages.
- Checks passed: `npm test` (22/22), `npx astro check` (0 errors), `npm run build`, `npm run check:contrast`. Boundary check requires independent review (R3). Stopped for review.

## 2026-09-29 — T-06: FieldSummaryBox (PASS)

- Implemented `src/components/FieldSummaryBox.astro` adhering to DESIGN §4.3.1 (block 8) and §4.3.3:
  - Supports both `masalah` and `panduan` variants with discriminated union.
  - Varian `masalah` fields: Masalah, Gejala Khas, Langkah Pertama, Dosis per Tangki 16 L (optional, tabular-nums), Waktu Aplikasi (optional).
  - Varian `panduan` fields: Tujuan Budidaya, Bahan yang Disiapkan (optional), Langkah Kunci, Waktu Pelaksanaan (optional).
  - Field labels styled with `color: var(--color-soil)` (contrast 8.95:1 on tint, exceeding 7:1 REQ-08 requirement).
  - Values styled with `color: var(--color-text)` (contrast 14.68:1 on tint).
  - Renders only populated fields; never guesses dosages.
  - Returns `null` when `fieldTakeaways` is missing (ensuring articles without takeaways render no empty box).
- Integrated into `src/layouts/ArticleLayout.astro` as Block 8 directly beneath Short Answer and above Table of Contents.
- UI validation evidence captured at 390px and 1440px on port 4330 via `agritani-shot.cjs`:
  - `field-summary-masalah-390.png` & `field-summary-masalah-1440.png` (verified full 5 fields on pest/disease problem).
  - `field-summary-panduan-390.png` & `field-summary-panduan-1440.png` (verified 4 fields on cultivation guide).
  - `field-summary-none-390.png` & `field-summary-none-1440.png` (verified 0 blank space/box on articles without takeaways).
- Checks passed: `npm run check:contrast`, `npm test` (38/38 pass), `npx astro check` (0 errors), `npm run build`. Boundary check passed: `BOUNDARY PASS effectiveRisk=R1`.

## 2026-09-29 — T-03 v2 & T-04 Nit Fixes (READY, PENDING INDEPENDENT REVIEW)

- Refined commodity assignments across 150 articles following Claude's review:
  - `artikel-64`: removed `kelapa-sawit`, kept `ubi-jalar`.
  - `artikel-78`: removed `padi`, kept `ubi-jalar`.
  - `artikel-25`: removed `padi`, kept `cabai`.
  - `artikel-79`: cleared to `[]` (general plant science: lignin biosynthesis).
  - `artikel-16`: cleared to `[]` (general Bt bioinsecticide).
  - `artikel-92`: cleared to `[]` (general MPHP plastic mulch).
  - Cleared general methodology/science articles (125, 134, 136, 149, 18, 56, 83) from `sayuran-daun`.
  - Tightened `scripts/check-commodities.mjs` aliases: eliminated loose terms (`wereng`, `moncong`, `rebah`, `benih`, `daun`, generic `kacang`).
  - Strict audit result: 118 commodity assignments across 150 articles, 0 invalid/unsupported assignments.
- Fixed `src/lib/whatsapp.ts`:
  - `isDraftPreview` respects `PUBLIC_INCLUDE_DRAFTS === 'true'` (in both `process.env` and `import.meta.env`).
  - Pure production build without `PUBLIC_INCLUDE_DRAFTS` enforces error-guard on empty `DEFAULT_WA_PHONE`.
  - Verified: `PUBLIC_INCLUDE_DRAFTS=true npm run build` successfully compiles all 175 pages with `DEV_PLACEHOLDER_PHONE`.
- Updated `src/components/Footer.astro`:
  - Widened brand description column to `lg:col-span-4` (grid 12) for comfortable measure.
  - Removed duplicate "Kebijakan Privasi" from bottom legal bar (already present in Perusahaan column).
  - Updated screenshot evidence captured at port 4330.
- All checks PASS: `check:commodities` (118/118), `check:contrast`, `npm test` (38/38), `npx astro check` (0 errors), `npm run build` (8 pages), `PUBLIC_INCLUDE_DRAFTS=true npm run build` (175 pages). Boundary escalated to R3 due to article scope; awaiting independent review.

## 2026-09-29 — T-07 References Component (PASS R1)

- Created `src/components/References.astro`:
  - Renders article references as Block 14 (Daftar Pustaka) inside a native `<details open>` element with `cursor-pointer`.
  - Ordered list `<ol class="list-decimal pl-5 space-y-2 text-sm text-soil">`.
  - External links formatted with `rel="noopener"` and `target="_blank"`, with DOI links prefixed with `https://doi.org/`.
  - Returns `null` if references array is empty or undefined (prevents empty cards/boxes).
- Integrated into `src/layouts/ArticleLayout.astro` as Block 14 above ConsultPrompt.
- UI validation evidence captured at 390px and 1440px on port 4330 via `agritani-shot.cjs`:
  - `references-detail-390.png` & `references-detail-1440.png` (verified list of citations with DOI links inside native `<details open>`).
  - `references-none-390.png` & `references-none-1440.png` (verified no card or empty element on article without references).
- Checks passed: `npm run check:commodities` (118/118), `npm run check:contrast`, `npm test` (38/38 pass), `npx astro check` (0 errors), `npm run build` (8 pages), `PUBLIC_INCLUDE_DRAFTS=true npm run build` (175 pages).
- Boundary check passed: `BOUNDARY PASS effectiveRisk=R1`.
- Ledger run `RUN-20260929T130452Z-a04d15c3` finished with result PASS.

## 2026-09-29 — T-13 Dynamic SEO Engine & Post-Build Verifier (READY, PENDING INDEPENDENT REVIEW)

- Dynamic SEO engine and metadata (`src/lib/seo.ts`):
  - Completed `buildSeo(input: SeoInput)` with JSON-LD `@graph` and stable `@id`s (`#organization`, `#website`, `#breadcrumb`, `#webpage`, `#article`, `#person`).
  - Breadcrumb hierarchy automatically aligned: `BreadcrumbList` in schema mirrors visible DOM breadcrumbs.
  - Open Graph tags: 1200×630 dimensions, `og:locale=id_ID`, `og:site_name=Agritani`, article published/modified time, author URL, and section.
  - Twitter card tags: `summary_large_image`, title, description, and image alt text.
  - Canonical URLs formatted strictly with apex host `https://agritani.com`, trailing slash, and stripped query strings/fragments.
- Head component (`src/components/SeoHead.astro`):
  - Full tag set rendered: primary meta, Open Graph, article OG, Twitter, favicon SVG, apple-touch-icon, sitemap link, theme-color `#1A6335`, and JSON-LD `@graph`.
- Static assets created:
  - `public/robots.txt`: Disallow `/cari/`, Sitemap index link.
  - `public/apple-touch-icon.png`: 180×180 PNG generated from brand mark (4.5 KB).
  - `public/og/`: 14 static OG PNGs (1200×630) created from brand palette and reverse logo (`default.png`, `jurnal.png`, 6 topic hubs, `komoditas.png`, 4 tool images, `produk.png`), all 34–41 KB (< 150 KB limit).
- Sitemap configuration (`astro.config.mjs`):
  - Filter excludes `/cari/`, `/404`, `/spesimen/`, and draft articles (`draft: true`).
  - Serialize attaches accurate ISO `lastmod` from article/page frontmatter, removes ignored `priority`/`changefreq`.
- Post-build verifier script (`scripts/check-seo.mjs`):
  - Scans all generated HTML in `dist/`.
  - Verifies: exactly one `<title>`, `<h1>`, canonical link; canonical URL structure; meta description bounds; valid JSON-LD `@graph`; no `noindex` pages in sitemap; robots.txt and asset existence.
  - Integrated into `package.json` `npm run build` and registered as `npm run check:seo`.
- Verifications:
  - `npm run check:commodities`: 118/118 valid assignments.
  - `npm run check:contrast`: PASS.
  - `npm test`: 38/38 unit tests PASS.
  - `npx astro check`: 0 errors.
  - `npm run build` (production build): 8 pages, `check-seo` PASS (0 errors, 0 warnings).
  - `PUBLIC_INCLUDE_DRAFTS=true npm run build` (draft preview build): 175 pages, `check-seo` PASS (0 errors, 0 warnings).
  - Boundary: escalated to R3 due to `package.json` modification. Stopped for independent review without self-review. Ledger run `RUN-20260929T131043Z-8a04bf9a` finished with result BLOCKED.

## 2026-09-29 — T-05: Jurnal Tani Article Page, Hubs, & Index (PASS)

- Addressed review findings from Claude (sesi pemantau):
  1. Consultation prompt threshold: Removed unverified numerical threshold "menyebar lebih dari 15% populasi dalam satu petak" from `src/layouts/ArticleLayout.astro`. Replaced with truthful phrasing: "Bila gejala terus meluas atau respon tanaman tidak membaik setelah tindakan pertama...".
  2. Author Bio: Replaced unverified biography in `src/components/AuthorBio.astro` with verified role "Profesor Pertanian. Moderator Jurnal Tani." and visible placeholder `[Bio menyusul - OQ-4]`.
  3. Neutrality & portal ownership: Removed the word "independen" from `AuthorBio.astro` and `src/pages/jurnal/index.astro` to avoid contradicting the distributor disclosure statement.
  4. Related Articles algorithm in `src/pages/jurnal/[slug].astro`:
     - Prioritizes shared commodities first (weight 100), shared tags second (weight 10), topic third (weight 1).
     - Isolates distinct crops: articles with specific commodities never cross-link to articles with disjoint specific commodities (e.g. chili articles never recommend oil palm articles).
     - Empty result sets render nothing (clean fallback).
  5. ASCII / Code block styling: Added `.prose :global(pre)` styles in `ArticleLayout.astro` featuring light background (`var(--color-tint)`), dark text (`var(--color-text)`), border, 2px radius, and `overflow-x: auto`. Client-side script applies `tabindex="0"` for full keyboard accessibility.
  6. Footer tagline: Removed unrequested tagline "Sains agronomi & praktik lahan" in `src/components/Footer.astro` to align strictly with DESIGN §4.2.1 baris 4b.
- Impeccable critique pass:
  - Visual hierarchy: editorial Newsreader serif headers with Plus Jakarta Sans body/UI; measure bounded to 68ch; no kickers, no decorative icons, no divider lines between sections.
  - Responsive verification: tested at 390px (mobile) and 1440px (desktop) via `agritani-shot.cjs` on port 4330.
  - UI proof captured: `article-revised-390.png` and `article-revised-1440.png` in `.gemini/antigravity-cli/brain/4994fe89-47c7-485e-88fb-da50632cba49/proof/ui/t05/`.
- Verifications:
  - `npm run check:commodities`: 118/118 valid assignments.
  - `npm run check:contrast`: PASS (all text ≥ 7:1, UI ≥ 3:1).
  - `npm test`: 38/38 unit tests PASS.
  - `npx astro check`: 0 errors.
  - `npm run build`: 8 production pages, `check-seo` PASS (0 errors, 0 warnings).
  - `PUBLIC_INCLUDE_DRAFTS=true npm run build`: 175 draft preview pages, `check-seo` PASS (0 errors, 0 warnings).
- Boundary check passed: `BOUNDARY PASS effectiveRisk=R2`. Ledger run `RUN-20260929T131837Z-bafff014` finished with result PASS.


