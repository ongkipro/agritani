# Catatan Pengerjaan T-33: Aturan Tautan Keluar & Status Tautan (Hover/Active)

Tanggal: 2026-09-30  
Branch: `feat/launch-content`  
Spesifikasi: DESIGN §3.6.1, DESIGN §4.4.12, TASKS T-33  

---

## 1. Rangkuman Implementasi

### (a) Helper Outbound Link (`src/lib/links.ts` & `src/components/ExternalLinkIcon.astro`)
- Dibuat fungsi helper murni `externalLink(kind: LinkKind)`:
  - `reference` (DOI, rujukan ilmiah, BMKG): `target="_blank"`, `rel="noopener"` (dofollow: rujukan editorial terpercaya).
  - `whatsapp` (`wa.me` / `api.whatsapp.com`): `target="_blank"`, `rel="noopener nofollow"`.
  - `sponsored` (mitra komersial): `target="_blank"`, `rel="sponsored noopener"`.
  - `ugc` (konten pengguna jika ada): `target="_blank"`, `rel="nofollow ugc noopener"`.
  - **Larangan `noreferrer`**: Seluruh atribut `noreferrer` dihapus dari kode situs karena `Referrer-Policy: strict-origin-when-cross-origin` sudah melindungi privasi pengguna di level origin, sementara penerima rujukan ilmiah/BMKG berhak mengetahui kunjungan berasal dari agritani.com.
  - Komponen `ExternalLinkIcon.astro` menyediakan ikon `ArrowUpRight` 12px inline SVG dengan `<span class="sr-only">(membuka tab baru)</span>` untuk aksesibilitas WCAG G201.
  - Diterapkan pada: `References.astro`, `ForecastTable.astro`, `cuaca-tani.astro`, `konsultasi.astro`, `Footer.astro`, `ConsultPrompt.astro`, dan `PartnerForm.astro`.

### (b) Plugin Markdown Rehype (`src/lib/rehype-external-links.mjs`)
- Modul plugin HAST/AST murni tanpa dependensi pihak ketiga untuk mentransformasi tag `<a>` eksternal di badan markdown artikel menjadi tautan rujukan ilmiah terstandar (`target="_blank"`, `rel="noopener"`, ikon 12px, sr-only tab notice).

### (c) Label Kategori Topik di Atas Judul (`.topic-link` & `.topic-marker`)
- Menghapus semua `hover:underline` pada badge topik di atas judul.
- Mengimplementasikan kelas `.topic-link` dan `.topic-marker` di `src/styles/global.css`:
  - Kotak penanda berukuran 8px dengan radius 2px (`rounded-[2px]`).
  - Efek hover memanjangkan kotak penanda menjadi bilah 16px via `transform: scaleX(2)` dengan `transform-origin: left center` tanpa layout shift.
  - Teks warna `soil` berubah menjadi warna `text` saat hover; saat ditekan (`:active`) menjadi `brand-strong`.
  - Target sentuh minimal 44px (`min-height: 44px`) diterapkan di `ArticleRow.astro`, `index.astro`, dan `TopicSidebar.astro`.

### (d) Sistem Status Tautan & Interaksi (DESIGN §3.6.1)
- Prosa: `:visited` dibatasi hanya di badan artikel (`.prose a:visited`) dan Daftar Pustaka (`.references-list a:visited`) dengan warna `soil` agar pembaca mengetahui rujukan yang sudah dikunjungi.
- Judul: Diam tanpa garis; hover garis bawah 2px offset 4px warna `brand-strong`; active warna `brand-hover`.
- Tombol: `:active` satu tingkat lebih gelap (brightness 0.90 tanpa pergeseran posisi); `disabled` opasitas 55% + kursor `not-allowed`.
- Motion Guard: Seluruh efek transformasi hover dibungkus dalam `@media (hover: hover)` agar tidak "lengket" di perangkat layar sentuh mobile.
- Aksesibilitas Motion: `@media (prefers-reduced-motion: reduce)` menonaktifkan seluruh transisi gerak.

### (e) Perluasan Skrip Validasi Tautan (`scripts/check-links.mjs`)
- Mengaudit semua file HTML di `dist/`:
  - 2.892 tautan internal diverifikasi ada filenya.
  - 80 tautan keluar diverifikasi mematuhi standar DESIGN §4.4.12:
    - Wajib `target="_blank"`.
    - Wajib `rel` memuat `noopener`.
    - Dilarang memuat `noreferrer`.
    - Tautan WhatsApp wajib memuat `nofollow`.
    - Wajib memuat indikator ramah pembaca layar (screen reader) `(membuka tab baru)`.
    - Dilarang menggunakan URL shortener (`bit.ly`, `tinyurl.com`, dll.).
    - Dilarang menggunakan redirect perantara atau URL yang disamarkan.

---

## 2. Bukti Verifikasi Eksekusi

1. **Astro Type Check (`npx astro check`)**:
   - 87 files diperiksa: 0 error, 0 warning.

2. **Unit Test behavioral (`npm test`)**:
   - 87 tests passed (termasuk 6 suite unit tests di `src/lib/links.test.ts`).

3. **Production Build (`npm run build`)**:
   - `check-commodities`: PASS (150 artikel, 118 penugasan valid).
   - `astro build`: PASS (35 halaman HTML terkompilasi).
   - `pagefind`: PASS (indeks pencarian statis).
   - `check-seo`: PASS (0 error, 0 warning).
   - `check-csp`: PASS (0 inline scripts, 0 on* handlers, 0 style attributes).
   - `check-placeholders`: PASS (bersih dari draf dan placeholder terlarang).
   - `check-links`: PASS (2.892 internal links, 80 outbound links valid).

4. **Bukti Render Visual & Navigasi Keyboard**:
   - `proof/ui/t33/beranda-390.png` (viewport mobile Android 390×844)
   - `proof/ui/t33/beranda-1440.png` (viewport desktop 1440×900)
   - `proof/ui/t33/artikel-390.png`
   - `proof/ui/t33/artikel-1440.png`
   - `proof/ui/t33/keyboard-focus-tab.png` (bukti ring fokus `:focus-visible` 2px–3px solid pada navigasi Tab keyboard)

---

T-33 SIAP REVIEW
