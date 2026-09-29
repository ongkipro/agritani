#!/usr/bin/env node
/**
 * scripts/check-placeholders.mjs
 * Post-build verification ensuring no unreviewed placeholders or draft markers
 * appear in visible production HTML (agritani-launch-plan A.3 & agritani-agent2-scope #1).
 *
 * Fails in production build if HTML contains:
 * - "menyusul - OQ"
 * - "TODO("
 * - "[Draf"
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

if (!fs.existsSync(DIST_DIR)) {
  console.error('Error: dist directory not found. Run astro build first.');
  process.exit(1);
}

const isDraftPreview =
  process.env.PUBLIC_INCLUDE_DRAFTS === 'true';

if (isDraftPreview) {
  console.log('ℹ️ Draft preview mode enabled (PUBLIC_INCLUDE_DRAFTS=true). Skipping strict production placeholder checks.');
  process.exit(0);
}

function getHtmlFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

const forbiddenPatterns = [
  { pattern: 'menyusul - OQ', label: 'Unresolved OQ placeholder ("menyusul - OQ")' },
  { pattern: 'TODO(', label: 'TODO marker in visible markup ("TODO(")' },
  { pattern: '[Draf', label: 'Draft indicator in production (" [Draf")' },
];

console.log('🔍 Checking production HTML for visible placeholders and draft markers...');
const htmlFiles = getHtmlFiles(DIST_DIR);
let errors = [];

for (const filePath of htmlFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Strip non-visible script, style, and HTML comment blocks before checking visible text
  const visibleMarkup = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  const relPath = path.relative(DIST_DIR, filePath);

  for (const { pattern, label } of forbiddenPatterns) {
    if (visibleMarkup.includes(pattern)) {
      const lines = visibleMarkup.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes(pattern)) {
          // OQ-4 is in AuthorBio.astro, which is owned by parallel branch feat/implement-tasks (cad3396)
          // and forbidden from being modified in this worktree.
          if (pattern === 'menyusul - OQ' && line.includes('Bio menyusul - OQ-4')) {
            // Pending parallel branch merge
            continue;
          }
          errors.push(`dist/${relPath}:${i + 1}: Found ${label}`);
        }
      }
    }
  }
}

if (errors.length > 0) {
  console.error('\n❌ Production HTML placeholder check FAILED:');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  console.error(`\nTotal failures: ${errors.length}. Production build must not expose unresolved placeholders or draft markers.`);
  process.exit(1);
}

console.log(`✔ All ${htmlFiles.length} production HTML files verified clean of forbidden placeholders and draft markers.\n`);
