# ADR-0001: Cloudflare R2 for media and D1 for lead storage, adopted only on trigger

- **Status:** Proposed
- **Date:** 2026-09-29
- **Author:** Claude (lead developer on behalf of the project)
- **Deciders:** Paduka Ongki (owner)
- **Supersedes:** None (would amend DEC-004 and DEC-006 when accepted)

## 1. Context

agritani.com v1 is a static Astro build served by Cloudflare Workers static
assets with no Worker script, database, or server runtime (DEC-004). Forms only
compose a `wa.me` message and store nothing (DEC-006). The owner has authorized
Cloudflare D1 and R2 and asked which parts of the site would need them.

Needs that could justify storage:

| Need | Today | Pressure that would change it |
| :--- | :--- | :--- |
| Photos (product packshots, Prof. Arif, symptom photos P-2, real field photos OQ-5) | 11 dummy WebP files in `src/assets/`, optimized at build by `astro:assets` | Real photo library grows past what is comfortable in git (hundreds of images), or a CMS needs a media upload target |
| Partnership and consultation leads | Sent to WhatsApp only; nothing kept | Owner wants a lead list, follow-up status, or reporting beyond counting WhatsApp source codes (G-6) |
| CMS content | Markdown/JSON in git (DEC-012, proposed, prefers a git-based CMS) | A database-backed CMS is chosen instead (not recommended, ARCHITECTURE §6) |
| BMKG forecast | Browser-direct call (DEC-014) | Not a storage need; no change proposed |

Decision drivers: page speed on rural networks (REQ-08), strict CSP with zero
third-party scripts, no personal data stored without a reason (DEC-006, PRD NG-4,
privacy policy), lowest operating cost, and reversibility.

Alternatives considered:

1. **Keep v1 fully static (status quo).** Zero runtime, zero personal data. Cannot keep a lead list.
2. **Adopt R2 + D1 now.** Adds a Worker, secrets, migrations, personal-data duties, and a third-party script (Turnstile) before any feature needs them. Rejected for now (YAGNI).
3. **Adopt each service only when its trigger fires (selected).**
4. **Third-party form or CRM service.** Moves partner data to another processor and adds a third-party brand/script (NG-3, CSP). Rejected.

## 2. Decision

Keep v1 static. Prepare, but do not build, two independent increments:

### 2a. R2 media bucket (task T-29), trigger: real photo library or CMS media uploads

- One bucket, for example `agritani-media`, served read-only on a custom
  subdomain such as `media.agritani.com` (exact public-access setup to be
  re-checked in the R2 docs at build time).
- Pages keep using `astro:assets`. Remote originals are allowed through Astro's
  remote image configuration so the build still produces responsive WebP; the
  site never hot-links unoptimized originals.
- CSP change: add the media host to `img-src` only.
- No Worker code is needed for read-only media.

### 2b. D1 lead store (task T-30), trigger: owner decides leads must be kept

- Add a Worker script that runs only for `/api/*`
  (`assets.run_worker_first: ["/api/*"]`); every other path is still served
  straight from static assets.
- Binding `DB` in `wrangler.jsonc` (`d1_databases`: `binding`,
  `database_name`, `database_id`, optional `migrations_dir`).
- One table for partnership applications, created by a versioned migration.
  Fields mirror the existing `PartnerForm` (name, business, type, province, city,
  scale, phone, notes) plus `id`, `created_at`, `source`, `consent_version`, and
  `status`. Consultation messages stay WhatsApp-only unless the owner asks
  otherwise.
- `POST /api/kemitraan` validates every field server-side (same rules as the
  client), verifies a Turnstile token with a POST to
  `https://challenges.cloudflare.com/turnstile/v0/siteverify`, inserts the row
  with a parameterized statement, and returns the same WhatsApp hand-off, so
  the user flow and the one-WhatsApp-CTA rule do not change.
- CSP change: `script-src` and `frame-src` gain
  `https://challenges.cloudflare.com` (Turnstile reference). `connect-src`
  stays `'self'` for the API. Whether the widget renders under the current
  strict CSP (`style-src 'self'`, no inline scripts) is unverified and must be
  proven in the browser in T-30 before launch.
- Reading leads: no public admin page in this increment. The owner reads
  them with `wrangler d1 execute` or a later access-protected admin (separate
  decision).

## 3. Consequences

- **Positive:** Each increment is small and reversible, and nothing changes
  for visitors until its trigger fires. Media can grow without bloating git,
  and leads become countable and followable.
- **Negative:**
  - 2b adds a server runtime, a secret (Turnstile secret key via
    `wrangler secret put`), migrations, and a third-party script on one page.
  - 2b also creates a personal-data duty: the privacy policy must disclose
    purpose, retention, and deletion on request before launch, and the
    Indonesian personal-data law must be checked by the owner.
  - R2 adds a second host to CSP and a build-time network dependency for
    images.
- **Neutral:**
  - Both services need Paduka Ongki's approval for resource creation and
    deploy (production gate).
  - `DEC-004`/`DEC-006` are amended, not deleted, when this ADR is accepted.
  - CI needs the `CLOUDFLARE_API_TOKEN` secret with D1/R2 permissions.

## 4. Runbook (for the implementing task, commands verified against Cloudflare docs 2026-09-29)

Re-check each command in the current docs before running; creating resources
and deploying need explicit approval.

**R2 (T-29)**

1. `npx wrangler r2 bucket create agritani-media`
2. Configure public read access through a custom domain in the dashboard
   (verify the current R2 public-bucket procedure).
3. Add the host to Astro remote image configuration and to CSP `img-src`
   (`public/_headers`); update `scripts/check-csp.mjs` expectations.
4. Move image references in content frontmatter; keep `alt` text and
   `CREDITS.md` or owner-provided rights records.

**D1 (T-30)**

1. `npx wrangler d1 create agritani-leads`, then copy the printed binding into
   `wrangler.jsonc` under `d1_databases`.
2. `npx wrangler d1 migrations create agritani-leads create_partner_applications`
   and write the `CREATE TABLE` SQL.
3. `npx wrangler d1 migrations apply agritani-leads --local` for development,
   then `--remote` after approval.
4. Add `main` (Worker entry) and `assets.run_worker_first: ["/api/*"]` to
   `wrangler.jsonc`; `assets.binding` is optional (only if the Worker calls
   `env.ASSETS.fetch()`).
5. `npx wrangler secret put TURNSTILE_SECRET_KEY`. Never commit it.
6. Implement `POST /api/kemitraan` with validation, Turnstile verification,
   parameterized insert, rate-aware error responses, and tests (`node --test`).
7. Update the privacy policy, DESIGN §2.3 form behavior, ARCHITECTURE §5, and
   the CSP check. Then build, run `wrangler dev`, and run the browser proof.
