# Status — agritani

Updated: 2026-09-29
Status: Active
State: READY
Review-Risk: R1
Independent-Review: PENDING
Primary-Worker: Antigravity
Independent-Reviewer: UNSET
Independent-Review-Head: UNSET

## Delivery state machine

Allowed forward path:

`PLANNED -> READY -> IMPLEMENTING -> VERIFYING -> REVIEWING -> INTEGRATING -> PRODUCTION_READY -> AWAITING_DEPLOY_APPROVAL -> DEPLOYED -> SMOKE_TESTING -> VERIFIED`

Use `BLOCKED` only as an interruption state. Record the blocker and exact state to resume. Do not skip verification/review/integration states. `production-gate` proves the transition from `INTEGRATING` to `PRODUCTION_READY`; it never deploys.

`RELEASE.md` owns release-specific truth: release ID, base, declared risk, rollback reference/command, backup proof, and readiness status. `Review-Risk` is the highest semantic risk found during review. `production-gate` computes effective release risk as max(`RELEASE.md` Declared-Risk, deterministic `diff-risk`, `Review-Risk`). R3/R4 require `Independent-Review: PASS`, a reviewer distinct from `Primary-Worker`, and `Independent-Review-Head` bound to the reviewed release content. Only review-attestation files may change after that commit.

`OBSERVABILITY.md` owns post-deploy verification probes. After deployment, transition to `SMOKE_TESTING` and run `release-check`. Every configured observability probe must pass before transition to `VERIFIED`.

## Current state

Kontrak pra-pengembangan diaudit ulang pada 2026-09-29 dengan skill dotfiles terbaru (`development-kit` → `design-taste`):
- Lane: `prd-taskbreaker` (PRD.md + TASKS.md root); satu kontrak desain di `DESIGN.md`. Tidak memakai spec suite.
- `PRD.md`: REQ-02/04/05/06/07/08 dibuat terukur, REQ-06b (search) dipisah, persona ditandai *Assumption*, NG-4/NG-5 ditambah, checklist data pemilik OQ-1…OQ-12 (PRD §8).
- `DESIGN.md` ditulis ulang: identitas brand baru (DEC-011: Hybrid sains + lapangan, Hijau Daun + Kuning Panen, petani dulu), posisi distributor resmi (DEC-010), kontrak perilaku, token kontras hasil ukur, fotografi, integritas konten, gate bukti UI §10. Komposisi PROPOSED berbasis 9 referensi yang diinspeksi (T-00 selesai, DESIGN §4.0); UI render belum ada.
- `DESIGN.md` §4.2–4.3: anatomi global situs (kerangka header/breadcrumb/footer, 13 tipe halaman, SEO per tipe) dan anatomi artikel "Kanvas Jurnal Tani" (17 blok, state, metadata, JSON-LD, hub & internal link); dicek terhadap `impeccable` craft-floor (kicker dihapus, nomor hanya untuk urutan nyata, permukaan browser bertema). Belum dirender.
- Empat pilar situs (Jurnal Tani, Alat Tani, Konsultasi, Profil) + REQ-09…REQ-12: Kalender Tanam (data disemai dari agrimarket tanpa data pribadi/merek/harga, ditinjau Prof. Arif), Cuaca Tani (API BMKG langsung, diverifikasi), Kalkulator Dosis, Konsultasi; logo "Tunas A" diterima (DEC-013, `docs/brand/logo/`).
- `DESIGN.md` §4.4 Kontrak SEO Dinamis: `buildSeo()` + `SeoHead`, aturan field, template per 17 tipe halaman, breadcrumb, JSON-LD `@graph` dengan `@id` stabil, gambar OG, canonical/redirect, sitemap & robots, pemeriksa pasca-build (klaim Google diverifikasi 2026-09-29).
- `DESIGN.md` §2.0 peta situs (diagram + 17 tipe halaman) dan §2.8 aturan anti-spam WhatsApp (maksimal satu ajakan per halaman); `AGENTS.md` berisi panduan agent: urutan baca, routing skill, aturan keras, dan perintah.
- `ARCHITECTURE.md`: Astro 7 + Tailwind 4 + content layer 6 koleksi (commodities, articles, products, symptoms, cropCalendars, pages), cek integritas saat build, mode pratinjau draft, CSP lengkap, Cloudflare Workers.
- `TASKS.md`: 26 task (T-00…T-25) dalam 6 milestone (M0–M5), protokol eksekusi, dan skill pemilik per task dengan dependensi, blocker, gate UI, dan mode pratinjau draft untuk bukti UI.
- Review independen menyeluruh (2026-09-29): 5 blocker, 10 should-fix, 6 nit ditemukan dan diperbaiki (skema artikel vs naskah, pipeline draft, rute spesimen, kepemilikan `waLink`, CSP Pagefind, JSON-LD, komponen & path, koleksi `commodities`).
- `DECISIONS.md`: DEC-004…DEC-015 diterima kecuali DEC-012 (CMS setelah v1, PROPOSED); DEC-001 superseded.

- **2026-09-29 — pull naskah:** 150 artikel dari device lain (125 baru + 25 diperbarui) sudah ada di lokal. Dokumen disesuaikan: 6 topik jurnal + hub komoditas, `metaTitle`/`description` dari naskah, pemetaan 47 kategori (ARCHITECTURE §3.0), paginasi jurnal, dan skala konten T-16/T-25. Temuan konten: 6 judul berklaim absolut, 1/150 naskah punya referensi; tidak ada merek pihak ketiga atau penyebutan produk.

## Active work

T-02 selesai dikerjakan dan terverifikasi secara lokal (tes 9/9 lulus, build dan check lulus), namun check-boundary menghasilkan REVIEW_REQUIRED (effectiveRisk R2). Sesuai aturan, task T-02 dihentikan menunggu review independen resmi dari Claude/Paduka Ongki. Melanjutkan ke T-23 dan T-04 yang tidak bergantung pada T-02.

## Blockers

T-02 menunggu review independen (boundary review) dari Claude/Paduka Ongki karena kenaikan risiko deterministik skema koleksi ke R2.

## Verification evidence

- T-01 fondasi Astro 7.3.5 + Tailwind 4.3.3 + sitemap 3.7.4 selesai dan ter-commit.
- T-02 lokal: `src/lib/content-integrity.test.ts` (9 kasus uji gagal/lulus PASS dalam 5.5ms), `npx astro check` PASS (0 errors), `npm run build` PASS, `npm run check:contrast` PASS.
- Bukti visual T-01: `spesimen-390.png` dan `spesimen-1440.png` tersimpan.

## Next verified action

T-23: CI GitHub Actions (`.github/workflows/ci.yml`) dan T-04: Kerangka global, 404, `waLink`.

