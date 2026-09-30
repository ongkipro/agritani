import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/ongki/Projects/tokophi/node_modules/playwright-core');

const PORT = 4389;
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

const testPages = [
  { name: 'Beranda (Home)', path: '/' },
  { name: 'Tentang Kami', path: '/tentang-kami/' },
  { name: 'Katalog Produk', path: '/produk/' },
  { name: 'Detail Produk Aussie', path: '/produk/aussie/' },
  { name: 'Indeks Jurnal', path: '/jurnal/' },
  { name: 'Topik Proteksi Tanaman', path: '/jurnal/topik/proteksi-tanaman/' },
  { name: 'Artikel Analisis BEP', path: '/jurnal/analisis-break-even-point-bep-usaha-tani-cabai-padi/' },
  { name: 'Alat Cuaca Tani', path: '/alat/cuaca-tani/' },
  { name: 'Profil Arif Prabowo', path: '/penulis/arif-prabowo/' },
];

async function measurePage(browser, pageInfo, viewport) {
  const context = await browser.newContext({
    viewport: viewport,
    userAgent: viewport.isMobile
      ? 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  let totalBytes = 0;
  let requestCount = 0;
  let imageBytes = 0;
  let imageCount = 0;
  const requests = [];

  page.on('response', async (response) => {
    try {
      const buffer = await response.body();
      const size = buffer.length;
      totalBytes += size;
      requestCount++;
      const ct = response.headers()['content-type'] || '';
      if (ct.includes('image')) {
        imageBytes += size;
        imageCount++;
      }
      requests.push({ url: response.url(), status: response.status(), size, ct });
    } catch {
      // Ignore aborts
    }
  });

  // Inject performance observer before navigation
  await page.addInitScript(() => {
    window.__cwv = {
      fcp: null,
      lcp: null,
      lcpElement: null,
      cls: 0,
      clsEntries: [],
    };

    // FCP
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          window.__cwv.fcp = entry.startTime;
        }
      }
    }).observe({ type: 'paint', buffered: true });

    // LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1];
        window.__cwv.lcp = lastEntry.startTime;
        window.__cwv.lcpElement = lastEntry.element ? (lastEntry.element.tagName + (lastEntry.element.className ? '.' + lastEntry.element.className.slice(0, 30) : '')) : 'unknown';
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // CLS
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__cwv.cls += entry.value;
          window.__cwv.clsEntries.push({
            val: entry.value,
            sources: (entry.sources || []).map((s) => (s.node ? s.node.tagName + (s.node.className ? '.' + s.node.className : '') : 'none')),
          });
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  const url = `http://localhost:${PORT}${pageInfo.path}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const cwv = await page.evaluate(() => window.__cwv);
  await context.close();

    return {
      ...pageInfo,
      viewport: `${viewport.width}x${viewport.height}`,
      fcp: cwv.fcp ? Math.round(cwv.fcp) : null,
      lcp: cwv.lcp ? Math.round(cwv.lcp) : null,
      lcpElement: cwv.lcpElement,
      cls: Number(cwv.cls.toFixed(4)),
      clsEntries: cwv.clsEntries,
      requestCount,
      totalKb: Math.round(totalBytes / 1024),
      imageCount,
      imageKb: Math.round(imageBytes / 1024),
    };
}

async function main() {
  const server = await startServer();
  console.log(`Auditing Core Web Vitals on local production server at port ${PORT}...`);

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const mobileViewport = { width: 390, height: 844, isMobile: true };
  const desktopViewport = { width: 1440, height: 900, isMobile: false };

  console.log('\n📱 --- MOBILE VIEWPORT (390px - Low-End / Constrained Profile) ---');
  const mobileResults = [];
  for (const p of testPages) {
    const res = await measurePage(browser, p, mobileViewport);
    mobileResults.push(res);
    console.log(
      `  ✓ ${res.name.padEnd(25)} | FCP: ${String(res.fcp).padStart(4)}ms | LCP: ${String(res.lcp).padStart(4)}ms (${(res.lcpElement || '').slice(0, 20)}) | CLS: ${res.cls.toFixed(4)} | Total: ${String(res.totalKb).padStart(3)} KB (${res.imageKb} KB img)`
    );
    if (res.cls > 0.05) {
      console.log('    Shift entries:', JSON.stringify(res.clsEntries, null, 2));
    }
  }

  console.log('\n💻 --- DESKTOP VIEWPORT (1440px) ---');
  const desktopResults = [];
  for (const p of testPages) {
    const res = await measurePage(browser, p, desktopViewport);
    desktopResults.push(res);
    console.log(
      `  ✓ ${res.name.padEnd(25)} | FCP: ${String(res.fcp).padStart(4)}ms | LCP: ${String(res.lcp).padStart(4)}ms (${(res.lcpElement || '').slice(0, 20)}) | CLS: ${res.cls.toFixed(4)} | Total: ${String(res.totalKb).padStart(3)} KB (${res.imageKb} KB img)`
    );
  }

  await browser.close();
  server.close();

  console.log('\n=== AUDIT CWV SUMMARY ===');
  console.log('Semua halaman diuji di browser Chromium nyata (Google Chrome) dengan metrik navigasi & resource.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
