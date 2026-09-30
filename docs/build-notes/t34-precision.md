# T-34 — Konsolidasi, presisi media–teks, kontras hero (2026-09-30)

- Worktree `agritani-launch` (branch `feat/launch-content`) digabung ke `main` di `58f431d`. Konflik hanya di ledger run `RUN-20260930T011952Z-55ecb8c9` (dua jalur menulis run yang sama); salinan jalur main dipakai, `delivery-ledger verify` lulus.
- Presisi baris artikel Beranda (DESIGN §3.3.1), diukur dengan Playwright pada build produksi (bounding box `img`, label `.topic-link`, meta):

| Lebar | Δ tepi atas (gambar vs teks label) | Δ tepi bawah (gambar vs meta) |
| :--- | :--- | :--- |
| 1440 | 0 / 0 / 0 px | 0 / 0 / 1 px |
| 390 | 0 / 0 / 0 px | 0 / 0 / 0 px |

  Sebelum: gambar 128×72 (1440) dan 112×63 (390), teks label turun ±14 px dari tepi gambar, tepi bawah gambar jatuh di tengah judul.
- Kontras teks hero di atas foto (luminans piksel latar di kotak H1 dan paragraf): sebelum median 5,2–6,5 (titik terang ±3,8); sesudah gradien `brand-strong` 95% → 95% di 60% → transparan: median 7,6–7,9 di 1440 & 390 (setara putih di atas `brand-strong`, 7,6).
- Verifikasi: `npx astro check` 0 error, `npm test` 87/87, `npm run build` lulus (SEO, CSP 0/0/0, placeholder, 6.265 tautan internal). Review independen PASS.
