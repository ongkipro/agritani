# Task Execution Queue: Agritani — Jurnal Tani, Alat Tani, Konsultasi & Profil

> **Entitas**: PT Agritani Internasional ([agritani.com](https://agritani.com))
> **Prinsip**: Setiap tugas memiliki **tepat satu Primary Requirement** dari [PRD.md](PRD.md); requirement lain adalah constraint.
> **Status**: Ready for Execution (revisi 2026-09-29) · antrean eksekusi tunggal proyek ini.

**Gate UI (berlaku untuk setiap task bertanda UI):** "Done" hanya setelah
bukti [DESIGN.md §10](DESIGN.md) tercatat: `impeccable` critique + polish,
lalu `ui-validation` pada halaman nyata di 360px dan 1440px, keyboard, dan
alur kritis. `npm run build` hijau bukan bukti UI.

**Perintah verifikasi dasar** (dibuat di T-01): `npm run build`, `npx astro check`, `npm test`, `npm run check:contrast`.

**Artikel draft:** semua artikel draft sampai pustaka (T-16/OQ-3) dan Jawaban Singkat ada. Task UI membuktikan diri di **mode pratinjau draft** (ARCHITECTURE §3.2); hanya T-15 yang wajib memakai build produksi dengan artikel terbit.

---

## Protokol Eksekusi Task (wajib untuk setiap task)

Berlaku untuk agent maupun manusia. Detail aturan agent ada di [AGENTS.md](AGENTS.md).

1. **Izin**: task hanya dimulai setelah Paduka Ongki memberi otorisasi development (STATUS.md). Pilih task yang semua `Depends`-nya Done dan `Blocked by`-nya terjawab (atau boleh memakai placeholder bertanda).
2. **Siapkan**: `git pull`; kerjakan di worktree/branch `feat/T-xx-<slug>` (bukan langsung di `main`).
3. **Buka run**: `delivery-ledger --repo . start --task T-xx --requirement <Primary> --risk <Risk> --worker <nama> --allow '<pola>'…` dengan satu `--allow` per pola **Allowed paths** task itu. Perubahan di luar pola = berhenti dan minta perluasan scope.
4. **Baca** bagian DESIGN/ARCHITECTURE yang dirujuk task dan buka **Owner skill**-nya sebelum menulis kode.
5. **Implementasi** minimum yang memenuhi "Done when"; logika non-trivial (tanggal, dosis, SEO, WhatsApp, integritas, indikator cuaca) disertai tes tabel kasus.
6. **Verifikasi** dan catat tiap perintah: `delivery-ledger record --check <nama> --command "<perintah>"` untuk `npm run build`, `npx astro check`, `npm test`, `npm run check:contrast`, dan pemeriksaan khusus task.
7. **Gate UI** (task bertanda ✓): `impeccable` critique + polish → `ui-validation` (360px & 1440px, keyboard, state kritis) → bukti dicatat (DESIGN §10).
8. **Tutup**: `delivery-ledger check-boundary` → `finish --result PASS|FAIL`; perbarui kolom Status di matriks, `STATUS.md` (Active work / Next action), dan catatan tahan lama di `BUILD-LOG.md`.
9. **Commit/push hanya bila diminta**; stage hanya file task; tanpa trailer atribusi AI.

**Definition of Done (semua task)**: "Done when" terpenuhi dengan bukti perintah nyata · tidak ada perubahan di luar Allowed paths · tidak ada merek pihak ketiga, klaim tertahan (DESIGN §2.5/§7), data pribadi, atau rahasia · aturan WhatsApp DESIGN §2.8 dipatuhi · kontrak dokumen diperbarui bila implementasi berbeda (ARCHITECTURE mencatat yang benar-benar dibangun).

## Milestones

| Milestone | Task | Syarat selesai |
| :--- | :--- | :--- |
| **M0 Fondasi** | T-01, T-02, T-23 | Build/check/test/kontras hijau lokal & CI; 6 koleksi terbaca; spesimen token dirender |
| **M1 Kerangka & Jurnal** | T-03, T-04, T-05, T-06, T-07, T-13, T-14 | Artikel (pratinjau draft) tampil sesuai anatomi §4.3; SEO dinamis & pemeriksa pasca-build lulus; pencarian jalan |
| **M2 Alat Tani & Konsultasi** | T-09, T-19, T-20, T-21, T-22 | Empat alat + konsultasi lolos gate UI; data kalender/gejala berlabel "belum ditinjau" di pratinjau |
| **M3 Beranda, Profil & B2B** | T-08, T-10, T-11, T-12, T-17 | Semua halaman di peta situs (DESIGN §2.0) ada; data pemilik terisi atau placeholder bertanda |
| **M4 Konten siap terbit** | T-16, T-25 | Artikel yang dirilis punya pustaka terverifikasi + Jawaban Singkat; data tertinjau Arif Prabowo |
| **M5 Rilis** | T-18, T-15, T-24 | Audit akhir di build produksi lulus; deploy produksi **dengan persetujuan**; probe observability lulus |

---

## Task Matrix & Tracing

| Task | Nama | Primary | Constraints | Risk | UI | Depends | Blocked by | Status |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- | :--- | :---: |
| T-00 | Reference discovery & composition contract | REQ-01 | REQ-03, REQ-08 | R1 | — | — | — | Done 2026-09-29 (DESIGN §4.0) |
| T-01 | Fondasi Astro 7 + Tailwind 4 + token + font | REQ-08 | REQ-03 | R1 | — | — | — | Done 2026-09-29 |
| T-02 | Content config: 6 koleksi (ARCHITECTURE §3) + cek integritas | REQ-03 | REQ-05, REQ-06 | R1 | — | T-01 | — | Menunggu review independen |
| T-03 | Normalisasi frontmatter 150 artikel (in place) | REQ-03 | REQ-04, REQ-05 | R1 | — | T-02 | — | Menunggu review independen |
| T-04 | Kerangka global, 404, `waLink` WhatsApp | REQ-01 | REQ-07, REQ-08 | R1 | ✓ | T-01 | OQ-5, OQ-7 (placeholder teks diperbolehkan, ditandai) | Menunggu review independen |
| T-05 | ArticleLayout, TOC, indeks `/jurnal` | REQ-03 | REQ-08 | R2 | ✓ | T-03, T-04 | — | Done 2026-09-29 |
| T-06 | FieldSummaryBox | REQ-04 | REQ-08 | R1 | ✓ | T-05 | — | Done 2026-09-29 |
| T-07 | References (daftar pustaka) | REQ-05 | REQ-03 | R1 | ✓ | T-05 | — | Done 2026-09-29 |
| T-08 | Homepage hibrida | REQ-01 | REQ-03, REQ-06, REQ-08 | R2 | ✓ | T-00, T-05 | — | Menunggu review independen |
| T-09 | Triage: dataset `symptoms.json` + `/alat/diagnosa-gejala/` | REQ-06 | REQ-08 | R2 | ✓ | T-00, T-03, T-04 | — | Menunggu review independen |
| T-10 | Tentang Kami & profil penulis | REQ-01 | REQ-08 | R1 | ✓ | T-00, T-04, T-05 | OQ-4 (file foto, gelar lengkap, institusi) | Menunggu review independen |
| T-11 | Katalog & detail produk | REQ-01 | REQ-04, NG-1 | R1 | ✓ | T-00, T-02, T-04 | OQ-1, OQ-2, OQ-5 | Menunggu review independen |
| T-12 | Formulir kemitraan → WhatsApp | REQ-02 | REQ-08, NG-4 | R1 | ✓ | T-00, T-04 | OQ-1 | Menunggu review independen |
| T-13 | SEO dinamis: JSON-LD, breadcrumb, sitemap, robots, OG, pemeriksa pasca-build | REQ-07 | REQ-03 | R1 | — | T-05 | — | Done 2026-09-29 |
| T-14 | Pencarian statis Pagefind | REQ-06b | REQ-08 | R2 | ✓ | T-05 | — | Done 2026-09-29 |
| T-15 | Audit akhir: kontras render, a11y, budget, Lighthouse, brand | REQ-08 | REQ-01, REQ-07 | R1 | ✓ | T-04…T-14, T-17…T-23, T-25 | T-16/OQ-3 (butuh artikel terbit) | Pending (audit akhir pasca-merge) |
| T-16 | Sumber pustaka tingkat paper per artikel | REQ-05 | NG-3 | R1 | — | T-03 | OQ-3 (verifikasi pemilik) | Terblokir OQ-3 / Branch konten paralel |
| T-17 | Halaman Kebijakan Privasi | REQ-02 | NG-4, REQ-10 | R1 | ✓ | T-04 | OQ-7 | Menunggu review independen |
| T-18 | Konfigurasi Cloudflare Workers static assets + header keamanan | REQ-08 | ARCHITECTURE §5 | R2 | — | T-01, T-13 | OQ-6 (akun & domain) | Menunggu persetujuan deploy |
| T-19 | Kalender Tanam: data `crop-calendars.json` + `/alat/kalender-tanam/` | REQ-09 | REQ-08, NG-3, DEC-015 | R2 | ✓ | T-02, T-04, T-05 | OQ-11a (tinjauan data) | Menunggu review independen |
| T-20 | Cuaca Tani: dataset wilayah + klien BMKG + `/alat/cuaca-tani/` | REQ-10 | REQ-08, DEC-014 | R2 | ✓ | T-04 | OQ-11b (ambang indikator; halaman boleh rilis tanpa indikator) | Menunggu review independen |
| T-21 | Kalkulator Dosis `/alat/kalkulator-dosis/` | REQ-11 | REQ-08, OQ-2 | R1 | ✓ | T-04 | — | Menunggu review independen |
| T-22 | Konsultasi `/konsultasi/` + indeks `/alat/` | REQ-12 | G-6, REQ-08 | R1 | ✓ | T-04 | OQ-1 | Menunggu review independen |
| T-23 | CI GitHub Actions: build, check, test, kontras, SEO | REQ-08 | REQ-07 | R1 | — | T-01 | — | Menunggu review independen |
| T-25 | Konten terbit: Jawaban Singkat, judul tanpa klaim absolut, pengantar hub, tinjauan data | REQ-03 | REQ-05, REQ-09, DEC-015 | R1 | — | T-03 | Device lain (naskah), OQ-3, OQ-11, OQ-12 | Terblokir refs batch 1 / Branch konten paralel |
| T-26 | Gambar dummy WebP (10 slot) | REQ-01 | REQ-08, OQ-5 | R1 | — | T-01 | — | Done 2026-09-29 |
| T-27 | Beranda & polish UI mengikuti referensi teagasc.ie | REQ-01 | REQ-08, DESIGN §4.1 C9–C11 | R1 | — | T-08, T-26 | — | Done 2026-09-29 |
| T-28 | ADR-0001: dokumen & panduan D1/R2 (tanpa implementasi) | REQ-08 | DEC-004, DEC-006 | R1 | — | — | — | Done 2026-09-30 |
| T-29 | R2 untuk media foto asli | REQ-08 | ADR-0001 §2a, OQ-5 | R2 | — | T-28 | Foto asli dari pemilik + ADR-0001 diterima + persetujuan pembuatan resource | Diblokir (pemicu belum terjadi) |
| T-30 | D1 penyimpanan pengajuan kemitraan | REQ-02 | ADR-0001 §2b, OQ-13, DEC-006 | R3 | — | T-28 | Keputusan OQ-13 + ADR-0001 diterima + kebijakan privasi disetujui | Diblokir (menunggu OQ-13) |
| T-31 | Celah anatomi & kebutuhan UI/UX lanjutan | REQ-01 | DESIGN §4.2.3, §3.5.1, §6 | R1 | — | T-27 | — | Butir 1–3 selesai; pengelompokan hub per topik digantikan DEC-019 (satu daftar); butir 4–5 menunggu OQ-2/OQ-4/OQ-5 |
| T-32 | Identitas baru (DEC-016), foto Arif Prabowo, integritas Beranda, OG | REQ-01 | DEC-016, OQ-4, DESIGN §1.1, §4.2.3, §4.3.1, §4.4 | R2 | — | T-27 | — | Done 2026-09-30 (live; kemasan AI disetujui pemilik) |
| T-33 | Aturan tautan keluar & status tautan (hover/active) | REQ-08 | DESIGN §3.6.1, §4.4.12 | R1 | — | T-32 | — | Done 2026-09-30 (`11cdd25`) |
| T-34 | Konsolidasi worktree, presisi media–teks, kontras hero, DESIGN Beranda disetujui | REQ-01 | DESIGN §3.3.1, §4.2.3, §3.5.1 | R1 | — | T-32, T-33 | — | Done 2026-09-30 |
| T-35 | Halaman artikel, gambar artikel dummy, sidebar sticky | REQ-03 | DESIGN §3.3.2, §3.5.1, §4.3.8 | R2 | — | T-34 | — | Done 2026-09-30 |
| T-36 | Produk di artikel (baris ringkas), halaman tag sekerangka dengan hub | REQ-03 | DESIGN §4.3.8, §2.5 | R1 | — | T-35 | — | Done 2026-09-30 |
| T-37 | Pemisah judul " - " (bukan "|"), perbaikan judul ganda, rapikan chip tag | REQ-07 | DESIGN §4.4.2, §4.3.8 | R1 | — | T-36 | — | Done 2026-09-30 |
| T-38 | Rapikan semua halaman ke pola Beranda: kartu rapi (§3.3.3) untuk produk, alat, penulis, bacaan terkait, formulir; tanpa bayangan/label kapital/garis antar-section; footer dikunci versi pemilik | REQ-08 | DESIGN §3.3.3, §4.2.3, §4.3.8 | R2 | — | T-37 | — | Done 2026-09-30 (DEC-019; review independen APPROVE) |
| T-39 | Rapikan hub topik & komoditas ke pola kartu (§3.3.3): kartu alat, judul daftar, produk via `ArticleProducts`; bersihkan monospace & bayangan sisa; bersihkan worktree pekerja | REQ-08 | DESIGN §4.2.3, §3.3.3 | R1 | — | T-38 | — | Done 2026-09-30 |
| T-40 | Audit & perbaikan tampilan HP (360/390): area sentuh 44px, padding kartu HP, urutan judul sidebar hub | REQ-08 | DESIGN §3.3.4 | R1 | — | T-39 | — | Done 2026-09-30 |
| T-41 | Pagar aturan pemilik di build (`check-owner-rules`: nama terlarang, penempatan WhatsApp, bayangan/kapital di `<main>`) + unit test; AGENTS.md ringkasan keputusan pemilik; STATUS.md dibersihkan | DEC-019 | AGENTS.md, DESIGN §2.8, §3.3 | R1 | — | T-40 | — | Done 2026-09-30 |
| T-42 | Terbit massal 288 naskah (total 296), SEO judul/meta tanpa klaim berlebihan, deskripsi tag 120–160, integritas disesuaikan DEC-020 | REQ-07 | DEC-020, `docs/build-notes/t42-publish.md` | R3 | — | T-41 | — | Done 2026-09-30 |
| T-43 | Tentang Kami diringkas: distributor resmi penjualan online, 4 produk, peluang agen/distributor + WhatsApp tim penjualan, satu baris pengelola | DEC-021 | DESIGN §4.2.3, §2.8 | R2 | — | T-42 | — | Done 2026-09-30 |
| T-44 | SEO semua halaman: `<title>` 55–70 & description 120–155 (1.825 halaman), `fitText()`, `check-seo` jadi error, 43 deskripsi artikel diringkas | REQ-07 | DEC-022, DESIGN §4.4.2 | R2 | — | T-43 | — | Done 2026-09-30 |
| T-45 | Cuaca Tani: ringkasan lokasi satu baris, kartu per hari + ringkasan suhu/hujan, tabel pas di HP; meta author & publisher semua halaman, `article:publisher`, logo raster | REQ-10, REQ-07 | DESIGN §4.2.3, §4.4.2 | R2 | — | T-44 | — | Done 2026-09-30 |
| T-46 | Hapus "Alur kemitraan distributor" di Kemitraan; aturan intake artikel baru (`docs/content/ARTICLE-INTAKE.md`) + `scripts/check-articles.mjs` di awal build + tes | DEC-020, DEC-022 | AGENTS.md | R1 | — | T-45 | — | Done 2026-09-30 |
| T-47 | Profil penulis gaya Medium (feed + filter topik + kartu penulis sticky, agy) dan halaman 404 pemulihan (agy, dirapikan Claude: tanpa kicker/ikon/lencana/garis) | DEC-016, DEC-019 | DESIGN §4.2.3 | R2 | — | T-46 | — | Done 2026-09-30 |
| T-24 | Rilis produksi & observability | REQ-08 | RELEASE.md, OBSERVABILITY.md | R2 | — | T-15, T-18 | OQ-6 + **persetujuan deploy Paduka Ongki** | Menunggu persetujuan deploy |

Urutan kerja yang disarankan (lihat Milestones): T-01 → T-02 → T-23 → T-04 → T-03 → T-05 → (T-06, T-07, T-13, T-14) → T-21 → T-22 → T-09 → T-19 → T-20 → T-26 → T-08 → T-10 → T-17 → T-11 → T-12 → T-16 & T-25 (jalur konten, paralel) → T-18 → T-15 → T-24.

---

## Detailed Task Specifications

### T-00 — Reference discovery & composition contract
- **Primary:** REQ-01 · **Constraints:** REQ-03, REQ-08 · **Risk:** R1
- **Owner skill:** `design-taste` (references/design-discovery.md)
- **Allowed paths:** `DESIGN.md` (§0, §4.0, dan item C §4.1 yang terbantah bukti)
- **Scope:** Inspeksi 4–6 referensi relevan: 2–3 media/portal pertanian atau penyuluhan berbahasa Indonesia (pola bahasa & perilaku lokal) dan 2–3 publikasi editorial/sains global (kanvas baca, referensi, indeks). Untuk tiap referensi catat URL, tanggal akses, viewport (360/1440), screenshot yang diinspeksi, observasi, apa yang ditransfer dan apa yang tidak.
- **Done when:** `DESIGN.md §4.0` berisi bukti referensi; composition contract §4.1 (C1–C8) dikonfirmasi atau direvisi berdasar bukti; `§0` Referensi berubah dari PENDING ke status berbukti; referensi yang gagal dibuka dicatat sebagai gagal. Tanpa menyalin merek atau aset referensi.

### T-01 — Fondasi Astro 7 + Tailwind 4 + token + font
- **Primary:** REQ-08 · **Constraints:** REQ-03 · **Risk:** R1
- **Owner skill:** `astro-development`, `native-first`, `design-taste` (token)
- **Allowed paths:** `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`, `public/fonts/**`, `public/favicon.svg`, `src/dev/spesimen.astro`, `scripts/check-contrast.mjs`, `.gitignore`
- **Scope:** `npm create astro@latest` (template minimal, TypeScript strict via `astro/tsconfigs/strict`), `npx astro add tailwind sitemap`, `site: 'https://agritani.com'`, token DESIGN §3.1–3.3 di `@theme`, print stylesheet dasar. `scripts/check-contrast.mjs` menghitung rasio WCAG untuk pasangan token yang dipakai dan gagal jika teks < 7 atau indikator non-teks < 3; didaftarkan sebagai `npm run check:contrast`.
- **Scope tambahan:** font Plus Jakarta Sans 400/400 italic/600/800 + Newsreader 600/600 italic (DESIGN §3.2); favicon dari `docs/brand/logo/favicon.svg`; `build.inlineStylesheets: 'never'`; integrasi dev-only yang meng-inject `/spesimen/` (ARCHITECTURE §2); skrip `npm test` dengan runner bawaan Node (`node --test`, type stripping) bila versi Node terpasang mendukung, selain itu satu devDependency runner yang dicatat di DECISIONS.
- **Done when:** `npm run build`, `npx astro check`, `npm test`, dan `npm run check:contrast` lulus; tidak ada `tailwind.config.*`; `/spesimen/` terbuka di `astro dev` dan **tidak ada** di `dist/`; spesimen dirender di 390px dan 1440px dan dicatat; total font ≤ 130 KB.

### T-02 — Content config + cek integritas
- **Primary:** REQ-03 · **Constraints:** REQ-05, REQ-06 · **Risk:** R1
- **Owner skill:** `astro-development`, `testing-engineering`
- **Allowed paths:** `src/content.config.ts`, `src/data/{commodities,products,symptoms,crop-calendars}.json`, `src/data/spray-thresholds.json`, `src/lib/content-integrity.ts`, `src/lib/content-integrity.test.ts`
- **Scope:** Skema ARCHITECTURE §3 (6 koleksi). `commodities.json` diisi daftar komoditas awal (padi, jagung, cabai, tomat, bawang-merah, kelapa-sawit, sayuran-daun, dan komoditas produk: kedelai, semangka, melon, kopi, kakao, cengkeh, durian, mangga, alpukat, jeruk); `products.json`, `symptoms.json`, `crop-calendars.json` = `[]`; `spray-thresholds.json` = `null`. `content-integrity.ts` mengimplementasikan ARCHITECTURE §3.1 sebagai fungsi murni atas data koleksi; T-05 memanggilnya dari `getStaticPaths`.
- **Done when:** `npx astro check` dan `npm run build` lulus dengan koleksi kosong; tes `content-integrity` (fixture: artikel terbit tanpa referensi, tanpa `answer`, `metaTitle` atau `description` ganda, gejala menunjuk slug fiktif) masing-masing menghasilkan galat yang menyebut entri-nya.

### T-03 — Normalisasi frontmatter 150 artikel (in place)
- **Primary:** REQ-03 · **Constraints:** REQ-04, REQ-05 · **Risk:** R1
- **Owner skill:** `astro-development`, `content`
- **Allowed paths:** `docs/content/articles/*.md`
- **Scope:** **Koordinasi:** naskah juga dikerjakan di device lain; T-03 dimulai setelah `git pull` terbaru, di-commit terpisah, dan hanya mengubah frontmatter + H1 duplikat. Terapkan pemetaan ARCHITECTURE §3.0: `meta_title`→`metaTitle`, `meta_description`→`description`, `tags` tetap, `published_date`→`pubDate`, `category`→`topic` (tabel 6 topik; pengecualian dicatat), `author: "Arif Prabowo"`, hapus `reading_time`/`source`; tambah `commodities` (slug dari `commodities.json`, dari isi artikel; tambahkan komoditas baru ke `commodities.json` bila perlu); `fieldTakeaways` dengan `kind` (`masalah`/`panduan`) dari blok "Key Takeaways" hanya bila isinya memadai (dosis tidak ditebak). `answer` tidak ditulis di T-03. Semua artikel `draft: true`. Dapat dikerjakan dengan skrip sekali pakai yang tidak di-commit; hasilnya diperiksa manual pada sampel.
- **Done when:** `npx astro check` dan `npm run build` lulus dengan 150 entri terbaca (semua draft); tidak ada `metaTitle`/`description` ganda; setiap topik terisi; build pratinjau merender semua artikel; sebaran per topik & komoditas serta daftar artikel yang butuh `answer`/referensi dicatat di BUILD-LOG.

### T-04 — BaseLayout, Navbar, Footer, 404 (UI)
- **Primary:** REQ-01 · **Constraints:** REQ-07, REQ-08 · **Risk:** R1
- **Owner skill:** `astro-development`, `design-taste`, `impeccable`, `ui-validation`, `seo-website-builder` (head)
- **Allowed paths:** `src/layouts/BaseLayout.astro`, `src/components/{Navbar,Footer,Breadcrumb,ConsultPrompt,SeoHead}.astro`, `src/lib/seo.ts`, `src/lib/seo.test.ts`, `src/lib/whatsapp.ts`, `src/lib/whatsapp.test.ts`, `src/pages/404.astro`
- **Scope:** Kerangka global DESIGN §4.2.1: `<html lang="id">`, skip link, `SeoHead` + `buildSeo()` (DESIGN §4.4.1–4.4.2: title, description, canonical, robots, OG, Twitter, ikon) dipakai lewat props bertipe `SeoInput`, navigasi §2.1 dengan `aria-current`, menu `<dialog>` layar penuh (tutup via tombol/Esc), footer identitas legal (placeholder bertanda `TODO(OQ-7)`), logo reverse inline SVG, `Breadcrumb` + `BreadcrumbList`. Satu fungsi `waLink({ source, fields })` (DESIGN §2.7, G-6) + `ConsultPrompt` (atribut `data-cta="whatsapp"`, gaya sekunder) dipakai **semua** ajakan WhatsApp berikutnya, sesuai aturan anti-spam DESIGN §2.8; nomor dari OQ-1 (placeholder bertanda sampai dikonfirmasi).
- **Done when:** Gate UI lulus; menu mobile terbuka/tertutup via keyboard dan sentuh; target sentuh ≥ 44px; tidak ada garis pemisah antar-section; tes `whatsapp` (baris pertama kode sumber, encoding karakter Indonesia & baris baru) dan tes `seo` (panjang judul/deskripsi, sufiks, canonical tanpa query + trailing slash, fallback gambar OG, noindex) lulus.

### T-05 — ArticleLayout, TOC, indeks jurnal (UI)
- **Primary:** REQ-03 · **Constraints:** REQ-08 · **Risk:** R2
- **Owner skill:** `astro-development`, `design-taste`, `impeccable`, `ui-validation`
- **Allowed paths:** `src/layouts/ArticleLayout.astro`, `src/components/{ArticleToc,ArticleRow,AuthorByline,AuthorBio,ShortAnswer,SymptomCompare}.astro`, `src/pages/jurnal/index.astro`, `src/pages/jurnal/halaman/[n].astro`, `src/pages/jurnal/[slug].astro`, `src/pages/jurnal/topik/[topik].astro`, `src/pages/jurnal/komoditas/[komoditas].astro`, `src/content/pages/{topik,komoditas}-*.md`, `src/lib/reading-time.ts`
- **Scope:** Anatomi DESIGN §4.3 (17 blok, state §4.3.3), indeks jurnal berpaginasi statis (30/halaman), hub topik (6) dan hub komoditas (≥ 3 artikel terbit) §4.2.3. Waktu baca dihitung dari jumlah kata.
- **Done when:** Gate UI lulus di mode pratinjau draft (ARCHITECTURE §3.2); `assertContentIntegrity()` dipanggil dari `getStaticPaths` `jurnal/[slug]`; measure isi terukur 65–72ch di 1440px; TOC sticky di ≥1024px dan `<details>` di 360px; tanpa scroll horizontal halaman di 320px; build produksi tidak memuat draft; tautan ke hub hanya dibuat untuk hub yang punya artikel terbit.

### T-06 — FieldSummaryBox (UI)
- **Primary:** REQ-04 · **Constraints:** REQ-08 · **Risk:** R1
- **Owner skill:** `astro-development`, `impeccable`, `ui-validation`
- **Allowed paths:** `src/components/FieldSummaryBox.astro`, `src/layouts/ArticleLayout.astro`
- **Done when:** Gate UI lulus; varian `masalah` dan `panduan` sama-sama benar; hanya field terisi yang tampil; artikel tanpa `fieldTakeaways` tidak merender kotak kosong; kontras isi ≥ 7:1 di `tint`.

### T-07 — References (UI)
- **Primary:** REQ-05 · **Constraints:** REQ-03 · **Risk:** R1
- **Owner skill:** `astro-development`, `impeccable`, `ui-validation`
- **Allowed paths:** `src/components/References.astro`, `src/layouts/ArticleLayout.astro`
- **Done when:** Gate UI lulus; daftar bernomor dalam `<details>` native; tautan DOI (`https://doi.org/<doi>`) hanya muncul bila `doi` ada; tautan eksternal `rel="noopener"`.

### T-08 — Homepage hibrida (UI)
- **Primary:** REQ-01 · **Constraints:** REQ-03, REQ-06, REQ-08 · **Risk:** R2
- **Owner skill:** `design-taste`, `astro-development`, `impeccable`, `ui-validation`
- **Allowed paths:** `src/pages/index.astro`, `src/components/CommodityPicker.astro`, komponen khusus homepage di `src/components/home/`
- **Scope:** Anatomi DESIGN §4.2.3 Beranda + C1–C8. Tombol komoditas diturunkan dari `commodities` yang punya data gejala tertinjau (bukan daftar tetap); jumlah artikel per hub komoditas dihitung dari koleksi.
- **Done when:** Gate UI lulus; checklist DESIGN §8 diperiksa pada render 360px dan 1440px dan hasilnya dicatat; tidak ada statistik/afiliasi/testimoni tanpa data resmi.

### T-09 — Triage engine (UI)
- **Primary:** REQ-06 · **Constraints:** REQ-08 · **Risk:** R2
- **Owner skill:** `astro-development`, `testing-engineering`, `impeccable`, `ui-validation`
- **Allowed paths:** `src/data/symptoms.json`, `src/pages/alat/diagnosa-gejala.astro`, `src/components/TriageFilter.astro`
- **Scope:** Dataset disemai dari (a) gejala yang dibahas di artikel terbit dan (b) `FIELD_PLAYBOOK_DICTIONARY` agrimarket (`problemName`, `visualSymptoms`, `rootCause` saja; tanpa `productPairing`, `prescription`, merek) — semua entri ditinjau Arif Prabowo (OQ-11c). Dataset disusun hanya dari gejala yang dibahas di artikel terbit (setiap entri menunjuk artikelnya); `distinguishingSign` wajib untuk diagnosis yang mudah tertukar; `causeType` wajib (penyakit/hama/hara/lingkungan). Perilaku & state DESIGN §2.2.
- **Done when:** Gate UI lulus; alur komoditas → bagian → gejala → hasil ≤ 4 interaksi; URL mencerminkan pilihan dan Back memulihkan state; empty state dan tampilan no-JS terverifikasi di browser; build gagal bila entri menunjuk artikel yang tidak ada (dicek T-02).

### T-10 — Tentang Kami (UI)
- **Primary:** REQ-01 · **Constraints:** REQ-08 · **Risk:** R1
- **Owner skill:** `astro-development`, `copywriting`, `impeccable`, `ui-validation`
- **Allowed paths:** `src/pages/tentang-kami.astro`, `src/pages/penulis/arif-prabowo.astro`, `src/content/pages/{tentang-kami,penulis-arif-prabowo}.md`
- **Scope:** Dari `docs/content/company-profile.md`. Klaim legalitas/sertifikasi hanya bila ada bukti resmi. Bagian moderator menaut ke `/penulis/arif-prabowo/` (anatomi DESIGN §4.2.3): Arif Prabowo, Konsultan Pertanian Senior · Pengelola Jurnal Tani (DEC-016); foto dari file yang dikirim pemilik (`astro:assets`); institusi & gelar lengkap hanya setelah OQ-4 terjawab.
- **Done when:** Gate UI lulus; tidak ada klaim yang tidak didukung data dari pemilik.

### T-11 — Katalog & detail produk (UI)
- **Primary:** REQ-01 · **Constraints:** REQ-04, NG-1 · **Risk:** R1
- **Owner skill:** `astro-development`, `copywriting`, `impeccable`, `ui-validation`
- **Allowed paths:** `src/data/products.json`, `src/pages/produk/index.astro`, `src/pages/produk/[slug].astro`, `src/components/ProductRow.astro`, `src/assets/products/**`
- **Done when:** Gate UI lulus; 4 produk (Aussie, BENSU, Kojien, Saratoga) dirender dari `products.json` berisi data resmi (OQ-2); tidak ada klaim berstatus "Ditahan" di DESIGN §2.5 yang tampil; nomor izin edar tampil bila ada; aksi "Konsultasi Dosis" membuka wa.me ke nomor resmi (OQ-1); tanpa tombol marketplace.

### T-12 — Formulir kemitraan → WhatsApp (UI)
- **Primary:** REQ-02 · **Constraints:** REQ-08, NG-4 · **Risk:** R1
- **Owner skill:** `astro-development`, `application-security` (input), `impeccable`, `ui-validation`
- **Allowed paths:** `src/pages/kemitraan-distributor.astro`, `src/components/PartnerForm.astro`
- **Scope:** DESIGN §2.3.
- **Done when:** Gate UI lulus; di browser: submit kosong menandai field yang salah + pesan perbaikan dan nilai lain tetap; submit valid membuka URL `wa.me` dengan pesan ter-encode yang memuat semua field (URL diperiksa, tanpa mengirim pesan nyata); keyboard-only dapat menyelesaikan form.

### T-13 — SEO dinamis (DESIGN §4.4)
- **Primary:** REQ-07 · **Constraints:** REQ-03 · **Risk:** R1
- **Owner skill:** `seo-website-builder`
- **Allowed paths:** `src/lib/seo.ts` (JSON-LD `@graph`), `src/components/SeoHead.astro`, `src/pages/**/*.astro` (props `SeoInput` saja), `scripts/check-seo.mjs`, `public/robots.txt`, `public/og/**`, `public/apple-touch-icon.png`, `astro.config.mjs` (sitemap `filter`/`serialize`), `package.json` (skrip build)
- **Scope:** Lengkapi `buildSeo()` dari T-04 dengan JSON-LD `@graph` per tipe (§4.4.3, §4.4.5), breadcrumb §4.4.4, sitemap & robots §4.4.8, gambar OG §4.4.6, dan pemeriksa pasca-build §4.4.1. Indeksasi & verifikasi mesin pencari (§4.4.9) **tidak** termasuk — tindakan eksternal setelah rilis.
- **Done when:** Semua butir DESIGN §4.4: `npm run build` menjalankan `check-seo.mjs` dan lulus (satu `<title>`/`<h1>`/canonical per halaman, judul & deskripsi unik dan dalam batas, JSON-LD ter-parse); `sitemap-index.xml` hanya berisi halaman indexable dengan `lastmod` akurat; `robots.txt` sesuai §4.4.8; breadcrumb terlihat = `BreadcrumbList`; satu contoh per tipe halaman lolos Schema Markup Validator dan Rich Results Test (hasil dicatat); gambar OG statis §4.4.6 ada dan < 150 KB; pratinjau tautan WhatsApp untuk 1 artikel & Beranda menampilkan judul, deskripsi, dan gambar yang benar.

### T-14 — Pencarian Pagefind (UI)
- **Primary:** REQ-06b · **Constraints:** REQ-08 · **Risk:** R2
- **Owner skill:** `astro-development`, `web-perf`, `ui-validation`
- **Allowed paths:** `package.json`, `src/components/SearchBox.astro`, `src/pages/cari.astro`, `src/layouts/BaseLayout.astro`, `src/layouts/ArticleLayout.astro`
- **Scope:** `pagefind --site dist` dijalankan di skrip `postbuild`; indeks dibatasi ke isi artikel (`data-pagefind-body`); script Pagefind dimuat saat kotak cari difokus.
- **Done when:** Gate UI lulus; di build pratinjau (draft disertakan) kueri "patek cabai" dan "ganoderma" mengembalikan artikel yang benar; halaman tanpa interaksi cari tidak memuat aset Pagefind; berfungsi di bawah CSP ARCHITECTURE §5.

### T-15 — Audit akhir
- **Primary:** REQ-08 · **Constraints:** REQ-01, REQ-07 · **Risk:** R1
- **Owner skills:** `ui-validation`, `web-perf`, `impeccable`
- **Allowed paths:** perbaikan kecil di `src/**`; catatan di `BUILD-LOG.md`
- **Done when:** Pada **build produksi** dengan minimal satu artikel terbit per topik yang dirilis, untuk Beranda, 1 artikel, 1 hub, `/alat/` beserta 4 alat, `/konsultasi/`, `/produk/`, 1 detail produk, `/kemitraan-distributor/`: axe tanpa pelanggaran serius; kontras render ≥ 7:1 teks dan ≥ 3:1 indikator; Lighthouse mobile ≥ 95 (Perf/A11y/SEO); transfer awal ≤ 350 KB; CLS ≤ 0.05; tidak ada galat CSP di konsol; `grep 'wa.me'` hanya di `src/lib/whatsapp.ts`; setiap halaman memuat ≤ 1 ajakan WhatsApp sesuai tabel DESIGN §2.8 (dihitung dari HTML build: elemen `data-cta="whatsapp"` per halaman); `grep` merek/marketplace pihak ketiga di `src/` dan artikel terbit = 0 di luar `references` (DEC-005). Semua hasil + perintah dicatat.

### T-16 — Sumber pustaka tingkat paper
- **Primary:** REQ-05 · **Constraints:** NG-3 · **Risk:** R1
- **Owner skill:** `content` (riset) — setiap entri diverifikasi dari sumber primer (halaman penerbit / resolusi DOI), bukan dari ingatan model
- **Allowed paths:** `docs/content/articles/*.md` (field `references`, `draft`), `docs/research/scientific-validation.md`
- **Done when:** Setiap artikel yang akan terbit (150 naskah; per 2026-09-29 hanya 1 yang punya bagian referensi) punya ≥ 1 referensi yang DOI/URL-nya terbukti mengarah ke karya yang dikutip (dicek dan dicatat); artikel yang klaimnya tidak dapat didukung tetap `draft` atau direvisi; `scientific-validation.md` tidak lagi mengklaim "Verified" tanpa rujukan tingkat paper. Dikerjakan bertahap per topik, selaras dengan T-25.

### T-17 — Kebijakan Privasi (UI)
- **Primary:** REQ-02 · **Constraints:** NG-4 · **Risk:** R1
- **Owner skill:** `astro-development`, `volumx-writer`, `ui-validation`
- **Allowed paths:** `src/pages/kebijakan-privasi.astro`, `src/content/pages/kebijakan-privasi.md`
- **Done when:** Gate UI lulus; halaman menjelaskan bahwa situs tidak memakai cookie/pelacak, data formulir hanya dikirim lewat WhatsApp oleh pengguna, Cuaca Tani memanggil BMKG dari browser pengguna, dan pilihan alat hanya tersimpan di perangkat; identitas legal dari OQ-7; teks akhir disetujui pemilik.

### T-18 — Konfigurasi Cloudflare Workers static assets
- **Primary:** REQ-08 · **Constraints:** ARCHITECTURE §5 · **Risk:** R2
- **Owner skills:** `cloudflare`, `wrangler`
- **Allowed paths:** `wrangler.jsonc`, `public/_headers`, `public/_redirects`, `package.json` (skrip `deploy`)
- **Scope:** `wrangler.jsonc` (`name`, `compatibility_date`, `assets.directory: "./dist"`, tanpa `main`); `_headers` persis ARCHITECTURE §5 (CSP dengan `'wasm-unsafe-eval'`, `worker-src 'self' blob:`, `connect-src` BMKG); cache panjang `immutable` untuk `/_astro/*` dan font, cache pendek untuk HTML; `_redirects` hanya bila perlu. Wrangler sebagai devDependency; versi & sintaks dicek dari dokumentasi resmi saat eksekusi.
- **Done when:** `npm run build && npx wrangler deploy --dry-run` lulus; `grep` HTML di `dist/` tidak menemukan `<script>` inline yang dieksekusi maupun atribut `on*=`/`style=`; tanpa galat CSP di konsol pada semua tipe halaman; `npx wrangler dev` lokal menunjukkan header yang benar pada HTML, aset `/_astro/*`, dan 404 (dicek dengan `curl -I`). **Deploy produksi, preview publik, dan pengaturan DNS tidak termasuk task ini** — masing-masing butuh persetujuan eksplisit Paduka Ongki.

### T-19 — Kalender Tanam (UI)
- **Primary:** REQ-09 · **Constraints:** REQ-08, NG-3, DEC-015 · **Risk:** R2
- **Owner skill:** `astro-development`, `testing-engineering`, `impeccable`, `ui-validation`
- **Allowed paths:** `src/data/crop-calendars.json`, `src/content.config.ts` (koleksi `cropCalendars`), `src/lib/crop-calendar.ts`, `src/lib/crop-calendar.test.ts`, `src/lib/ics.ts`, `src/pages/alat/kalender-tanam.astro`, `src/components/CropTimeline.astro`
- **Scope:** DESIGN §2.6.1 + anatomi §4.2.3; ARCHITECTURE §5b. Semai 6 komoditas (padi, jagung, cabai, tomat, bawang merah semusim; kelapa sawit tahunan) dari dokumen agrimarket dengan aturan pembersihan DEC-015; isi `sources` & `seededFrom`; `reviewedBy` dibiarkan kosong sampai Arif Prabowo menyetujui.
- **Done when:** Gate UI lulus; tes tabel kasus `crop-calendar` (tanggal tanam lampau/rencana, kabisat, akhir tahun) lulus; `.ics` hasil unduhan terbuka di Google Calendar/iOS tanpa galat; komoditas tanpa `reviewedBy` tidak tampil (diverifikasi); `grep` merek/harga/dosis pestisida pada `crop-calendars.json` = 0; tabel musim MT1–MT3 terbaca tanpa JS.

### T-20 — Cuaca Tani (UI)
- **Primary:** REQ-10 · **Constraints:** REQ-08, DEC-014 · **Risk:** R2
- **Owner skill:** `astro-development`, `testing-engineering`, `web-perf`, `impeccable`, `ui-validation`
- **Allowed paths:** `public/wilayah/**`, `scripts/build-wilayah.mjs`, `src/lib/bmkg.ts`, `src/lib/spray-window.ts`, `src/lib/spray-window.test.ts`, `src/data/spray-thresholds.json`, `src/pages/alat/cuaca-tani.astro`, `src/components/{RegionPicker,ForecastTable}.astro`
- **Scope:** Pilih & dokumentasikan sumber kode wilayah (Kemendagri terbaru atau turunan terbuka berlisensi jelas) di `public/wilayah/SOURCE.md`; bangun file JSON bertingkat; klien BMKG per ARCHITECTURE §5b; indikator aplikasi dari `spray-thresholds.json` (kosong/`reviewedBy` kosong → indikator disembunyikan).
- **Done when:** Gate UI lulus; di browser, memilih satu desa di 3 provinsi berbeda menampilkan prakiraan BMKG dengan atribusi dan waktu analisis; state gagal diuji dengan jaringan diblokir; tes tabel kasus `spray-window` lulus; tiap file wilayah < 40 KB gzip; lokasi terakhir diingat dan halaman tetap berfungsi dengan `localStorage` diblokir.

### T-21 — Kalkulator Dosis (UI)
- **Primary:** REQ-11 · **Constraints:** REQ-08, OQ-2 · **Risk:** R1
- **Owner skill:** `astro-development`, `testing-engineering`, `impeccable`, `ui-validation`
- **Allowed paths:** `src/lib/dose.ts`, `src/lib/dose.test.ts`, `src/components/DoseCalculator.astro`, `src/pages/alat/kalkulator-dosis.astro`
- **Done when:** Gate UI lulus; tes tabel kasus `dose` (ml/L, g/L, per tangki, m² vs ha, pembulatan tangki ke atas) lulus; input tidak valid menampilkan pesan per field; rumus "Cara hitung" sama dengan hasil; tanpa prefill dosis produk.

### T-22 — Konsultasi & indeks Alat Tani (UI)
- **Primary:** REQ-12 · **Constraints:** G-6, REQ-08 · **Risk:** R1
- **Owner skill:** `astro-development`, `copywriting`, `impeccable`, `ui-validation`
- **Allowed paths:** `src/pages/konsultasi.astro`, `src/pages/alat/index.astro`
- **Scope:** DESIGN §2.7 & §2.6.4; form penyusun pesan memakai `waLink` dari T-04.
- **Done when:** Gate UI lulus; form menghasilkan pesan berformat DESIGN §2.7 dengan kode `[Web·Konsultasi]`; indeks `/alat/` menautkan keempat alat; nomor dari OQ-1.

### T-23 — CI GitHub Actions
- **Primary:** REQ-08 · **Constraints:** REQ-07 · **Risk:** R1
- **Owner skill:** `github-actions`
- **Allowed paths:** `.github/workflows/ci.yml`
- **Scope:** Workflow pada `pull_request` dan `push` ke `main`: setup Node versi yang dipakai T-01 dengan cache npm, `npm ci`, `npx astro check`, `npm test`, `npm run check:contrast`, `npm run build` (termasuk `check-seo.mjs` dan Pagefind). Permission minimum (`contents: read`), action di-pin ke versi mayor terverifikasi, tanpa secret. Tidak ada deploy dari CI (deploy = T-24 dengan persetujuan).
- **Done when:** Workflow hijau di satu PR uji; workflow gagal bila satu pemeriksaan sengaja dirusak (dibuktikan lalu dikembalikan).

### T-25 — Konten siap terbit (jalur konten)
- **Primary:** REQ-03 · **Constraints:** REQ-05, REQ-09, DEC-015 · **Risk:** R1
- **Owner skill:** `content`, `volumx-writer`, `copywriting` (panjang judul/deskripsi)
- **Allowed paths:** `docs/content/articles/*.md` (field `answer`, `title`, `metaTitle`, `description`, `draft` saja), `src/content/pages/{topik,komoditas}-*.md`, `src/data/crop-calendars.json` & `src/data/symptoms.json` & `src/data/spray-thresholds.json` (hanya field `reviewedBy`/`reviewedAt` setelah persetujuan tertulis Arif Prabowo)
- **Koordinasi:** naskah artikel dikerjakan di device lain; task ini hanya berjalan setelah naskah terbaru di-pull, dan tidak menyentuh isi artikel di luar field di atas.
- **Scope:** Jawaban Singkat 40–60 kata per artikel (ditulis/disetujui penulis); revisi 6 judul berklaim absolut ("100%", "Ampuh", "Tuntas" — artikel-10x penyerbukan vanili/durian, pengendalian rumput teki, usir siput, parit isolasi Ganoderma, sambung pucuk, dormansi benih padi) sesuai DESIGN §1.3; pengantar hub (OQ-12); pencatatan persetujuan data kalender/gejala/ambang (OQ-11). Artikel diubah ke `draft: false` hanya bila integritas (ARCHITECTURE §3.1) lulus. Skala: 150 naskah — terbitkan bertahap per topik, dimulai dari `proteksi-tanaman` (paling dekat dengan Diagnosa Gejala).
- **Done when:** `npm run build` produksi lulus dengan artikel terbit; daftar artikel terbit vs draft dan catatan persetujuan Arif Prabowo (tanggal, cakupan) tercatat di BUILD-LOG.

### T-26 — Gambar dummy WebP (10 slot)
- **Primary:** REQ-01 · **Constraints:** REQ-08, OQ-5 · **Risk:** R1
- **Owner skill:** `content`, `web-perf`, `ui-validation`
- **Allowed paths:** `src/assets/images/dummy/**`, `scripts/to-webp.mjs`, `package.json`, `package-lock.json`
- **Scope:** Dari `docs/notes/agritani-T26-gambar-dummy.md` dan DESIGN §3.5.1. Unduh 10 foto lanskap/tanaman tropis bebas royalti (Pexels/Unsplash/Pixabay). Kompres ke WebP dengan `sharp` via `scripts/to-webp.mjs`. Simpan ke `src/assets/images/dummy/` dengan `CREDITS.md` lengkap. File sumber ≤ 250 KB per file.
- **Done when:** 10 file WebP ada di `src/assets/images/dummy/`; tidak ada format lain (.jpg/.png); `CREDITS.md` mencatat URL, fotografer, sumber, lisensi; semua berstatus "DUMMY — ganti (OQ-5)".

### T-27 — Beranda & polish UI mengikuti referensi teagasc.ie
- **Primary:** REQ-01 · **Constraints:** REQ-08, DESIGN §4.0, §3.1.1, §4.1 C9–C11, §4.2.3 · **Risk:** R1
- **Owner skill:** `design-taste`, `impeccable` (critique + polish), `ui-validation`
- **Allowed paths:** `src/**`, `DESIGN.md`, `TASKS.md`, `STATUS.md`
- **Scope:** Rekomposisi Beranda (baris editorial 3 kolom + indeks topik, pilar bergambar berselang, produk, moderator, kemitraan bergambar); warna topik dan sidebar hub Jurnal; hapus kicker, kotak, dan chip dari detail produk; gambar dummy tambahan `alat-tani.webp` (Pixabay, tercatat di CREDITS).
- **Done when:** build produksi lulus seluruh pemeriksaan (termasuk `check-links`); Beranda dan halaman yang diubah dirender dan dilihat di 390 dan 1440 px; bobot Beranda ≤ 350 KB, hero ≤ 90 KB di 390 px.

### T-29 — R2 untuk media foto asli
- **Primary:** REQ-08 · **Constraints:** ADR-0001 §2a, OQ-5 · **Risk:** R2
- **Owner skill:** `cloudflare`, `wrangler`, `astro-development`, `web-perf`, `application-security` (CSP)
- **Allowed paths:** `wrangler.jsonc`, `astro.config.*`, `public/_headers`, `scripts/check-csp.mjs`, `src/content/**`, `src/data/**`, `src/assets/**`, `ARCHITECTURE.md`, `DECISIONS.md`
- **Scope:** Ikuti runbook ADR-0001 §4 (R2). Verifikasi ulang prosedur bucket publik + domain kustom di dokumentasi R2 saat pengerjaan.
- **Done when:** gambar dari R2 tetap keluar sebagai WebP responsif hasil build; CSP hanya menambah host media di `img-src`; `npm run build` lulus; bobot halaman tetap dalam budget DESIGN §6.1.

### T-30 — D1 penyimpanan pengajuan kemitraan
- **Primary:** REQ-02 · **Constraints:** ADR-0001 §2b, OQ-13, DEC-006 · **Risk:** R3 (data pribadi, runtime baru)
- **Owner skill:** `cloudflare`, `wrangler`, `application-security`, `testing-engineering`, `astro-development`
- **Allowed paths:** `wrangler.jsonc`, `worker/**` (atau entri Worker yang dipilih), `migrations/**`, `src/components/PartnerForm.astro`, `src/pages/kemitraan-distributor.astro`, `src/pages/kebijakan-privasi.astro`, `public/_headers`, `scripts/check-csp.mjs`, `DESIGN.md` §2.3, `ARCHITECTURE.md`, `DECISIONS.md`
- **Scope:** Ikuti runbook ADR-0001 §4 (D1): Worker hanya `/api/*`, migrasi tabel pengajuan, validasi server, Turnstile, insert terparameter, hand-off WhatsApp tetap, kebijakan privasi (tujuan, retensi, penghapusan).
- **Done when:** tes `node --test` untuk validasi dan handler; `wrangler dev` + bukti browser formulir (sukses, gagal validasi, gagal Turnstile); tidak ada secret di repo; review independen (R3) PASS; deploy hanya dengan persetujuan.

### T-31 — Celah anatomi & kebutuhan UI/UX lanjutan
- **Status:** Butir 1–3 selesai 2026-09-30; butir 4–5 menunggu OQ-2/OQ-4/OQ-5
- **Primary:** REQ-01 · **Constraints:** DESIGN §4.2.3, §3.5.1, §6 · **Risk:** R1
- **Owner skill:** `design-taste`, `impeccable`, `ui-validation`, `astro-development`
- **Allowed paths:** `src/**`, `DESIGN.md`, `TASKS.md`
- **Scope (hasil audit DESIGN vs build 2026-09-30):**
  1. Konsultasi: section "Sambil menunggu jawaban" (DESIGN §4.2.3 Konsultasi butir 4); tambahkan "luas lahan" ke daftar yang perlu disiapkan (DESIGN §2.7).
  2. Hub komoditas: artikel dikelompokkan per topik bila ≥ 2 topik; maksimal 2 baris produk yang komoditasnya cocok.
  3. Avatar inisial "AP" persegi radius 2px di `AuthorByline` dan `AuthorBio` (saat ini lingkaran; DESIGN §3.5.1).
  4. Setelah OQ-2: bagian Legalitas (nomor izin edar) di detail produk dan kolom izin di tabel `/produk/`.
  5. Setelah OQ-5: ganti 11 gambar dummy dengan foto asli; foto kemasan di detail produk; foto Arif Prabowo sudah diterima, dikerjakan di T-32.
- **Done when:** butir 1–3 terbangun dan dirender di 390 & 1440 px; build produksi lulus seluruh pemeriksaan; butir 4–5 tetap terbuka sampai data pemilik ada.

### T-32 — Identitas baru (DEC-016), foto Arif Prabowo, integritas Beranda, gambar OG
- **Status:** Selesai A–E 2026-09-30, siap review independen (R2)
- **Primary:** REQ-01 · **Constraints:** DEC-016, OQ-4, DESIGN §1.1, §3.5.1, §4.2.3, §4.3.1 (blok 4 & 16), §4.4 · **Risk:** R2
- **Owner skill:** `astro-development`, `seo-website-builder`, `copywriting`, `impeccable`, `ui-validation`
- **Allowed paths:** `src/**`, `public/og/**`, `scripts/**`, `DESIGN.md`, `TASKS.md`
- **Scope:** (a) hapus gelar "Prof."/"Profesor" di seluruh UI, schema, dan tes; sebutan "Konsultan Pertanian Senior · Pengelola Jurnal Tani"; bio sesuai DESIGN §4.2.3 Profil Penulis; teks Pengungkapan artikel baru (DESIGN §4.3.1 blok 16); (b) posisi "distributor resmi" → portal dikelola Arif Prabowo + produk unggulan + kerja sama brand/perusahaan (tanpa nama); (c) foto `arif-prabowo.webp` via `AuthorAvatar` di semua avatar; (d) perbaikan integritas & invariant di Beranda dari commit `0888c13` (kutipan palsu, klaim tanpa sumber, kicker, kata jaminan, alt menyesatkan, radius/shadow/garis section/warna non-token); (e) buat ulang 14 gambar `public/og/*.png` tanpa teks "Distributor Resmi" dan tanpa "AGRITANI NUSANTARA".
- **Done when:** `grep -rniE "prof\.|profesor|distributor resmi|nusantara" src public/og` hanya menyisakan pemakaian yang sah untuk program mitra ("Kemitraan Distributor", judul "Kemitraan Distributor Resmi | Agritani"); ke-14 gambar OG dibuka dan diperiksa visual (teks di dalam PNG tidak terjangkau grep); build produksi lulus seluruh pemeriksaan; render 390 & 1440 Beranda, profil, satu artikel, Tentang Kami diperiksa; review independen (R2).

### T-33 — Aturan tautan keluar & status tautan (hover/active)
- **Primary:** REQ-08 · **Constraints:** DESIGN §3.6.1, §4.4.12, §6 · **Risk:** R1
- **Owner skill:** `seo-website-builder`, `impeccable`, `ui-validation`, `astro-development`
- **Allowed paths:** `src/**`, `astro.config.mjs`, `scripts/check-links.mjs`, `DESIGN.md`, `TASKS.md`
- **Scope:** (a) `src/lib/links.ts` helper `externalLink(kind)` → atribut `target`/`rel` + teks `sr-only` sesuai §4.4.12; pakai di `References`, `ForecastTable`, `cuaca-tani`, `konsultasi`, `Footer`, `waLink` pemanggil; (b) plugin rehype kecil milik repo untuk tautan keluar di badan Markdown (jenis rujukan); (c) kelas `.topic-link`/`.topic-marker` di `global.css` menggantikan `hover:underline` pada label kategori di `ArticleRow`, kolom Beranda, dan tempat lain; tinggi sentuh 44px; (d) status §3.6.1 untuk prosa (`:visited` di artikel & pustaka), judul, nav, indeks, tombol `:active`/`disabled`, hover dibungkus `@media (hover:hover)`; (e) perluas `check-links.mjs` sesuai §4.4.12.
- **Done when:** `npm run build` lulus termasuk aturan tautan keluar baru; tidak ada `hover:underline` pada label kategori; render 390 & 1440 + uji keyboard (Tab) menunjukkan ring fokus; tidak ada `noreferrer`, redirect perantara, atau URL tersamar.

### T-24 — Rilis produksi & observability
- **Primary:** REQ-08 · **Constraints:** RELEASE.md, OBSERVABILITY.md · **Risk:** R2
- **Owner skills:** `cloudflare`, `wrangler`, `observability-engineering`, `seo-website-builder` (indeksasi)
- **Allowed paths:** `RELEASE.md`, `OBSERVABILITY.md`, `STATUS.md`, `BUILD-LOG.md`
- **Scope:** Isi `RELEASE.md` (Release-ID, Base, Declared-Risk, Rollback-Ref, Rollback-Command yang didukung Wrangler dan dicek dari dokumentasi saat itu); isi probe `OBSERVABILITY.md` (Beranda, satu artikel, `/alat/cuaca-tani/`, `/sitemap-index.xml`, `/robots.txt` dengan status & teks yang diharapkan); jalankan `production-gate`. **Dengan persetujuan eksplisit per langkah**: pengaturan DNS & redirect `www`/`http` (DESIGN §4.4.7), `npx wrangler deploy`, lalu `release-check`, verifikasi Search Console/Bing & kirim sitemap (DESIGN §4.4.9).
- **Done when:** `production-gate` lulus sebelum deploy; setelah deploy yang disetujui, semua probe `release-check` lulus dan STATUS berpindah ke `VERIFIED`; sitemap terkirim dan tercatat.
