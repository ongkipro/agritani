# Task Execution Queue: Agritani Hybrid Corporate & Portal

> **Entitas**: PT Agritani Internasional ([agritani.com](https://agritani.com))
> **Prinsip**: Setiap tugas memiliki **tepat satu Primary Requirement** dari [PRD.md](PRD.md); requirement lain adalah constraint.
> **Status**: Ready for Execution (revisi 2026-09-29) · antrean eksekusi tunggal proyek ini.

**Gate UI (berlaku untuk setiap task bertanda UI):** "Done" hanya setelah
bukti [DESIGN.md §10](DESIGN.md) tercatat: `impeccable` critique + polish,
lalu `ui-validation` pada halaman nyata di 360px dan 1440px, keyboard, dan
alur kritis. `npm run build` hijau bukan bukti UI.

**Perintah verifikasi dasar** (dibuat di T-01): `npm run build`, `npx astro check`, `npm run check:contrast`.

---

## Task Matrix & Tracing

| Task | Nama | Primary | Constraints | Risk | UI | Depends | Blocked by | Status |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- | :--- | :---: |
| T-00 | Reference discovery & composition contract | REQ-01 | REQ-03, REQ-08 | R1 | — | — | — | Done 2026-09-29 (DESIGN §4.0) |
| T-01 | Fondasi Astro 7 + Tailwind 4 + token + font | REQ-08 | REQ-03 | R1 | — | — | — | Pending |
| T-02 | Content config: articles, products, symptoms + cek integritas | REQ-03 | REQ-05, REQ-06 | R1 | — | T-01 | — | Pending |
| T-03 | Normalisasi frontmatter 25 artikel (in place) | REQ-03 | REQ-04, REQ-05 | R1 | — | T-02 | — | Pending |
| T-04 | BaseLayout, Navbar, Footer, 404, meta dasar | REQ-01 | REQ-07, REQ-08 | R1 | ✓ | T-01 | OQ-5, OQ-7 (placeholder teks diperbolehkan, ditandai) | Pending |
| T-05 | ArticleLayout, TOC, indeks `/jurnal` | REQ-03 | REQ-08 | R2 | ✓ | T-03, T-04 | — | Pending |
| T-06 | FieldSummaryBox | REQ-04 | REQ-08 | R1 | ✓ | T-05 | — | Pending |
| T-07 | References (daftar pustaka) | REQ-05 | REQ-03 | R1 | ✓ | T-05 | — | Pending |
| T-08 | Homepage hibrida | REQ-01 | REQ-03, REQ-06, REQ-08 | R2 | ✓ | T-00, T-05 | — | Pending |
| T-09 | Triage: dataset `symptoms.json` + `/alat/diagnosa-gejala/` | REQ-06 | REQ-08 | R2 | ✓ | T-00, T-03, T-04 | — | Pending |
| T-10 | Halaman Tentang Kami | REQ-01 | REQ-08 | R1 | ✓ | T-00, T-04 | OQ-4 (file foto, gelar lengkap, institusi) | Pending |
| T-11 | Katalog & detail produk | REQ-01 | REQ-04, NG-1 | R1 | ✓ | T-00, T-02, T-04 | OQ-1, OQ-2, OQ-5 | Pending |
| T-12 | Formulir kemitraan → WhatsApp | REQ-02 | REQ-08, NG-4 | R1 | ✓ | T-00, T-04 | OQ-1 | Pending |
| T-13 | SEO: JSON-LD, sitemap, robots, canonical/OG | REQ-07 | REQ-03 | R1 | — | T-05 | — | Pending |
| T-14 | Pencarian statis Pagefind | REQ-06b | REQ-08 | R2 | ✓ | T-05 | — | Pending |
| T-15 | Audit akhir: kontras render, a11y, budget, Lighthouse, brand | REQ-08 | REQ-01, REQ-07 | R1 | ✓ | T-04…T-14, T-17, T-19…T-22 | — | Pending |
| T-16 | Sumber pustaka tingkat paper per artikel | REQ-05 | NG-3 | R1 | — | T-03 | OQ-3 (verifikasi pemilik) | Pending |
| T-17 | Halaman Kebijakan Privasi | REQ-02 | NG-4 | R1 | ✓ | T-04 | OQ-7 | Pending |
| T-18 | Konfigurasi Cloudflare Workers static assets + header keamanan | REQ-08 | ARCHITECTURE §5 | R2 | — | T-01, T-13 | OQ-6 (akun & domain) | Pending |
| T-19 | Kalender Tanam: data `crop-calendars.json` + `/alat/kalender-tanam/` | REQ-09 | REQ-08, NG-3, DEC-015 | R2 | ✓ | T-02, T-04, T-05 | OQ-11a (tinjauan data) | Pending |
| T-20 | Cuaca Tani: dataset wilayah + klien BMKG + `/alat/cuaca-tani/` | REQ-10 | REQ-08, DEC-014 | R2 | ✓ | T-04 | OQ-11b (ambang indikator; halaman boleh rilis tanpa indikator) | Pending |
| T-21 | Kalkulator Dosis `/alat/kalkulator-dosis/` | REQ-11 | REQ-08, OQ-2 | R1 | ✓ | T-04 | — | Pending |
| T-22 | Konsultasi `/konsultasi/` + indeks `/alat/` + kode sumber WhatsApp | REQ-12 | G-6, REQ-08 | R1 | ✓ | T-04 | OQ-1 | Pending |

Urutan kerja yang disarankan: T-00 ‖ T-01 → T-02 → T-03 → T-04 → T-05 → (T-06, T-07, T-13, T-14) → T-09 → T-08 → T-10 → T-17 → T-11/T-12 (saat OQ terjawab) → T-21 → T-22 → T-19 → T-20 → T-16 berjalan paralel → T-18 → T-15.

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
- **Allowed paths:** `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`, `public/fonts/**`, `scripts/check-contrast.mjs`, `.gitignore`
- **Scope:** `npm create astro@latest` (template minimal, TypeScript strict via `astro/tsconfigs/strict`), `npx astro add tailwind sitemap`, `site: 'https://agritani.com'`, token DESIGN §3.1–3.3 di `@theme`, font Plus Jakarta Sans (400/600/800) + Newsreader (500/600) self-hosted woff2 ≤ 110 KB total (lisensi OFL dicatat), halaman spesimen lokal `/_spesimen` (dikecualikan dari build produksi) untuk render palet baru (DESIGN §9), print stylesheet dasar. `scripts/check-contrast.mjs` menghitung rasio WCAG untuk pasangan token yang dipakai dan gagal jika teks < 7 atau indikator non-teks < 3; didaftarkan sebagai `npm run check:contrast`.
- **Done when:** `npm run build`, `npx astro check`, dan `npm run check:contrast` lulus; tidak ada `tailwind.config.*`; spesimen palet baru dirender di 390px dan 1440px dan dicatat.

### T-02 — Content config + cek integritas
- **Primary:** REQ-03 · **Constraints:** REQ-05, REQ-06 · **Risk:** R1
- **Allowed paths:** `src/content.config.ts`, `src/data/products.json`, `src/data/symptoms.json`, `src/content/pages/*.md`, `src/lib/content-integrity.ts`
- **Scope:** Skema ARCHITECTURE §3 termasuk koleksi `pages` (kesiapan CMS, ARCHITECTURE §6). `products.json` dan `symptoms.json` dimulai sebagai array kosong (data diisi T-09/T-11). Cek integritas (slug unik, `symptoms[].article` ada & non-draft, artikel non-draft punya ≥ 1 referensi) dijalankan saat build dan menggagalkan build.
- **Done when:** `npx astro check` lulus; satu fixture sengaja rusak (artikel non-draft tanpa referensi / symptom menunjuk slug fiktif) membuat build gagal dengan pesan yang menyebut file-nya, lalu fixture dihapus.

### T-03 — Normalisasi frontmatter 25 artikel (in place)
- **Primary:** REQ-03 · **Constraints:** REQ-04, REQ-05 · **Risk:** R1
- **Allowed paths:** `docs/content/articles/*.md`
- **Scope:** Ubah `published_date`→`pubDate`, `category`→`cluster` enum, hapus `reading_time`/`source` (waktu baca dihitung dari isi), tambah `description`, `commodities`, `focusKeyword` (dari `docs/research/keywords-masterlist.md`). Hapus H1 duplikat di badan (judul dirender layout). Blok "Key Takeaways" dipetakan ke `fieldTakeaways` hanya bila isinya memang ada; dosis tidak ditebak. Artikel tanpa referensi terverifikasi → `draft: true`.
- **Done when:** `npx astro check` dan `npm run build` lulus dengan 25 entri terbaca; jumlah artikel draft vs terbit tercatat di BUILD-LOG.

### T-04 — BaseLayout, Navbar, Footer, 404 (UI)
- **Primary:** REQ-01 · **Constraints:** REQ-07, REQ-08 · **Risk:** R1
- **Allowed paths:** `src/layouts/BaseLayout.astro`, `src/components/Navbar.astro`, `src/components/Footer.astro`, `src/pages/404.astro`
- **Scope:** `<html lang="id">`, skip link, title/description/canonical/OG per halaman via props, navigasi DESIGN §2.1 dengan `aria-current`, menu mobile yang bisa dioperasikan keyboard dan menutup dengan Esc, footer identitas legal (placeholder bertanda `TODO(OQ-7)` bila belum ada data).
- **Done when:** Gate UI lulus; menu mobile terbuka/tertutup via keyboard dan sentuh; target sentuh ≥ 44px; tidak ada garis pemisah antar-section.

### T-05 — ArticleLayout, TOC, indeks jurnal (UI)
- **Primary:** REQ-03 · **Constraints:** REQ-08 · **Risk:** R2
- **Allowed paths:** `src/layouts/ArticleLayout.astro`, `src/components/ArticleToc.astro`, `src/components/{Breadcrumb,AuthorByline,AuthorBio,ShortAnswer,SymptomCompare,ConsultPrompt}.astro`, `src/pages/jurnal/index.astro`, `src/pages/jurnal/[slug].astro`, `src/pages/jurnal/topik/[klaster].astro`, `src/lib/reading-time.ts`
- **Scope:** Anatomi DESIGN §4.3 (17 blok, state §4.3.3) + hub klaster §4.2.3. Waktu baca dihitung dari jumlah kata. Indeks jurnal berupa daftar baris dengan filter klaster tanpa JS wajib.
- **Done when:** Gate UI lulus; measure isi terukur 60–72ch di 1440px; TOC sticky di ≥1024px dan `<details>` di 360px; tanpa scroll horizontal halaman di 320px; artikel draft tidak muncul di build.

### T-06 — FieldSummaryBox (UI)
- **Primary:** REQ-04 · **Constraints:** REQ-08 · **Risk:** R1
- **Allowed paths:** `src/components/FieldSummaryBox.astro`, `src/layouts/ArticleLayout.astro`
- **Done when:** Gate UI lulus; artikel dengan `fieldTakeaways` menampilkan hanya field yang terisi; artikel tanpa `fieldTakeaways` tidak merender kotak kosong; kontras isi ≥ 7:1 di `surface-muted`.

### T-07 — References (UI)
- **Primary:** REQ-05 · **Constraints:** REQ-03 · **Risk:** R1
- **Allowed paths:** `src/components/References.astro`, `src/layouts/ArticleLayout.astro`
- **Done when:** Gate UI lulus; daftar bernomor dalam `<details>` native; tautan DOI (`https://doi.org/<doi>`) hanya muncul bila `doi` ada; tautan eksternal `rel="noopener"`.

### T-08 — Homepage hibrida (UI)
- **Primary:** REQ-01 · **Constraints:** REQ-03, REQ-06, REQ-08 · **Risk:** R2
- **Allowed paths:** `src/pages/index.astro`, komponen baru khusus homepage di `src/components/home/`
- **Scope:** DESIGN §4.1 mengikuti composition contract T-00. Jumlah artikel per klaster dihitung dari koleksi, bukan ditulis tangan.
- **Done when:** Gate UI lulus; checklist DESIGN §8 diperiksa pada render 360px dan 1440px dan hasilnya dicatat; tidak ada statistik/afiliasi/testimoni tanpa data resmi.

### T-09 — Triage engine (UI)
- **Primary:** REQ-06 · **Constraints:** REQ-08 · **Risk:** R2
- **Allowed paths:** `src/data/symptoms.json`, `src/pages/alat/diagnosa-gejala.astro`, `src/pages/alat/index.astro`, `src/components/TriageFilter.astro`
- **Scope:** Dataset disemai dari (a) gejala yang dibahas di artikel terbit dan (b) `FIELD_PLAYBOOK_DICTIONARY` agrimarket (`problemName`, `visualSymptoms`, `rootCause` saja; tanpa `productPairing`, `prescription`, merek) — semua entri ditinjau Prof. Arif (OQ-11c). Dataset disusun hanya dari gejala yang dibahas di artikel terbit (setiap entri menunjuk artikelnya); `distinguishingSign` wajib untuk diagnosis yang mudah tertukar; `causeType` wajib (penyakit/hama/hara/lingkungan). Perilaku & state DESIGN §2.2.
- **Done when:** Gate UI lulus; alur komoditas → bagian → gejala → hasil ≤ 4 interaksi; URL mencerminkan pilihan dan Back memulihkan state; empty state dan tampilan no-JS terverifikasi di browser; build gagal bila entri menunjuk artikel yang tidak ada (dicek T-02).

### T-10 — Tentang Kami (UI)
- **Primary:** REQ-01 · **Constraints:** REQ-08 · **Risk:** R1
- **Allowed paths:** `src/pages/tentang-kami.astro`, `src/pages/penulis/arif-prabowo.astro`
- **Scope:** Dari `docs/content/company-profile.md`. Klaim legalitas/sertifikasi hanya bila ada bukti resmi. Bagian moderator menaut ke `/penulis/arif-prabowo/` (anatomi DESIGN §4.2.3): Prof. Arif Prabowo, profesor pertanian (lintas komoditas), penulis & moderator Jurnal Tani; foto dari file yang dikirim pemilik (`astro:assets`); institusi & gelar lengkap hanya setelah OQ-4 terjawab.
- **Done when:** Gate UI lulus; tidak ada klaim yang tidak didukung data dari pemilik.

### T-11 — Katalog & detail produk (UI)
- **Primary:** REQ-01 · **Constraints:** REQ-04, NG-1 · **Risk:** R1
- **Allowed paths:** `src/data/products.json`, `src/pages/produk/index.astro`, `src/pages/produk/[slug].astro`, `src/components/ProductRow.astro`
- **Done when:** Gate UI lulus; 4 produk (Aussie, BENSU, Kojien, Saratoga) dirender dari `products.json` berisi data resmi (OQ-2); tidak ada klaim berstatus "Ditahan" di DESIGN §2.5 yang tampil; nomor izin edar tampil bila ada; aksi "Konsultasi Dosis" membuka wa.me ke nomor resmi (OQ-1); tanpa tombol marketplace.

### T-12 — Formulir kemitraan → WhatsApp (UI)
- **Primary:** REQ-02 · **Constraints:** REQ-08, NG-4 · **Risk:** R1
- **Allowed paths:** `src/pages/kemitraan-distributor.astro`, `src/components/PartnerForm.astro`
- **Scope:** DESIGN §2.3.
- **Done when:** Gate UI lulus; di browser: submit kosong menandai field yang salah + pesan perbaikan dan nilai lain tetap; submit valid membuka URL `wa.me` dengan pesan ter-encode yang memuat semua field (URL diperiksa, tanpa mengirim pesan nyata); keyboard-only dapat menyelesaikan form.

### T-13 — SEO foundations
- **Primary:** REQ-07 · **Constraints:** REQ-03 · **Risk:** R1
- **Owner skill:** `seo-website-builder`
- **Allowed paths:** `src/components/StructuredData.astro`, `src/layouts/*.astro`, `public/robots.txt`, `astro.config.mjs`
- **Done when:** Build menghasilkan `sitemap-index.xml` dan `robots.txt` yang menautnya; setiap halaman punya title/description unik dan canonical absolut; JSON-LD `Organization`, `Article` (author `Person` Arif Prabowo), `BreadcrumbList` lolos Schema Markup Validator untuk 1 artikel + homepage (hasil dicatat); tidak ada `FAQPage`/`HowTo`.

### T-14 — Pencarian Pagefind (UI)
- **Primary:** REQ-06b · **Constraints:** REQ-08 · **Risk:** R2
- **Allowed paths:** `package.json`, `src/components/SearchBox.astro`, `src/pages/cari.astro`, `src/layouts/BaseLayout.astro`, `src/layouts/ArticleLayout.astro`
- **Scope:** `pagefind --site dist` dijalankan di skrip `postbuild`; indeks dibatasi ke isi artikel (`data-pagefind-body`); script Pagefind dimuat saat kotak cari difokus.
- **Done when:** Gate UI lulus; kueri "patek cabai" dan "ganoderma" mengembalikan artikel yang benar di `astro preview`; halaman tanpa interaksi cari tidak memuat aset Pagefind.

### T-15 — Audit akhir
- **Primary:** REQ-08 · **Constraints:** REQ-01, REQ-07 · **Risk:** R1
- **Owner skills:** `ui-validation`, `web-perf`, `impeccable`
- **Allowed paths:** perbaikan kecil di `src/**`; catatan di `BUILD-LOG.md`
- **Done when:** Untuk homepage, 1 artikel, `/alat/diagnosa-gejala/`, `/produk`, `/kemitraan-distributor`: axe tanpa pelanggaran serius; kontras render ≥ 7:1 teks dan ≥ 3:1 indikator; Lighthouse mobile ≥ 95 (Perf/A11y/SEO); transfer awal ≤ 350 KB; CLS ≤ 0.05; `grep` merek/marketplace pihak ketiga di `src/` dan artikel terbit bernilai 0 di luar bagian `references` (DEC-005). Semua hasil + perintah dicatat.

### T-16 — Sumber pustaka tingkat paper
- **Primary:** REQ-05 · **Constraints:** NG-3 · **Risk:** R1
- **Owner skill:** `content` (riset) — setiap entri diverifikasi dari sumber primer (halaman penerbit / resolusi DOI), bukan dari ingatan model
- **Allowed paths:** `docs/content/articles/*.md` (field `references`, `draft`), `docs/research/scientific-validation.md`
- **Done when:** Setiap artikel yang akan terbit punya ≥ 1 referensi yang DOI/URL-nya terbukti mengarah ke karya yang dikutip (dicek dan dicatat); artikel yang klaimnya tidak dapat didukung tetap `draft` atau direvisi; `scientific-validation.md` tidak lagi mengklaim "Verified" tanpa rujukan tingkat paper.

### T-17 — Kebijakan Privasi (UI)
- **Primary:** REQ-02 · **Constraints:** NG-4 · **Risk:** R1
- **Allowed paths:** `src/pages/kebijakan-privasi.astro`
- **Done when:** Gate UI lulus; halaman menjelaskan bahwa situs tidak memakai cookie/pelacak dan data formulir hanya dikirim lewat WhatsApp oleh pengguna; identitas legal dari OQ-7; teks akhir disetujui pemilik.

### T-18 — Konfigurasi Cloudflare Workers static assets
- **Primary:** REQ-08 · **Constraints:** ARCHITECTURE §5 · **Risk:** R2
- **Owner skills:** `cloudflare`, `wrangler`
- **Allowed paths:** `wrangler.jsonc`, `public/_headers`, `public/_redirects`, `package.json` (skrip `deploy`)
- **Scope:** `wrangler.jsonc` (`name`, `compatibility_date`, `assets.directory: "./dist"`, tanpa `main`); `_headers`: CSP tanpa `unsafe-eval` dengan `connect-src 'self' https://api.bmkg.go.id` (DEC-014), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, cache panjang `immutable` untuk `/_astro/*` dan font, cache pendek untuk HTML; `_redirects` untuk varian tanpa trailing slash bila diperlukan. Wrangler dipasang sebagai devDependency; versi dan sintaks dicek dari dokumentasi resmi saat eksekusi.
- **Done when:** `npm run build && npx wrangler deploy --dry-run` lulus; `npx wrangler dev` lokal menunjukkan header yang benar pada HTML, aset `/_astro/*`, dan 404 (dicek dengan `curl -I`). **Deploy produksi, preview publik, dan pengaturan DNS tidak termasuk task ini** — masing-masing butuh persetujuan eksplisit Paduka Ongki.

### T-19 — Kalender Tanam (UI)
- **Primary:** REQ-09 · **Constraints:** REQ-08, NG-3, DEC-015 · **Risk:** R2
- **Allowed paths:** `src/data/crop-calendars.json`, `src/content.config.ts` (koleksi `cropCalendars`), `src/lib/crop-calendar.ts`, `src/lib/crop-calendar.test.ts`, `src/lib/ics.ts`, `src/pages/alat/kalender-tanam.astro`, `src/components/CropTimeline.astro`
- **Scope:** DESIGN §2.6.1 + anatomi §4.2.3; ARCHITECTURE §5b. Semai 6 komoditas (padi, jagung, cabai, tomat, bawang merah semusim; kelapa sawit tahunan) dari dokumen agrimarket dengan aturan pembersihan DEC-015; isi `sources` & `seededFrom`; `reviewedBy` dibiarkan kosong sampai Prof. Arif menyetujui.
- **Done when:** Gate UI lulus; tes tabel kasus `crop-calendar` (tanggal tanam lampau/rencana, kabisat, akhir tahun) lulus; `.ics` hasil unduhan terbuka di Google Calendar/iOS tanpa galat; komoditas tanpa `reviewedBy` tidak tampil (diverifikasi); `grep` merek/harga/dosis pestisida pada `crop-calendars.json` = 0; tabel musim MT1–MT3 terbaca tanpa JS.

### T-20 — Cuaca Tani (UI)
- **Primary:** REQ-10 · **Constraints:** REQ-08, DEC-014 · **Risk:** R2
- **Allowed paths:** `public/wilayah/**`, `scripts/build-wilayah.mjs`, `src/lib/bmkg.ts`, `src/lib/spray-window.ts`, `src/lib/spray-window.test.ts`, `src/data/spray-thresholds.json`, `src/pages/alat/cuaca-tani.astro`, `src/components/{RegionPicker,ForecastTable}.astro`
- **Scope:** Pilih & dokumentasikan sumber kode wilayah (Kemendagri terbaru atau turunan terbuka berlisensi jelas) di `public/wilayah/SOURCE.md`; bangun file JSON bertingkat; klien BMKG per ARCHITECTURE §5b; indikator aplikasi dari `spray-thresholds.json` (kosong/`reviewedBy` kosong → indikator disembunyikan).
- **Done when:** Gate UI lulus; di browser, memilih satu desa di 3 provinsi berbeda menampilkan prakiraan BMKG dengan atribusi dan waktu analisis; state gagal diuji dengan jaringan diblokir; tes tabel kasus `spray-window` lulus; tiap file wilayah < 40 KB gzip; lokasi terakhir diingat dan halaman tetap berfungsi dengan `localStorage` diblokir.

### T-21 — Kalkulator Dosis (UI)
- **Primary:** REQ-11 · **Constraints:** REQ-08, OQ-2 · **Risk:** R1
- **Allowed paths:** `src/lib/dose.ts`, `src/lib/dose.test.ts`, `src/pages/alat/kalkulator-dosis.astro`
- **Done when:** Gate UI lulus; tes tabel kasus `dose` (ml/L, g/L, per tangki, m² vs ha, pembulatan tangki ke atas) lulus; input tidak valid menampilkan pesan per field; rumus "Cara hitung" sama dengan hasil; tanpa prefill dosis produk.

### T-22 — Konsultasi & indeks Alat Tani (UI)
- **Primary:** REQ-12 · **Constraints:** G-6, REQ-08 · **Risk:** R1
- **Allowed paths:** `src/pages/konsultasi.astro`, `src/pages/alat/index.astro`, `src/lib/whatsapp.ts`, `src/lib/whatsapp.test.ts`, `src/components/ConsultPrompt.astro`
- **Scope:** DESIGN §2.7 & §2.6.4. Satu fungsi `waLink({ source, fields })` dipakai semua tombol konsultasi/kemitraan di situs (kode sumber G-6).
- **Done when:** Gate UI lulus; tes `whatsapp` memastikan baris pertama kode sumber dan encoding karakter Indonesia/baris baru benar; semua tombol WhatsApp di situs memakai `waLink` (`grep 'wa.me'` hanya di `whatsapp.ts`); nomor dari OQ-1.
