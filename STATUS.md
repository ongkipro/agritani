# Status — agritani

Updated: 2026-09-29
Status: Active
State: VERIFIED
Review-Risk: R3
Independent-Review: PASS
Primary-Worker: Antigravity
Independent-Reviewer: Claude (Opus 5.5), lead reviewer, distinct from Primary-Worker
Independent-Review-Head: 8f6c30a

## Delivery state machine

Allowed forward path:

`PLANNED -> READY -> IMPLEMENTING -> VERIFYING -> REVIEWING -> INTEGRATING -> PRODUCTION_READY -> AWAITING_DEPLOY_APPROVAL -> DEPLOYED -> SMOKE_TESTING -> VERIFIED`

Use `BLOCKED` only as an interruption state. Record the blocker and exact state to resume. Do not skip verification/review/integration states. `production-gate` proves the transition from `INTEGRATING` to `PRODUCTION_READY`; it never deploys.

`RELEASE.md` owns release-specific truth: release ID, base, declared risk, rollback reference/command, backup proof, and readiness status. `Review-Risk` is the highest semantic risk found during review. `production-gate` computes effective release risk as max(`RELEASE.md` Declared-Risk, deterministic `diff-risk`, `Review-Risk`). R3/R4 require `Independent-Review: PASS`, a reviewer distinct from `Primary-Worker`, and `Independent-Review-Head` bound to the reviewed release content. Only review-attestation files may change after that commit.

`OBSERVABILITY.md` owns post-deploy verification probes. After deployment, transition to `SMOKE_TESTING` and run `release-check`. Every configured observability probe must pass before transition to `VERIFIED`.

## Current state

### Rilis v1 — 2026-09-29 (live)

- **Live**: https://agritani.com dan https://www.agritani.com (Cloudflare Workers static assets, custom domain). Version ID aktif `830924c1-4cae-4baa-8488-1d8e265bf8f8`; rollback: `npx wrangler rollback aec03f37-ec82-4423-bbd4-3c54f90f6d8e`.
- **Isi rilis**: 35 halaman produksi; 8 artikel batch 1 terbit dengan referensi DOI terverifikasi Crossref (antraknosa, thrips, layu fusarium, wereng batang coklat, kresek, tungro, ulat grayak, bulai); 142 artikel tetap draft (4 ditahan karena masalah klaim inti, lihat `docs/build-notes/launch-content.md`). Cuaca Tani (BMKG), Kalkulator Dosis, Konsultasi, Produk (4), Kemitraan, Tentang Kami, profil penulis, Kebijakan Privasi, pencarian Pagefind.
- **Disembunyikan sampai ditinjau Arif Prabowo (OQ-11)**: Diagnosa Gejala dan Kalender Tanam (label "Segera hadir"); indikator waktu semprot.
- **Verifikasi live** (via IP Cloudflare karena cache DNS lokal): semua halaman utama 200, 404 benar, `www` 200, header CSP/nosniff/Referrer/Permissions aktif; di browser headless: prakiraan BMKG tampil (Jawa Barat › Bandung › Cileunyi › Cileunyi Kulon), pencarian "wereng" menemukan artikel yang benar, menu mobile terbuka, ikon cuaca tampil setelah perbaikan CSP `img-src`.
- **Review independen**: setiap task T-01…T-26 direview Claude dari kode, data, dan render nyata (bukan dari laporan agent); temuan dan koreksi tercatat di riwayat commit dan BUILD-LOG.
- **Smoke test**: `release-check .` → `RELEASE_CHECK=VERIFIED` (app, health, article, weather-tool, sitemap) setelah DNS lokal pulih; probe contoh database/background-jobs yang tidak berlaku untuk situs statis dihapus dari OBSERVABILITY.md.
- **Polish UI pasca-rilis (2026-09-29)**: pass `impeccable` + referensi arah teagasc.ie (DESIGN §4.0, §3.1.1, C9–C10): gambar dummy responsif di hub/Konsultasi/Kemitraan (hero 88 KB di 390px), kicker/border kiri/pemisah section dihapus, grid kartu jadi baris indeks, warna topik + sidebar hub Jurnal. Pemeriksaan `check-links` baru menemukan dan memperbaiki tautan produk footer yang salah (`/produk/pupuk-hayati-aussie/` → `/produk/aussie/`, di semua halaman) dan tautan ke hub komoditas yang tidak dibangun (jagung).
- **Dokumen lanjutan (2026-09-30)**: ADR-0001 (PROPOSED) menyiapkan R2 media dan D1 lead kemitraan sebagai increment berpemicu (T-29, T-30; OQ-13); audit anatomi DESIGN vs build menghasilkan T-31. Tidak ada perubahan runtime.
- **Revisi identitas (2026-09-30, DEC-016)**: Arif Prabowo bukan profesor → "Konsultan Pertanian Senior · Pengelola Jurnal Tani"; Agritani = portal dikelola Arif Prabowo dengan 4 produk unggulan dan kerja sama brand/perusahaan. Dokumen sudah diperbarui; source, OG, dan foto dikerjakan di T-32. **Situs live masih memuat identitas lama dan klaim tanpa sumber dari commit `0888c13`** sampai T-32 dideploy.
- **Sisa**: beacon Cloudflare Web Analytics disisipkan zona dan diblokir CSP (tidak ada data terkirim) — matikan Web Analytics di dashboard zona; data pemilik OQ-2..OQ-12 (PRD §8); auto-deploy CI butuh secret `CLOUDFLARE_API_TOKEN`.

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

