# Catatan Build T-32 & T-31 — Identitas Baru, AuthorAvatar, Integritas Beranda, OG Images & Gap UI

**Tanggal:** 2026-09-30  
**Tugas:** T-32 & T-31 (Butir 1–3)  
**Kepatuhan:** DEC-016, DESIGN §1.1, §3.5.1, §4.2.3, §4.3.1 (blok 4 & 16), §4.4, REQ-01, REQ-05, REQ-08  
**Status Eksekusi:** Selesai, siap review independen (R2/R3)

---

## 1. Ringkasan Eksekusi DEC-016 (Bagian A–E)

### Bagian A: Pembersihan Identitas & "Prof."
- Menghapus seluruh sebutan "Prof." dan "Profesor" di UI, metadata SEO, skema JSON-LD Person, konten Markdown, serta unit test mock.
- Sebutan resmi diterapkan: **"Konsultan Pertanian Senior · Pengelola Jurnal Tani"**.
- Schema Person di `src/lib/seo.ts` diperbarui: tanpa `honorificPrefix`, `jobTitle: 'Konsultan Pertanian Senior'`, ditautkan ke organisasi via `worksFor: { '@id': 'https://agritani.com/#organization' }`.
- Teks Pengungkapan baku DEC-016 diterapkan seragam di artikel dan profil:
  > *"Artikel ini ditulis oleh Arif Prabowo, konsultan pertanian senior dan pengelola Jurnal Tani. Beliau juga bekerja sebagai sales dan konsultan produk Agritani (Aussie, BENSU, Kojien, Saratoga). Ikuti selalu petunjuk pada label kemasan."*
- Mengubah posisi identitas Agritani: bukan "distributor resmi", melainkan portal pertanian yang dikelola resmi oleh Arif Prabowo untuk PT Agritani Internasional dengan 4 produk unggulan. Kata "distributor resmi" hanya dipakai untuk kemitraan saluran distribusi pihak ketiga.
- Legal footer diperbarui: `© {tahun} PT Agritani Internasional · Portal pertanian dikelola Arif Prabowo`.

### Bagian B: Aset Foto & Komponen AuthorAvatar
- Menempatkan foto asli berlisensi di `src/assets/images/authors/arif-prabowo.webp`.
- Membuat `src/components/AuthorAvatar.astro` dengan pemotongan proporsional persegi (radius 2px), loading eager/lazy otomatis, dan alt text deskriptif ("Foto Arif Prabowo").
- Mengintegrasikan `AuthorAvatar` di:
  - `AuthorByline.astro` (ukuran 40px)
  - `AuthorBio.astro` (ukuran 56px)
  - Profil Penulis `/penulis/arif-prabowo/` (ukuran 96px, `decorative={false}`)
  - Tentang Kami `/tentang-kami/` (ukuran 56px)
  - Blok Pengelola Beranda `/` (ukuran 112px)

### Bagian C: Pembersihan Integritas & Invariant Beranda
- Hapus `<blockquote>` kutipan atas nama Arif Prabowo; diganti kalimat pernyataan faktual: *"Artikel Jurnal Tani yang terbit ditulis dan dimoderasi oleh Arif Prabowo, dan wajib memuat daftar pustaka yang dapat ditelusuri."*
- Hapus klaim tanpa sumber: *"Kurasi 150 Naskah"*, *"Verifikasi Ambang Teknis"*, *"Bebas Klaim Absolut"*.
- Hapus badge *"Dewan Pakar"*; judul section diubah menjadi *"Profil Pengelola: Arif Prabowo & PT Agritani Internasional"*.
- Hapus kata *"garansi/jaminan"*; frasa diubah menjadi *"Keaslian Kemasan ShieldedTag™"*.
- Menghilangkan foto sawah yang dipakai tidak pada tempatnya sebagai ilustrasi segel.
- Pembersihan gaya: radius 2px konsisten (`rounded-[2px]`), tanpa shadow kartu, tanpa garis pembatas antar-section, pergantian latar memakai token semantik (`var(--color-canvas)`, `var(--color-surface)`), dan menghapus `uppercase tracking-wider` dari label atas judul.

