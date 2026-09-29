# Sumber Data Wilayah Administratif Indonesia (Kode adm4)

Dokumen ini mencatat sumber, lisensi, struktur data, dan kepatuhan anggaran ukuran untuk dataset kode wilayah bertingkat yang digunakan oleh alat **Cuaca Tani** (`/alat/cuaca-tani/`) per ARCHITECTURE §5b dan TASKS.md T-20.

## 1. Sumber Primer

- **Basis Data Resmi:** Kementerian Dalam Negeri Republik Indonesia (Kemendagri)
- **Regulasi:** Keputusan Menteri Dalam Negeri (Kepmendagri) No. 300.2.2-2430 Tahun 2025 (arsip 2022: No. 100.1.1-6117) tentang Pemberian dan Pemutakhiran Kode, Data Wilayah Administrasi Pemerintahan, dan Pulau.
- **Repositori Turunan Terbuka:** [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah) (file: `db/wilayah.sql`)
- **Commit SHA Sumber:** `0d1237a5eef926629c69d287cf2282006144f4fa` (diunduh pada 2026-09-29)
- **Lisensi:** MIT License (Copyright © 2025 cahya dsn)
- **Validasi Integrasi BMKG:** 40 dari 40 sampel kode `adm4` acak dari dataset ini (mencakup 83.202 desa/kelurahan) telah diuji dan divalidasi berhasil mengembalikan respons 200 dengan payload data cuaca lengkap dari API BMKG pada 2026-09-29.

## 2. Relevansi dengan API BMKG

API Publik BMKG (`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode}`) mewajibkan parameter `adm4` yang mengacu pada kode wilayah tingkat IV Kemendagri bertitik:
- `adm1` (Provinsi): 2 digit (contoh: `32` untuk Jawa Barat)
- `adm2` (Kabupaten/Kota): 2 digit bertitik (contoh: `32.04` untuk Kabupaten Bandung)
- `adm3` (Kecamatan): 2 digit bertitik (contoh: `32.04.10` untuk Kecamatan Margaasih)
- `adm4` (Desa/Kelurahan): 4 digit bertitik (contoh: `32.04.10.2001` untuk Desa Margaasih)

Format kode pada dataset ini 100% identik dengan format yang diterima oleh endpoint BMKG tanpa translasi atau transformasi tambahan.

## 3. Arsitektur Pemecahan Bertingkat (Tiered Loading)

Untuk meminimalkan konsumsi kuota data petani di lapangan, data wilayah dipecah menjadi file statis JSON bertingkat:
1. `public/wilayah/provinsi.json`: Daftar 38 provinsi di Indonesia (±2 KB).
2. `public/wilayah/{kode-prov}.json`: Daftar kabupaten/kota dalam provinsi tersebut (rata-rata 1–4 KB).
3. `public/wilayah/{kode-kab}.json`: Struktur lengkap kecamatan dan seluruh desa/kelurahan dalam kabupaten tersebut.

Saat pengguna memilih Kabupaten, browser hanya mengunduh 1 file detail kabupaten. Pemilihan Kecamatan dan Desa selanjutnya berjalan instan di memori peramban tanpa panggilan jaringan tambahan.

## 4. Anggaran Performa (Performance Budget)

- **Batas Anggaran:** < 40 KB gzip per file (TASKS.md T-20).
- **Hasil Audit Pembuatan:**
  - Total entitas wilayah: 91.162
  - Jumlah file kabupaten: 514
  - File kabupaten terbesar: `11.08.json` (Kabupaten Aceh Utara, memiliki 27 kecamatan dan 852 desa) dengan ukuran **7.27 KB gzip** (36.4 KB uncompressed).
  - Rata-rata ukuran file kabupaten: 1.5 – 3.5 KB gzip.
  - Status Anggaran: **LULUS (100% di bawah batas 40 KB gzip)**.
