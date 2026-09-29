# Launch Content Build Notes (feat/launch-content)

Dokumen ini mencatat catatan implementasi, bukti verifikasi, dan temuan telaah editorial naskah untuk peluncuran v1 Agritani.

---

## 1. Data Peluncuran (A.1–A.3)

- **Nomor WhatsApp Resmi**: Menggunakan nomor resmi dari `docs/research/web-scan.md` baris 146 (`6287770457256` / `+62 877-7045-7256`).
- **Footer (`src/components/Footer.astro`)**: Ditampilkan sebagai teks kontak biasa dengan tautan langsung ke WhatsApp (`+62 877-7045-7256`). Baris alamat dan seluruh placeholder telah dihapus.
- **Halaman Konsultasi (`src/pages/konsultasi.astro`)**: Baris jam operasional layanan yang tidak memiliki data resmi dihapus; teks nomor kontak fallback diperbarui ke nomor resmi.
- **Pemeriksaan Pasca-Build Placeholder (`scripts/check-placeholders.mjs`)**: Menambahkan skrip verifikasi yang memindai seluruh file HTML di `dist/` pada build produksi. Build akan gagal jika ditemukan `"menyusul - OQ"`, `"TODO("`, atau `"[Draf"`.

---

## 2. Alat Tersembunyi (A.8)

- **Halaman Indeks Alat (`src/pages/alat/index.astro`)**: Dibiarkan tidak disentuh pada branch ini sesuai koordinasi (dikerjakan di branch lain).
- **Integritas Gejala (`src/lib/content-integrity.ts`)**: Gejala yang belum ditinjau (`reviewedBy` kosong) disembunyikan di produksi dan tidak menggagalkan build produksi jika merujuk artikel draf. Hanya gejala yang tampil (`reviewedBy` terisi) yang wajib menunjuk artikel terbit.

---

## 3. T-25 Batch 1: Publikasi Artikel & Telaah Ilmiah

Sebanyak 8 artikel telah diterbitkan (`draft: false`) dengan referensi ilmiah Crossref DOI terverifikasi dan ringkasan Jawaban Singkat 40–60 kata. Judul dan metaTitle dengan klaim absolut atau kata "Jurus" / "Obat" telah dibersihkan. 4 artikel lain berstatus `holdBack` tetap draf.

### Artikel yang Diterbitkan (8 Artikel)
1. `jurus-pengendalian-antraknosa-patek-cabai`
   - Judul baru: "Pengendalian Antraknosa (Patek Cabai): Protokol Terpadu Mencegah Busuk Buah Melingkar"
   - DOI: `10.3767/003158517x692788`, `10.17503/agrivita.v44i2.3705`, `10.1111/j.1364-3703.2011.00783.x`
2. `mengenal-hama-thrips-cabai-dan-pengendalian`
   - DOI: `10.7717/peerj.13868`, `10.1093/jisesa/iev087`, `10.32473/edis-in1407-2023`, `10.14719/pst.5779`
3. `mengatasi-layu-fusarium-pada-cabai-tomat`
   - DOI: `10.1111/j.1364-3703.2009.00538.x`, `10.5539/jas.v12n10p347`
4. `pengendalian-wereng-batang-coklat-padi`
   - Judul baru: "Pengendalian Wereng Batang Coklat Padi: Cegah Puso Akibat Hopperburn"
   - DOI: `10.1007/978-94-017-9535-7_3`, `10.1146/annurev-ento-011019-025215`, `10.5994/jei.20.3.203`, `10.5994/jei.20.2.137`
5. `mengatasi-penyakit-kresek-hawar-daun-bakteri-padi`
   - Judul baru: "Mengatasi Penyakit Kresek Padi (Hawar Daun Bakteri): Gejala dan Pengendaliannya"
   - DOI: `10.1111/j.1364-3703.2006.00344.x`, `10.1094/pd-65-578`, `10.1094/phyto-69-970`
6. `mencegah-penyakit-tungro-dan-wereng-hijau-padi`
   - DOI: `10.1094/pdis.2002.86.2.88`, `10.21082/ijas.v15n2.2014.65-70`
7. `membasmi-ulat-grayak-jagung-faw-spodoptera`
   - Judul baru: "Pengendalian Ulat Grayak Jagung (FAW): Cara Melindungi Titik Tumbuh Tanaman"
   - DOI: `10.13057/biodiv/d220655`, `10.1088/1755-1315/741/1/012020`, `10.1371/journal.pone.0165632`
8. `mengatasi-penyakit-bulai-jagung-peronosclerospora`
   - DOI: `10.25181/jppt.v24i4.3431`, `10.1094/phyto-71-1133`

### Catatan Klaim Belum Terverifikasi untuk Ditinjau Penulis (`unverifiedClaimsForAuthorReview`)