### Bagian D: Halaman Produk & Tentang Kami
- `/produk/`: Memperbaiki narasi pembuka menjadi *"Empat produk unggulan Agritani"*.
- `/tentang-kami/`: H1 *"Tentang Agritani"*, penjelasan legalitas PT Agritani Internasional, portal dikelola resmi oleh Arif Prabowo, kerja sama dengan mitra industri saprotan tanpa menyebut nama pihak ketiga (NG-3), mempertahankan asal teknologi Thailand & Jepang.

### Bagian E: Pembuatan Ulang 14 Gambar OG (1200×630)
- Dibuat skrip `scripts/generate-og.mjs` menggunakan `sharp` (transitif).
- Latar warna semantik `--color-brand` (`#1A6335`), logo resmi reverse dari `docs/brand/logo/agritani-logo-reverse.svg`, judul per halaman yang tajam dan proporsional.
- Tanpa label huruf kapital di atas judul (label lama "AGRITANI NUSANTARA" dan "Distributor Resmi" dihapus sepenuhnya).
- Baris penutup bawah: *"agritani.com · Portal pertanian dikelola Arif Prabowo"*.
- Ke-14 file PNG dihasilkan di `public/og/` dengan ukuran 23–39 KB (jauh di bawah batas 150 KB).

---

## 2. Penyelesaian T-31 (Butir 1–3)

- **Konsultasi (`src/pages/konsultasi.astro`):**
  - Menambahkan butir 5 *"Luas Lahan: perkiraan luas petak (m² atau hektar)"* pada daftar persiapan.
  - Menambahkan section *"Sambil menunggu jawaban"* dengan 3 tautan teks baris terbuka (Jurnal Tani, Cuaca Tani, Kalkulator Dosis).
  - Mempertahankan aturan 1 CTA WhatsApp per halaman.
- **Hub Komoditas (`src/pages/jurnal/komoditas/[komoditas].astro`):**
  - Mengelompokkan artikel berdasarkan topik terurut `TOPICS` saat artikel mencakup ≥ 2 topik berbeda.
  - Menambahkan section *"Produk yang relevan"* (maksimal 2 produk unggulan yang relevan dengan komoditas tersebut: Aussie, Kojien, BENSU, Saratoga) dalam bentuk baris terbuka tanpa kartu/CTA WhatsApp.
- **Avatar Inisial / AuthorAvatar:**
  - Telah digantikan oleh foto resmi `AuthorAvatar` dengan radius 2px di seluruh komponen artikel dan profil.

---

## 3. Hasil Verifikasi Teknis

- `npx astro check`: **0 errors, 0 warnings, 4 hints** (PASS)
- `npm test`: **81 tests pass, 0 fail, 13 suites** (PASS)
- `npm run build`:
  - 35 halaman HTML terbangun dalam 2.32 detik
  - Pagefind mengindeks 8 halaman artikel & 1314 kata
  - `check-seo.mjs`: 35 file lolos (0 errors, 0 warnings)
  - `check-csp.mjs`: 35 file lolos audit invariant ketat (0 inline scripts, 0 inline on*=, 0 inline style= — 0/0/0)
  - `check-placeholders.mjs`: 35 file bersih dari placeholder terlarang
  - `check-links.mjs`: seluruh link internal terbukti valid
- Audit larangan kata:
  - `grep -rniE "prof\.|profesor|distributor resmi|nusantara" src public/og` = **0 temuan** (PASS)
  - `grep -nE "uppercase|tracking-wider|rounded-\[4px\]|shadow-|emerald|#F8F9F8" src/pages/index.astro src/components/Navbar.astro src/components/Footer.astro` = **0 temuan** (PASS)

---

## 4. Bukti Render Browser (390px & 1440px)

Tangkapan layar resolusi penuh dihasilkan via `agritani-shot.cjs` pada port statis 4370 dan telah diinspeksi secara visual:

