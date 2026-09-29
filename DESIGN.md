# UI/UX Specification: Agritani Hybrid Corporate & Agriculture Portal

> **Entitas**: PT Agritani Internasional ([agritani.com](https://agritani.com))  
> **Status**: Specification Accepted / Pre-Development  
> **Framework**: Astro 5 (Static Content Collections + Islands) + Tailwind CSS  
> **Design Philosophy**: *Botanical Precision & Editorial Authority* (Perpaduan Kredibilitas Korporasi Bioteknologi & Kenyamanan Membaca Jurnal Ilmiah Bergaya Medium/Substack).

---

## 1. Surface Definition & User Job Matrix

Situs **Agritani** dirancang sebagai portal hibrida (*hybrid corporate & science portal*) yang melayani dua kelompok audiens utama tanpa mencampuradukkan intensi navigasi mereka:

| Kelompok Audiens | User Job (Tujuan Utama) | Mode Interaksi | Area Kunci di UI |
| :--- | :--- | :--- | :--- |
| **Mitra B2B & Perkebunan Korporasi** | Mengevaluasi kredibilitas sains, melihat sertifikasi/uji efikasi, memeriksa portofolio produk (Aussie, Bensu, Saratoga, Kojien), dan mendaftar kemitraan/distributor. | Evaluasi Bukti & Konversi Cepat | Landing page korporasi, kalkulator efisiensi tonase sawit, katalog formulasi teknis, formulir kemitraan B2B. |
| **Petani Lapangan & Pelaku Agribisnis** | Mencari solusi darurat atas serangan penyakit/hama di lahan pagi hari (busuk buah, daun keriting, blast, ganoderma). | Pemecahan Masalah Cepat (*Triage*) | Mesin pencari gejala tanaman (*Diagnostic Search*), indeks taksonomi penyakit, kartu dosis cepat (*Quick-Dosage Card*). |
| **Agronom, Peneliti & Hobiis Urban** | Membaca kajian botani mendalam, panduan budidaya presisi (hidroponik, kompos, benih mandiri), serta memvalidasi data sitasi ilmiah. | Membaca Fokus (*Deep Reading*) | Jurnal Agritani bergaya Medium/Substack, daftar isi mengambang (*sticky TOC*), laci referensi jurnal (*DOI accordion*). |

---

## 2. Riset Sistem & Arsitektur Informasi (Hybrid Portal System)

### 2.1. Arsitektur Jalur Navigasi (*Dual-Funnel Routing*)

```
                                [ Header Agritani ]
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
[ Corporate / B2B Path ]                                       [ Knowledge & Journal Path ]
 ├── Visi & Teknologi Imun Imun                                 ├── Diagnostic Triage (Cari Gejala)
 ├── Portofolio Produk (Bensu/Aussie)                          ├── Kategori Komoditas (Sawit, Horti, Pangan)
 ├── Bukti Uji Lapang & Riset Ilmiah                           ├── Ensiklopedia Penyakit & Hama
 └── Registrasi Mitra Distributor                              └── Bank Artikel Sains Pertanian (Medium-style)
```

### 2.2. Sistem Mesin Diagnostik Gejala (*Agronomy Triage Engine*)
Fitur unggulan untuk petani lapangan yang tidak tahu nama latin penyakit tanamannya:
1. **Pilih Tanaman**: Kelapa Sawit | Cabai | Padi | Jagung | Tomat | Sayuran Daun.
2. **Pilih Bagian Tanaman**: Daun | Batang/Pangkal | Buah/Bunga | Akar.
3. **Pilih Gejala Visual**: Misal *"Bercak hitam melingkar basah"* atau *"Daun muda keriting kaku menguning"*.
4. **Hasil Instan**: Diagnosa nama penyakit + Mekanisme patogen + Rekomendasi protokol biologis Agritani + Dosis semprot/kocor.

---

## 3. Design Tokens & Visual Language

Prinsip utama: **Anti-Template, Anti-Slop, dan Ramah Sinar Matahari Lapangan (*Outdoor Sunlight Legibility*)**.

### 3.1. Palet Warna (*Color Tokens*)

```css
:root {
  /* Brand Primary & Backgrounds */
  --color-primary: #132E20;        /* Deep Forest Emerald - Otoritas sains, stabil, tenang */
  --color-primary-light: #1E5E3A;  /* Chlorophyll Green - Aksen subjudul & indikator aktif */
  --color-canvas: #F9F9F6;         /* Warm Ivory Paper - Latar baca artikel anti silau di luar ruangan */
  --color-surface-white: #FFFFFF;  /* Pure White - Kartu data, modal, dan formulir B2B */
  --color-surface-muted: #F1F3ED;  /* Soft Mineral Muted - Blok kutipan & tabel ringkasan */

  /* Text & Contrast (WCAG AAA) */
  --color-text-main: #1A241E;      /* Deep Earth Charcoal - Rasio kontras 14.5:1 terhadap canvas */
  --color-text-muted: #4B5563;     /* Muted Slate - Metadata tanggal, waktu baca, taksonomi */
  --color-text-subtle: #6B7280;    /* Caption & sitasi jurnal */

  /* Accent & Action */
  --color-accent: #C27803;         /* Harvest Amber - Tombol CTA aksi utama, badge penting */
  --color-accent-hover: #9A5B02;   /* Hover state amber */
  --color-border: #E5E7EB;         /* Garis pemisah netral tipis */
  --color-border-active: #1E5E3A;  /* Garis fokus interaktif */

  /* Semantic Alerts */
  --color-alert-danger: #991B1B;   /* Merah marun untuk peringatan patogen ganas/karantina */
  --color-alert-warning: #B45309;  /* Amber untuk peringatan kompatibilitas pestisida */
  --color-alert-success: #15803D;  /* Hijau pupuk untuk rekomendasi organik */
}
```

### 3.2. Tipografi (*Typography Scale & Hierarchy*)

* **Judul Utama & Header Editorial**: Font Serif berbobot akademis (*Newsreader* atau *Merriweather*). Menghadirkan wibawa jurnal riset seperti Nature, Quanta Magazine, atau Medium Staff Picks.
* **Teks Bodi & Antarmuka UI**: Font Humanist Sans (*Plus Jakarta Sans* atau *Inter*). Bersih, bebas lelah, memiliki bentuk huruf terbuka yang mudah dibaca pada layar ponsel petani di bawah sinar matahari langsung.
* **Data Teknis & Formula**: Font Monospace (*JetBrains Mono*). Digunakan untuk rumus kimia ($H_3PO_4$, $K_2O$), rasio NPK (16-16-16), dosis (2 ml/liter), dan fase hari setelah tanam (HST).

```css
/* Typography Scale */
--font-serif: "Newsreader", "Merriweather", Georgia, serif;
--font-sans: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", Menlo, Consolas, monospace;

--text-article-title: clamp(2rem, 3.5vw, 2.75rem); /* 32px - 44px */
--text-h2: clamp(1.5rem, 2.5vw, 2rem);             /* 24px - 32px */
--text-h3: 1.25rem;                                /* 20px */
--text-body: 1.125rem;                              /* 18px Desktop / 16px Mobile */
--line-height-body: 1.75;                          /* Spasi baris lega untuk kenyamanan baca */
--measure-body: 68ch;                              /* Lebar teks ideal 65-72 karakter per baris */
```

---

## 4. Layout & Komposisi Halaman

### 4.1. Halaman Depan Hibrida (*Corporate Hero + Journal Feed*)
* **Bagian 1: Hero Otoritas Sains**: Pernyataan nilai (*Value Proposition*) agribisnis berkelanjutan, aktivasi imunitas tanaman vaskular, dan tombol ganda:
  - CTA Utama: *"Jelajahi Portal Sains Tani"* (Mengarahkan ke bank solusi).
  - CTA Sekunder: *"Kemitraan Distributor B2B"* (Membuka profil korporasi & formulir kontak).
* **Bagian 2: Triage Bar Lapangan**: Bar pencarian interaktif satu baris: *"Apa masalah tanaman Anda hari ini? (contoh: buah cabai busuk hitam, daun sawit kering, padi roboh)"*.
* **Bagian 3: Kurasi Editorial Pilihan (*Editor's Choice / Featured Research*)**: 1 artikel utama berskala besar (bukan kartu 3 kolom seragam) disertai ringkasan eksekutif dan waktu baca.
* **Bagian 4: Klaster Komoditas & Topik**: Tab filter dinamis (Sawit & Perkebunan, Hortikultura & Cabai, Pangan & Padi, Biologi Tanah).
* **Bagian 5: Validasi Ilmiah & Konsorsium**: Statistik pengujian lapangan, daftar institusi riset rujukan (IRRI, MPOB, J. Econ Entomol), tanpa klaim palsu.
* **Bagian 6: Skema Distribusi & Hubungi Tim Agronomis**: Alur kemitraan transparan dengan tautan langsung konsultasi agronomis via WhatsApp.

### 4.2. Pengalaman Membaca Artikel (*Medium/Substack-Style Reading Canvas*)
* **Lebar Teks Terpusat**: Lebar baca persis `68ch` dengan marjin lapang.
* **Sticky Table of Contents (TOC)**: Mengambang elegan di kolom samping (desktop) dengan penanda bab aktif saat digulir.
* **Header Penulis & Akurasi Sains**: Tanggal publikasi, estimasi waktu baca (misal: `7 menit baca`), nama tim agronomis Agritani, dan label peninjauan ilmiah (*Reviewed by Agronomy Board*).
* **Field Summary Box**: Kotak ringkasan praktis di awal artikel ("Takeaway Lapangan"):
  - Hama/Patogen: *Colletotrichum capsici*
  - Gejala Khas: Lesi melingkar hitam konsentris pada buah matang
  - Solusi Utama: Aplikasi Bio-Fungisida + Kalsium Organik pada 07:00 pagi
  - Interval: 5 hari sekali saat curah hujan tinggi
* **Interactive Citation Drawer**: Catatan kaki ilmiah yang dapat diklik untuk membuka ringkasan paper jurnal langsung tanpa meninggalkan artikel.

---

## 5. Komponen Kunci (*Component Contracts*)

### 5.1. Komponen `AgronomyCard` (Kartu Produk & Formulasi)
* Menampilkan nama produk resmi Agritani (Aussie, Bensu, Saratoga, Kojien, Living Water, Vermi Compost).
* Komposisi bahan aktif dan enzim biologi.
* Dosis anjuran per tangki semprot (16 liter) dan metode aplikasi (kocor/semprot).
* Tidak mengandung tombol marketplace pihak ketiga; menyajikan tombol *"Konsultasi Dosis Lahan"* langsung ke agronomis.

### 5.2. Komponen `DiagnosticWidget`
* Filter bersarang 3 tingkat: Komoditas $\rightarrow$ Bagian $\rightarrow$ Gejala.
* Menggunakan pencarian instan berbasis teks tanpa reload halaman (*client-side fuzzy search*).

### 5.3. Komponen `PrintableFieldGuide`
* Mode cetak ramah lembar kerja A4: otomatis menyembunyikan navigasi, header, dan footer saat tombol *"Cetak Panduan Lapangan"* ditekan. Menghasilkan ringkasan 1-2 lembar bersih untuk dibawa ke kebun.

---

## 6. Standar Aksesibilitas & Responsif (*Field Conditions Check*)

1. **Penggunaan Luar Ruangan (*Outdoor Readability*)**: Rasio kontras teks terhadap latar belakang wajib minimal `7:1` (melebihi standar WCAG AAA 4.5:1) untuk memastikan teks terbaca jelas di bawah terik matahari.
2. **Target Sentuh Mobile (*Touch Targets*)**: Seluruh tombol, filter tab, dan tautan memiliki area sentuh minimal `44px x 44px` agar mudah ditekan oleh petani yang mengenakan sarung tangan atau bekerja di lahan.
3. **Ukuran Font Form Input**: Minimal `16px` pada perangkat mobile untuk mencegah auto-zoom paksa pada peramban iOS Safari.
4. **Efisiensi Beban Aset (*Performance Budget*)**:
   - Zero framework overhead berlebih: menggunakan Astro Islands (komponen dinamis hanya dihidrasi saat terlihat/dibutuhkan).
   - Seluruh SVG ikon dimuat inline atau via Lucide Icons lokal.
   - Tanpa skrip pelacak berat pihak ketiga.

---

## 7. Anti-Template & Anti-Slop Audit Checklist

- [x] **Tidak ada grid 3-kartu seragam tanpa tujuan**: Setiap informasi disajikan sesuai fungsinya (tabel agronomi untuk dosis, daftar artikel editorial berbobot untuk riset, split layout untuk heronya).
- [x] **Tidak ada badge dekoratif tanpa konteks**: Badge hanya digunakan untuk kategori komoditas, tingkat keparahan hama (Tinggi/Sedang), dan status peninjauan ilmiah.
- [x] **Tidak ada testimoni fiktif**: Bukti mengandalkan data literatur ilmiah bereputasi (MPOB, IRRI, jurnal internasional) dan protokol lapangan yang dapat diuji mandiri oleh petani.
- [x] **100% Bebas nama kompetitor / pihak ketiga**: Seluruh kepemilikan dan hak cipta berada di bawah PT Agritani Internasional ([agritani.com](https://agritani.com)).
