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
    .webp({ quality: 75 })
    .toFile(outputPath);
  const stat = fs.statSync(outputPath);
  console.log(`[Screenshot] Saved ${path.relative(process.cwd(), outputPath)} (${(stat.size / 1024).toFixed(1)} KB)`);
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 40);
    });
  });
  await page.waitForTimeout(500);
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
      console.log(`\n--- Capturing for viewport ${vp.name} (${vp.width}x${vp.height}) ---`);

      // 1. Katalog /produk/
      {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`${BASE_URL}/produk/`, { waitUntil: 'networkidle', timeout: 30000 });
        await autoScroll(page);

        const buf = await page.screenshot({ fullPage: true });
        await saveWebp(buf, `proof/ui/produk/katalog-${vp.name}.webp`);
        await page.close();
      }

      // 2. Detail /produk/aussie/
      {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`${BASE_URL}/produk/aussie/`, { waitUntil: 'networkidle', timeout: 30000 });
        await autoScroll(page);

        const buf = await page.screenshot({ fullPage: true });
        await saveWebp(buf, `proof/ui/produk/produk-aussie-${vp.name}.webp`);
        await page.close();
      }

      // 3. Detail /produk/kojien/
      {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`${BASE_URL}/produk/kojien/`, { waitUntil: 'networkidle', timeout: 30000 });
        await autoScroll(page);

        const buf = await page.screenshot({ fullPage: true });
        await saveWebp(buf, `proof/ui/produk/produk-kojien-${vp.name}.webp`);
        await page.close();
      }
    }

    // Capture BENSU & Saratoga for 1440
    {
      console.log(`\n--- Capturing BENSU & Saratoga for 1440 ---`);
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      
      await page.goto(`${BASE_URL}/produk/bensu/`, { waitUntil: 'networkidle', timeout: 30000 });
      await autoScroll(page);
      let buf = await page.screenshot({ fullPage: true });
      await saveWebp(buf, `proof/ui/produk/produk-bensu-1440.webp`);

      await page.goto(`${BASE_URL}/produk/saratoga/`, { waitUntil: 'networkidle', timeout: 30000 });
      await autoScroll(page);
      buf = await page.screenshot({ fullPage: true });
      await saveWebp(buf, `proof/ui/produk/produk-saratoga-1440.webp`);

      await page.close();
    }

    console.log('\nAll captures completed successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
