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

### Active work

T-19 Revisi (Kalender Tanam: Sanitasi Sumber Data & Keselarasan Siklus Panen) selesai diimplementasikan dan diverifikasi:
- Sanitasi Sumber Data (`src/data/crop-calendars.json`): Menghapus seluruh nama institusi/lembaga yang tidak boleh dikarang (BSIP, Balitsa, PPKS, Kementan) per NG-3 dan DEC-005. Mengganti semua 6 entri dengan atribusi jujur: `["Bahan awal internal: agrimarket docs/spec/KALENDER-TANAM-NASIONAL.md (belum diverifikasi ke sumber primer)"]`.
- Komponen `CropTimeline.astro`: Label diubah menjadi "Sumber Data Awal" dan status telaah agronomi jujur berstatus "Status telaah agronomi: Belum ditinjau [Draf — validasi OQ-11b]".
- Keselarasan Siklus Panen: `endDay` fase terakhir seluruh 5 tanaman semusim disamakan dengan `cycleDays.max` (Padi: 125, Jagung: 110, Cabai: 150, Tomat: 110, Bawang Merah: 75).
- Audit Tipografi (DESIGN §3.2): Ukuran font status draf di `CropTimeline.astro` dan `TriageFilter.astro` dinaikkan menjadi `text-xs sm:text-sm` (≥ 14px pada body surface).
- CI Workflow: Komentar action pinning di `.github/workflows/ci.yml` diperjelas secara faktual.
- Verifikasi: 72/72 unit test PASS, `astro check` 0 error, build 182 halaman PASS (check-seo PASS, check-csp 0/0/0).

T-20 Revisi (Metadata Wilayah, Format WIB, & Optimasi Mobile Tabel Cuaca) selesai diimplementasikan dan diverifikasi (RUN-20260929T144716Z-29b68cd1):
- `public/wilayah/SOURCE.md`: Nomor regulasi diperbaiki ke Kepmendagri No. 300.2.2-2430 Tahun 2025 (arsip 2022: No. 100.1.1-6117), dicatat upstream commit SHA `0d1237a5eef926629c69d287cf2282006144f4fa` (unduh 2026-09-29), dan bukti empiris 40/40 sampel kode adm4 divalidasi berhasil ke API BMKG.
- Waktu Pembaruan BMKG: `src/lib/bmkg.ts` mengonversi waktu UTC ke representasi id-ID zona WIB via `Intl.DateTimeFormat` Asia/Jakarta (contoh: "29 Sep 2026, 19.00 WIB"). 4 behavioral unit test ditambahkan di `src/lib/bmkg.test.ts` (total 76/76 PASS).
- Tata Letak Mobile 390px/360px (`ForecastTable.astro`): Kolom Hujan diposisikan setelah Suhu; kolom Lembap dan Angin disembunyikan di `< md` (`hidden md:table-cell`) dan dirangkum sebagai subteks di bawah deskripsi Cuaca. Seluruh 4 kolom inti (Jam, Cuaca, Suhu, Hujan) terlihat utuh di layar mobile tanpa scroll horizontal.
- Audit CSP: 0 inline script, 0 inline on*=, 0 inline style=.
- Verifikasi Browser: Screenshot Playwright diperbarui di `proof/ui/t20/cuaca-jabar-margaasih-390.png` & `1440.png`.

Selanjutnya:
Mengeksekusi **T-26** (Gambar Dummy WebP 10 Slot) lalu **T-08** (Beranda Hibrida) / **T-10** (Tentang Kami & Profil Penulis).

## Blockers

- T-02 menunggu review independen (boundary review R2) dari Claude/Paduka Ongki.
- T-23 menunggu review independen (boundary review R3) dari Claude/Paduka Ongki.
- T-04 menunggu review independen (boundary review R3) dari Claude/Paduka Ongki.
- T-03 menunggu review independen (boundary review R3) dari Claude/Paduka Ongki.
- FIX-CSP menunggu review independen (boundary review R3) dari Claude/Paduka Ongki.
- T-21 (termasuk revisi) menunggu review independen (boundary review R2) dari Claude/Paduka Ongki.
- T-22 menunggu review independen (boundary review R2) dari Claude/Paduka Ongki.
- T-19 menunggu review independen (boundary review R3) dari Claude/Paduka Ongki.
- T-20 (termasuk revisi) menunggu review independen (boundary review R3) dari Claude/Paduka Ongki.

## Verification evidence

