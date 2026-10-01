// Post-build guard:
// 1. Every internal href/src in dist/*.html must resolve to a built file.
// 2. Outbound link verification (DESIGN §4.4.12 & TASKS T-33):
//    - target="_blank"
//    - rel contains "noopener"
//    - rel NEVER contains "noreferrer"
//    - every outbound link includes "nofollow" (DEC-024)
//    - screen-reader tab notice (e.g. sr-only "(membuka tab baru)")
//    - Prohibit intermediate redirects, shorteners, or cloaked/encrypted URLs.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });

const exists = (url) => {
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  const p = join(dist, path);
  return existsSync(p) && (statSync(p).isFile() || existsSync(join(p, 'index.html')));
};

const FORBIDDEN_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'cutt.ly',
  'rebrand.ly',
  'shorturl.at',
  'bl.ink',
]);

const brokenInternal = [];
const outboundErrors = [];
let internalLinkCount = 0;
let outboundLinkCount = 0;

for (const file of walk(dist)) {
  const relFile = file.slice(dist.length);
  const html = readFileSync(file, 'utf8');

  // 1. Audit internal links & assets
  for (const [, url] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    internalLinkCount++;
    if (!exists(url)) {
      brokenInternal.push(`${relFile} -> ${url}`);
    }
  }

  // 2. Audit outbound <a> links (DESIGN §4.4.12)
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = match[1];
    const innerHtml = match[2];

    const hrefMatch = attrs.match(/\bhref="([^"]*)"/i) || attrs.match(/\bhref='([^']*)'/i);
    if (!hrefMatch) continue;
    const href = hrefMatch[1].trim();

    if (!href.startsWith('http://') && !href.startsWith('https://')) {
      continue;
    }

    let urlObj;
    try {
      urlObj = new URL(href);
    } catch {
      outboundErrors.push(`${relFile}: Invalid outbound URL "${href}"`);
      continue;
    }

    const host = urlObj.hostname.toLowerCase();
    // Exclude internal domain variations or local test servers
    if (
      host === 'agritani.com' ||
      host === 'www.agritani.com' ||
      host.endsWith('.agritani.com') ||
      host === 'localhost' ||
      host === '127.0.0.1'
    ) {
      continue;
    }

    outboundLinkCount++;

    // Guard: No URL shorteners
    if (FORBIDDEN_SHORTENERS.has(host)) {
      outboundErrors.push(
        `${relFile}: URL shortener forbidden (DESIGN §4.4.12): "${href}"`
      );
    }

    // Guard: No intermediate redirectors or disguised links
    if (
      /[?&](?:url|redirect|goto|dest|link)=https?%3A/i.test(href) ||
      /anonym\.to|dereferer/i.test(href)
    ) {
      outboundErrors.push(
        `${relFile}: Disguised or intermediate redirect forbidden (DESIGN §4.4.12): "${href}"`
      );
    }

    // Guard: target="_blank"
    const targetMatch = attrs.match(/\btarget="([^"]*)"/i) || attrs.match(/\btarget='([^']*)'/i);
    const target = targetMatch ? targetMatch[1].trim() : '';
    if (target !== '_blank') {
      outboundErrors.push(
        `${relFile}: Outbound link must have target="_blank": "${href}" (found: "${target}")`
      );
    }

    // Guard: rel must include noopener
    const relMatch = attrs.match(/\brel="([^"]*)"/i) || attrs.match(/\brel='([^']*)'/i);
    const rel = relMatch ? relMatch[1].trim().toLowerCase() : '';
    const relTokens = rel.split(/\s+/).filter(Boolean);

    if (!relTokens.includes('noopener')) {
      outboundErrors.push(
        `${relFile}: Outbound link rel must contain "noopener": "${href}" (found: "${rel}")`
      );
    }

    // Guard: rel NEVER contains noreferrer (DESIGN §4.4.12)
    if (relTokens.includes('noreferrer')) {
      outboundErrors.push(
        `${relFile}: Outbound link rel must NOT contain "noreferrer" (DESIGN §4.4.12): "${href}"`
      );
    }

    // Guard: every outbound link is nofollow (owner rule DEC-024)
    if (!relTokens.includes('nofollow')) {
      outboundErrors.push(
        `${relFile}: Outbound link rel must contain "nofollow" (DEC-024): "${href}" (found: "${rel}")`
      );
    }

    // Guard: Screen-reader notice for opening new tab
    const hasSrNotice =
      /class="[^"]*\bsr-only\b[^"]*"[^>]*>[^<]*(?:tab baru|buka tab|membuka tab)[^<]*/i.test(innerHtml) ||
      /\(membuka tab baru\)/i.test(innerHtml) ||
      /aria-label="[^"]*(?:tab baru|buka tab|membuka tab)[^"]*"/i.test(attrs);

    if (!hasSrNotice) {
      outboundErrors.push(
        `${relFile}: Outbound link missing sr-only new tab indicator "(membuka tab baru)": "${href}"`
      );
    }
  }
}

let hasError = false;

if (brokenInternal.length) {
  console.error(
    `✖ ${brokenInternal.length} broken internal link(s):\n` +
      [...new Set(brokenInternal)].slice(0, 50).join('\n')
  );
  hasError = true;
} else {
  console.log(`✔ All internal links (${internalLinkCount} audited) resolve to built files.`);
}

if (outboundErrors.length) {
  console.error(
    `✖ ${outboundErrors.length} outbound link violation(s) (DESIGN §4.4.12):\n` +
      [...new Set(outboundErrors)].slice(0, 50).join('\n')
  );
  hasError = true;
} else {
  console.log(
    `✔ All outbound links (${outboundLinkCount} audited) comply with target, rel, nofollow, and sr-only standards.`
  );
}

if (hasError) {
  process.exit(1);
}