T-26 (Gambar Dummy WebP 10 Slot) selesai diimplementasikan dan diverifikasi (RUN-20260929T145254Z-076e455a):
- 10 Berkas WebP (`src/assets/images/dummy/**`): Dibuat sesuai spesifikasi `DESIGN.md` §3.5.1 dan catatan T-26: `hero-beranda.webp` (5:4), `topik-*.webp` (6 berkas, 16:9), `kemitraan.webp` (3:2), `tentang-kami.webp` (3:2), `konsultasi.webp` (3:2).
- Kepatuhan Format & Ukuran: Seluruh berkas bertipe `.webp` (tanpa format lain), masing-masing berukuran <= 250 KB (terkecil 35.3 KB, terbesar 241.9 KB).
- Atribusi Lengkap: `src/assets/images/dummy/CREDITS.md` mendokumentasikan nama berkas, fotografer, lisensi Unsplash, tanggal unduh, dan status wajib "DUMMY — ganti (OQ-5)".

T-08 (Homepage Hibrida) selesai diimplementasikan dan diverifikasi (RUN-20260929T145637Z-f73f7b8f):
- Komponen `CommodityPicker.astro`: tap-first min 48px, 6 komoditas utama menaut ke diagnosa gejala.
- Halaman `index.astro`: 8 bagian DESIGN §4.1 (Hero dengan hero-beranda.webp, Band tint topik, Bacaan Pilihan, Alat Tani terbuka, Tanya Agronomi tanpa link WA langsung, Tentang Penulis AP, Produk tanpa klaim tertahan, Band Kemitraan alur 01-03).
- Kepatuhan Desain: 0 kickers, 0 garis pemisah, radius 2px, kontras teks >= 7:1, CSP 0/0/0, og:image menunjuk /og/default.png valid.
- Bukti UI Browser: `proof/ui/t08/beranda-390.png` dan `proof/ui/t08/beranda-1440.png` di port 4330.
- Verifikasi: 76/76 unit tests PASS, `astro check` 0 error, build 183 halaman PASS, check-seo PASS, check-csp PASS.

T-10 (Tentang Kami & Profil Penulis) selesai diimplementasikan dan diverifikasi (RUN-20260929T151900Z-fc507dc5):
- Halaman `tentang-kami.astro`: Posisi distributor resmi (DEC-010), asal teknologi Thailand & Jepang, aktivasi imun (SAR), alur distribusi 01–03, media `tentang-kami.webp`, tepat 1 ajakan WhatsApp via ConsultPrompt.
- Halaman `penulis/arif-prabowo.astro`: Inisial AP, bio minimalis (A.4: Profesor Pertanian · Moderator Jurnal Tani), pengungkapan independensi, daftar panduan teknis, 1 ajakan konsultasi.
- Koleksi `pages`: Menambahkan `tentang-kami.md` dan `penulis-arif-prabowo.md`.
- Verifikasi: 76/76 unit tests PASS, `astro check` 0 error, build 185 halaman PASS (check-seo PASS, check-csp 0/0/0 PASS), bukti UI browser di `proof/ui/t10/`.

