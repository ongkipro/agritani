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

  const targets = [
    {
      slug: 'analisis-break-even-point-bep-usaha-tani-cabai-padi',
      name: 'bep-math-display',
      mathSelector: '.katex',
    },
    {
      slug: 'aplikasi-asam-humat-perbaiki-tanah-bawang-merah',
      name: 'asam-humat-math-inline',
      mathSelector: '.katex',
    },
  ];

  const viewports = [
    { name: '390', width: 390, height: 844 },
    { name: '1440', width: 1440, height: 900 },
  ];

  try {
    for (const target of targets) {
      const url = `http://localhost:${PORT}/jurnal/${target.slug}/`;
      console.log(`\nAuditing target: ${url}`);

      for (const vp of viewports) {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(300);

        // Check for raw $$ in visible text
        const bodyText = await page.innerText('body');
        const hasRawDollarBlock = bodyText.includes('$$');
        console.log(`[${target.name}] [${vp.name}] Raw $$ in body text: ${hasRawDollarBlock}`);
        if (hasRawDollarBlock) {
          throw new Error(`Found raw $$ in visible text for ${target.slug}!`);
        }

        // Count <math> and .katex elements
        const mathCount = await page.locator('math').count();
        const katexCount = await page.locator('.katex').count();
        console.log(`[${target.name}] [${vp.name}] <math> count: ${mathCount}, .katex count: ${katexCount}`);

        // Capture formula specific area or section
        const firstMath = page.locator(target.mathSelector).first();
        if (await firstMath.count() > 0) {
          await firstMath.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);
        }

        const screenshot = await page.screenshot({ fullPage: false });
        await saveWebp(screenshot, `proof/ui/math/${target.name}-${vp.name}.webp`);

        await page.close();
      }
    }
    console.log('\nAll math UI screenshots captured and verified successfully!');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
