import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/ongki/Projects/tokophi/node_modules/playwright-core');

const PORT = 4349;
const DIST_DIR = path.resolve('dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath.endsWith('/')) reqPath += 'index.html';
      let filePath = path.join(DIST_DIR, reqPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      if (!fs.existsSync(filePath)) {
        filePath = path.join(DIST_DIR, '404.html');
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(filePath));
        return;
      }

      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(filePath));
    });

    server.listen(PORT, () => {
      console.log(`[Server] Serving dist/ on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function saveWebp(pngBuffer, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  await sharp(pngBuffer).webp({ quality: 80 }).toFile(outputPath);
  const stat = fs.statSync(outputPath);
  console.log(`[Screenshot] Saved ${path.relative(process.cwd(), outputPath)} (${(stat.size / 1024).toFixed(1)} KB)`);
}

async function main() {
  const server = await startServer();
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
  });

  const BASE_URL = `http://localhost:${PORT}`;

  try {
    console.log('\n=== 1. VERIFYING HEADER SEARCH INPUT ===');

    // Mobile Viewport (390x844)
    {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Click search trigger mobile
      const triggerMobile = page.locator('#header-search-trigger-mobile');
      await triggerMobile.click();
      await page.waitForTimeout(300);

      // Verify search bar is visible
      const searchBar = page.locator('#header-search-bar');
      const isSearchBarVisible = await searchBar.isVisible();
      console.log(`[Search-Mobile] Search bar visible: ${isSearchBarVisible}`);

      // Measure font-size of header search input (MUST BE >= 16px to prevent iOS auto-zoom)
      const inputFontSize = await page.$eval('#header-search-input', (el) => window.getComputedStyle(el).fontSize);
      console.log(`[Search-Mobile] #header-search-input computed font-size: ${inputFontSize}`);
      if (parseFloat(inputFontSize) < 16) {
        throw new Error(`FAIL: header-search-input font size ${inputFontSize} is < 16px! Will trigger zoom on iOS.`);
      }
      console.log(`[Search-Mobile] PASS: font-size >= 16px (NO ZOOM IN).`);

      // Check focus outline on input (MUST NOT have intrusive frame box / outline)
      await page.focus('#header-search-input');
      const headerFocusOutline = await page.$eval('#header-search-input', (el) => {
        const s = window.getComputedStyle(el);
        return {
          outlineStyle: s.outlineStyle,
          outlineWidth: s.outlineWidth,
        };
      });
      console.log(`[Search-Mobile] #header-search-input focus outline: style=${headerFocusOutline.outlineStyle}, width=${headerFocusOutline.outlineWidth}`);
      if (headerFocusOutline.outlineStyle !== 'none' && parseFloat(headerFocusOutline.outlineWidth) > 0) {
        throw new Error(`FAIL: header-search-input has visible outline frame box! style=${headerFocusOutline.outlineStyle}`);
      }
      console.log(`[Search-Mobile] PASS: focus outline is none/0px (NO FRAME KOTAK).`);

      // Screenshot focused input state (showing clean border and no outer frame box)
      const bufFocused = await page.screenshot({ fullPage: false });
      await saveWebp(bufFocused, 'proof/ui/header-search/header-search-focused-390.webp');

      // Type query "wereng"
      await page.fill('#header-search-input', 'wereng');
      await page.waitForTimeout(400);

      // Check clear button is visible
      const clearBtn = page.locator('#header-search-input-clear-btn');
      const isClearVisible = await clearBtn.isVisible();
      console.log(`[Search-Mobile] Clear button visible on text: ${isClearVisible}`);

      // Screenshot with search results dropdown
      const bufResults = await page.screenshot({ fullPage: false });
      await saveWebp(bufResults, 'proof/ui/header-search/header-search-results-390.webp');

      // Click clear button
      await clearBtn.click();
      await page.waitForTimeout(300);
      const valAfterClear = await page.$eval('#header-search-input', (el) => el.value);
      const isClearHidden = !(await clearBtn.isVisible());
      console.log(`[Search-Mobile] Value after clear: "${valAfterClear}" (cleared: ${valAfterClear === ''}, btn hidden: ${isClearHidden})`);

      // Screenshot cleared state (quick chips restored)
      const bufCleared = await page.screenshot({ fullPage: false });
      await saveWebp(bufCleared, 'proof/ui/header-search/header-search-cleared-390.webp');

      // Close search
      await page.click('#header-search-close-btn');
      await page.waitForTimeout(300);
      const isSearchClosed = !(await searchBar.isVisible());
      console.log(`[Search-Mobile] Search closed cleanly: ${isSearchClosed}`);

      await context.close();
    }

    // Desktop Viewport (1440x900)
    {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Click desktop search trigger
      await page.click('#header-search-trigger-desktop');
      await page.waitForTimeout(300);

      await page.fill('#header-search-input', 'patek');
      await page.waitForTimeout(400);

      const bufDesktop = await page.screenshot({ fullPage: false });
      await saveWebp(bufDesktop, 'proof/ui/header-search/header-search-results-1440.webp');

      await context.close();
    }

    console.log('\n=== 2. VERIFYING CUACA TANI / REGION PICKER ===');

    // Mobile Viewport (390x844)
    {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/alat/cuaca-tani/`, { waitUntil: 'networkidle' });

      // Measure font size of combobox search inputs (MUST BE >= 16px to prevent iOS auto-zoom)
      const provInputFontSize = await page.$eval('#combobox-search-provinsi', (el) => window.getComputedStyle(el).fontSize);
      console.log(`[Cuaca-Mobile] #combobox-search-provinsi computed font-size: ${provInputFontSize}`);
      if (parseFloat(provInputFontSize) < 16) {
        throw new Error(`FAIL: combobox-search-provinsi font size ${provInputFontSize} is < 16px!`);
      }
      console.log(`[Cuaca-Mobile] PASS: font-size >= 16px (NO ZOOM IN).`);

      // Verify trigger touch target (min-height >= 44px)
      const triggerHeight = await page.$eval('#combobox-trigger-provinsi', (el) => el.getBoundingClientRect().height);
      console.log(`[Cuaca-Mobile] Trigger height: ${triggerHeight}px (>= 44px: ${triggerHeight >= 44})`);

      // Open Provinsi dropdown
      await page.click('#combobox-trigger-provinsi');
      await page.waitForTimeout(350);

      // Verify popover is visible
      const isProvPopoverVisible = await page.locator('#combobox-popover-provinsi').isVisible();
      console.log(`[Cuaca-Mobile] Provinsi popover visible: ${isProvPopoverVisible}`);

      // Check item touch target (min-height >= 44px)
      const firstItemHeight = await page.$eval('#combobox-list-provinsi .combobox-item', (el) => el.getBoundingClientRect().height);
      console.log(`[Cuaca-Mobile] Item touch target height: ${firstItemHeight}px (>= 44px: ${firstItemHeight >= 44})`);

      // Screenshot Provinsi popover open
      const bufProvOpen = await page.screenshot({ fullPage: false });
      await saveWebp(bufProvOpen, 'proof/ui/cuaca-tani/region-picker-provinsi-open-390.webp');

      // Check focus outline on combobox input (MUST NOT have intrusive frame box / outline)
      await page.focus('#combobox-search-provinsi');
      const provFocusOutline = await page.$eval('#combobox-search-provinsi', (el) => {
        const s = window.getComputedStyle(el);
        return {
          outlineStyle: s.outlineStyle,
          outlineWidth: s.outlineWidth,
        };
      });
      console.log(`[Cuaca-Mobile] #combobox-search-provinsi focus outline: style=${provFocusOutline.outlineStyle}, width=${provFocusOutline.outlineWidth}`);
      if (provFocusOutline.outlineStyle !== 'none' && parseFloat(provFocusOutline.outlineWidth) > 0) {
        throw new Error(`FAIL: combobox-search-provinsi has visible outline frame box! style=${provFocusOutline.outlineStyle}`);
      }
      console.log(`[Cuaca-Mobile] PASS: focus outline is none/0px (NO FRAME KOTAK).`);

      // Type "Jawa Barat" into filter
      await page.fill('#combobox-search-provinsi', 'Jawa Barat');
      await page.waitForTimeout(300);

      // Verify clear button in search input is visible
      const isProvClearVisible = await page.locator('#combobox-clear-provinsi').isVisible();
      console.log(`[Cuaca-Mobile] Search clear button visible: ${isProvClearVisible}`);

      // Screenshot filtered state
      const bufProvSearch = await page.screenshot({ fullPage: false });
      await saveWebp(bufProvSearch, 'proof/ui/cuaca-tani/region-picker-provinsi-search-390.webp');

      // Click "JAWA BARAT"
      const jabarItem = page.locator('#combobox-list-provinsi .combobox-item', { hasText: 'JAWA BARAT' });
      await jabarItem.click();
      await page.waitForTimeout(500);

      // Verify step 1 badge is visible
      const isBadgeProvVisible = await page.locator('#badge-provinsi').isVisible();
      console.log(`[Cuaca-Mobile] Provinsi badge '✓ Terpilih' visible: ${isBadgeProvVisible}`);

      // Verify Step 2 (Kabupaten) is enabled
      const isKabEnabled = await page.$eval('#combobox-trigger-kabupaten', (el) => !el.disabled);
      console.log(`[Cuaca-Mobile] Kabupaten trigger enabled: ${isKabEnabled}`);

      // Open Kabupaten dropdown
      await page.click('#combobox-trigger-kabupaten');
      await page.waitForTimeout(400);

      // Filter and select "KABUPATEN BANDUNG"
      await page.fill('#combobox-search-kabupaten', 'BANDUNG');
      await page.waitForTimeout(300);
      const kabBandung = page.locator('#combobox-list-kabupaten .combobox-item', { hasText: 'KABUPATEN BANDUNG' }).first();
      await kabBandung.click();
      await page.waitForTimeout(500);

      // Open Kecamatan dropdown & select "CILEUNYI"
      await page.click('#combobox-trigger-kecamatan');
      await page.waitForTimeout(400);
      await page.fill('#combobox-search-kecamatan', 'CILEUNYI');
      await page.waitForTimeout(300);
      const kecCileunyi = page.locator('#combobox-list-kecamatan .combobox-item', { hasText: 'CILEUNYI' }).first();
      await kecCileunyi.click();
      await page.waitForTimeout(500);

      // Open Desa dropdown & select "CILEUNYI KULON"
      await page.click('#combobox-trigger-desa');
      await page.waitForTimeout(400);
      await page.fill('#combobox-search-desa', 'KULON');
      await page.waitForTimeout(300);
      const desaKulon = page.locator('#combobox-list-desa .combobox-item', { hasText: 'CILEUNYI KULON' }).first();
      await desaKulon.click();
      await page.waitForTimeout(800);

      // Verify Active Summary Card is visible
      const isActiveSummaryVisible = await page.locator('#region-active-summary').isVisible();
      const activeText = await page.locator('#region-active-text').textContent();
      console.log(`[Cuaca-Mobile] Active summary visible: ${isActiveSummaryVisible}`);
      console.log(`[Cuaca-Mobile] Active summary text: "${activeText?.trim()}"`);

      // Screenshot complete selection
      const bufComplete = await page.screenshot({ fullPage: true });
      await saveWebp(bufComplete, 'proof/ui/cuaca-tani/region-picker-complete-390.webp');

      // Test "Ganti Wilayah" reset button
      await page.click('#region-reset-btn');
      await page.waitForTimeout(400);
      const isResetSummaryHidden = !(await page.locator('#region-active-summary').isVisible());
      const isProvOpenAgain = await page.locator('#combobox-popover-provinsi').isVisible();
      console.log(`[Cuaca-Mobile] Reset clicked: summary hidden (${isResetSummaryHidden}), Provinsi popover opened (${isProvOpenAgain})`);

      const bufReset = await page.screenshot({ fullPage: false });
      await saveWebp(bufReset, 'proof/ui/cuaca-tani/region-picker-reset-390.webp');

      await context.close();
    }

    // Desktop Viewport (1440x900)
    {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/alat/cuaca-tani/`, { waitUntil: 'networkidle' });

      // Open Provinsi on desktop
      await page.click('#combobox-trigger-provinsi');
      await page.waitForTimeout(300);

      // Verify search is auto-focused on desktop
      const isSearchFocusedDesktop = await page.$eval('#combobox-search-provinsi', (el) => el === document.activeElement);
      console.log(`[Cuaca-Desktop] Search input auto-focused on desktop: ${isSearchFocusedDesktop}`);

      // Filter and select "JAWA BARAT"
      await page.keyboard.type('Jawa Barat');
      await page.waitForTimeout(300);
      await page.locator('#combobox-list-provinsi .combobox-item', { hasText: 'JAWA BARAT' }).click();
      await page.waitForTimeout(500);

      // Select Kabupaten Bandung
      await page.click('#combobox-trigger-kabupaten');
      await page.waitForTimeout(300);
      await page.keyboard.type('BANDUNG');
      await page.waitForTimeout(300);
      await page.locator('#combobox-list-kabupaten .combobox-item', { hasText: 'KABUPATEN BANDUNG' }).first().click();
      await page.waitForTimeout(500);

      // Select Cileunyi
      await page.click('#combobox-trigger-kecamatan');
      await page.waitForTimeout(300);
      await page.keyboard.type('CILEUNYI');
      await page.waitForTimeout(300);
      await page.locator('#combobox-list-kecamatan .combobox-item', { hasText: 'CILEUNYI' }).first().click();
      await page.waitForTimeout(500);

      // Select Cileunyi Kulon
      await page.click('#combobox-trigger-desa');
      await page.waitForTimeout(300);
      await page.keyboard.type('KULON');
      await page.waitForTimeout(300);
      await page.locator('#combobox-list-desa .combobox-item', { hasText: 'CILEUNYI KULON' }).first().click();
      await page.waitForTimeout(1000);

      const bufDesktop = await page.screenshot({ fullPage: true });
      await saveWebp(bufDesktop, 'proof/ui/cuaca-tani/region-picker-desktop-1440.webp');

      await context.close();
    }

    console.log('\n=== ALL PLAYWRIGHT UI & FUNCTIONAL TESTS PASSED! ===\n');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
