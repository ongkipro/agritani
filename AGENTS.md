# Project Instructions — agritani

## Scope

This file contains repository-specific rules only. Global safety, Git, secret-handling, native-first, and verification policy comes from the user's canonical AI policy.

## Project

- **What**: agritani.com is an agriculture portal officially managed by **Arif Prabowo** (Senior Agricultural Consultant, not a professor) under the name **Agritani Official** (no legal entity yet; never write "PT Agritani Internasional", DEC-017), which offers four flagship products and partners with several fertilizer brands and agricultural companies (partners never named, NG-3; never claim to be a manufacturer or research institute; DEC-016). The site has four pillars: **Jurnal Tani** (articles by Arif Prabowo, each with a commercial-relationship disclosure), **Alat Tani** (Diagnosa Gejala, Kalender Tanam, Cuaca Tani, Kalkulator Dosis), **Konsultasi** (WhatsApp), and the company profile. Four products (Aussie, BENSU, Kojien, Saratoga) serve as reference; B2B partnership comes second (PRD §1.5).
- **Stack**: static site on TypeScript strict + Astro 7 + Tailwind CSS 4 (`@theme` tokens, no `tailwind.config`) + Pagefind, hosted on Cloudflare Workers static assets (DEC-004, DEC-009). No database, auth, server runtime, UI framework, or third-party tracking. The only runtime network call is the browser-direct BMKG forecast (DEC-014).
- **Audience & language**: Indonesian farmers on low-end Android phones outdoors. All UI copy is Bahasa Indonesia (DESIGN §1.3); code, identifiers, and commit messages are English.

## Read before any task

1. `STATUS.md` holds the current state and whether development is authorized.
2. `TASKS.md` gives the task, its protocol, Allowed paths, Owner skill, and Done when.
3. The `DESIGN.md` and `ARCHITECTURE.md` sections the task cites.
4. `DECISIONS.md` before adding any dependency, service, or pattern.

Do not start implementation while `STATUS.md` says development authorization is pending.

## Skill routing

| Work | Skill(s) |
| :--- | :--- |
| Astro pages, content collections, routing, build | `astro-development` (+ `native-first` for any dependency question) |
| Visual/UX decisions on public pages | `design-taste`. Then, for every changed UI: `impeccable` (critique + polish), then `ui-validation` (browser proof at 360px & 1440px) |
| Metadata, JSON-LD, sitemap, robots, canonical | `seo-website-builder` (contract: DESIGN §4.4) |
| Tests for pure logic | `testing-engineering` (`node --test`, table-driven cases) |
| CSP, form input handling | `application-security` |
| Performance budget, Lighthouse | `web-perf` |
| Cloudflare config, deploy | `cloudflare`, `wrangler` (deploy needs approval) |
| CI workflow | `github-actions` |
| Copy, article fields, hub intros | `copywriting`, `content`, `volumx-writer` |

## Hard rules for this repository

