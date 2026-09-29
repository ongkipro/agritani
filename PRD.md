# PRD: Agritani Hybrid Corporate Profile & Agriculture Science Portal

> **Entitas**: PT Agritani Internasional ([agritani.com](https://agritani.com))  
> **Status**: Accepted / Ready for Implementation  
> **Owner**: Business System Architect & Full-Stack Developer  
> **Target Release**: Q4 2026 / Version 1.0.0  

---

## 1. Problem Statement

Sektor pertanian Indonesia menghadapi jurang informasi kritis:
1. **Disinformasi & Ketergantungan Kimia Berlebih**: Petani kesulitan membedakan gejala penyakit tanaman di lahan (seperti membedakan thrips vs virus gemini, atau layu fusarium vs layu bakteri), sehingga sering melakukan penyemprotan pestisida kimia secara salah dosis dan tidak efektif.
2. **Ketiadaan Portal Sains Terbuka yang Kredibel**: Mayoritas media pertanian daring di Indonesia dipenuhi oleh berita seremonial politik atau artikel clickbait tanpa validasi ilmiah dan tanpa protokol penanganan yang teruji.
3. **Kebutuhan Identitas Korporasi Bioteknologi Berkelanjutan**: PT Agritani Internasional membutuhkan saluran representasi digital yang menggabungkan wibawa korporasi produsen aktivator imun tanaman dengan media publikasi sains agronomi terbuka bergaya *Medium/Substack* untuk mengedukasi pasar dan memperluas jaringan distributor B2B nasional.

---

## 2. Goals & Success Metrics

* **G-1 (Reputasi Otoritas Sains)**: Menyajikan portal pengetahuan agrikultur berbasis riset ilmiah dengan 25 artikel agronomi mendalam dan indeks taksonomi 370 kata kunci pertanian Indonesia.
* **G-2 (Diagnostic Triage Speed)**: Memungkinkan petani menemukan diagnosis gejala penyakit tanaman dalam waktu kurang dari 30 detik melalui fitur pencarian gejala visual.
* **G-3 (B2B Distributor Pipeline)**: Menyediakan kanal onboarding dan intake mitra distributor/perkebunan resmi yang langsung terhubung ke tim agronomis resmi Agritani.
* **G-4 (SEO Organic Domination)**: Menguasai kueri pencarian petani berbasis gejala fisik dan mengincar kotak Google Featured Snippet (Posisi 0) untuk kueri *People Also Ask* (PAA).
* **G-5 (Zero-Friction Mobile Field Performance)**: Menghasilkan skor Google Lighthouse Mobile $\ge 95$ untuk Performa, Aksesibilitas, dan SEO, serta dapat diakses dengan lancar di jaringan pedesaan 3G/4G.

---

## 3. Non-Goals (Batasan Ruang Lingkup)

* **NG-1 (Bukan Marketplace C2C / E-Commerce Publik)**: Portal ini tidak menyediakan fitur keranjang belanja (*cart*), gateway pembayaran ritel instan, atau koneksi ke marketplace pihak ketiga. Fokus komersial murni pada kemitraan B2B, perkebunan korporasi, dan konsultasi agronomis resmi.
* **NG-2 (Bukan Portal Berita Politik / Acara Seremonial)**: Konten 100% *evergreen*, berfokus pada sains botani, patologi tanaman, biologi tanah, dan panduan budidaya presisi.
* **NG-3 (Zero Third-Party Brand Exposure)**: Tidak mencantumkan nama entitas atau merek luar mana pun. Seluruh hak cipta, narasi, dan teknologi adalah milik penuh PT Agritani Internasional.

---

## 4. User Personas

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
   - *Kebutuhan*: Mengevaluasi legalitas formula, sertifikasi uji efikasi, dan margin keuntungan untuk menjadi distributor resmi Agritani.

---

## 5. Requirements (EARS Format)

### 5.1. Core System & Corporate Profile
* **REQ-01 (Corporate Authority)**: The system shall present the official identity of PT Agritani Internasional, detailing its 3 core pillars (Biological Immunity Activator, Precision Bio-Nutrition, Soil Regeneration), product catalogue (Aussie, Bensu, Saratoga, Kojien, Living Water, Vermi Compost), and research credentials.
* **REQ-02 (B2B Distributor Ingestion)**: When a potential partner accesses the B2B registration form, the system shall validate business entity data (Company Name, Plantation Area/Store Location, Capacity) and forward the inquiry directly to the Agritani Agronomy Partnership desk via secured API / direct WhatsApp dispatch.

### 5.2. Editorial Publication & Agriculture Journal
* **REQ-03 (Medium/Substack Editorial Canvas)**: The system shall render long-form agronomy articles using an optimized reading canvas (65–72ch line measure, 1.75 line-height, Newsreader Serif headings, and Plus Jakarta Sans body) equipped with a dynamic Table of Contents (TOC) and estimated reading time.
* **REQ-04 (Field Quick-Reference Callout)**: When an article describes disease or crop management, the system shall display a high-contrast "Field Takeaway Box" containing the target pathogen, recommended active protocol, spray dosage per 16L tank, and timing restrictions.
* **REQ-05 (Scientific Validation Accordion)**: The system shall include an interactive citation section for every agronomy article, referencing peer-reviewed literature (IRRI, MPOB, Frontiers, MDPI, J. Econ. Entomol) with direct DOI external links.

### 5.3. Search, Triage & Taxonomy
* **REQ-06 (Diagnostic Crop Triage)**: When a user selects a crop commodity and visual symptom, the system shall filter and return matching diagnosis articles and treatment protocols instantaneously without page reloads.
* **REQ-07 (SEO Structured Data & PAA)**: The system shall inject schema.org structured data (`Article`, `FAQPage`, and `HowTo`) and render natural-language question-answer headings targeting Google Featured Snippets (Position 0).

### 5.4. Responsive & Outdoor Resilience
* **REQ-08 (Outdoor High-Contrast & Performance)**: The system shall enforce a minimum 7:1 color contrast ratio across all content surfaces, support minimum 44px touch targets on mobile viewports, and achieve zero layout shifts (CLS = 0) with a page weight under 350KB initial payload.

---

## 6. Route & Information Architecture

```
/                            -> Homepage: Corporate Value Proposition + Triage Bar + Featured Research + Products + B2B Ingestion
/tentang-kami                -> Corporate Profile: PT Agritani Internasional, Visi, Misi, Dewan Riset Agronomi
/produk                      -> Katalog Produk & Formulasi: Aussie, Bensu, Saratoga, Kojien, Living Water, Vermi Compost
/produk/[slug]               -> Detail Formulasi: Bahan Aktif, Mekanisme Biologi, Dosis Aplikasi, Lembar Data Keselamatan
/jurnal                      -> Portal Sains Agritani: Indeks Artikel, Filter Klaster (Sawit, Pangan, Horti, Tanah)
/jurnal/[slug]               -> Halaman Artikel Penuh: Editorial Canvas, TOC Mengambang, Quick-Reference Box, Sitasi Jurnal
/triage                      -> Mesin Diagnostik Gejala Tanaman: Filter Interaktif Komoditas + Bagian + Gejala
/kemitraan-distributor       -> Alur Kemitraan B2B & Registrasi Distributor Resmi Agritani
/kebijakan-privasi           -> Kebijakan Privasi & Legalitas
```

---

## 7. Acceptance Criteria & Quality Gates

1. **Konten & Integritas Branding**: 100% materi terbebas dari penyebutan nama merek luar atau pihak ketiga mana pun. Seluruh artikel dan data mengacu eksklusif pada entitas Agritani.
2. **Keterbacaan Lapangan**: Teks artikel dapat dibaca jelas pada perangkat layar ponsel di luar ruangan tanpa menyilaukan mata (latar `#F9F9F6`, teks `#1A241E`).
3. **Responsivitas**: Desain bertransformasi mulus dari ponsel layar kecil (360px) hingga monitor desktop lebar (1440px+).
4. **Kecepatan Akses**: Halaman statis dimuat dalam waktu kurang dari 1.2 detik pada koneksi 4G reguler.
