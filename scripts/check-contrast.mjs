#!/usr/bin/env node

/**
 * scripts/check-contrast.mjs
 * WCAG 2.1 Contrast Ratio Checker for Agritani design tokens
 * Fails if text contrast < 7.0:1 (REQ-08) or non-text control contrast < 3.0:1
 */

const tokens = {
  // Brand
  brand: '#1A6335',
  brandHover: '#14502B',
  brandStrong: '#0F5C33',
  harvest: '#F2B632',
  harvestHover: '#F7C955',
  soil: '#5C3A1E',

  // Surfaces
  canvas: '#F8F8F3',
  surface: '#FFFFFF',
  tint: '#EEF3E6',
  harvestTint: '#FBF3DC',

  // Text
  text: '#16211A',
  textMuted: '#3B4A40',

  // Lines & State
  border: '#E3E6DD',
  borderControl: '#6B7A70',
  danger: '#9B1C1C',

  // Base
  white: '#FFFFFF',
};

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Text pairs: must be >= 7.0:1
const textPairs = [
  { fg: tokens.white, bg: tokens.brand, name: 'white on brand (header/primary btn/footer text & links)' },
  { fg: tokens.white, bg: tokens.brandHover, name: 'white on brandHover' },
  { fg: tokens.brandStrong, bg: tokens.canvas, name: 'brandStrong on canvas' },
  { fg: tokens.brandStrong, bg: tokens.surface, name: 'brandStrong on surface' },
  { fg: tokens.brandStrong, bg: tokens.tint, name: 'brandStrong on tint' },
  { fg: tokens.text, bg: tokens.harvest, name: 'text on harvest (accent btn)' },
  { fg: tokens.text, bg: tokens.harvestHover, name: 'text on harvestHover' },
  { fg: tokens.soil, bg: tokens.canvas, name: 'soil on canvas' },
  { fg: tokens.soil, bg: tokens.surface, name: 'soil on surface' },
  { fg: tokens.soil, bg: tokens.tint, name: 'soil on tint' },
  { fg: tokens.text, bg: tokens.canvas, name: 'text on canvas' },
  { fg: tokens.text, bg: tokens.surface, name: 'text on surface' },
  { fg: tokens.text, bg: tokens.tint, name: 'text on tint' },
  { fg: tokens.textMuted, bg: tokens.canvas, name: 'textMuted on canvas' },
  { fg: tokens.textMuted, bg: tokens.surface, name: 'textMuted on surface' },
  { fg: tokens.textMuted, bg: tokens.tint, name: 'textMuted on tint' },
  { fg: tokens.danger, bg: tokens.canvas, name: 'danger on canvas' },
  { fg: tokens.danger, bg: tokens.surface, name: 'danger on surface' },
  { fg: tokens.danger, bg: tokens.tint, name: 'danger on tint' },
];

// Non-text UI control pairs: must be >= 3.0:1
const indicatorPairs = [
  { fg: tokens.borderControl, bg: tokens.canvas, name: 'borderControl on canvas' },
  { fg: tokens.borderControl, bg: tokens.surface, name: 'borderControl on surface' },
  { fg: tokens.borderControl, bg: tokens.tint, name: 'borderControl on tint' },
  { fg: tokens.harvest, bg: tokens.brand, name: 'harvest on brand (focus ring on header)' },
];

let failed = false;

console.log('--- Checking Text Contrast (min 7.0:1) ---');
for (const { fg, bg, name } of textPairs) {
  const ratio = contrastRatio(fg, bg);
  const ratioStr = ratio.toFixed(2) + ':1';
  if (ratio < 7.0) {
    console.error(`FAIL: ${name} is ${ratioStr} (< 7.0:1)`);
    failed = true;
  } else {
    console.log(`PASS: ${name} is ${ratioStr}`);
  }
}

console.log('\n--- Checking Non-Text Indicator Contrast (min 3.0:1) ---');
for (const { fg, bg, name } of indicatorPairs) {
  const ratio = contrastRatio(fg, bg);
  const ratioStr = ratio.toFixed(2) + ':1';
  if (ratio < 3.0) {
    console.error(`FAIL: ${name} is ${ratioStr} (< 3.0:1)`);
    failed = true;
  } else {
    console.log(`PASS: ${name} is ${ratioStr}`);
  }
}

if (failed) {
  console.error('\nContrast check FAILED');
  process.exit(1);
} else {
  console.log('\nAll token contrast checks PASSED');
  process.exit(0);
}