#### 1. `jurus-pengendalian-antraknosa-patek-cabai`
- NO VERIFIED SOURCE: calcium-boron cell-wall strengthening reduces anthracnose
- NO VERIFIED SOURCE: 50 cm minimum spacing
- NO VERIFIED SOURCE: 50-90% yield loss figure
- NO VERIFIED SOURCE: 'systemic immunity stimulation'

#### 2. `mengenal-hama-thrips-cabai-dan-pengendalian`
- NO VERIFIED SOURCE: silver reflective mulch controls thrips in chili (Hutton & Handley 2007, 10.21273/horttech.17.2.214, is about pepper yield in Maine, not thrips; do not cite for this)
- NO VERIFIED SOURCE: upward boat-shaped leaf curl symptom specific to T. parvispinus

#### 3. `mengatasi-layu-fusarium-pada-cabai-tomat`
- NO VERIFIED SOURCE: root-knot nematode wounds enable Fusarium infection in chili/tomato
- NO VERIFIED SOURCE: liming to pH 6-6.5 suppresses Fusarium
- NO VERIFIED SOURCE: wilt at midday, recovery in evening as diagnostic

#### 4. `pengendalian-wereng-batang-coklat-padi`
- NO VERIFIED SOURCE: jajar legowo reduces BPH
- NO VERIFIED SOURCE: draining field until soil cracks suppresses BPH
- NO VERIFIED SOURCE: nozzle to stem base improves control
- NO VERIFIED SOURCE: Lycosa/Cyrtorhinus predator claims (not read in any verified abstract)

#### 5. `mengatasi-penyakit-kresek-hawar-daun-bakteri-padi`
- NO VERIFIED SOURCE: entry via hydathodes specifically (not confirmed in read abstracts)
- NO VERIFIED SOURCE: alternate wetting/drying (macak-macak) reduces BLB
- NO VERIFIED SOURCE: silica/potassium effect
- NO VERIFIED SOURCE: P. fluorescens control; note Reddy is Indian data, and 'Xanthomonas' should be named X. oryzae pv. oryzae

#### 6. `mencegah-penyakit-tungro-dan-wereng-hijau-padi`
- NO VERIFIED SOURCE (not read in abstract): synchronous planting and stubble destruction reduce tungro (likely covered by Azzam & Chancellor but not confirmed)
- NO VERIFIED SOURCE: orange-yellow leaf symptom description

#### 7. `membasmi-ulat-grayak-jagung-faw-spodoptera`
- NO VERIFIED SOURCE: Bt bioinsecticide efficacy on FAW in maize (Indonesian Bt paper 10.35791/jat.v7i1.66642 seen in search but not verified for content)
- NO VERIFIED SOURCE: direct funnel spray
- NO VERIFIED SOURCE: rice husk ash + sand efficacy (folk remedy, likely no evidence)
- NO VERIFIED SOURCE: larvae hidden under sawdust-like frass (visual sign)

#### 8. `mengatasi-penyakit-bulai-jagung-peronosclerospora`
- NO VERIFIED SOURCE: metalaxyl/seed-treatment efficacy against P. maydis in Indonesia
- NO VERIFIED SOURCE: infection before 20 days causes complete sterility
- NO VERIFIED SOURCE: 'immune activation' claim
- NOTE: Bonde 1979 is on P. sacchari; use only as general downy mildew biology

### Artikel yang Ditahan (`holdBack` - Tetap Draf)
1. `mengatasi-hama-tungau-merah-pada-cabai`: Gejala cocok dengan broad mite *Polyphagotarsonemus latus*, bukan tungau merah *Tetranychus*.
2. `perbedaan-layu-bakteri-dan-layu-fusarium`: Klaim uji gelas air "100% akurat dalam 3 menit" overclaim tanpa sumber terverifikasi.
3. `ganoderma-sawit-immune-activator`: Bingkai klaim aktivator imun dan molibdenum-fitoaleksin tanpa sumber ilmiah.
4. `teknik-parit-isolasi-mencegah-penularan-ganoderma`: Ukuran parit tidak didukung rujukan terverifikasi.

---

## 4. Konfigurasi CI (A.10)

- `.github/workflows/ci.yml`: Langkah build utama menjalankan `npm run build` dalam mode produksi murni tanpa `PUBLIC_INCLUDE_DRAFTS`.
- Menambahkan langkah build pratinjau terpisah (`Build preview with drafts`) dengan `PUBLIC_INCLUDE_DRAFTS: "true"` untuk memverifikasi draf tetap valid tanpa mencemari indeks produksi.
- Menjalankan seluruh pengujian dan audit kualitas: `npx astro check`, `npm test`, `npm run check:contrast`, dan seluruh skrip audit bawaan di `npm run build` (`check-commodities`, `check-seo`, `check-csp`, `check-placeholders`).

