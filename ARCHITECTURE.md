# System Architecture: Agritani Hybrid Corporate & Portal

> **Entitas**: PT Agritani Internasional ([agritani.com](https://agritani.com))  
> **Status**: Accepted Architecture  
> **Updated**: 2026-09-29  

---

## 1. Architectural Strategy & Stack Decisions

Untuk memenuhi kebutuhan performa ekstrem di wilayah pedesaan (*field connectivity*), keamanan tanpa celah, dan efisiensi biaya hosting, Agritani mengadopsi arsitektur **Modern Static-First Jamstack** dengan pemisahan pulau-pulau interaktif (*Islands Architecture*):

```
                                  [ GitHub Repo ]
                                         │
                                [ Build Pipeline ]
              ┌──────────────────────────┼──────────────────────────┐
              ▼                          ▼                          ▼
     [ Astro 5 Core ]          [ Content Collections ]     [ Tailwind CSS ]
   Static Site Generator       25 Markdown Articles +      Design Tokens &
   Zero-JS Baseline            Product Vaults Schema       Editorial Measure
              │                          │                          │
              └──────────────────────────┼──────────────────────────┘
                                         ▼
                            [ Static Dist HTML/CSS/Assets ]
                                         │
                         [ Pagefind WASM Search Indexer ]
                                         │
                                         ▼
                        [ Edge CDN / Host Deployment ]
                       (Cloudflare Pages / Vercel / VPS)
```

### 1.1. Core Tech Stack
* **Framework**: **Astro 5**
  - Mengapa Astro? Menghasilkan HTML statis murni secara bawaan (*Zero JS by default*). Sangat penting bagi petani di pedesaan yang sering kali mengakses web dengan ponsel berspesifikasi rendah dan kuota terbatas.
* **Content Engine**: **Astro Content Collections** (Strict Zod Schema)
  - Seluruh artikel agronomi (`docs/content/articles/`) dan data produk divalidasi tipe datanya saat waktu kompilasi (*build-time type-safety*).
* **Styling**: **Tailwind CSS**
  - Dikonfigurasi dengan token khusus Agritani (warna botani tanah, rasio tipografi clamp, dan spasi baca lega 68ch).
* **Pencarian Statis**: **Pagefind**
  - Mesin pencari full-text statis berbasis WebAssembly (WASM). Sangat ringan (<30KB), berjalan sepenuhnya di sisi klien tanpa server database eksternal.
* **Ikon**: **Lucide Icons**
  - Ikon SVG minimalis, tajam, dan dapat diakses dengan ARIA labels.
* **Metadata & SEO**: **Schema.org JSON-LD Generator**
  - Otomasi pembuatan schema `Article`, `FAQPage`, `HowTo`, dan `Organization` untuk mendominasi Google Featured Snippets (Posisi 0).

---

## 2. Directory Structure & Code Organization

```
/Users/ongki/Projects/agritani/
├── docs/                             # Dokumen Sumber Pengetahuan & Riset
│   ├── content/                      # Content Vaults & Naskah Mentah
│   │   ├── articles/                 # 25 File Naskah Artikel Riset
│   │   ├── company-profile.md        # Naskah Profil Korporasi
│   │   ├── perkebunan-sawit-content-vault.md
│   │   └── hortikultura-urban-farming-content-vault.md
│   └── research/                     # Laporan Riset
│       ├── keywords-masterlist.md    # Masterlist 370 Kata Kunci
│       ├── seo-keyword-research-report.md # Laporan Analisis SEO
│       ├── scientific-validation.md  # Bukti Sitasi Jurnal
│       ├── web-scan.md               # Analisis Produk & Anti-Pemalsuan
│       └── portal-blueprint.md       # Cetak Biru Portal
├── src/
│   ├── components/                   # Komponen UI
│   │   ├── AgronomyCard.astro        # Kartu Formulasi & Produk
│   │   ├── ArticleCard.astro         # Kartu Artikel Editorial
│   │   ├── B2BContactForm.astro      # Form Registrasi Distributor
│   │   ├── CitationDrawer.astro      # Laci Sitasi Riset Ilmiah
│   │   ├── DiagnosticSearch.astro    # Mesin Diagnostik Triage Lapangan
│   │   ├── FieldSummaryBox.astro     # Kotak Takeaway Dosis Cepat
│   │   ├── Footer.astro              # Footer Resmi PT Agritani Internasional
│   │   ├── Navbar.astro              # Header Navigasi Hibrida
│   │   ├── StickyTOC.astro           # Daftar Isi Mengambang
│   │   └── StructuredData.astro      # Injektor Schema.org JSON-LD
│   ├── content/
│   │   ├── config.ts                 # Schema Definisi Zod untuk Artikel & Produk
│   │   └── articles/                 # Koleksi 25 Artikel Terstruktur
│   ├── layouts/
│   │   ├── BaseLayout.astro          # Template Dasar SEO & Global Styles
│   │   ├── ArticleLayout.astro       # Template Khusus Membaca Artikel Sains
│   │   └── CorporateLayout.astro     # Template Khusus Profil Korporasi & B2B
│   ├── pages/
│   │   ├── index.astro               # Homepage Hibrida (Hero + Feed)
│   │   ├── tentang-kami.astro        # Profil Resmi PT Agritani Internasional
│   │   ├── produk/index.astro        # Katalog Formulasi
│   │   ├── produk/[slug].astro       # Spesifikasi Teknis Produk
│   │   ├── jurnal/index.astro        # Direktori Publikasi & Filter Klaster
│   │   ├── jurnal/[slug].astro       # Halaman Artikel Lengkap
│   │   ├── triage.astro              # Mesin Triage Diagnosa Gejala Tanaman
│   │   └── kemitraan-distributor.astro # Registrasi Distributor Resmi
│   └── styles/
│       └── global.css                # CSS Variables, Tipografi, Print Stylesheet
├── public/                           # Aset Statis (Favicon, Logo, Peta Lahan)
├── astro.config.mjs                  # Konfigurasi Astro
├── tailwind.config.mjs               # Konfigurasi Tema Tailwind
├── tsconfig.json                     # Konfigurasi TypeScript
├── PRD.md                            # Kontrak Kebutuhan Produk
├── DESIGN.md                         # Spesifikasi UI/UX & Design Tokens
├── TASKS.md                          # Antrean Eksekusi Tugas Bertahap
├── STATUS.md                         # Status Eksekusi Proyek
└── README.md                         # Dokumentasi Master Repositori
```

---

## 3. Data Schema & Content Contracts (`src/content/config.ts`)

Skema validasi Zod untuk artikel agronomi:

```typescript
import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default('Tim Agronomi Agritani'),
    reviewedBy: z.string().default('Dewan Pakar Agrikultur PT Agritani Internasional'),
    category: z.enum(['sawit', 'pangan', 'hortikultura', 'tanah-nutrisi', 'urban-farming']),
    commodity: z.string(),
    focusKeyword: z.string(),
    secondaryKeywords: z.array(z.string()),
    targetPathogen: z.string().optional(),
    readingTime: z.number().default(5),
    featured: z.boolean().default(false),
    fieldTakeaways: z.object({
      pathogenOrProblem: z.string(),
      typicalSymptom: z.string(),
      recommendedProtocol: z.string(),
      sprayDosagePer16LTank: z.string(),
      bestApplicationTime: z.string(),
    }).optional(),
    citations: z.array(z.object({
      authors: z.string(),
      year: z.number(),
      title: z.string(),
      journalOrInstitution: z.string(),
      doiOrUrl: z.string().optional(),
    })).default([]),
  }),
});

export const collections = {
  articles: articlesCollection,
};
```

---

## 4. Keamanan & Batasan Sistem (*Trust & Security Boundaries*)

1. **Static Delivery Security**: Seluruh halaman dirender ke HTML statis. Tidak ada server runtime yang mengeksekusi PHP/Node secara dinamis di publik, sehingga mengeliminasi risiko Remote Code Execution (RCE), SQL Injection, dan DDoS komputasi database.
2. **B2B Ingestion Sanitization**: Formulir pendaftaran mitra divalidasi ketat di sisi klien, disanitasi dari tag skrip berbahaya (XSS), dan langsung disalurkan via WhatsApp Click-to-Chat terenkripsi atau webhook endpoint yang aman.
3. **Privasi Data Petani**: Tidak ada pelacakan pihak ketiga (*third-party cookies*) yang membagikan data lokasi atau nomor kontak pengguna ke jaringan periklanan luar.