| Halaman | Bukti Desktop (1440px) | Bukti Mobile (390px) | Catatan Visual |
| :--- | :--- | :--- | :--- |
| Beranda (`/`) | `proof/ui/t32/beranda-1440.png` | `proof/ui/t32/beranda-390.png` | Zero card-soup, avatar Arif 112px tajam, 4 produk unggulan rapi, ShieldedTag bersih |
| Profil Penulis (`/penulis/arif-prabowo/`) | `proof/ui/t32/penulis-arif-prabowo-1440.png` | `proof/ui/t32/penulis-arif-prabowo-390.png` | Avatar 96px persegi rapi, bio & pengungkapan baku, load more artikel |
| Detail Artikel (`/jurnal/.../`) | `proof/ui/t32/artikel-antraknosa-1440.png` | `proof/ui/t32/artikel-antraknosa-390.png` | Byline 40px, bio 56px, pengungkapan baku, daftar pustaka DOI aktif |
| Tentang Kami (`/tentang-kami/`) | `proof/ui/t32/tentang-kami-1440.png` | `proof/ui/t32/tentang-kami-390.png` | Narasi legal PT Agritani Internasional & profil pengelola |
| Katalog Produk (`/produk/`) | `proof/ui/t32/produk-1440.png` | `proof/ui/t32/produk-390.png` | 4 produk unggulan, navigasi per komoditas |
| Konsultasi (`/konsultasi/`) | `proof/ui/t32/konsultasi-1440.png` | `proof/ui/t32/konsultasi-390.png` | Luas lahan di daftar persiapan, section sambil menunggu jawaban, 1 CTA WhatsApp |
| Hub Komoditas (`/jurnal/komoditas/cabai/`) | `proof/ui/t32/komoditas-cabai-1440.png` | `proof/ui/t32/komoditas-cabai-390.png` | Artikel terkelompok, produk relevan (BENSU & Saratoga) |

---

## 5. Penyempurnaan Hasil Review Kritis (2026-09-30)

1. **Aset Packshot Produk Unggulan**:
   - Mempertahankan 4 berkas kemasan resmi (`src/assets/images/dummy/produk-{aussie,bensu,kojien,saratoga}.webp`) dan modul `src/lib/product-images.ts` sesuai arahan Paduka Ongki.
   - Kemasan ditampilkan secara proporsional dan elegan di Beranda (`/`), katalog `/produk/`, serta detail produk `/produk/[slug]/`.
2. **Koreksi Angka Manual Panduan**:
   - Menghapus angka statis "29" dan "20" pada Beranda; kini dihitung secara dinamis dari koleksi artikel terbit via `getCommodityArticleCount()` (Padi: 3, Cabai: 3, Jagung: 2).
3. **Pemberantasan CTA WhatsApp di Beranda**:
   - Menghapus seluruh tombol dan ajakan WhatsApp dari Beranda (`/`) per DESIGN §2.8 dan AGENTS.md; digantikan oleh tautan teks navigasi resmi ke `/konsultasi/`.
4. **Alat Tani Berupa Baris Indeks**:
   - Menghapus ikon dekoratif SVG dan grid 4 kartu; diganti baris indeks horizontal terbuka per DESIGN §4.2.3.
5. **Penyempurnaan Footer**:
   - Menghapus klaim aksesibilitas belum terverifikasi ("WCAG AAA 7:1").
   - Menghapus garis pita warna antar-section di atas footer.
   - Memperbarui komentar arsitektur di `Footer.astro`.
6. **Hero Fokus Visual**:
   - Mengembalikan layout editorial masthead dengan fokus visual foto sawah terbuka dan headline proporsional yang tidak mendominasi visual.
7. **Pembersihan Token Warna**:
   - Menghapus seluruh hardcoded hex `#B3261E` dan sejenisnya; beralih 100% ke token CSS `var(--color-topic-...)` dan `var(--color-brand-strong)`.

8. **Penyempurnaan Header & Interaksi Tautan (`.link-more`):**
   - Menghapus frame outline/ring kotak saat tautan/tombol diklik dengan aturan CSS `:focus:not(:focus-visible) { outline: none !important; box-shadow: none !important; }` tanpa mengorbankan aksesibilitas keyboard (`focus-visible`).
   - Memperhalus active dan hover state navbar: mengganti blok abu-abu kaku dengan indikator garis bawah mulus (`scale-x` animation) yang selaras dengan estetika editorial brand.
   - Mengadopsi kelas `.link-more` dengan animasi garis bawah bertransisi halus di berbagai penjuru situs (Alat Tani, Konsultasi, Hub Komoditas, Profil Penulis, dan Baris Artikel Jurnal).
   - Memperkuat ketegasan headline section (`.section-headline`) menggunakan warna teks kaya berbobot 700 dan letter-spacing rapat editorial (`-0.02em`).

---

T-32 SIAP REVIEW ULANG

