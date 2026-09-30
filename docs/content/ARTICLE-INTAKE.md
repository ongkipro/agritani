# Intake artikel Jurnal Tani (AI atau berkas `.md`)

Berlaku untuk setiap artikel baru atau perubahan artikel, baik ditulis agent AI maupun
disalin dari berkas Markdown. Dasar: DEC-016, DEC-017, DEC-019, DEC-020, DEC-022, AGENTS.md.
Pemeriksaan otomatis: `npm run check:articles` (juga langkah pertama `npm run build`).

## 1. Sebelum menulis

- `git pull --ff-only` dulu (folder artikel juga diedit dari perangkat lain), lalu commit kecil dan push segera.
- Satu berkas per artikel di `docs/content/articles/`, nama `artikel-NNN-{slug}.md` (NNN = nomor berikutnya).
- Jangan mengubah fakta, angka, dosis, rujukan, klaim produk, `draft`, atau `slug` artikel lain tanpa diminta.

## 2. Frontmatter wajib (artikel terbit)

```yaml
---
title: "Judul H1 yang jelas, tanpa klaim berlebihan"
metaTitle: "Judul SEO 44–59 karakter (menjadi 55–70 dengan ' - Agritani')"
description: "Meta description 120–155 karakter, satu kalimat utuh diakhiri titik, berisi kata kunci terkait."
slug: "huruf-kecil-dengan-tanda-hubung"
pubDate: "YYYY-MM-DD"
author: "Arif Prabowo"
topic: "proteksi-tanaman"   # salah satu: proteksi-tanaman, tanah-nutrisi, budidaya, air-irigasi, pascapanen-agribisnis, sains-tanaman
commodities:              # opsional; id dari src/data/commodities.json, harus cocok dengan judul/tag
  - "cabai"
tags:                     # minimal 1, huruf kecil
  - "antraknosa cabai"
references:               # opsional; hanya rujukan nyata dengan doi atau url — jangan dikarang
  - authors: "Nama A, Nama B"
    year: 2022
    title: "Judul makalah"
    source: "Nama jurnal"
    doi: "10.xxxx/xxxx"
draft: false
---
```

## 3. Aturan isi

- **Judul, `metaTitle`, `description`:** tanpa "Rahasia", "Ampuh", "Tuntas", "Jurus", "100%", "Ajaib", "Dijamin/Menjamin", "Pasti", "Selangit", "Cuan", "Sukses", "Super", "Terbukti". Pemisah `-` atau `:`, tidak pernah `|` atau `—`. Kurang panjang → tambah kata kunci terkait (komoditas, gejala, tahap, lokasi), bukan hiperbola.
- **Nama:** "Agritani" / "Agritani Official"; tidak pernah "PT Agritani Internasional". Arif Prabowo = "Konsultan Pertanian Senior", bukan "Prof.".
- **Rujukan:** hanya yang bisa ditelusuri (DOI/URL). Tanpa rujukan boleh terbit (DEC-020); halaman menampilkan "Rujukan ilmiah untuk artikel ini sedang dilengkapi."
- **Badan artikel:** hindari klaim absolut ("100% efektif", "dijamin sembuh"); tidak ada nama merek pihak ketiga di luar daftar pustaka; tidak ada placeholder `TODO(`.
- **Produk Agritani:** tidak menulis dosis atau klaim produk baru; halaman artikel menampilkan kartu produk otomatis dari data produk.
- **Gambar:** hanya WebP (sumber di `src/assets/`); ALT wajib 10–125 karakter dan memuat kata kunci artikel (komoditas/topik + judul). Gambar utama artikel tanpa `heroImage` otomatis memakai foto komoditas/topik dengan ALT dari `articleImageAlt()`. Dicek `npm run check:images` (bagian dari build).
- **Rumus:** LaTeX `$...$` / `$$...$$` dirender otomatis (DEC-018); jangan ubah rumus yang sudah ada kecuali salah.

## 4. Verifikasi sebelum commit

```bash
npm run check:articles   # aturan intake (frontmatter, panjang, kata terlarang, rujukan)
npm test
npm run build            # check-seo (title 55–70, description 120–155), CSP, tautan, owner-rules
```

Semua harus lulus. Lalu buka artikel di `npm run dev` (lebar 390 dan 1440) dan periksa judul, gambar
utama, daftar isi, tag, blok penutup.

## 5. Terbit dan deploy

- `draft: false` = terbit pada deploy berikutnya; `draft: true` = hanya tampil di mode pratinjau.
- Naskah bermasalah isi (salah identifikasi, klaim tanpa sumber) tetap `draft: true` dan dicatat di `docs/build-notes/`.
- Commit hanya berkas artikel yang dikerjakan (tanpa trailer AI), push, lalu deploy mengikuti AGENTS.md (persetujuan pemilik).
