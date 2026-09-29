# Decision Register — agritani

Updated: 2026-09-29

Record accepted decisions that materially constrain product behavior,
architecture, security, data, operations, or delivery. Repository evidence must
support each decision; AI output alone is not evidence.

| ID | Status | Decision | Drivers | Evidence | Supersedes |
|---|---|---|---|---|---|
| DEC-001 | ACCEPTED | Mengadopsi Astro 5 (Static Site Generator & Content Collections) | Kecepatan akses sub-detik di jaringan pedesaan (*zero JS by default*), keamanan tanpa server runtime, dan kemudahan authoring Markdown. | Evaluasi performa pedesaan pada [ARCHITECTURE.md](ARCHITECTURE.md) | — |
| DEC-002 | ACCEPTED | Mengadopsi Pagefind (WASM) untuk Pencarian Statis | Mengeliminasi ketergantungan server database eksternal/Elasticsearch, menjaga biaya hosting nol, dan privasi penuh. | Riset mesin pencari statis pada [ARCHITECTURE.md](ARCHITECTURE.md) | — |
| DEC-003 | ACCEPTED | Kanal Komersial B2B & Dispatch WhatsApp (Tanpa Keranjang Belanja Ritel) | Fokus bisnis pada pasokan perkebunan skala besar dan jaringan distributor resmi agrikultur nasional. | Batasan non-goals pada [PRD.md](PRD.md) | — |

Use stable IDs such as `DEC-001`. When a decision needs detailed alternatives or
consequences, record a full ADR in `docs/adr/` and use its ID here as a link,
for example `[ADR-0007](docs/adr/ADR-0007-d1-drizzle-orm.md)`. This file is the
only decision index. Never rewrite history silently: mark the old decision
superseded or deprecated and add the new one.
