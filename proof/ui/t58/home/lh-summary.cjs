// Summarise a Lighthouse JSON report: node proof/ui/t58/home/lh-summary.cjs <report.json>
const r = require(require('node:path').resolve(process.argv[2]));
const a = r.audits;
const pick = (k) => (a[k] ? a[k].displayValue : 'n/a');
console.log({
  score: r.categories.performance.score,
  FCP: pick('first-contentful-paint'),
  LCP: pick('largest-contentful-paint'),
  TBT: pick('total-blocking-time'),
  CLS: pick('cumulative-layout-shift'),
  SI: pick('speed-index'),
  totalBytes: pick('total-byte-weight'),
});
for (const [k, v] of Object.entries(a)) {
  const s = v.details && (v.details.overallSavingsBytes || v.metricSavings);
  if (/image/i.test(k) && v.details && v.details.overallSavingsBytes) {
    console.log(k, Math.round(v.details.overallSavingsBytes / 1024) + ' KiB', (v.details.items || []).map((i) => (i.url || '').split('/').pop()).join(', '));
  }
}