T-17 (Kebijakan Privasi) selesai diimplementasikan dan diverifikasi (RUN-20260929T152357Z-0090aa33):
- Halaman `kebijakan-privasi.astro`: Transparansi data tanpa cookies/pelacak pihak ketiga (NG-4), form hanya via WhatsApp, akses langsung peramban ke API BMKG (DEC-014), penyimpanan preferensi lokal `localStorage`.
- Koleksi `pages`: Menambahkan `kebijakan-privasi.md`.
- Verifikasi: 76/76 unit tests PASS, `astro check` 0 error, build 186 halaman PASS (check-seo PASS, check-csp 0/0/0 PASS), bukti UI browser di `proof/ui/t17/`.

T-17 REVISE & Metadata Pages Cleanup selesai diimplementasikan dan diverifikasi (RUN-20260929T153603Z-1d7bab27):
- Halaman `kebijakan-privasi.astro`: Menghapus email karangan info@agritani.com, menyajikan nomor kontak resmi WhatsApp sebagai teks biasa (+62 877-7045-7256), menghapus komponen ConsultPrompt (0 ajakan WhatsApp sesuai DESIGN §2.8), mengubah merek iklan menjadi istilah generik "piksel pelacak iklan pihak ketiga", dan menambahkan klausul ketentuan privasi WhatsApp.
- Koleksi `pages`: Menghapus field `reviewedBy` dari semua file di `src/content/pages/` (termasuk 6 topik dan halaman statis) untuk mencegah atestasi palsu. Menetralkan seluruh pengantar hub topik.
- Bukti UI WebP kualitas 70 tersimpan di `proof/ui/t17/kebijakan-privasi-390.webp` dan `proof/ui/t17/kebijakan-privasi-1440.webp`.
- Verifikasi: 79/79 unit tests PASS, `npx astro check` 0 error, build 186 halaman PASS (check-seo PASS, check-csp 0/0/0 PASS).

T-08 REVISE (Homepage Hibrida) selesai diimplementasikan dan diverifikasi (RUN-20260929T153010Z-5ebb5dd4):
- Produk dirender dinamis dari koleksi `products` (`src/data/products.json`), menghapus teks manual.
- Bio Prof. Arif Prabowo di beranda distandarkan menjadi: "Profesor Pertanian · Moderator Jurnal Tani PT Agritani Internasional".
- Pemilih komoditas hero secara dinamis menaut ke `/jurnal/komoditas/{slug}/` di mode produksi jika gejala belum ditinjau (`hasReviewedSymptoms: false`), dengan unit test di `src/components/CommodityPicker.test.ts`.
- Keterangan teks hero dihapus (hanya alt image deskriptif) dan kicker "Artikel Utama" dihapus.
- Band Jurnal per Komoditas diubah menjadi baris indeks teks bersih tanpa kotak/kartu latar.
- Label "Segera hadir" ditambahkan pada Diagnosa Gejala dan Kalender Tanam di indeks Alat Tani (`/alat/`) untuk mode produksi murni.
- Bukti UI WebP kualitas 70 tersimpan di `proof/ui/t08/beranda-390.webp` dan `proof/ui/t08/beranda-1440.webp`.
- Verifikasi: 79/79 unit tests PASS, `npx astro check` 0 error, build 186 halaman PASS (check-seo PASS, check-csp 0/0/0 PASS).

