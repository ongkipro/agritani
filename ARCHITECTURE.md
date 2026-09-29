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
│   ├── brand/logo/               # Logo "Tunas A" (DEC-013)
│   ├── content/articles/         # SUMBER TUNGGAL artikel (dibaca langsung oleh glob loader)
│   ├── content/*.md              # Naskah profil & content vault (bahan tulis, bukan halaman)
│   └── research/                 # Riset SEO, validasi ilmiah, blueprint (bukan halaman)
├── public/
│   ├── fonts/                    # woff2 self-hosted
│   ├── wilayah/                  # Kode wilayah Kemendagri bertingkat + SOURCE.md (T-20)
│   ├── og/                       # Gambar Open Graph statis 1200×630 (DESIGN §4.4.6)
│   ├── robots.txt  _headers  _redirects  favicon.svg  apple-touch-icon.png
├── scripts/
│   ├── check-contrast.mjs        # T-01
│   ├── check-seo.mjs             # T-13, dijalankan setelah build (DESIGN §4.4.1)
│   └── build-wilayah.mjs         # T-20
├── src/
│   ├── content.config.ts         # Koleksi: commodities, articles, products, symptoms, cropCalendars, pages
│   ├── content/pages/*.md        # Teks halaman statis yang kelak diedit CMS (§6)
│   ├── data/
│   │   ├── commodities.json      # Daftar komoditas bersama (satu sumber slug)
│   │   ├── products.json         # 4 produk: aussie, bensu, kojien, saratoga (OQ-2)
│   │   ├── symptoms.json         # Dataset diagnosa
│   │   ├── crop-calendars.json   # Kalender tanam (T-02 membuat `[]`, T-19 mengisi)
│   │   └── spray-thresholds.json # Ambang indikator Cuaca Tani (§5b)
│   ├── dev/spesimen.astro        # Spesimen token; hanya di-inject saat `astro dev` (T-01)
│   ├── lib/                      # Fungsi murni + tes: seo, content-integrity, reading-time, crop-calendar, ics, bmkg, spray-window, dose, whatsapp
│   ├── components/               # Nama sesuai DESIGN §5
│   ├── layouts/
│   │   ├── BaseLayout.astro      # <head>, meta/canonical/OG, font, skip link, header/footer
│   │   └── ArticleLayout.astro   # Kanvas Jurnal Tani (DESIGN §4.3)
│   ├── pages/
│   │   ├── index.astro  404.astro  tentang-kami.astro  konsultasi.astro  cari.astro
│   │   ├── kemitraan-distributor.astro  kebijakan-privasi.astro
│   │   ├── alat/index.astro  alat/diagnosa-gejala.astro  alat/kalender-tanam.astro
│   │   ├── alat/cuaca-tani.astro  alat/kalkulator-dosis.astro
│   │   ├── produk/index.astro  produk/[slug].astro
│   │   ├── jurnal/index.astro  jurnal/[slug].astro  jurnal/topik/[topik].astro  jurnal/komoditas/[komoditas].astro
│   │   └── penulis/arif-prabowo.astro
│   └── styles/global.css         # @import "tailwindcss"; @theme token DESIGN §3; print CSS
├── astro.config.mjs
└── wrangler.jsonc                # Cloudflare Workers static assets (DEC-009)
```

`astro.config.mjs`: `site: 'https://agritani.com'`, `trailingSlash: 'always'`, `build.format: 'directory'`, `build.inlineStylesheets: 'never'` (CSP tanpa `unsafe-inline`, §5). Spesimen token tidak memakai prefiks `_` (Astro tidak pernah merutekan file `_*`); ia di-inject sebagai rute hanya saat `command === 'dev'` lewat integrasi kecil (`injectRoute`, API dicek saat T-01), sehingga tidak ada di `dist/`.

Artikel **tidak** disalin ke `src/content/`. Glob loader membaca `docs/content/articles/` agar hanya ada satu salinan naskah.

---

## 3. Content Contracts (`src/content.config.ts`)

API mengikuti dokumentasi Astro saat ini: `defineCollection` + `glob`/`file` loader, `z` dari `astro/zod`, `reference()` untuk relasi antarkoleksi, helper `image()` untuk gambar yang diproses `astro:assets`. Detail sintaks dicek terhadap versi terpasang saat T-02.

```ts
import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// Satu sumber slug komoditas (S7): dipakai artikel, produk, gejala, kalender, tombol homepage.
const commodities = defineCollection({
  loader: file('./src/data/commodities.json'),
  schema: z.object({
    id: z.string(),                                  // mis. 'cabai', 'kelapa-sawit', 'padi'
    name: z.string(),                                // 'Cabai'
    group: z.enum(['perkebunan', 'pangan', 'hortikultura', 'urban']),
  }),
});

const reference_ = z.object({
  authors: z.string(),
  year: z.number().int(),
  title: z.string(),
  source: z.string(),                                // jurnal / lembaga penerbit
  doi: z.string().optional(),                        // hanya jika benar-benar ada
  url: z.string().url().optional(),
});

const fieldTakeaways = z.discriminatedUnion('kind', [
  z.object({                                         // artikel penyakit/hama
    kind: z.literal('masalah'),
    problem: z.string(),
    typicalSymptom: z.string(),
    firstStep: z.string(),
    dosagePer16LTank: z.string().optional(),         // hanya dari label/sumber; tidak ditebak
    applicationTiming: z.string().optional(),
  }),
  z.object({                                         // artikel panduan budidaya
    kind: z.literal('panduan'),
    goal: z.string(),
    materials: z.string().optional(),
    keySteps: z.string(),
    timing: z.string().optional(),
  }),
]);

const articles = defineCollection({
  loader: glob({ pattern: '*.md', base: './docs/content/articles' }),
  schema: ({ image }) => z.object({
    title: z.string().min(20).max(110),              // H1; naskah saat ini 73–103 karakter
    metaTitle: z.string().min(30).max(60),           // dari `meta_title` naskah; dipakai apa adanya sebagai <title> artikel (tanpa sufiks)
    description: z.string().min(120).max(160),       // dari `meta_description` naskah; juga dek
    answer: z.string().optional(),                   // Jawaban Singkat 40–60 kata; wajib untuk non-draft (dicek integritas)
    slug: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Arif Prabowo'),
    reviewedBy: z.string().optional(),               // hanya bila peninjau berbeda dari penulis
    topic: z.enum(['proteksi-tanaman', 'tanah-nutrisi', 'budidaya', 'air-irigasi', 'pascapanen-agribisnis', 'sains-tanaman']),
    commodities: z.array(reference('commodities')).min(1),
    tags: z.array(z.string()).min(1),                // kata kunci editorial dari naskah; tags[0] = kata kunci utama (bukan meta keywords)
    featured: z.boolean().default(false),
    heroImage: z.object({ src: image(), alt: z.string().min(5).max(125), credit: z.string() }).optional(),
    fieldTakeaways: fieldTakeaways.optional(),
    references: z.array(reference_).default([]),
    draft: z.boolean().default(true),                // terbit hanya setelah lolos integritas & OQ-3
  }),
});

const products = defineCollection({
  loader: file('./src/data/products.json'),
  schema: ({ image }) => z.object({
    id: z.string(),                                  // aussie | bensu | kojien | saratoga
    name: z.string(),
    tagline: z.string().optional(),                  // hanya tagline yang lolos DESIGN §2.5
    role: z.string(),                                // peran singkat, mis. "Aktivator imun khusus padi"
    commodities: z.array(reference('commodities')).min(1),
    summary: z.string(),
    composition: z.string().optional(),              // sesuai label
    form: z.string().optional(),                     // bentuk sediaan & ukuran kemasan (OQ-2)
    applicationMethods: z.array(z.string()),
    dosage: z.string().optional(),                   // sesuai label (OQ-2)
    registrationNumber: z.string().optional(),       // izin edar Kementan (OQ-2)
    registrationCategory: z.string().optional(),     // pupuk / pembenah tanah / ... (OQ-9)
    authenticityCheck: z.string().optional(),        // cara cek keaslian (OQ-8)
    packshot: image().optional(),                    // foto kemasan asli (OQ-5)
  }),
});

const symptoms = defineCollection({
  loader: file('./src/data/symptoms.json'),
  schema: z.object({
    id: z.string(),
    commodity: reference('commodities'),
    part: z.enum(['daun', 'batang-pangkal', 'buah-bunga', 'akar']),
    causeType: z.enum(['penyakit', 'hama', 'hara', 'lingkungan']),
    symptom: z.string(),                             // bahasa awam
    diagnosis: z.string(),                           // nama umum
    scientificName: z.string().optional(),
    distinguishingSign: z.string(),
    article: z.string(),                             // slug artikel terbit (dicek integritas)
    seededFrom: z.string().optional(),               // mis. 'agrimarket FIELD_PLAYBOOK_DICTIONARY'
    reviewedBy: z.string().optional(),               // wajib agar tampil (DEC-015)
  }),
});

const phase = z.object({
  id: z.string(),                                    // persemaian | vegetatif | generatif | panen | ...
  name: z.string(),
  startDay: z.number().int(),                        // HST; negatif untuk persemaian (mis. -30 = 30 hari sebelum tanam)
  endDay: z.number().int(),
  activities: z.array(z.string()).max(4),            // kegiatan agronomi, tanpa merek/dosis pestisida
  watch: z.array(z.object({ name: z.string(), article: z.string().optional() })).default([]),
});

const cropCalendars = defineCollection({
  loader: file('./src/data/crop-calendars.json'),
  schema: z.object({
    id: z.string(),                                  // slug komoditas; keberadaannya di `commodities` dicek integritas (§3.1)
    type: z.enum(['semusim', 'tahunan']),
    cycleDays: z.object({ min: z.number().int(), max: z.number().int() }).optional(),
    phases: z.array(phase).default([]),
    annualTasks: z.array(z.object({ months: z.array(z.number().int().min(1).max(12)), task: z.string() })).default([]),
    seasons: z.array(z.object({ code: z.enum(['MT1', 'MT2', 'MT3']), label: z.string(), plantMonths: z.array(z.number().int()), harvestMonths: z.array(z.number().int()) })).default([]),
    sources: z.array(z.string()).min(1),
    seededFrom: z.string().optional(),
    reviewedBy: z.string().optional(),               // wajib agar tampil (REQ-09)
    reviewedAt: z.coerce.date().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string(), description: z.string().min(120).max(160), updatedDate: z.coerce.date().optional(), reviewedBy: z.string().optional() }),
});

export const collections = { commodities, articles, products, symptoms, cropCalendars, pages };
```

Catatan: `file()` loader mewajibkan `id` string per entri; karena itu relasi `cropCalendars.id` → `commodities` dicek oleh integritas (§3.1), bukan `reference()`.

### 3.0. Pemetaan naskah → skema (diterapkan T-03)

Naskah di `docs/content/articles/` (150 file per 2026-09-29) memakai frontmatter `title, slug, category, author, reading_time, published_date, source, tags, meta_title, meta_description`.

| Naskah | Skema | Aturan |
| :--- | :--- | :--- |
| `meta_title` (45–59 karakter) | `metaTitle` | Dipakai apa adanya sebagai `<title>` |
| `meta_description` (124–155) | `description` | Juga dek artikel |
| `tags` | `tags` | Urutan dipertahankan; `tags[0]` = kata kunci utama |
| `published_date` | `pubDate` | — |
| `author: "Tim Riset Agronomi Agritani"` | `author: "Arif Prabowo"` | Keputusan penulis (OQ-4) |
| `category` (47 variasi) | `topic` (6) + `commodities` | Tabel di bawah; komoditas diisi dari isi artikel |
| `reading_time`, `source` | — | Dihapus; waktu baca dihitung |

| `topic` | Kategori naskah yang dipetakan | Artikel |
| :--- | :--- | ---: |
| `budidaya` | Teknik Budidaya & Manajemen Lahan/Pembibitan; Komoditas Pangan, Perkebunan & Hortikultura; Tanaman Pangan & (Budidaya Padi/Palawija/Umbi-Umbian); Perkebunan Kelapa Sawit; Perkebunan & Manajemen Lahan; Hortikultura & (Tanaman Buah/Teknik Budidaya); Teknik Pembenihan & (Agronomi/Pembibitan); Agro-Ekologi & (Budidaya/Teknik Budidaya); Urban Farming & (Hidroponik/Lahan Sempit) | 54 |
| `proteksi-tanaman` | semua kategori Hama…, Patologi Tanaman…, Pengendalian Hama Terpadu & Bioproteksi, Bioproteksi & Mikrobiologi Tanah, Perkebunan & (Hama/Patologi) Tanaman, Perkebunan Kopi & Patologi, Tanaman Pangan & Hama Lapangan | 35 |
| `tanah-nutrisi` | Ilmu/Sains/Biologi/Kesuburan Tanah…, Nutrisi Tanaman…, Fisiologi Nutrisi Tanaman, Biostimulan & Fisiologi Tanaman | 29 |
| `pascapanen-agribisnis` | Bioteknologi, Agribisnis & Pasca Panen | 14 |
| `air-irigasi` | Manajemen Air & Sistem Irigasi Pertanian | 9 |
| `sains-tanaman` | Fisiologi & Anatomi Tumbuhan; Fisiologi Tanaman & Perawatan | 9 |

Pemetaan kategori adalah titik awal; T-03 boleh memindahkan artikel ke topik yang lebih tepat berdasarkan isinya dan mencatat pengecualiannya di BUILD-LOG.

### 3.1. Integritas konten (dijalankan setiap build dan dev)

`src/lib/content-integrity.ts` mengekspor `assertContentIntegrity()` yang dipanggil di `getStaticPaths` `src/pages/jurnal/[slug].astro` (selalu dieksekusi saat build/dev); galat menggagalkan build dengan nama file:

- Slug artikel unik; `symptoms[].article` menunjuk artikel **terbit**; `cropCalendars[].id` ada di `commodities`.
- Artikel terbit (`draft: false`) wajib: ≥ 1 `references` (REQ-05), `answer` 40–60 kata, `metaTitle` & `description` unik antarartikel, `author` terisi.
- Gejala dan kalender tanpa `reviewedBy` tidak dirender di produksi (bukan galat).
- Di mode pratinjau (§3.2), rujukan ke artikel draft diizinkan dan data tanpa `reviewedBy` ikut dirender dengan label "BELUM DITINJAU".

### 3.2. Mode pratinjau draft

Karena artikel baru terbit setelah pustaka terverifikasi (OQ-3/T-16), UI dikembangkan dan dibuktikan dengan **mode pratinjau**: `PUBLIC_INCLUDE_DRAFTS=true` (hanya untuk `astro dev` dan build pratinjau lokal) merender artikel draft dengan pita "DRAF — belum terbit" dan `noindex`. Build produksi tanpa variabel ini tidak pernah memuat draft. Bukti UI task (DESIGN §10) boleh memakai mode pratinjau; bukti rilis (T-15) harus dari build produksi.

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
4. **Header keamanan** (`public/_headers`, diterapkan Cloudflare ke respons aset statis):
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.bmkg.go.id; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
   X-Content-Type-Options: nosniff
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: camera=(), microphone=(), geolocation=()
   ```
   `'wasm-unsafe-eval'` dan `worker-src 'self' blob:` dibutuhkan Pagefind (pagefind.app/docs/hosting, diakses 2026-09-29); `connect-src` BMKG untuk Cuaca Tani (DEC-014). Konsekuensi: tanpa script inline yang dieksekusi, tanpa atribut `onclick`/`style="…"`, CSS tidak di-inline (`build.inlineStylesheets: 'never'`), inisialisasi Pagefind di file JS sendiri, data untuk script memakai `<script type="application/json">` (data block, tidak dieksekusi). Astro dapat meng-inline script terproses yang kecil; T-18 memeriksa HTML hasil build bahwa tidak ada `<script>` inline yang dieksekusi (selain data block JSON) dan mematikan inlining bila ada. Bila Astro versi terpasang menyediakan CSP berbasis hash bawaan, evaluasi di T-18 sebelum melonggarkan kebijakan.
5. **Privasi**: tanpa cookie dan pelacak pihak ketiga. Pilihan Alat Tani hanya di `localStorage` perangkat; Cuaca Tani mengirim kode `adm4` ke BMKG dari browser pengguna (diungkap di Kebijakan Privasi). Bila analitik ditambah kemudian, butuh keputusan baru + pembaruan kebijakan privasi.

---

## 5b. Alat Tani — Data & Integrasi

### Cuaca Tani ↔ BMKG (DEC-014)

- Endpoint publik: `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode}` — tanpa API key; prakiraan 3 hari per 3 jam; batas 60 permintaan/menit/IP; **wajib mencantumkan BMKG sebagai sumber** (data.bmkg.go.id/prakiraan-cuaca, diakses 2026-09-29).
- Diuji 2026-09-29: respons `access-control-allow-origin: *`, `cache-control: public, max-age=3600`, field per slot `local_datetime, t, hu, tp, ws, wd, tcc, weather_desc, vs_text, analysis_date` → **dipanggil langsung dari browser**, tanpa Worker. Setiap pengguna memakai kuotanya sendiri (IP masing-masing).
- Klien menyimpan respons terakhir per `adm4` di `localStorage` (maks 1 jam) agar tidak memanggil ulang saat halaman dibuka lagi; bila gagal, tampilkan state error §2.6.2.
- Indikator aplikasi lapangan = fungsi murni `sprayWindow(slot, nextSlot, thresholds)` → `{ status: 'layak' | 'hati-hati' | 'tunda', reasons: string[] }`. `thresholds` dari `src/data/spray-thresholds.json`, divalidasi zod di `src/lib/spray-window.ts`:
  ```ts
  z.object({
    rainTundaMm: z.number(),          // tp slot ini atau slot berikut ≥ nilai → Tunda
    windTundaKmh: z.number(),         // ws ≥ nilai → Tunda
    windHatiKmh: z.number(),          // ws ≥ nilai → Hati-hati
    tempHatiC: z.number(),            // t ≥ nilai → Hati-hati
    humidityHatiPct: z.number(),      // hu ≤ nilai → Hati-hati
    reviewedBy: z.string().optional(),
    sources: z.array(z.string()),
  }).nullable()                        // null atau reviewedBy kosong → indikator disembunyikan (OQ-11b)
  ```
  T-02 membuat file berisi `null`. Fungsi punya satu tes berbasis tabel kasus.
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

1. **Konten di file, bukan di `.astro`.** Semua teks yang kelak diedit non-developer tinggal di koleksi konten: artikel (`docs/content/articles/*.md`), produk (`src/data/products.json`), gejala (`src/data/symptoms.json`), serta teks halaman statis (Tentang Kami, pengantar hub topik & komoditas, profil penulis, Kebijakan Privasi) di koleksi `pages` (`src/content/pages/*.md`). Komponen `.astro` hanya berisi struktur dan label UI.
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