---

## 5. Konfigurasi Deployment T-18 (Cloudflare Workers & Headers)

- **`wrangler.jsonc`**:
  - `name`: `"agritani"`
  - `compatibility_date`: `"2026-09-29"`
  - `assets.directory`: `"./dist"`
  - Tanpa properti `main` (statik murni)
  - Custom domain: `agritani.com` dan `www.agritani.com` (`custom_domain: true`)
- **`public/_headers`**:
  - Menetapkan header keamanan ketat sesuai ARCHITECTURE §5:
    - `Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.bmkg.go.id; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - Cache kontrol aset statik immutable:
    - `/_astro/*`: `Cache-Control: public, max-age=31536000, immutable`
    - `/fonts/*`: `Cache-Control: public, max-age=31536000, immutable`

---

## 6. Bukti Verifikasi Lengkap (Langkah 6)

### 6.1. Build Produksi Murni & Pemeriksaan Kualitas
Build produksi dieksekusi tanpa `PUBLIC_INCLUDE_DRAFTS` (`npm run build`):
- **Commodity Assignments**: 118 penugasan komoditas diverifikasi valid terhadap judul dan tag (0 invalid).
- **Astro Build**: 29 rute statik berhasil dibuat (termasuk 8 artikel terbit).
- **Pagefind**: Mengindeks 8 artikel publikasi (1 bahasa: id, 1304 kata).
- **Audit SEO (`check-seo.mjs`)**: 29 file HTML diperiksa, 0 error, 0 warning.
- **Audit CSP (`check-csp.mjs`)**: 29 file HTML diperiksa, invariant 0/0/0 terpenuhi (0 inline script, 0 inline on*= handler, 0 inline style= attribute).
- **Audit Placeholder (`check-placeholders.mjs`)**: 29 file HTML produksi bersih dari placeholder draf dan TODO.
- **Type Checking (`npx astro check`)**: 0 error, 0 warning, 0 hint.
- **Unit & behavioral tests (`npm test`)**: 78 tes lulus dari 12 suite (0 gagal, 0 diskip).
- **Contrast Check (`npm run check:contrast`)**: Semua rasio kontras teks (≥ 7.0:1) dan kontrol non-teks (≥ 3.0:1) lulus.

### 6.2. Wrangler Deploy Dry-Run
```bash
$ npx wrangler deploy --dry-run
 ⛅️ wrangler 4.143.1
────────────────────
✨ Read 686 files from the assets directory /home/ongki/Projects/agritani-launch/dist
Total Upload: 0.31 KiB / gzip: 0.22 KiB
No bindings found.
--dry-run: exiting now.
```
Exit code: 0.

### 6.3. Verifikasi Header Lokal (`wrangler dev` + `curl -I`)
Dijalankan pada server lokal port 8787:
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=0, must-revalidate
ETag: "3b40e4f717c0f9bb063251cde2fa0aca"
CF-Cache-Status: HIT
content-security-policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.bmkg.go.id; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
permissions-policy: camera=(), microphone=(), geolocation=()
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
```
Header aset immutable (`curl -I http://localhost:8787/_astro/BaseLayout.B5hu0LA5.css`):
```http
HTTP/1.1 200 OK
Content-Type: text/css; charset=utf-8
Cache-Control: public, max-age=31536000, immutable
content-security-policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.bmkg.go.id; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
permissions-policy: camera=(), microphone=(), geolocation=()
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
```

### 6.4. Bukti Tangkapan Layar UI (Port 4331)
Tangkapan layar resolusi seluler (390px) dan desktop (1440px) dihasilkan menggunakan `agritani-shot.cjs` dan tersimpan di `proof/ui/launch-content/`:
- `beranda-390.png` & `beranda-1440.png`: Membuktikan footer dengan tautan resmi WhatsApp tanpa placeholder alamat.
- `konsultasi-390.png` & `konsultasi-1440.png`: Membuktikan halaman konsultasi bersih tanpa baris jam operasional placeholder.
- `alat-index-390.png` & `alat-index-1440.png`: Membuktikan tampilan halaman indeks alat tani tanpa perubahan pada berkas `src/pages/alat/index.astro`.
- `jurnal-index-390.png` & `jurnal-index-1440.png`: Membuktikan indeks jurnal hanya memuat 8 artikel terbitan Batch 1.
- `artikel-antraknosa-390.png` & `artikel-antraknosa-1440.png`: Membuktikan artikel antraknosa dengan judul terevisi, DOI Crossref resmi, dan jawaban singkat 40–60 kata.
- `artikel-wereng-390.png` & `artikel-wereng-1440.png`: Membuktikan artikel wereng batang coklat dengan DOI terverifikasi dan tanpa klaim overpromising.

---

LAUNCH-CONTENT SELESAI
