// Post-build guard: every internal href/src in dist/*.html must resolve to a built file.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
});

const exists = (url) => {
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  const p = join(dist, path);
  return existsSync(p) && (statSync(p).isFile() || existsSync(join(p, 'index.html')));
};

const broken = [];
for (const file of walk(dist)) {
  const html = readFileSync(file, 'utf8');
  for (const [, url] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    if (!exists(url)) broken.push(`${file.slice(dist.length)} -> ${url}`);
  }
}

if (broken.length) {
  console.error(`✖ ${broken.length} broken internal link(s):\n` + [...new Set(broken)].slice(0, 50).join('\n'));
  process.exit(1);
}
console.log('✔ All internal links resolve to built files.');