T-11 (Katalog & Detail Produk) selesai diimplementasikan dan diverifikasi (RUN-20260929T154148Z-820d40cc):
- Katalog `/produk/`: Posisi distributor resmi tertera jelas (DEC-010), shortcut anchor per komoditas, tabel perbandingan desktop (>=1024px), kartu modular perbandingan (ProductRow.astro), penjelasan keaslian ShieldedTag (OQ-8), dan 0 ajakan WhatsApp sesuai DESIGN §2.8.
- Detail `/produk/[slug]`: 4 rute dinamis (Aussie, Kojien, BENSU, Saratoga), sub-navigasi anchor lengket (#fungsi, #komposisi, #cara-pakai, #keaslian), data resmi tanpa klaim tertahan ("obat", "membasmi", "naik 50%", dll), tanpa blok gambar kemasan dummy/placeholder, rekomendasi panduan budidaya terkait, dan tepat 1 ajakan WhatsApp via ConsultPrompt untuk tanya dosis lapangan.
- Bukti UI WebP kualitas 70: `proof/ui/t11/produk-katalog-*.webp` dan `proof/ui/t11/produk-detail-aussie-*.webp`.
- Verifikasi: 79/79 unit tests PASS, `npx astro check` 0 error, build 191 halaman PASS (check-seo PASS, check-csp 0/0/0 PASS).

T-12 (Formulir Kemitraan Distributor) selesai diimplementasikan dan diverifikasi (RUN-20260929T154439Z-dae3ff13):
- Halaman `/kemitraan-distributor.astro`: Alur kemitraan 01-03, posisi distributor resmi (DEC-010), dan formulir pendaftaran kemitraan.
- Komponen `PartnerForm.astro`: Semua field wajib DESIGN §2.3 (Nama, Usaha, Jenis, Provinsi, Kota, Kapasitas/Luas, WA, Catatan). Validasi interaktif + aria role alert tanpa menghilangkan nilai isian saat error.
- Pengujian browser Playwright terverifikasi: submit kosong menandai field tidak valid, navigasi keyboard mengisi seluruh input, submit valid membuka URL wa.me ber-prefix [Web·Kemitraan] ke nomor resmi +62 877-7045-7256, dan memunculkan panel konfirmasi dengan nomor cadangan.
- Bukti UI WebP kualitas 70: `proof/ui/t12/kemitraan-distributor-390.webp` (101 KB) dan `proof/ui/t12/kemitraan-distributor-1440.webp` (106 KB).
- Verifikasi: 79/79 unit tests PASS, `npx astro check` 0 error, build 192 halaman PASS (check-seo PASS, check-csp 0/0/0 PASS).

Selanjutnya:
**IMPLEMENT-TASKS SELESAI**
Seluruh task implementasi dalam scope branch `feat/implement-tasks` (T-08, T-17, T-11, T-12, perbaikan data & CSP) telah selesai dikerjakan, diverifikasi, dan dibuktikan dengan tangkapan layar browser WebP di port 4330.
Berhenti dan menunggu koordinasi branch `feat/launch-content` dari agent kedua, penggabungan branch, audit akhir T-15, dan prosedur deploy ke Cloudflare Workers.

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
- T-26 menunggu review independen (boundary review R3) dari Claude/Paduka Ongki.
- T-08 menunggu review independen (boundary review R2) dari Claude/Paduka Ongki.
- T-17 (termasuk revisi) menunggu review independen (boundary review R3) dari Claude/Paduka Ongki.
- T-11 menunggu review independen (boundary review R2) dari Claude/Paduka Ongki.
- T-12 menunggu review independen (boundary review R2) dari Claude/Paduka Ongki.

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
- T-26: Gambar Dummy WebP 10 Slot selesai diimplementasikan (RUN-20260929T145254Z-076e455a). 10 berkas WebP (<= 250 KB), atribusi Unsplash jujur dengan penanda "DUMMY — ganti (OQ-5)".
- T-08: Homepage Hibrida selesai diimplementasikan (RUN-20260929T145637Z-f73f7b8f). Hero tap-first min 48px, band topik dinamis, bacaan pilihan serif, alat tani terbuka, 0 link WA langsung di beranda, tentang penulis AP, produk tanpa klaim tertahan, band kemitraan 01-03. Bukti UI 390px & 1440px terverifikasi.

## Next verified action

T-10: Tentang Kami & Profil Penulis (`src/pages/tentang-kami.astro`, `src/pages/penulis/arif-prabowo.astro`).