- T-01 fondasi Astro 7.3.5 + Tailwind 4.3.3 + sitemap 3.7.4 selesai dan ter-commit.
- T-02 lokal: `src/lib/content-integrity.test.ts` (9 kasus uji PASS dalam 5.5ms), `npx astro check` PASS, `npm run build` PASS, `npm run check:contrast` PASS.
- T-23 lokal: `.github/workflows/ci.yml` sintaks YAML valid (Python safe_load), build, check, test, kontras lulus. Workflow diperbarui dengan `PUBLIC_INCLUDE_DRAFTS: "true"` untuk CI lokal/remote, pin action ke mayor `@v4`, dan audit eksplisit `check:commodities` dan `check:csp`.
- T-04 lokal: `src/lib/whatsapp.test.ts` & `src/lib/seo.test.ts` (22/22 unit tests PASS), `npx astro check` PASS, `npm run build` PASS, `npm run check:contrast` PASS, UI screenshot 404 pada 390px dan 1440px lulus (bebas garis pemisah, touch target >= 44px, navigasi accessible).
- T-03 lokal: 150 artikel berhasil dinormalisasi in-place sesuai ARCHITECTURE §3.0. 0 duplikasi metaTitle dan description; 6 topik terisi penuh; 17 komoditas terhubung; `npx astro check` PASS (0 errors), `npm test` PASS (22/22), `npm run build` PASS, `npm run check:contrast` PASS.
- T-05: Jurnal Tani Article Page, Hubs, & Index selesai dan PASS (RUN-20260929T131837Z-bafff014). Menjawab seluruh masukan review Claude: ambang karangan 15% dihapus, bio penulis sesuai peran dan placeholder OQ-4, kata 'independen' dibersihkan, algoritma bacaan terkait mengisolasi komoditas dan memprioritaskan kecocokan komoditas -> tag -> topik, blok diagram pre/code diberi warna terang tint dan keyboard tabindex, tagline footer dihapus sesuai DESIGN §4.2.1 baris 4b. Screenshot 390px dan 1440px terverifikasi di port 4330. Boundary check PASS R2.
- T-06: FieldSummaryBox selesai dan PASS (RUN-20260929T125122Z-81b067e9). Varian masalah & panduan terverifikasi; ketiadaan takeaways tidak merender kotak kosong; kontras label soil di atas tint 8.95:1 (>= 7:1); unit test 38/38 PASS, check, build, kontras PASS; boundary PASS R1.
- T-07: References component selesai dan PASS (RUN-20260929T130452Z-a04d15c3). Native `<details open>`, daftar bernomor, tautan DOI dan URL, tidak merender kotak kosong jika referensi kosong; screenshot 390px dan 1440px terverifikasi; check, build, test, kontras PASS; boundary PASS R1.
- T-13: Dynamic SEO engine, sitemap filter/serialize, robots.txt, 14 static OG images, dan post-build verifier `scripts/check-seo.mjs` selesai dan diperbaiki sesuai review Claude (RUN-20260929T132557Z-d177f66c). Gambar OG topik budidaya dan tanah-nutrisi sinkron dengan slug kanonikal, aset diperiksa secara fisik di disk, schema Article patuh DESIGN §4.4.5. Semua cek PASS (39/39 test, 8 hal produksi & 175 hal pratinjau, 0 error, 0 warning). Boundary check PASS R2.
- T-14: Pagefind static search engine, SearchBox component, dan dedicated `/cari/` search page selesai dan PASS (RUN-20260929T133042Z-fc2aae13). Pengujian query 'patek cabai' (6 hasil) dan 'ganoderma' (3 hasil) lulus dengan rendering judul, kutipan highlight, dan link artikel; 0 aset pagefind di halaman non-pencarian; UI screenshot 390px dan 1440px terverifikasi. Boundary check PASS R2.
- T-21: Kalkulator Dosis Semprot selesai (commit `6583920`). 50/50 unit tests PASS (label tank scaling, small plot, batch calculation), check commodities PASS, contrast check PASS, `astro check` PASS, build 177 halaman PASS, CSP 0/0/0. UI screenshots `dose-calc-*.png` di `proof/ui/t21/`. Boundary check menghasilkan REVIEW_REQUIRED (eskalasi R1 -> R2), berhenti menunggu review independen.
- T-22: Konsultasi & Indeks Alat Tani selesai (commit `b36db9f`). 50/50 unit tests PASS, check-seo PASS (179 halaman), check-csp PASS (0/0/0). UI screenshots `alat-index-*.png` dan `konsultasi-*.png` di `proof/ui/t22/`. Boundary check menghasilkan REVIEW_REQUIRED (eskalasi R1 -> R2), berhenti menunggu review independen.
- T-09: Triage Engine: Diagnosa Gejala & Dataset Gejala selesai direvisi (RUN-20260929T142508Z-97394bc1). 62/62 unit tests PASS (4 tes triage review gating), `astro check` 0 errors, check-seo PASS (181 halaman), check-csp PASS (0/0/0). Kontras tombol 7.29:1 terverifikasi dengan Playwright computed style dan crop zoom. Honest empty state terverifikasi untuk mode produksi unreviewed. Boundary check PASS R2.
- T-19: Kalender Tanam & Rencana Musim selesai direvisi (commit `07b6545`). 72/72 unit tests PASS (8 tes kalkulasi tanggal, kabisat, cross-year, ics, dan filter review), `astro check` 0 errors, check-seo PASS (182 halaman), check-csp PASS (0/0/0). Seluruh 6 sumber data disanitasi dari institusi karangan (NG-3, DEC-005, DEC-015), siklus panen fase akhir diselaraskan ke cycleDays.max, label status draf memenuhi font-size >= 14px.
- T-20: Cuaca Tani & Integrasi BMKG selesai direvisi (RUN-20260929T144716Z-29b68cd1). 76/76 unit tests PASS (4 tes formatter BMKG termasuk WIB timezone, 10 tes jendela semprot), `astro check` 0 errors, check-seo PASS (182 halaman), check-csp PASS (0/0/0). Regulasi Kepmendagri 300.2.2-2430 Tahun 2025 dan commit SHA sumber tercatat jujur; kolom Hujan tampil utuh tanpa scroll di 390px/360px mobile; 0 atribut style= inline. Boundary check menghasilkan REVIEW_REQUIRED (eskalasi R2 -> R3).

## Next verified action

T-26: Gambar Dummy WebP 10 Slot (`src/assets/images/dummy/**`).