- **Contracts first**: implement what DESIGN/ARCHITECTURE specify. If the code must differ, update `ARCHITECTURE.md` (what was actually built) and record the decision; never leave two current claims.
- **Allowed paths**: only touch the files a task allows. Start each task with `delivery-ledger --repo . start … --allow <pattern>` and close it with `check-boundary` and `finish` (TASKS protocol).
- **Articles folder**: `docs/content/articles/` is also edited on another device. Editing article bodies is **allowed** (owner decision 2026-09-30) under these guards: `git pull --ff-only` immediately before editing; commit in small batches and push promptly so the other device can pull; never change facts, figures, dosages, citations/references, product claims, `draft` status, or `slug` unless the task says so; formatting and readability fixes (for example LaTeX to readable formulas, headings, lists) are fine. Prefer a build-time fix when the same problem affects many articles (it also covers future articles).
- **Content integrity**: never invent citations, DOIs, dosages, registration numbers, reviewers, credentials, statistics, prices, or testimonials. Unknown owner data stays a placeholder marked `TODO(OQ-n)` and tracked in `PRD.md` §8. Product claims marked "Ditahan" in DESIGN §2.5 never render.
- **Journal content model**: there are 300 manuscripts; 296 are published (DEC-020, 2026-09-30) and 4 stay `draft: true` because of recorded content problems (`docs/build-notes/launch-content.md` §3). References, short answer, and commodities are optional for published articles; never invent them. Topic taxonomy is 6 fixed topics plus commodity hubs (built at ≥ 3 published articles). Map frontmatter exactly as in ARCHITECTURE §3.0: `meta_title` becomes `metaTitle` (used verbatim as `<title>`), `meta_description` becomes `description`, `category` becomes `topic`. Publish topic by topic, starting with `proteksi-tanaman`.
- **Voice**: no absolute or guarantee claims ("100%", "ampuh", "tuntas", "pasti", "menjamin") in titles, copy, or UI (DESIGN §1.3). Flag them for T-25 instead of silently rewriting an article.
- **No third-party brands** outside article reference lists (NG-3, DEC-005). No personal data from `agrimarket` or anywhere else (DEC-015).
- **Reviewed data only**: crop calendars, symptoms, and spray thresholds render in production only when `reviewedBy` is set. Draft or unreviewed content appears only in draft-preview mode (ARCHITECTURE §3.2).
- **WhatsApp**: at most one WhatsApp CTA per page, placed after the task. Never in the header, menu, hero, a sticky or floating element, or per list item. All links go through `waLink()` (DESIGN §2.8).
- **UI invariants**: no kickers/eyebrows, no divider lines between sections, 2px max radius, no shadows, no decorative icons, text contrast ≥ 7:1, touch targets ≥ 44px (DESIGN §3, §3.3.4, §8).
- **Owner decisions 2026-09-30 (DEC-016, DEC-017, DEC-019, DEC-020, DEC-021, T-37)** — do not undo without a new decision:
  - Name: "Agritani" / "Agritani Official"; never "PT Agritani Internasional". Arif Prabowo is "Konsultan Pertanian Senior", never "Prof.".
  - Cards are allowed only as the single `.card` style for a whole unit (product, price, tool input/result, author, related item, form); never around sections or prose; no card inside a card (DESIGN §3.3.3). Homepage stays open (approved).
  - Footer is locked to the owner version (`src/components/Footer.astro`); do not restyle it.
  - WhatsApp: none on the homepage, product pages, Jurnal index/hubs/tags, Alat index, Privasi, Cari, 404. Article: only the link in the author block. Tools: only after a result. Profile: one prompt under the bio. Tentang Kami: one sales CTA (DEC-021). Konsultasi/Kemitraan: the form submit.
  - Positioning (DEC-021): Agritani Official is the official and main distributor for online sales (marketplaces and other platforms).
  - Prices: from `src/data/products.json` only, with the check date; never name or link the source site.
  - Commodity hub: one article list with "Muat Panduan Lainnya", not split by topic. Article tags: "Tag:" + plain `#tag` links, no chips.
  - Indexing (DEC-023, DEC-025): every page is indexable except `/cari/`, 404, and tag archives with fewer than `TAG_INDEX_MIN` (3) published articles, which render `noindex, follow`. The sitemap lists exactly the built pages without `noindex` (filter in `astro.config.mjs`; `check-seo` fails otherwise). `/sitemap.xml` is a split index (jurnal, topik, komoditas, tag, produk, alat, pages). `robots.txt` blocks no path, so `noindex` stays readable (DEC-024).
  - Outbound links (DEC-024): every external link is `rel` with `nofollow` + `noopener` (`externalLink()` in components, the rehype plugin in Markdown); `check-links` fails otherwise.
  - Articles: reuse existing tags; set `updatedDate` on every substantive revision (docs/content/ARTICLE-INTAKE.md §3).
  - SEO lengths (DEC-022): final `<title>` 55–70 characters including spaces and the " - Agritani" suffix (home has no suffix); meta description 120–155 characters. Separator " - " (or ":" inside a title), never "|" or "—". Pad short titles/descriptions with related keywords, never with hype words. Generated titles use `fitText()` in `src/lib/seo.ts`; `check-seo` fails the build outside these ranges.
