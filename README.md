# Agritani — Hybrid Corporate Profile & Agriculture Science Portal

> **Status:** Active | **Repo:** [ongkipro/agritani](https://github.com/ongkipro/agritani)  
> **Entitas Resmi:** PT Agritani Internasional ([agritani.com](https://agritani.com))  
> **Stack:** Astro 7 / Tailwind CSS 4 / Content Layer / Pagefind / Schema.org JSON-LD  
> **Updated:** 2026-09-29  

---

## 🌾 Ikhtisar Proyek

**Agritani** adalah portal pertanian yang dikelola resmi oleh Arif Prabowo (Konsultan Pertanian Senior) untuk PT Agritani Internasional, dengan empat pilar (DEC-016):
1. **Jurnal Tani** — artikel agronomi berbasis pustaka oleh Arif Prabowo, dengan pengungkapan hubungan komersialnya.
2. **Alat Tani** — Diagnosa Gejala, Kalender Tanam, Cuaca Tani (data BMKG), Kalkulator Dosis; gratis, tanpa akun.
3. **Konsultasi** — tanya langsung ke tim agronomi via WhatsApp dengan pesan terstruktur.
4. **Profil perusahaan** — portal yang bekerja sama dengan brand pupuk & perusahaan pertanian; 4 produk unggulan Agritani (Aussie, BENSU, Kojien, Saratoga) sebagai referensi, kemitraan B2B sebagai sasaran kedua.

---

## 📚 Dokumen Otoritatif Repositori

Setiap dokumen di bawah ini memiliki fungsi spesifik dan merupakan sumber kebenaran (*single source of truth*) untuk domainnya:

- 📋 [**PRD.md**](./PRD.md) — Kontrak kebutuhan produk terstruktur (empat pilar situs, REQ-01 s.d. REQ-12 + REQ-06b, EARS format, proto-persona, non-goals, checklist data pemilik).
- 🎨 [**DESIGN.md**](./DESIGN.md) — Spesifikasi UI/UX, token desain botani, tipografi editorial Newsreader/Plus Jakarta Sans, kontrak perilaku, dan gate bukti UI.
- 🏗️ [**ARCHITECTURE.md**](./ARCHITECTURE.md) — Arsitektur Astro 7 statis, skema content layer 6 koleksi, integrasi BMKG, pencarian Pagefind, dan batas keamanan.
- ✅ [**TASKS.md**](./TASKS.md) — Antrean 26 tugas (T-00 s.d. T-25) dalam 6 milestone, dengan protokol eksekusi dengan penelusuran 1 task = 1 primary requirement.
- 📊 [**STATUS.md**](./STATUS.md) — State machine workflow, status fase saat ini (`READY`), dan bukti verifikasi.
- 📝 [**DECISIONS.md**](./DECISIONS.md) — Daftar keputusan arsitektural yang disepakati.
- 🚀 [**RELEASE.md**](./RELEASE.md) — Batasan rilis dan mitigasi risiko.
- 📡 [**OBSERVABILITY.md**](./OBSERVABILITY.md) — Pemeriksaan pasca rilis.
- 📜 [**BUILD-LOG.md**](./BUILD-LOG.md) — Riwayat build persisten.
- 🤖 [**AGENTS.md**](./AGENTS.md) — Petunjuk kerja agen AI di repositori ini.

---

## 🗂️ Direktori Konten & Bank Riset

- 📄 [`docs/content/articles/`](./docs/content/articles/) — Bank 150 naskah artikel agronomi (6 topik); terbit bertahap setelah pustaka & Jawaban Singkat lengkap.
- 🌿 [`docs/content/perkebunan-sawit-content-vault.md`](./docs/content/perkebunan-sawit-content-vault.md) — Bank pengetahuan agronomi perkebunan kelapa sawit & Ganoderma.
- 🍅 [`docs/content/hortikultura-urban-farming-content-vault.md`](./docs/content/hortikultura-urban-farming-content-vault.md) — Bank pengetahuan hortikultura & urban farming.
- 🏢 [`docs/content/company-profile.md`](./docs/content/company-profile.md) — Naskah resmi profil korporasi PT Agritani Internasional.
- 🔍 [`docs/research/seo-keyword-research-report.md`](./docs/research/seo-keyword-research-report.md) — Laporan riset kata kunci SEO, search intent, dan pemetaan PAA.
- 📑 [`docs/research/keywords-masterlist.md`](./docs/research/keywords-masterlist.md) — Masterlist taksonomi 370 kata kunci pertanian Indonesia.
- 🔬 [`docs/research/scientific-validation.md`](./docs/research/scientific-validation.md) — Validasi literatur ilmiah (IRRI, MPOB, Frontiers, MDPI, J. Econ. Entomol).
- 🛡️ [`docs/research/web-scan.md`](./docs/research/web-scan.md) — Rangkuman 4 lini produk dan proteksi keaslian (ShieldedTag).
- 🗺️ [`docs/research/portal-blueprint.md`](./docs/research/portal-blueprint.md) — Cetak biru arsitektur jurnal sains tani.
