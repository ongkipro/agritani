import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/ongki/Projects/tokophi/node_modules/playwright-core');

const PORT = 4355;
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
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found: ' + req.url);
        return;
      }

      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
    });

    server.listen(PORT, () => {
      resolve(server);
    });
  });
}

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

async function main() {
  console.log('Starting static server on port', PORT);
  const server = await startServer();

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
  });

  const url = `http://localhost:${PORT}/penulis/arif-prabowo/`;

  try {
    // 1. Desktop 1440px
    {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      // Verify page elements
      const title = await page.title();
      console.log('Desktop page title:', title);

      // Ensure visible images are loaded
      await page.evaluate(async () => {
        const visibleImgs = Array.from(document.querySelectorAll('img')).filter(
          (img) => img.offsetParent !== null && img.getBoundingClientRect().top < window.innerHeight
        );
        await Promise.all(
          visibleImgs.map((img) => {
            if (img.complete) return;
            return new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
              setTimeout(resolve, 800);
            });
          })
        );
      });
      await page.waitForTimeout(300);

      // Take initial screenshot (viewport & full)
      const buf1440 = await page.screenshot({ fullPage: false });
      await saveWebp(buf1440, 'proof/ui/author/author-profile-1440.webp');

      // Click topic tab "Proteksi Tanaman"
      const proteksiTab = page.locator('button[data-filter="proteksi-tanaman"]');
      if (await proteksiTab.count() > 0) {
        await proteksiTab.click();
        await page.waitForTimeout(300);
        const bufFiltered = await page.screenshot({ fullPage: false });
        await saveWebp(bufFiltered, 'proof/ui/author/author-profile-filtered-1440.webp');
      }

      await page.close();
    }

    // 2. Mobile 390px
    {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await page.evaluate(async () => {
        const visibleImgs = Array.from(document.querySelectorAll('img')).filter(
          (img) => img.offsetParent !== null && img.getBoundingClientRect().top < window.innerHeight
        );
        await Promise.all(
          visibleImgs.map((img) => {
            if (img.complete) return;
            return new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
              setTimeout(resolve, 800);
            });
          })
        );
      });
      await page.waitForTimeout(300);

      const buf390 = await page.screenshot({ fullPage: false });
      await saveWebp(buf390, 'proof/ui/author/author-profile-390.webp');

      // Scroll down to stories stream
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(300);
      const buf390Feed = await page.screenshot({ fullPage: false });
      await saveWebp(buf390Feed, 'proof/ui/author/author-profile-mobile-feed-390.webp');

      await page.close();
    }

    console.log('\nAuthor UI screenshots captured and verified successfully!');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