- **New or updated articles (AI-written or copied from a `.md` file)**: follow `docs/content/ARTICLE-INTAKE.md` exactly (frontmatter template, 44–59 char `metaTitle`, 120–155 char `description`, no hype words, real references only). `npm run build` starts with `scripts/check-articles.mjs`, which fails on any violation; run `npm run check:articles` first.
- **Images (owner 2026-10-01)**: every page image is WebP (SVG only for icons/logos; PNG only for `public/og/*.png` and `public/apple-touch-icon.png`). Put sources in `src/assets/` as `.webp` (convert with `scripts/to-webp.mjs`) and render with `astro:assets` (`<Picture>`/`<Image>` with `formats={['webp']}`). Every `<img>` needs a descriptive ALT of 10–125 characters that contains the page's keyword: article images use `articleImageAlt()` (`src/lib/image-alt.ts`: "Ilustrasi {komoditas|topik}: {judul}"), product images "Kemasan {nama}, {peran}", other images describe what is shown plus the page topic. No empty ALT, no generic ALT ("gambar", "foto"). `scripts/check-images.mjs` fails the build otherwise.
- **Build guard**: `npm run build` ends with `scripts/check-owner-rules.mjs`, which fails on the forbidden names, WhatsApp placement, and `shadow-*`/`uppercase` inside `<main>`. Fix the page, do not weaken the guard; changing a rule needs a `DECISIONS.md` entry first.
- **No new dependencies or runtime services** without a `DECISIONS.md` entry. Prefer platform features (native form validation, `<dialog>`, `<details>`, `Intl`, `navigator.share`).
- **CSP-safe code**: no inline executed scripts, `on*=` attributes, or `style=` attributes (ARCHITECTURE §5).
- **Approval gates**: production deploy, DNS/redirect changes, search-engine submissions, and pushing to `main` each need Paduka Ongki's explicit approval.

## Commands (available after T-01)

`npm run dev` · `npm run build` (includes Pagefind, `check-seo`, `check-csp`, `check-placeholders`, `check-links`, `check-owner-rules`) · `npx astro check` · `npm test` · `npm run check:contrast` · draft preview: `PUBLIC_INCLUDE_DRAFTS=true npm run dev`

## Sources of truth

- Accepted product behavior: `PRD.md`; for a specification-suite project it is
  only the entrypoint to canonical `docs/spec/02-PRD.md`
- Sole executable work queue: `TASKS.md`
- Current implementation handoff and semantic review state: `STATUS.md`
- Accepted technical and product constraints: `DECISIONS.md`
- Accepted implementation design when present: `PLAN.md`
- Full architecture decisions when present: `docs/adr/ADR-NNNN-<slug>.md`; `DECISIONS.md` remains the canonical index
- Current release boundary, declared release risk, rollback evidence: `RELEASE.md`
- Post-deploy runtime health contract: `OBSERVABILITY.md`
- Execution evidence and resume projection: `.delivery/`
- Durable implementation notes: `BUILD-LOG.md`
- Architecture and trust boundaries: `ARCHITECTURE.md`

When design and implementation diverge, `ARCHITECTURE.md` records what the code
actually does and therefore outranks a pre-implementation `PLAN.md`. Update the
plan or supersede its decision rather than leaving two current claims.

`STATUS.md` is the only workflow-state authority. `.delivery/current.json` is a projection/evidence index and must never override `STATUS.md`. Do not hand-edit `.delivery/runs/*.jsonl` or `.delivery/releases/*.json`; their integrity is verified by hash chains/self-hashes. Use `delivery-ledger` to start runs, capture an R1-R4 task boundary, record verification, check the final change surface, checkpoint handoffs, finish runs, and snapshot releases. A bounded run may not report `PASS` without a current passing or independently approved boundary result. The canonical behavior and examples live in `~/dotfiles/docs/task-change-boundary.md`.

Delivery metrics are optional immutable sidecars under `.delivery/metrics/`. Use `delivery-benchmark` to record them after a run finishes and to compare model reliability/cost empirically. Benchmark recommendations are advisory only. Do not rewrite routing from a small sample, do not select a cheaper model below the configured reliability floor, and never auto-downgrade R3/R4 work from benchmark output.

Inspect the repository's actual configuration before adding stack-specific rules. Disk and executable behavior override stale documentation. Production readiness must be proven by the repository gates; never infer it from prose alone. `production-gate` also requires `delivery-ledger verify` to pass before a release is production-ready.
