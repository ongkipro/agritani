#!/usr/bin/env node
/**
 * scripts/check-csp.mjs
 * Post-build Content Security Policy (CSP) invariant auditor (AGENTS.md, ARCHITECTURE §5).
 *
 * Verifies that all built HTML files in dist/ strictly satisfy:
 * 1. ZERO executed inline scripts (only external <script src="..."> and structured <script type="application/ld+json"> allowed).
 * 2. ZERO inline event handler attributes (on*= e.g., onclick, onsubmit, onload).
 * 3. ZERO inline style attributes (style="...").
 *
 * Exits with non-zero exit code if any CSP violation is found.
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

if (!fs.existsSync(DIST_DIR)) {
  console.error(`[check-csp] ERROR: dist directory not found at ${DIST_DIR}. Run build first.`);
  process.exit(1);
}

function walkHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = walkHtmlFiles(DIST_DIR);
console.log(`🔍 [check-csp] Auditing ${htmlFiles.length} HTML files for strict CSP invariants...`);

let totalInlineScripts = 0;
let totalOnAttributes = 0;
let totalStyleAttributes = 0;
const violations = [];

for (const filePath of htmlFiles) {
  const relPath = path.relative(DIST_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  let fileInlineScripts = 0;
  let fileOnAttributes = 0;
  let fileStyleAttributes = 0;

  // 1. Audit script tags
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  while ((scriptMatch = scriptRegex.exec(content)) !== null) {
    const attrs = scriptMatch[1] || '';
    const srcMatch = attrs.match(/\bsrc\s*=\s*['"]([^'"]+)['"]/i);
    const typeMatch = attrs.match(/\btype\s*=\s*['"]([^'"]+)['"]/i);
    const type = typeMatch ? typeMatch[1].toLowerCase() : '';

    // Allowed: external scripts with src, or data payloads (JSON-LD, application/json)
    if (!srcMatch && type !== 'application/ld+json' && type !== 'application/json') {
      fileInlineScripts++;
    }
  }

  // 2. Audit inline event handlers on* (e.g. onclick=, onsubmit=)
  const onMatches = content.match(/\s+on[a-z0-9_-]+\s*=/gi) || [];
  fileOnAttributes += onMatches.length;

  // 3. Audit inline style attributes (style=...)
  const styleMatches = content.match(/\s+style\s*=/gi) || [];
  fileStyleAttributes += styleMatches.length;

  if (fileInlineScripts > 0 || fileOnAttributes > 0 || fileStyleAttributes > 0) {
    violations.push({
      file: relPath,
      inlineScripts: fileInlineScripts,
      onAttributes: fileOnAttributes,
      styleAttributes: fileStyleAttributes,
    });
  }

  totalInlineScripts += fileInlineScripts;
  totalOnAttributes += fileOnAttributes;
  totalStyleAttributes += fileStyleAttributes;
}

console.log('\n--- CSP Audit Results ---');
console.log(`Audited HTML files   : ${htmlFiles.length}`);
console.log(`Executed inline scripts: ${totalInlineScripts} ${totalInlineScripts === 0 ? '✔ (PASS)' : '✖ (FAIL)'}`);
console.log(`Inline on*= attributes : ${totalOnAttributes} ${totalOnAttributes === 0 ? '✔ (PASS)' : '✖ (FAIL)'}`);
console.log(`Inline style= attributes: ${totalStyleAttributes} ${totalStyleAttributes === 0 ? '✔ (PASS)' : '✖ (FAIL)'}`);

if (violations.length > 0) {
  console.error('\n✖ [check-csp] FAILED: Violations found in the following files:');
  for (const v of violations.slice(0, 10)) {
    console.error(`  - ${v.file}: inline-scripts=${v.inlineScripts}, on*=${v.onAttributes}, style=${v.styleAttributes}`);
  }
  if (violations.length > 10) {
    console.error(`  ... and ${violations.length - 10} more files.`);
  }
  process.exit(1);
}

console.log('\n✅ All post-build CSP invariants strictly PASSED (0/0/0)!\n');
process.exit(0);
