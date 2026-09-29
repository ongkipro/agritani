/**
 * scripts/to-webp.mjs
 * Processes images using sharp for T-26 dummy assets:
 * Resizes, crops to exact slot aspect ratio, converts to WebP (quality: 72),
 * and verifies file size <= 250 KB.
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export async function processToWebp({ inputBuffer, outputPath, width, height, quality = 72 }) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let currentQuality = quality;
  let attempts = 0;

  while (attempts < 5) {
    await sharp(inputBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: currentQuality, effort: 6 })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    if (stats.size <= 250 * 1024) {
      const sizeKb = (stats.size / 1024).toFixed(1);
      console.log(`[WebP] Created ${path.basename(outputPath)}: ${width}x${height}, ${sizeKb} KB (quality: ${currentQuality})`);
      return { path: outputPath, sizeBytes: stats.size };
    }

    currentQuality -= 5;
    attempts++;
  }

  const finalStats = fs.statSync(outputPath);
  const sizeKb = (finalStats.size / 1024).toFixed(1);
  if (finalStats.size > 250 * 1024) {
    throw new Error(`File size ${sizeKb} KB exceeds 250 KB budget after multiple compression attempts!`);
  }

  return { path: outputPath, sizeBytes: finalStats.size };
}
