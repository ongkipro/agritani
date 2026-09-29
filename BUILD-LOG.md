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

## 2026-09-29 — T-04: Global Framework, Navbar, Footer, Breadcrumb, 404, waLink (READY - PENDING INDEPENDENT REVIEW)

- Implemented `src/lib/whatsapp.ts` with strict anti-spam query param encoding, source tracking, and newline serialization. Tests in `src/lib/whatsapp.test.ts` (7 tests).
- Implemented `src/lib/seo.ts` with `buildSeo()`, title suffixing, canonical url sanitization, OpenGraph metadata fallback, and robots directives. Tests in `src/lib/seo.test.ts` (6 tests).
- Created `src/components/SeoHead.astro`, `src/components/Breadcrumb.astro`, `src/components/ConsultPrompt.astro`.
- Created accessible `src/components/Navbar.astro` (desktop nav, modal dialog for mobile, skip link target) and `src/components/Footer.astro` (legal identity placeholder TODO(OQ-7), WA text TODO(OQ-1)).
- Created `src/layouts/BaseLayout.astro` and `src/pages/404.astro`.
- Captured UI proof at 390px and 1440px via `agritani-shot.cjs` on port 4330.
- Verification passed: `npm test` (22/22 tests), `npx astro check`, `npm run build`, `npm run check:contrast`. Boundary check requires independent review (R3). Stopped for review.

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



