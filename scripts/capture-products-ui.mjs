import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/ongki/Projects/tokophi/node_modules/playwright-core');

const PORT = 4330;
const BASE_URL = `http://localhost:${PORT}`;

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function saveWebp(pngBuffer, outputPath) {
  const dir = path.dirname(outputPath);
  await ensureDir(dir);
  await sharp(pngBuffer)
    .webp({ quality: 80 })
    .toFile(outputPath);
  const stat = fs.statSync(outputPath);
  console.log(`[Screenshot] Saved ${path.relative(process.cwd(), outputPath)} (${(stat.size / 1024).toFixed(1)} KB)`);
}

async function run() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
  });

  const viewports = [
    { name: '390', width: 390, height: 844 },
    { name: '1440', width: 1440, height: 900 },
  ];

  try {
    for (const vp of viewports) {
      console.log(`\n--- Capturing Products for viewport ${vp.name} (${vp.width}x${vp.height}) ---`);

      // 1. Katalog /produk/
      {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`${BASE_URL}/produk/`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(500);

        const buf = await page.screenshot({ fullPage: true });
        await saveWebp(buf, `proof/ui/produk/produk-index-${vp.name}.webp`);
        await page.close();
      }

      // 2. Detail /produk/aussie/
      {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`${BASE_URL}/produk/aussie/`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(500);

        const buf = await page.screenshot({ fullPage: true });
        await saveWebp(buf, `proof/ui/produk/produk-aussie-${vp.name}.webp`);
        await page.close();
      }
    }
    console.log('\nAll product screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('[Error]', err);
  process.exit(1);
});
