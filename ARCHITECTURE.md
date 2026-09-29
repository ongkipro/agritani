# System Architecture: Agritani Hybrid Corporate & Portal

> **Entitas**: PT Agritani Internasional ([agritani.com](https://agritani.com))
> **Status**: Accepted architecture (pre-implementation) · revisi 2026-09-29
> **Updated**: 2026-09-29

Belum ada kode. Setelah implementasi dimulai, dokumen ini mencatat apa yang
benar-benar dilakukan kode dan harus diperbarui bila berbeda.

---

## 1. Strategy & Stack

Situs statis penuh (`output: 'static'`), HTML tanpa JS secara bawaan, interaksi kecil sebagai progressive enhancement.

```
docs/content/articles/*.md ─┐
src/data/*.json (produk,    ├─► Astro build (content layer + Zod) ─► dist/ (HTML/CSS/aset)
  gejala)                   ┘                                          │
                                                        pagefind --site dist
                                                                       │
                                                        Cloudflare Workers static assets (DEC-009)
```

| Lapisan | Pilihan | Versi terverifikasi (npm, 2026-09-29) | Alasan |
| :--- | :--- | :--- | :--- |
| Framework | Astro | 7.3.x | Static output, content collections, `astro:assets` |
| Styling | Tailwind CSS via `@tailwindcss/vite` | 4.3.x | Token CSS-first lewat `@theme` di `global.css`; **tanpa** `tailwind.config.mjs` |
| Search | Pagefind | 1.5.x | Indeks statis pasca-build, tanpa server |
| Sitemap | `@astrojs/sitemap` | 3.7.x | REQ-07 |
| Ikon | Lucide (SVG inline / paket Astro yang dipilih saat T-01) | — | Hanya ikon fungsional |
| Structured data | JSON-LD ditulis manual di komponen | — | Tanpa dependensi |
| Hosting | Cloudflare Workers static assets via Wrangler (`wrangler.jsonc`, `assets.directory: "./dist"`) | versi Wrangler dicek saat T-18 | DEC-009; tanpa script Worker di v1 |

Pasang integrasi dengan `npx astro add tailwind sitemap` agar konfigurasi mengikuti versi terpasang. Jangan menyalin konfigurasi Astro 5/Tailwind 3 dari dokumen lama.

Tidak dipakai: React/Vue/Svelte, CMS, database, server runtime, analitik pihak ketiga. Menambah salah satunya butuh entri baru di [DECISIONS.md](DECISIONS.md).

---

## 2. Directory Structure (target)

```
agritani/
├── docs/
│   ├── content/articles/         # SUMBER TUNGGAL 25 artikel (dibaca langsung oleh glob loader)
│   ├── content/*.md              # Naskah profil & content vault (bahan tulis, bukan halaman)
│   └── research/                 # Riset SEO, validasi ilmiah, blueprint (bukan halaman)
├── src/
│   ├── content.config.ts         # Definisi koleksi: articles, products, symptoms, pages
│   ├── data/
│   │   ├── products.json         # 4 produk: aussie, bensu, kojien, saratoga (data resmi; OQ-2)
│   │   ├── symptoms.json         # Dataset diagnosa: komoditas × bagian × gejala → diagnosis
│   │   └── crop-calendars.json   # Kalender tanam per komoditas (ditinjau Prof. Arif)
├── public/wilayah/               # Kode wilayah Kemendagri: provinsi.json, {prov}.json, {kab}.json (dimuat bertahap)
│   ├── components/
│   │   ├── Navbar.astro  Footer.astro  StructuredData.astro
│   │   ├── FieldSummaryBox.astro  ArticleToc.astro  References.astro
│   │   ├── TriageFilter.astro  PartnerForm.astro  ProductRow.astro  SearchBox.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro      # <head>, meta/canonical/OG, font, skip link, header/footer
│   │   └── ArticleLayout.astro   # Kanvas baca, TOC, takeaway, referensi
│   ├── pages/
│   │   ├── index.astro  404.astro  tentang-kami.astro  konsultasi.astro
│   │   ├── alat/index.astro  alat/diagnosa-gejala.astro  alat/kalender-tanam.astro
│   │   ├── kemitraan-distributor.astro  kebijakan-privasi.astro
│   │   ├── produk/index.astro  produk/[slug].astro
│   │   ├── jurnal/index.astro  jurnal/[slug].astro  jurnal/topik/[klaster].astro
│   │   └── penulis/arif-prabowo.astro  cari.astro
│   └── styles/global.css         # @import "tailwindcss"; @theme token DESIGN §3; print CSS
├── public/                       # favicon, robots.txt, font woff2, _headers, _redirects
├── wrangler.jsonc                # Cloudflare Workers static assets (DEC-009)
└── astro.config.mjs
```

`astro.config.mjs`: `trailingSlash: 'always'`, `build.format: 'directory'`, `site: 'https://agritani.com'`. Anatomi halaman: DESIGN §4.2–4.3.

Artikel **tidak** disalin ke `src/content/`. Glob loader membaca `docs/content/articles/` agar hanya ada satu salinan naskah.

---

## 3. Content Contracts (`src/content.config.ts`)

API mengikuti dokumentasi Astro saat ini: `defineCollection` + `glob`/`file` loader, `z` dari `astro/zod`. Frontmatter naskah saat ini (`reading_time: "5 min read"`, `published_date`, `category` teks bebas, `slug`) harus dinormalisasi ke skema ini di T-03.

```ts
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const reference = z.object({
  authors: z.string(),
  year: z.number().int(),
  title: z.string(),
  source: z.string(),               // jurnal / lembaga penerbit
  doi: z.string().optional(),       // hanya jika benar-benar ada
  url: z.string().url().optional(),
});

const articles = defineCollection({
  loader: glob({ pattern: '*.md', base: './docs/content/articles' }),
  schema: z.object({
    title: z.string().min(20).max(70),
    seoTitle: z.string().max(60).optional(),        // bila title terlalu panjang untuk <title>
    description: z.string().min(120).max(160),      // juga dirender sebagai dek
    answer: z.string(),                              // Jawaban Singkat 40–60 kata (DESIGN §4.3.1 blok 7)
    heroImage: z.object({ src: z.string(), alt: z.string().min(5).max(125), credit: z.string() }).optional(),
    slug: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Arif Prabowo'),     // profesor pertanian, penulis & moderator (OQ-4)
    reviewedBy: z.string().optional(),               // hanya bila peninjau berbeda dari penulis
    cluster: z.enum(['sawit', 'pangan', 'hortikultura', 'tanah-nutrisi', 'urban-farming']),
    commodities: z.array(z.string()).min(1),
    focusKeyword: z.string(),
    featured: z.boolean().default(false),
    fieldTakeaways: z.object({
      problem: z.string(),
      typicalSymptom: z.string(),
      recommendedProtocol: z.string(),
      dosagePer16LTank: z.string().optional(),       // tidak boleh diisi tebakan
      applicationTiming: z.string().optional(),
    }).optional(),
    references: z.array(reference).default([]),
    draft: z.boolean().default(false),
  }),
});

const products = defineCollection({
  loader: file('./src/data/products.json'),
  schema: z.object({
    id: z.string(),                                  // slug
    name: z.string(),
    tagline: z.string(),
    commodities: z.array(z.string()).min(1),        // komoditas sasaran dari label/data resmi
    summary: z.string(),
    composition: z.string().optional(),
    applicationMethods: z.array(z.string()),
    dosage: z.string().optional(),
    registrationNumber: z.string().optional(),       // izin edar Kementan (OQ-2)
  }),
});

const symptoms = defineCollection({
  loader: file('./src/data/symptoms.json'),
  schema: z.object({
    id: z.string(),
    commodity: z.string(),
    part: z.enum(['daun', 'batang-pangkal', 'buah-bunga', 'akar']),
    causeType: z.enum(['penyakit', 'hama', 'hara', 'lingkungan']),
    symptom: z.string(),                             // bahasa awam
    diagnosis: z.string(),                           // nama umum
    scientificName: z.string().optional(),
    distinguishingSign: z.string(),                  // pembeda dari diagnosis mirip
    article: z.string(),                             // slug artikel; build gagal jika tidak ada
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string(), description: z.string().min(120).max(160) }),
});

const phase = z.object({
  id: z.string(),                                  // persemaian | vegetatif | generatif | panen | ...
  name: z.string(),
  startDay: z.number().int(),                      // HST, boleh negatif untuk persemaian (T-30)
  endDay: z.number().int(),
  activities: z.array(z.string()).max(4),          // kegiatan agronomi, tanpa merek/dosis pestisida
  watch: z.array(z.object({ name: z.string(), article: z.string().optional() })).default([]),
});

const cropCalendars = defineCollection({
  loader: file('./src/data/crop-calendars.json'),
  schema: z.object({
    id: z.string(),                                // slug komoditas, sama dengan symptoms.commodity
    name: z.string(),
    type: z.enum(['semusim', 'tahunan']),
    cycleDays: z.object({ min: z.number().int(), max: z.number().int() }).optional(),   // semusim
    phases: z.array(phase).default([]),                                                  // semusim
    annualTasks: z.array(z.object({ months: z.array(z.number().int().min(1).max(12)), task: z.string() })).default([]), // tahunan
    seasons: z.array(z.object({ code: z.enum(['MT1', 'MT2', 'MT3']), label: z.string(), plantMonths: z.array(z.number().int()), harvestMonths: z.array(z.number().int()) })).default([]),
    sources: z.array(z.string()).min(1),
    seededFrom: z.string().optional(),             // mis. 'agrimarket docs/spec/KALENDER-TANAM-NASIONAL.md §3.1'
    reviewedBy: z.string().optional(),             // wajib terisi agar tampil (REQ-09)
    reviewedAt: z.coerce.date().optional(),
  }),
});

export const collections = { articles, products, symptoms, pages, cropCalendars };
```

Aturan integritas yang dicek saat build (bukan hanya dokumentasi):

- Setiap `symptoms[].article` menunjuk slug artikel yang ada dan tidak `draft`.
- Artikel non-draft wajib punya ≥ 1 `references` (REQ-05). Selama OQ-3 belum terjawab, artikel tanpa referensi berstatus `draft: true` dan tidak dipublikasikan.
- Slug artikel unik.

---

## 4. Client JavaScript Budget

| Halaman | Script | Batas |
| :--- | :--- | :--- |
| Semua | Toggle menu mobile (jika bukan `<details>`) | < 1 KB |
| `/jurnal/[slug]` | Penanda bagian aktif TOC | < 1 KB |
| `/alat/diagnosa-gejala/` | Filter dataset `symptoms` (data inline JSON) + sinkron URL | < 5 KB + data |
| `/kemitraan-distributor`, `/konsultasi/` | Susun pesan wa.me dari form | < 2 KB |
| `/alat/kalender-tanam/` | Hitung tanggal fase dari HST, buat `.ics` (teks RFC 5545 via `Blob`) | < 6 KB + data komoditas |
| `/alat/cuaca-tani/` | Pemilih wilayah bertingkat + `fetch` BMKG + indikator aplikasi | < 8 KB + JSON wilayah per tingkat |
| `/alat/kalkulator-dosis/` | Rumus dosis, format `Intl.NumberFormat('id-ID')` | < 2 KB |
| Search | Pagefind UI/API dimuat saat kotak cari difokus | lazy |

---

## 5. Trust & Security Boundaries

1. **Tanpa server runtime**: host hanya menyajikan file statis. Tidak ada endpoint yang menerima input.
2. **Formulir kemitraan**: data pengguna tidak meninggalkan peramban kecuali lewat tautan `wa.me` yang dibuka pengguna sendiri. Nilai di-encode dengan `encodeURIComponent`; tidak pernah dirender kembali ke DOM sebagai HTML. Tidak ada webhook di v1 (DEC-006).
3. **Konten**: Markdown dari repositori (tepercaya). Tautan eksternal referensi memakai `rel="noopener"`; tanpa HTML mentah dari sumber luar.
4. **Header keamanan** (`public/_headers`, diterapkan Cloudflare ke respons aset statis): `Content-Security-Policy` tanpa `unsafe-eval`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal.
5. **Privasi**: tanpa cookie dan pelacak pihak ketiga. Bila analitik ditambah kemudian, butuh keputusan baru + pembaruan kebijakan privasi.

---

## 5b. Alat Tani — Data & Integrasi

### Cuaca Tani ↔ BMKG (DEC-014)

- Endpoint publik: `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode}` — tanpa API key; prakiraan 3 hari per 3 jam; batas 60 permintaan/menit/IP; **wajib mencantumkan BMKG sebagai sumber** (data.bmkg.go.id/prakiraan-cuaca, diakses 2026-09-29).
- Diuji 2026-09-29: respons `access-control-allow-origin: *`, `cache-control: public, max-age=3600`, field per slot `local_datetime, t, hu, tp, ws, wd, tcc, weather_desc, vs_text, analysis_date` → **dipanggil langsung dari browser**, tanpa Worker. Setiap pengguna memakai kuotanya sendiri (IP masing-masing).
- Klien menyimpan respons terakhir per `adm4` di `localStorage` (maks 1 jam) agar tidak memanggil ulang saat halaman dibuka lagi; bila gagal, tampilkan state error §2.6.2.
- Indikator aplikasi lapangan = fungsi murni `sprayWindow(slot, thresholds)` dengan `thresholds` dari `src/data/spray-thresholds.json` (bertanda `reviewedBy`; indikator disembunyikan bila kosong, OQ-11). Fungsi ini punya satu tes berbasis tabel kasus.
- Worker proxy hanya ditambahkan bila CORS BMKG berubah atau kuota bermasalah — butuh keputusan baru.

### Data wilayah (kode `adm4`)

- Kode wilayah mengikuti format Kemendagri (`31.71.03.1001`) yang dipakai BMKG.
- Sumber dataset: **dipilih di T-20** dari rilis kode wilayah Kemendagri terbaru atau turunan terbuka yang lisensinya jelas; sumber, versi, dan lisensi dicatat di `public/wilayah/SOURCE.md`. Tidak memakai `province-districts-data.ts` agrimarket (hanya nama kabupaten, sebagian angka dikarang).
- Dipecah statis: `provinsi.json` → `{kode-prov}.json` (kabupaten) → `{kode-kab}.json` (kecamatan + desa), masing-masing target < 40 KB gzip, dimuat saat dipilih.

### Kalender Tanam (DEC-015)

- Data `src/data/crop-calendars.json` disemai dari agrimarket `docs/spec/KALENDER-TANAM-NASIONAL.md` §3 dan `docs/spec/commodities/*.md` §6.1: **hanya** rentang HST, fase, kegiatan agronomi umum, jendela OPT, dan musim MT1–MT3.
- Dibuang saat penyemaian: nama merek/varietas komersial & perusahaan, harga, rekomendasi bahan aktif & dosis pestisida, data kredit/komersial, matriks skenario iklim 2026/2027 (telemetri diketik manual, tanpa sumber live).
- Komoditas awal mengikuti artikel yang ada: padi, jagung, cabai, tomat, bawang merah (semusim) dan kelapa sawit (tahunan). Komoditas lain ditambah setelah ada artikel & tinjauan.
- Tanggal fase = `tanggalTanam + startDay/endDay` (hari kalender, zona waktu lokal perangkat); `.ics` dibuat di klien (VEVENT all-day per fase). Logika tanggal punya satu tes berbasis tabel kasus (termasuk tahun kabisat dan tanggal lampau).
- Tidak ada data pribadi yang diambil dari agrimarket (users, chats, tasks, profil tidak disentuh).

---

## 6. Kesiapan CMS Admin (setelah v1, DEC-012)

v1 tidak punya admin. Aturan berikut berlaku sejak T-01 supaya CMS nanti
hanya menjadi "editor" di atas file yang sudah ada:

1. **Konten di file, bukan di `.astro`.** Semua teks yang kelak diedit non-developer tinggal di koleksi konten: artikel (`docs/content/articles/*.md`), produk (`src/data/products.json`), gejala (`src/data/symptoms.json`), serta teks halaman statis (Tentang Kami, pengantar hub klaster, profil penulis, Kebijakan Privasi) di koleksi `pages` (`src/content/pages/*.md`). Komponen `.astro` hanya berisi struktur dan label UI.
2. **Skema Zod = kontrak CMS.** Field, batas panjang, dan enum di `src/content.config.ts` menjadi sumber definisi form CMS; CMS tidak boleh mengizinkan konten yang gagal build.
3. **Aset di satu folder** (`src/assets/`), direferensikan relatif dari frontmatter, agar media library CMS bisa mengelolanya.
4. **Publikasi lewat build.** Edit CMS → commit/PR ke repo → build statis → deploy. Tidak ada penulisan langsung ke produksi.

Kandidat saat keputusan diambil (belum dievaluasi, versi & API wajib dicek dari dokumentasi resmi saat itu):

| Pendekatan | Contoh kandidat | Cocok bila |
| :--- | :--- | :--- |
| Git-based, admin statis | Decap CMS, Sveltia CMS | Editor sedikit (Prof. Arif, admin Agritani), konten tetap di repo, butuh proxy OAuth GitHub |
| Git-based, terintegrasi Astro | Keystatic, TinaCMS | Butuh pengalaman edit lebih kaya; bisa menambah dependensi React/rute server |
| CMS database (headless) | Payload, Directus, Strapi | Banyak editor, alur persetujuan, penjadwalan; membutuhkan server + database dan memindahkan konten keluar dari repo |

Pertanyaan yang menentukan pilihan (dicatat di PRD OQ-10): siapa editornya, berapa orang, perlu alur tinjau/setujui, perlu jadwal terbit, dan apakah editor mau memakai akun GitHub.
