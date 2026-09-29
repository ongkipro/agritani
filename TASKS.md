# Task Execution Queue: Agritani Hybrid Corporate & Portal

> **Entitas**: PT Agritani Internasional ([agritani.com](https://agritani.com))  
> **Prinsip**: Setiap tugas memiliki **tepat satu Primary Requirement** yang diacu dari [PRD.md](PRD.md). Kebutuhan lain berfungsi sebagai batasan (*constraints*).  
> **Status**: Ready for Execution  

---

## Task Matrix & Tracing

| Task ID | Nama Tugas | Primary Req | Constraints | Risk Level | Status |
| :--- | :--- | :---: | :--- | :---: | :---: |
| **T-01** | Inisialisasi Fondasi Astro 5 + Tailwind & Design Tokens | REQ-08 | REQ-01, REQ-03 | R1 | Pending |
| **T-02** | Konfigurasi Content Collections & Zod Schema Artikel | REQ-03 | REQ-05, REQ-07 | R1 | Pending |
| **T-03** | Migrasi 25 Artikel Agronomi ke Format Content Collections | REQ-03 | REQ-04, REQ-05 | R1 | Pending |
| **T-04** | Pembuatan BaseLayout & Header Navigasi Dual-Funnel | REQ-01 | REQ-08 | R1 | Pending |
| **T-05** | Pembuatan Template Editorial ArticleLayout & Sticky TOC | REQ-03 | REQ-08 | R2 | Pending |
| **T-06** | Pembuatan Komponen FieldSummaryBox (Takeaway Lapangan) | REQ-04 | REQ-08 | R1 | Pending |
| **T-07** | Pembuatan Komponen CitationDrawer (Sitasi Riset Ilmiah) | REQ-05 | REQ-03 | R1 | Pending |
| **T-08** | Pembangunan Homepage Hibrida (Corporate Hero + Journal) | REQ-01 | REQ-03, REQ-08 | R2 | Pending |
| **T-09** | Pembangunan Mesin Triage Diagnosa Gejala Tanaman | REQ-06 | REQ-08 | R2 | Pending |
| **T-10** | Halaman Profil Korporasi & Dewan Riset Sains | REQ-01 | REQ-08 | R1 | Pending |
| **T-11** | Halaman Katalog Produk Formulasi & Lembar Dosis | REQ-01 | REQ-04 | R1 | Pending |
| **T-12** | Funnel Pendaftaran Distributor B2B & Dispatch WhatsApp | REQ-02 | REQ-08 | R1 | Pending |
| **T-13** | Injeksi Otomatis Schema.org JSON-LD (Article, FAQ, HowTo) | REQ-07 | REQ-03 | R1 | Pending |
| **T-14** | Integrasi Mesin Pencari Statis Pagefind (WASM) | REQ-06 | REQ-08 | R2 | Pending |
| **T-15** | Audit Aksesibilitas, Kontras Lapangan, dan Uji Verifikasi | REQ-08 | REQ-01, REQ-07 | R1 | Pending |

---

## Detailed Task Specifications

### T-01 — Inisialisasi Fondasi Astro 5 + Tailwind & Design Tokens
- **Primary requirement:** REQ-08
- **Constraints:** REQ-01, REQ-03
- **Risk Level:** R1
- **Allowed Paths:** `package.json`, `astro.config.mjs`, `tailwind.config.mjs`, `src/styles/global.css`
- **Depends On:** None
- **Done when:** `npm run build` berhasil dijalankan dan berkas `global.css` memuat semua CSS variables warna botani (`--color-primary`, `--color-canvas`, dsb.) serta aturan tipografi `68ch`.

### T-02 — Konfigurasi Content Collections & Zod Schema Artikel
- **Primary requirement:** REQ-03
- **Constraints:** REQ-05, REQ-07
- **Risk Level:** R1
- **Allowed Paths:** `src/content/config.ts`
- **Depends On:** T-01
- **Done when:** `src/content/config.ts` mendefinisikan koleksi `articles` dan `products` dengan validasi Zod lengkap tanpa galat tipe TypeScript.

### T-03 — Migrasi 25 Artikel Agronomi ke Format Content Collections
- **Primary requirement:** REQ-03
- **Constraints:** REQ-04, REQ-05
- **Risk Level:** R1
- **Allowed Paths:** `src/content/articles/*.md`
- **Depends On:** T-02
- **Done when:** Seluruh 25 berkas artikel dari `docs/content/articles/` terpasang di `src/content/articles/` dengan frontmatter YAML valid yang lolos validasi `astro check`.

### T-04 — Pembuatan BaseLayout & Header Navigasi Dual-Funnel
- **Primary requirement:** REQ-01
- **Constraints:** REQ-08
- **Risk Level:** R1
- **Allowed Paths:** `src/layouts/BaseLayout.astro`, `src/components/Navbar.astro`, `src/components/Footer.astro`
- **Depends On:** T-01
- **Done when:** Navbar menampilkan pemisahan jelas antara jalur korporasi (Tentang Kami, Produk, Kemitraan) dan portal sains (Jurnal Tani, Diagnosa Gejala) dengan menu mobile yang ramah sentuhan (min 44px).

### T-05 — Pembuatan Template Editorial ArticleLayout & Sticky TOC
- **Primary requirement:** REQ-03
- **Constraints:** REQ-08
- **Risk Level:** R2
- **Allowed Paths:** `src/layouts/ArticleLayout.astro`, `src/components/StickyTOC.astro`
- **Depends On:** T-03, T-04
- **Done when:** Halaman artikel merender teks bodi dengan lebar pas `68ch`, spasi baris `1.75`, font serif pada judul, dan TOC di sidebar yang menyorot posisi baca saat discroll.

### T-06 — Pembuatan Komponen FieldSummaryBox (Takeaway Lapangan)
- **Primary requirement:** REQ-04
- **Constraints:** REQ-08
- **Risk Level:** R1
- **Allowed Paths:** `src/components/FieldSummaryBox.astro`
- **Depends On:** T-05
- **Done when:** Setiap artikel penyakit tanaman menampilkan kotak ringkasan berlatar kontras tinggi berisi nama patogen, gejala khas, protokol Agritani, dan dosis semprot per tangki 16L.

### T-07 — Pembuatan Komponen CitationDrawer (Sitasi Riset Ilmiah)
- **Primary requirement:** REQ-05
- **Constraints:** REQ-03
- **Risk Level:** R1
- **Allowed Paths:** `src/components/CitationDrawer.astro`
- **Depends On:** T-05
- **Done when:** Bagian akhir artikel menampilkan daftar sitasi jurnal (IRRI, MPOB, dll.) dalam bentuk akordeon interaktif dengan tautan DOI yang dapat diklik.

### T-08 — Pembangunan Homepage Hibrida (Corporate Hero + Journal)
- **Primary requirement:** REQ-01
- **Constraints:** REQ-03, REQ-08
- **Risk Level:** R2
- **Allowed Paths:** `src/pages/index.astro`, `src/components/ArticleCard.astro`
- **Depends On:** T-04, T-05
- **Done when:** Homepage menyajikan pernyataan nilai korporasi Agritani, bar pencarian gejala cepat, 1 artikel unggulan besar, dan grid topik komoditas tanpa menggunakan template bento 3-kartu generik.

### T-09 — Pembangunan Mesin Triage Diagnosa Gejala Tanaman
- **Primary requirement:** REQ-06
- **Constraints:** REQ-08
- **Risk Level:** R2
- **Allowed Paths:** `src/pages/triage.astro`, `src/components/DiagnosticSearch.astro`
- **Depends On:** T-03, T-04
- **Done when:** Pengguna dapat memilih komoditas (Cabai/Sawit/Padi) dan bagian tanaman untuk langsung melihat daftar penyakit yang cocok beserta tautan penanganannya dalam hitungan detik.

### T-10 — Halaman Profil Korporasi & Dewan Riset Sains
- **Primary requirement:** REQ-01
- **Constraints:** REQ-08
- **Risk Level:** R1
- **Allowed Paths:** `src/pages/tentang-kami.astro`
- **Depends On:** T-04
- **Done when:** Halaman menampilkan profil resmi PT Agritani Internasional, filosofi 3 pilar aktivator imun tanaman, dan metodologi verifikasi sains independen.

### T-11 — Halaman Katalog Produk Formulasi & Lembar Dosis
- **Primary requirement:** REQ-01
- **Constraints:** REQ-04
- **Risk Level:** R1
- **Allowed Paths:** `src/pages/produk/index.astro`, `src/pages/produk/[slug].astro`, `src/components/AgronomyCard.astro`
- **Depends On:** T-04
- **Done when:** Halaman produk menampilkan formulasi lengkap (Aussie, Bensu, Saratoga, Kojien, Living Water, Vermi Compost) dengan tabel dosis aplikasi dan tombol konsultasi agronomis via WhatsApp (bebas dari tombol marketplace pihak ketiga).

### T-12 — Funnel Pendaftaran Distributor B2B & Dispatch WhatsApp
- **Primary requirement:** REQ-02
- **Constraints:** REQ-08
- **Risk Level:** R1
- **Allowed Paths:** `src/pages/kemitraan-distributor.astro`, `src/components/B2BContactForm.astro`
- **Depends On:** T-04
- **Done when:** Formulir pendaftaran mitra divalidasi dan menghasilkan pesan terstruktur yang langsung dapat dikirim ke kontak WhatsApp kemitraan Agritani.

### T-13 — Injeksi Otomatis Schema.org JSON-LD (Article, FAQ, HowTo)
- **Primary requirement:** REQ-07
- **Constraints:** REQ-03
- **Risk Level:** R1
- **Allowed Paths:** `src/components/StructuredData.astro`
- **Depends On:** T-05
- **Done when:** Inspeksi HTML pada halaman artikel memuat tag `<script type="application/ld+json">` yang valid dengan skema `Article` dan `FAQPage` sesuai pedoman Google Rich Results.

### T-14 — Integrasi Mesin Pencari Statis Pagefind (WASM)
- **Primary requirement:** REQ-06
- **Constraints:** REQ-08
- **Risk Level:** R2
- **Allowed Paths:** `package.json`, `src/components/SearchModal.astro`
- **Depends On:** T-08, T-09
- **Done when:** Perintah build menghasilkan indeks Pagefind dan input pencarian dapat mengembalikan hasil artikel instan berdasarkan kueri kata kunci petani.

### T-15 — Audit Aksesibilitas, Kontras Lapangan, dan Uji Verifikasi
- **Primary requirement:** REQ-08
- **Constraints:** REQ-01, REQ-07
- **Risk Level:** R1
- **Allowed Paths:** Seluruh berkas `src/`
- **Depends On:** T-01 hingga T-14
- **Done when:** Pemeriksaan kontras warna membuktikan rasio $\ge 7:1$, touch targets $\ge 44\text{px}$, dan audit grep membuktikan 0 kemunculan nama kompetitor/pihak ketiga di seluruh repositori.
