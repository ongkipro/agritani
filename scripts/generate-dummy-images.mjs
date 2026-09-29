/**
 * scripts/generate-dummy-images.mjs
 * Downloads and processes 10 royalty-free WebP dummy images for T-26.
 * Generates src/assets/images/dummy/CREDITS.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import { processToWebp } from './to-webp.mjs';

const DUMMY_DIR = path.resolve('src/assets/images/dummy');

const IMAGES = [
  {
    name: 'hero-beranda.webp',
    width: 1600,
    height: 1280,
    ratio: '5:4',
    sourceUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1800&q=80',
    pageUrl: 'https://unsplash.com/photos/green-grass-field-during-daytime-1500382017468-9049fed747ef',
    photographer: 'James Wheeler',
    alt: 'Bentangan lahan pertanian hijau subur tropis di pagi hari',
    description: 'Kolom media hero Beranda (bukan latar di balik teks)',
  },
  {
    name: 'topik-proteksi-tanaman.webp',
    width: 1600,
    height: 900,
    ratio: '16:9',
    sourceUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1800&q=80',
    pageUrl: 'https://unsplash.com/photos/green-leaf-with-water-drops-1588872657578-7efd1f1555ed',
    photographer: 'Egor Kamelev',
    alt: 'Daun tanaman hijau subur dengan perlindungan alami terhadap hama dan penyakit',
    description: 'Header hub topik Proteksi Tanaman',
  },
  {
    name: 'topik-tanah-nutrisi.webp',
    width: 1600,
    height: 900,
    ratio: '16:9',
    sourceUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1800&q=80',
    pageUrl: 'https://unsplash.com/photos/person-holding-soil-1464226184884-fa280b87c399',
    photographer: 'Gabriel Jimenez',
    alt: 'Genggaman tanah humus subur kaya bahan organik dan nutrisi mikroba',
    description: 'Header hub topik Tanah & Nutrisi',
  },
  {
    name: 'topik-budidaya.webp',
    width: 1600,
    height: 900,
    ratio: '16:9',
    sourceUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1800&q=80',
    pageUrl: 'https://unsplash.com/photos/green-plant-growing-on-soil-1523348837708-15d4a09cfac2',
    photographer: 'Markus Spiske',
    alt: 'Tunas bibit tanaman muda bertumbuh sehat pada media tanam gembur',
    description: 'Header hub topik Budidaya',
  },
  {
    name: 'topik-air-irigasi.webp',
    width: 1600,
    height: 900,
    ratio: '16:9',
    sourceUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1800&q=80',
    pageUrl: 'https://unsplash.com/photos/water-canal-in-countryside-1509099836639-18ba1795216d',
    photographer: 'Dan Meyers',
    alt: 'Aliran air jernih pada saluran irigasi persawahan pertanian',
    description: 'Header hub topik Air & Irigasi',
  },
  {
    name: 'topik-pascapanen-agribisnis.webp',
    width: 1600,
    height: 900,
    ratio: '16:9',
    sourceUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=1800&q=80',
    pageUrl: 'https://unsplash.com/photos/fresh-harvest-vegetables-1598170845058-32b9d6a5da37',
    photographer: 'Peter Wendt',
    alt: 'Keranjang hasil panen komoditas pertanian segar siap distribusi',
    description: 'Header hub topik Pascapanen & Agribisnis',
  },
  {
    name: 'topik-sains-tanaman.webp',
    width: 1600,
    height: 900,
    ratio: '16:9',
    sourceUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1800&q=80',
    pageUrl: 'https://unsplash.com/photos/green-leaf-macro-1518531933037-91b2f5f229cc',
    photographer: 'CHUTTERSNAP',
    alt: 'Struktur urat daun hijau makro fotosintesis dan klorofil jaringan tanaman',
    description: 'Header hub topik Sains Tanaman',
  },
  {
    name: 'kemitraan.webp',
    width: 1600,
    height: 1067,
    ratio: '3:2',
    sourceUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1800&q=80',
    pageUrl: 'https://unsplash.com/photos/warehouse-logistics-1586528116311-ad8dd3c8310d',
    photographer: 'Petr Magera',
    alt: 'Gudang distribusi sarana produksi dan logistik rantai pasok agribisnis',
    description: 'Hero halaman Kemitraan Distributor',
  },
  {
    name: 'tentang-kami.webp',
    width: 1600,
    height: 1067,
    ratio: '3:2',
    sourceUrl: 'https://images.unsplash.com/photo-1534710961216-75c88202f43e?w=1800&q=80',
    pageUrl: 'https://unsplash.com/photos/aerial-view-of-green-field-1534710961216-75c88202f43e',
    photographer: 'Caleb Jack',
    alt: 'Lanskap perkebunan dan hamparan vegetasi pertanian tropis Indonesia',
    description: 'Hero halaman Profil Perusahaan Tentang Kami',
  },
  {
    name: 'konsultasi.webp',
    width: 1600,
    height: 1067,
    ratio: '3:2',
    sourceUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=1800&q=80',
    pageUrl: 'https://unsplash.com/photos/crop-inspection-phone-1589923188900-85dae523342b',
    photographer: 'CDC',
    alt: 'Pemeriksaan kondisi tanaman di lahan pertanian bersama tim agronomi',
    description: 'Hero halaman Konsultasi Pertanian',
  },
];

async function main() {
  if (!fs.existsSync(DUMMY_DIR)) {
    fs.mkdirSync(DUMMY_DIR, { recursive: true });
  }

  const results = [];

  for (const item of IMAGES) {
    const destPath = path.join(DUMMY_DIR, item.name);
    console.log(`Downloading ${item.name} from Unsplash...`);
    const res = await fetch(item.sourceUrl);
    if (!res.ok) {
      throw new Error(`Failed to download ${item.name}: ${res.status}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());

    const processed = await processToWebp({
      inputBuffer: buffer,
      outputPath: destPath,
      width: item.width,
      height: item.height,
      quality: 72,
    });

    results.push({ ...item, sizeKb: (processed.sizeBytes / 1024).toFixed(1) });
  }

  // Generate CREDITS.md
  let creditsMd = `# Kredit Aset Gambar Dummy Sementara (T-26 / OQ-5)

> **Status Kolektif**: DUMMY — ganti (OQ-5)  
> **Lisensi**: Unsplash License (Bebas untuk penggunaan komersial dan non-komersial, tanpa royalti)  
> **Tanggal Unduh**: 2026-09-29  
> **Aturan**: Seluruh gambar di bawah ini bersifat sementara untuk kebutuhan pratinjau layout sebelum aset foto asli perkebunan dan kemasan PT Agritani Internasional diserahkan oleh pemilik (OQ-5). Dilarang menyajikan gambar-gambar ini sebagai demplot resmi, foto produk, atau foto profil staf.

| Berkas | Dipakai Di | Ukuran & Rasio | Ukuran Berkas | Fotografer | Tautan Sumber | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

  for (const r of results) {
    creditsMd += `| \`${r.name}\` | ${r.description} | ${r.width}×${r.height} (${r.ratio}) | ${r.sizeKb} KB | ${r.photographer} | [Unsplash](${r.pageUrl}) | DUMMY — ganti (OQ-5) |\n`;
  }

  fs.writeFileSync(path.join(DUMMY_DIR, 'CREDITS.md'), creditsMd, 'utf-8');
  console.log('✅ Successfully generated 10 WebP dummy images and CREDITS.md!');
}

main().catch((err) => {
  console.error('Error generating dummy images:', err);
  process.exit(1);
});
