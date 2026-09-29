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

- **Halaman Indeks Alat (`src/pages/alat/index.astro`)**: Memeriksa ketersediaan data yang telah ditinjau (`reviewedBy`). Jika belum ada data tertinjau di produksi, kartu Diagnosa Gejala dan Kalender Tanam secara otomatis diberi badge "Segera hadir".
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
