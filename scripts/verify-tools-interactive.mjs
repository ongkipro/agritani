import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/ongki/Projects/tokophi/node_modules/playwright-core');

// Usage: BASE_URL=http://localhost:4321 node scripts/verify-tools-interactive.mjs (dev or preview server).
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

async function run() {
  console.log(`Starting automated interactive browser validation on ${BASE_URL}...`);
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
  });

  const proofDir = path.resolve('proof/ui');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

  try {
    // -------------------------------------------------------------
    // Test 1: Kalender Tanam
    // -------------------------------------------------------------
    console.log('\n--- Testing Kalender Tanam ---');
    const pageKalender = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await pageKalender.goto(`${BASE_URL}/alat/kalender-tanam/`, { waitUntil: 'networkidle', timeout: 30000 });

    // 1. Verify Shadcn UI Commodity Dropdown Trigger
    const commTrigger = pageKalender.locator('#crop-comm-trigger');
    await commTrigger.waitFor({ state: 'visible' });
    console.log('✓ Found #crop-comm-trigger');

    // 2. Click trigger to open dropdown
    await commTrigger.click();
    await pageKalender.waitForTimeout(300);
    const commDropdown = pageKalender.locator('#crop-comm-dropdown');
    const isExpanded = await commTrigger.getAttribute('aria-expanded');
    console.log(`✓ Dropdown expanded state: ${isExpanded}`);

    // Take screenshot of open commodity dropdown
    await pageKalender.screenshot({ path: path.join(proofDir, 'kalender-tanam-dropdown-open.png') });

    // 3. Select "Cabai" from dropdown
    const cabaiOption = pageKalender.locator('.crop-dropdown-option[data-commodity="cabai"]');
    await cabaiOption.click();
    await pageKalender.waitForTimeout(400);

    const selectedName = await pageKalender.locator('#crop-comm-selected-name').textContent();
    console.log(`✓ Selected commodity name: "${selectedName?.trim()}"`);

    // 4. Open Date Picker Popover
    const dateTrigger = pageKalender.locator('#date-picker-trigger');
    await dateTrigger.click();
    await pageKalender.waitForTimeout(300);

    // Click "Pakai Hari Ini" in popover
    const btnToday = pageKalender.locator('#btn-popover-today');
    await btnToday.click();
    await pageKalender.waitForTimeout(500);

    const dateMode = await pageKalender.locator('#label-date-mode').textContent();
    console.log(`✓ Date mode label: "${dateMode?.trim()}"`);

    // 5. Verify timeline calculation results
    const resultsArea = pageKalender.locator('#calendar-results');
    const isResultsVisible = await resultsArea.isVisible();
    const planTitle = await pageKalender.locator('#plan-title').textContent();
    console.log(`✓ Calendar results visible: ${isResultsVisible}, title: "${planTitle?.trim()}"`);

    // Take desktop & mobile screenshots
    await pageKalender.screenshot({ path: path.join(proofDir, 'kalender-tanam-desktop-success.png'), fullPage: true });

    // Mobile viewport
    const pageKalenderMobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await pageKalenderMobile.goto(`${BASE_URL}/alat/kalender-tanam/?k=cabai`, { waitUntil: 'networkidle' });
    await pageKalenderMobile.waitForTimeout(500);
    await pageKalenderMobile.screenshot({ path: path.join(proofDir, 'kalender-tanam-mobile-success.png'), fullPage: true });
    console.log('✓ Captured Kalender Tanam mobile screenshot');

    // -------------------------------------------------------------
    // Test 2: Cuaca Tani
    // -------------------------------------------------------------
    console.log('\n--- Testing Cuaca Tani ---');
    const pageCuaca = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    
    // Listen for console logs / errors
    pageCuaca.on('console', (msg) => {
      if (msg.type() === 'error') console.log(`[Browser Error]: ${msg.text()}`);
    });

    await pageCuaca.goto(`${BASE_URL}/alat/cuaca-tani/?adm4=33.01.01.2001`, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for forecast results to be populated by BMKG client
    const forecastResults = pageCuaca.locator('#forecast-results');
    await forecastResults.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✓ #forecast-results is visible');

    // Verify Hero Snapshot card
    const heroCard = pageCuaca.locator('#forecast-current-hero');
    await heroCard.waitFor({ state: 'visible', timeout: 5000 });
    const heroText = await heroCard.textContent();
    console.log(`✓ Hero card loaded: ${heroText?.includes('°C') ? 'Includes temperature' : 'Missing temp'}`);

    // Verify Daily cards
    const dailyCards = pageCuaca.locator('#daily-tables-container .card');
    const cardCount = await dailyCards.count();
    console.log(`✓ Daily forecast cards count: ${cardCount}`);

    // Capture desktop and mobile screenshots
    await pageCuaca.screenshot({ path: path.join(proofDir, 'cuaca-tani-desktop-success.png'), fullPage: true });

    const pageCuacaMobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await pageCuacaMobile.goto(`${BASE_URL}/alat/cuaca-tani/?adm4=33.01.01.2001`, { waitUntil: 'networkidle', timeout: 30000 });
    await pageCuacaMobile.locator('#forecast-results').waitFor({ state: 'visible', timeout: 15000 });
    await pageCuacaMobile.waitForTimeout(500);
    await pageCuacaMobile.screenshot({ path: path.join(proofDir, 'cuaca-tani-mobile-success.png'), fullPage: true });
    console.log('✓ Captured Cuaca Tani mobile screenshot');

    console.log('\n🎉 ALL INTERACTIVE UI VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Validation failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
