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

async function saveWebp(pngBuffer, outputPath, width) {
  const dir = path.dirname(outputPath);
  await ensureDir(dir);
  await sharp(pngBuffer)
    .webp({ quality: 75 })
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
      console.log(`\n--- Capturing for viewport ${vp.name} (${vp.width}x${vp.height}) ---`);

      // 1. Cuaca Tani - Initial State
      {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`${BASE_URL}/alat/cuaca-tani/`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(500);

        const buf1 = await page.screenshot({ fullPage: true });
        await saveWebp(buf1, `proof/ui/cuaca-tani/cuaca-tani-initial-${vp.name}.webp`, vp.width);

        // Click Provinsi Combobox Trigger to open dropdown showing ~5 items & scrollbar
        const trigger = page.locator('#combobox-trigger-provinsi');
        await trigger.click();
        await page.waitForTimeout(400);

        const buf2 = await page.screenshot({ fullPage: false });
        await saveWebp(buf2, `proof/ui/cuaca-tani/cuaca-tani-dropdown-open-${vp.name}.webp`, vp.width);

        // Search "Jawa" inside the combobox
        const searchInput = page.locator('#combobox-search-provinsi');
        await searchInput.fill('Jawa');
        await page.waitForTimeout(300);

        const buf3 = await page.screenshot({ fullPage: false });
        await saveWebp(buf3, `proof/ui/cuaca-tani/cuaca-tani-dropdown-search-${vp.name}.webp`, vp.width);

        await page.close();
      }

      // 2. Kalkulator Dosis - Initial & Calculated State
      {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`${BASE_URL}/alat/kalkulator-dosis/`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(500);

        const bufInitial = await page.screenshot({ fullPage: true });
        await saveWebp(bufInitial, `proof/ui/kalkulator-dosis/kalkulator-dosis-initial-${vp.name}.webp`, vp.width);

        // Fill inputs: dose 2, click area preset 1 ha, spray preset 300 L/ha
        await page.fill('#input-dose', '2');
        const areaBtn = page.locator('.area-preset-btn', { hasText: '1 ha' });
        await areaBtn.click();
        const sprayBtn = page.locator('.spray-preset-btn', { hasText: '300 L/ha' });
        await sprayBtn.click();

        await page.waitForTimeout(500);

        const bufCalc = await page.screenshot({ fullPage: true });
        await saveWebp(bufCalc, `proof/ui/kalkulator-dosis/kalkulator-dosis-calculated-${vp.name}.webp`, vp.width);

        await page.close();
      }

      // 3. Kalender Tanam - Initial & Selected State
      {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`${BASE_URL}/alat/kalender-tanam/`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(500);

        const bufInitial = await page.screenshot({ fullPage: true });
        await saveWebp(bufInitial, `proof/ui/kalender-tanam/kalender-tanam-initial-${vp.name}.webp`, vp.width);

        // Select Cabai commodity
        const cabaiBtn = page.locator('.crop-comm-btn', { hasText: 'Cabai' });
        if (await cabaiBtn.count() > 0) {
          await cabaiBtn.first().click();
          await page.waitForTimeout(600);

          const bufSelected = await page.screenshot({ fullPage: true });
          await saveWebp(bufSelected, `proof/ui/kalender-tanam/kalender-tanam-cabai-${vp.name}.webp`, vp.width);
        }

        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
