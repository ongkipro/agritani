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
