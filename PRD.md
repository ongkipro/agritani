# PRD: Agritani — Profil Perusahaan, Jurnal Tani, Alat Tani & Konsultasi

> **Entitas**: PT Agritani Internasional ([agritani.com](https://agritani.com))  
> **Status**: Accepted (revisi 2026-09-29: empat pilar situs, Alat Tani REQ-09…REQ-12, Konsultasi) · development belum diotorisasi  
> **Owner**: Business System Architect & Full-Stack Developer  
> **Target Release**: Q4 2026 / Version 1.0.0  

---

## 1. Problem Statement

Sektor pertanian Indonesia menghadapi jurang informasi kritis:
1. **Disinformasi & Ketergantungan Kimia Berlebih**: Petani kesulitan membedakan gejala penyakit tanaman di lahan (seperti membedakan thrips vs virus gemini, atau layu fusarium vs layu bakteri), sehingga sering melakukan penyemprotan pestisida kimia secara salah dosis dan tidak efektif.
2. **Ketiadaan Portal Sains Terbuka yang Kredibel**: Mayoritas media pertanian daring di Indonesia dipenuhi oleh berita seremonial politik atau artikel clickbait tanpa validasi ilmiah dan tanpa protokol penanganan yang teruji.
3. **Kebutuhan Identitas Korporasi Bioteknologi Berkelanjutan**: PT Agritani Internasional membutuhkan saluran representasi digital yang menggabungkan kredibilitas distributor resmi produk aktivator imun tanaman dengan media publikasi sains agronomi terbuka bergaya *Medium/Substack* untuk mengedukasi pasar dan memperluas jaringan distributor B2B nasional.

---

## 1.5. Empat Pilar Situs (keputusan Paduka Ongki 2026-09-29)

| Pilar | Peran | Halaman |
| :--- | :--- | :--- |
| **Jurnal Tani** | Artikel agronomi oleh Prof. Arif Prabowo; sumber trafik organik & kepercayaan | `/jurnal/…`, `/penulis/…` |
| **Alat Tani** | Tools praktis yang dipakai berulang di lahan: Diagnosa Gejala, Kalender Tanam, Cuaca Tani, Kalkulator Dosis | `/alat/…` |
| **Konsultasi** | Jalur tanya langsung ke tim agronomi via WhatsApp, dengan pesan terstruktur | `/konsultasi/` + tombol berkonteks di seluruh situs |
| **Profil perusahaan** | Identitas PT Agritani Internasional sebagai distributor resmi | `/tentang-kami/` |

**Produk** (4) tampil sebagai **referensi** yang relevan dengan komoditas, bukan etalase jualan. **B2B/kemitraan** adalah sasaran kedua: tersedia dan mudah ditemukan, tetapi tidak mendominasi pengalaman petani.

## 2. Goals & Success Metrics

* **G-1 (Reputasi Otoritas Sains)**: Menyajikan portal pengetahuan agrikultur berbasis riset ilmiah dengan 150 artikel agronomi (naskah per 2026-09-29) yang setiap klaim teknisnya dapat ditelusuri ke pustaka terverifikasi. Masterlist 370 kata kunci adalah bahan riset SEO internal, bukan halaman publik.
* **G-2 (Diagnostic Triage Speed)**: Memungkinkan petani mencapai daftar kandidat diagnosis dalam ≤ 4 interaksi (komoditas → bagian → gejala → hasil) tanpa memuat ulang halaman.
* **G-3 (B2B Distributor Pipeline — sasaran kedua)**: Menyediakan kanal intake mitra distributor/perkebunan resmi yang langsung terhubung ke tim kemitraan Agritani.
* **G-6 (Konsultasi terukur tanpa pelacak)**: Setiap pesan WhatsApp dari situs membawa kode sumber di baris pertama (misal `[Web·Diagnosa]`, `[Web·Kalender]`, `[Web·Produk:aussie]`), sehingga tim dapat menghitung konsultasi per sumber secara manual tanpa cookie atau analitik pihak ketiga.
* **G-7 (Alat Tani dipakai berulang)**: Alat Tani berfungsi tanpa akun, bekerja di Android kelas bawah, dan mengingat pilihan terakhir pengguna (lokasi, komoditas) di perangkatnya sendiri.
* **G-4 (Organic & AI Search Visibility)**: Mendapatkan trafik organik dari kueri gejala fisik dengan jawaban ringkas berbentuk pertanyaan–jawaban di dalam artikel (kandidat featured snippet/PAA dan kutipan AI search). Catatan terverifikasi: rich result FAQ hanya untuk situs pemerintah/kesehatan dan HowTo sudah dihentikan Google (Google Search Central, perubahan 14-09-2023), sehingga keduanya bukan target.
* **G-5 (Zero-Friction Mobile Field Performance)**: Menghasilkan skor Google Lighthouse Mobile $\ge 95$ untuk Performa, Aksesibilitas, dan SEO, serta dapat diakses dengan lancar di jaringan pedesaan 3G/4G.

---

## 3. Non-Goals (Batasan Ruang Lingkup)

* **NG-1 (Bukan Marketplace C2C / E-Commerce Publik)**: Portal ini tidak menyediakan fitur keranjang belanja (*cart*), gateway pembayaran ritel instan, atau koneksi ke marketplace pihak ketiga. Fokus komersial murni pada kemitraan B2B, perkebunan korporasi, dan konsultasi agronomis resmi.
* **NG-2 (Bukan Portal Berita Politik / Acara Seremonial)**: Konten 100% *evergreen*, berfokus pada sains botani, patologi tanaman, biologi tanah, dan panduan budidaya presisi.
* **NG-3 (Zero Third-Party Brand Exposure)**: Tidak mencantumkan nama merek komersial, kompetitor, atau marketplace pihak ketiga, dan tidak menyiratkan afiliasi/endorsement lembaga mana pun. Pengecualian tunggal: atribusi pustaka ilmiah (penulis, jurnal, lembaga penerbit) di bagian Referensi artikel ([DEC-005](DECISIONS.md)).
* **NG-4 (Tanpa Penyimpanan Data Mitra di v1)**: Situs tidak menyimpan data formulir di server; formulir kemitraan diteruskan melalui WhatsApp ([DEC-006](DECISIONS.md)).
* **NG-5 (Tanpa Akun, CMS, atau Dark Mode di v1)**: Konten dikelola sebagai Markdown/JSON di repositori; satu tema terang. CMS admin direncanakan setelah v1 ([DEC-012](DECISIONS.md)); v1 wajib menjaga seluruh konten yang akan diedit non-developer tetap di file konten, bukan di kode halaman.

---

## 4. User Personas

> **Status: Assumption (proto-persona).** Belum divalidasi dengan riset pengguna atau data analitik. Dipakai untuk menguji skenario desain, bukan sebagai bukti perilaku atau konversi.

1. **Pak Joko (48 th) — Kepala Kebun Sawit Plasma (Riau)**
   - *Kebutuhan*: Mencari solusi pembusukan pangkal batang akibat Ganoderma boninense dan cara menaikkan berat janjiang/tandan buah segar (TBS).
   - *Perilaku*: Mengakses ponsel Android di tengah kebun; membutuhkan teks kontras tinggi, ringkasan cepat dosis per hektar, dan tombol WhatsApp agronomis.
2. **Mas Bayu (32 th) — Petani Hortikultura Cabai Rawit (Jawa Timur)**
   - *Kebutuhan*: Mengatasi daun cabai keriting kaku kuning dan antraknosa (patek) di musim penghujan.
   - *Perilaku*: Mencari lewat Google Search dengan mengetik gejala fisik; membutuhkan tabel panduan tangki semprot 16L.
3. **Ibu Rina (38 th) — Praktisi Urban Farming (Bandung)**
   - *Kebutuhan*: Panduan budikdamber (lele-kangkung), hidroponik styrofoam boks, dan komposter sampah dapur tanpa bau.
   - *Perilaku*: Membaca mendalam di laptop/tablet pada akhir pekan, menghargai tipografi yang rapi dan langkah-langkah terstruktur.
4. **Haji Mansur (52 th) — Pemilik Toko Sarana Produksi Pertanian (Sumatera Utara)**
   - *Kebutuhan*: Mengevaluasi legalitas formula (nomor izin edar Kementan), lini produk, dan syarat kemitraan untuk menjadi distributor resmi Agritani.

---

## 5. Requirements (EARS Format)

### 5.1. Core System & Corporate Profile
* **REQ-01 (Corporate Authority)**: The system shall present the official identity of PT Agritani Internasional as an official distributor, its immune-cell-activator approach, its technology origins (Thailand, Japan), and its catalogue of exactly four products — Aussie, BENSU, Kojien, and Saratoga — each with target commodities, function, composition, application method, and registration number when provided.
* **REQ-02 (B2B Distributor Ingestion)**: When a potential partner submits the partnership form with all required fields valid (name, business name, business type, province/regency, area or capacity, WhatsApp number), the system shall open a WhatsApp conversation to the official Agritani partnership number with a prefilled structured message, without storing the submission on any server. If a required field is invalid, the system shall identify the field, explain the correction, and keep all entered values.

### 5.2. Editorial Publication & Agriculture Journal
* **REQ-03 (Medium/Substack Editorial Canvas)**: The system shall render long-form agronomy articles using an optimized reading canvas (65–72ch line measure, 1.75 line-height, Newsreader Serif headings, and Plus Jakarta Sans body) equipped with a dynamic Table of Contents (TOC) and estimated reading time.
* **REQ-04 (Field Quick-Reference Callout — "Ringkasan Lapangan")**: When an article's frontmatter contains `fieldTakeaways`, the system shall display a high-contrast "Ringkasan Lapangan" panel near the start of the article showing only the provided fields: for problem articles (`kind: masalah`) problem/pathogen, typical symptom, first step, dosage per 16 L tank, application timing; for guide articles (`kind: panduan`) goal, materials, key steps, timing. The system shall not render placeholder or inferred dosage values.
* **REQ-05 (Scientific References)**: Where an article's frontmatter lists verified references, the system shall render a numbered reference list (authors, year, title, journal/institution) in a native disclosure at the end of the article, linking to the DOI or publisher URL when one exists. An article shall not be published without at least one verified reference for its core technical claim. *Blocker*: `docs/research/scientific-validation.md` currently names institutions only, with no paper-level citation or DOI (T-16).

### 5.3. Search, Triage & Taxonomy
* **REQ-06 (Diagnostic Crop Triage)**: When a user selects a commodity, a plant part, and a visual symptom, the system shall list every matching diagnosis from the curated `symptoms` dataset, each linking to an existing article, without a page reload; the selection shall be reflected in the URL. When no diagnosis matches, the system shall show an empty state linking to the journal index and the agronomist contact. Without JavaScript, the page shall still expose the symptom index as static links.
* **REQ-06b (Site Search)**: The system shall provide full-text search across published articles using a static, build-time index.
* **REQ-07 (Dynamic SEO)**: The system shall generate, from content data and without per-page hand-written tags, for every page: a unique title (≤ 60 characters) and meta description (120–160), an absolute self-referencing canonical URL without query strings, robots directives, Open Graph and Twitter tags with a 1200×630 image, a visible breadcrumb with matching `BreadcrumbList`, and one JSON-LD `@graph` per page type — all as specified in DESIGN §4.4; plus `sitemap-index.xml` (only indexable pages, accurate `lastmod`) and `robots.txt`. A post-build check shall fail the build on missing, duplicate, or out-of-range SEO fields. `FAQPage`, `HowTo`, `Product`, and rating markup are out of scope (G-4, DEC-007).

### 5.3b. Alat Tani & Konsultasi

* **REQ-09 (Kalender Tanam — "Rencana Tanam Saya")**: When a user selects a supported commodity and a planting (or transplanting) date, the system shall display a phase timeline by days after planting (HST) with calendar dates: phases, key agronomic activities, pest/disease watch windows linked to existing articles, and an estimated harvest window; and shall let the user print it, share it to WhatsApp, and download it as an `.ics` calendar file. For perennial crops (kelapa sawit), the system shall display an annual maintenance calendar instead of an HST timeline. The page shall also show national planting-season windows (MT1–MT3) for the commodity, labelled as national averages that differ by region. The system shall only display crop-calendar data whose `reviewedBy` is set. No brand names, prices, or pesticide doses shall appear in the calendar.
* **REQ-10 (Cuaca Tani)**: When a user selects a village-level location (province → regency/city → district → village), the system shall fetch the BMKG public forecast for that `adm4` code directly from the browser and display the 3-day, 3-hourly forecast (temperature, humidity, rainfall, wind speed & direction, cloud cover, weather description) with a per-slot field-application indicator, and shall display "Sumber data: BMKG" with the forecast analysis time. If the forecast cannot be fetched, the system shall show an error state with a retry action and a link to BMKG, without breaking the rest of the page. The last selected location shall be remembered on the user's device only.
* **REQ-11 (Kalkulator Dosis)**: When a user enters a label dose (ml or g per liter, or per tank), a tank volume (default 16 L), an area (m² or ha), and a spray volume per hectare, the system shall compute the product amount per tank, the number of tanks (rounded up), and the total product required, showing the formula used and the units. The system shall not prefill any product dose that is not taken from an official label (OQ-2).
* **REQ-12 (Konsultasi)**: The system shall provide a consultation page and contextual consultation actions (diagnosis result, article, product, tool result) that open WhatsApp to the official number (OQ-1) with a structured prefilled message: source code (G-6), commodity, plant age, location (regency), problem, and a reminder to attach photos. The page shall state service hours, what to prepare, who responds, and that advice is guidance, not a guarantee. Each page shall carry at most one WhatsApp call to action, placed after the user's task is done (tool result, end of article/product, or form submit) and never in the header, menu, hero, sticky or floating elements, or per list item (DESIGN §2.8).

### 5.4. Responsive & Outdoor Resilience
* **REQ-08 (Outdoor High-Contrast & Performance)**: The system shall render all text at a contrast ratio of at least 7:1 and all control/focus indicators at least 3:1 against their composited background, provide touch targets of at least 44×44 px on mobile viewports, keep CLS ≤ 0.05 (target 0), and transfer at most 350 KB (including fonts) on initial load of any page, reaching Lighthouse mobile ≥ 95 for Performance, Accessibility, and SEO.

---

## 6. Route & Information Architecture

Anatomi setiap tipe halaman: [DESIGN.md](DESIGN.md) §4.2. Semua URL memakai trailing slash.

```
/                            -> Beranda: pilih tanaman (Diagnosa) + Alat Tani + Jurnal pilihan + Konsultasi + Produk + Kemitraan
/alat/                       -> Indeks Alat Tani
/alat/diagnosa-gejala/       -> Diagnosa Gejala (REQ-06)
/alat/kalender-tanam/        -> Kalender Tanam (REQ-09)
/alat/cuaca-tani/            -> Cuaca untuk Aplikasi Lapangan (REQ-10)
/alat/kalkulator-dosis/      -> Kalkulator Dosis Tangki & Luas Lahan (REQ-11)
/konsultasi/                 -> Konsultasi Pertanian via WhatsApp (REQ-12)
/jurnal/                     -> Indeks Jurnal Tani: artikel terbaru + 6 hub topik + hub komoditas
/jurnal/topik/[topik]/       -> Hub topik (proteksi-tanaman, tanah-nutrisi, budidaya, air-irigasi, pascapanen-agribisnis, sains-tanaman)
/jurnal/komoditas/[komoditas]/ -> Hub komoditas (dibangun bila ≥ 3 artikel terbit untuk komoditas itu)
/jurnal/[slug]/              -> Artikel: anatomi DESIGN §4.3
/penulis/arif-prabowo/       -> Profil penulis & moderator (ProfilePage)
/produk/                     -> 4 produk sebagai referensi: Aussie, BENSU, Kojien, Saratoga (per komoditas)
/produk/[slug]/              -> Detail produk: fungsi, kandungan, cara pakai, legalitas
/tentang-kami/               -> Profil PT Agritani Internasional
/kemitraan-distributor/      -> Alur & formulir kemitraan B2B
/kebijakan-privasi/          -> Kebijakan Privasi & Legalitas
/cari/                       -> Pencarian Pagefind (noindex)
/404                         -> Halaman tidak ditemukan (noindex)
```

---

## 7. Acceptance Criteria & Quality Gates

1. **Konten & Integritas Branding**: 100% materi terbebas dari penyebutan nama merek luar atau pihak ketiga mana pun. Seluruh artikel dan data mengacu eksklusif pada entitas Agritani.
2. **Keterbacaan Lapangan**: Teks artikel dapat dibaca jelas pada perangkat layar ponsel di luar ruangan tanpa menyilaukan mata (latar `#F8F8F3`, teks `#16211A`, 15.6:1; token lengkap di [DESIGN.md](DESIGN.md) §3.1).
3. **Responsivitas**: Desain bertransformasi mulus dari ponsel layar kecil (360px) hingga monitor desktop lebar (1440px+).
4. **Kecepatan Akses**: LCP ≤ 2.5 detik pada profil throttling mobile Lighthouse (Slow 4G, CPU 4×).
5. **Bukti UI**: Setiap halaman lolos gate `impeccable` + `ui-validation` (360px dan 1440px) sesuai [DESIGN.md](DESIGN.md) §10.

---

## 8. Open Questions — Checklist Data dari Pemilik

Data yang hanya bisa diberikan PT Agritani Internasional / Paduka Ongki.
Tidak ada item yang boleh diisi dengan tebakan. Kolom "Format" adalah yang
dibutuhkan implementasi; kolom "Status" diperbarui saat data diterima.

### 8.1. Wajib sebelum rilis v1

| ID | Data | Format yang dibutuhkan | Dipakai di | Status |
| :--- | :--- | :--- | :--- | :--- |
| OQ-1 | Nomor WhatsApp resmi (kemitraan & konsultasi; boleh satu nomor) + jam layanan | `62…` tanpa spasi; jam & hari layanan dalam teks | Header menu, footer, hasil diagnosa, produk, form kemitraan (T-11, T-12) | Kandidat `+6287770457256` di `docs/research/web-scan.md`, **belum dikonfirmasi** |
| OQ-2 | Data label 4 produk: nomor izin edar, kategori izin, komposisi, bentuk & ukuran kemasan, dosis & cara aplikasi, komoditas | Foto label depan & belakang tiap kemasan (JPG terbaca) atau dokumen izin | `/produk/`, detail produk (T-11) | Belum |
| OQ-3 | Pustaka ilmiah tingkat paper per artikel (150 naskah; per 2026-09-29 hanya 1 yang punya bagian referensi) | Penulis, tahun, judul, jurnal/lembaga, DOI/URL — minimal 1 per artikel | Daftar Pustaka (T-16, REQ-05) | Belum; artikel tanpa ini tetap `draft` |
| OQ-4 | Profil Prof. Arif Prabowo | Foto potret (JPG/PNG, ≥ 800×800 px, latar polos); penulisan gelar lengkap; institusi/universitas (atau "tidak ditampilkan"); 2–4 kalimat bio & bidang keahlian | Byline, Tentang Penulis, `/penulis/arif-prabowo/` (T-05, T-10) | Nama, gelar profesor, peran penulis & moderator, izin foto: **diterima**; file foto, gelar lengkap, institusi: belum |
| OQ-6 | Akun Cloudflare & domain | Akses akun Cloudflare yang dipakai; status registrasi `agritani.com` dan siapa registrarnya | T-18, rilis | Hosting diputuskan (DEC-009); akun & domain belum (domain tidak resolve per 2026-09-29) |
| OQ-7 | Identitas legal | Nama badan hukum, alamat kantor, NIB, email resmi | Footer, Tentang Kami, Kebijakan Privasi (T-04, T-10, T-17) | Belum |
| OQ-9 | Klaim produk yang diizinkan | Konfirmasi per klaim di DESIGN §2.5 + bukti uji bila klaim hasil dipertahankan | Tagline & fungsi produk (T-11) | Belum; klaim berisiko ditahan |
| OQ-11 | Tinjauan agronomis Prof. Arif Prabowo: (a) data kalender tanam per komoditas (HST, fase, kegiatan, jendela OPT, MT1–MT3) yang disemai dari agrimarket; (b) ambang indikator aplikasi lapangan Cuaca Tani; (c) dataset gejala awal dari playbook agrimarket | Catatan setuju/revisi per komoditas dan per ambang (boleh berupa komentar di dokumen) | Kalender Tanam, Cuaca Tani, Diagnosa (T-09, T-19, T-20) | Belum |
| OQ-12 | Pengantar 80–150 kata untuk tiap hub topik (6) dan hub komoditas utama, ditulis/disetujui Prof. Arif | Teks Markdown per hub | Hub `/jurnal/topik/…` (T-05) | Belum; hub tanpa pengantar tetap tampil dengan daftar artikel saja |
| OQ-13 | Apakah pengajuan kemitraan perlu disimpan di server (D1) selain dikirim via WhatsApp? Bila ya: siapa yang membaca, berapa lama disimpan, dan teks persetujuan | Keputusan pemilik + retensi (bulan) + teks persetujuan | T-30, ADR-0001, Kebijakan Privasi | Belum; default: tidak disimpan (DEC-006) |

### 8.2. Penting, tidak memblokir rilis

| ID | Data | Format | Dipakai di | Status |
| :--- | :--- | :--- | :--- | :--- |
| OQ-5 | Foto asli: kemasan 4 produk, lahan/demplot, kios mitra, tim | JPG ≥ 2000 px sisi panjang, dengan izin pemakaian tertulis bila ada orang/lahan mitra | Hero, produk, artikel (T-04, T-08, T-11) | Belum; situs tetap lengkap tanpa foto (DESIGN §3.5) |
| OQ-8 | Cara cek keaslian kemasan (ShieldedTag) | Langkah verifikasi yang dilakukan pembeli + foto contoh label | Detail produk, halaman produk (T-11) | Belum |

### 8.3. Setelah v1

| ID | Data | Dipakai di | Status |
| :--- | :--- | :--- | :--- |
| OQ-10 | CMS admin: siapa editornya, berapa orang, perlu alur tinjau/setujui & jadwal terbit, bersedia memakai akun GitHub? | DEC-012 | Belum |
| P-3 | Logo resmi | DESIGN §1.4, DEC-013 | **Selesai** — "Tunas A" diterima 2026-09-29 |

## 9. Proposals (belum diterima, bukan requirement)

| ID | Usulan | Alasan |
| :--- | :--- | :--- |
| P-1 | Direktori distributor/kios resmi per provinsi | Petani membeli di kios saprotan terdekat; mencegah pembelian produk palsu. Butuh data distributor resmi. |
| P-2 | Foto gejala berlisensi di Diagnosa Gejala | Petani mengenali gejala dari gambar, bukan nama; butuh foto dengan identifikasi terverifikasi. |
| P-3 | Desain logo resmi Agritani | Selesai: "Tunas A" (DEC-013). |
