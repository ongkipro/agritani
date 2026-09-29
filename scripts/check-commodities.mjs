import fs from 'node:fs';
import path from 'node:path';

const articlesDir = path.resolve('docs/content/articles');
const commoditiesFile = path.resolve('src/data/commodities.json');

const commodities = JSON.parse(fs.readFileSync(commoditiesFile, 'utf-8'));
const validCommodityIds = new Set(commodities.map((c) => c.id));

// Alias mapping for checking whether a commodity is truly supported by title or tags
export const commodityAliases = {
  'padi': ['padi', 'gabah', 'beras', 'sawah'],
  'jagung': ['jagung', 'tongkol jagung'],
  'cabai': ['cabai', 'cabe', 'patek cabai', 'antraknosa cabai', 'keriting kuning cabai', 'pewiwitan cabai'],
  'tomat': ['tomat'],
  'bawang-merah': ['bawang merah', 'bawang'],
  'kelapa-sawit': ['kelapa sawit', 'sawit', 'ganoderma', 'tbs', 'kumbang tanduk sawit', 'ulat kantung sawit', 'alb sawit'],
  'sayuran-daun': ['sayuran daun', 'sayur daun', 'selada', 'sawi', 'kangkung', 'bayam', 'pakcoy', 'pak choi'],
  'kedelai': ['kedelai'],
  'semangka': ['semangka'],
  'melon': ['melon'],
  'kopi': ['kopi'],
  'kakao': ['kakao', 'cokelat', 'pbk kakao', 'vsd kakao', 'busuk buah kakao'],
  'cengkeh': ['cengkeh'],
  'durian': ['durian'],
  'mangga': ['mangga'],
  'alpukat': ['alpukat'],
  'jeruk': ['jeruk', 'sitrus'],
  'terung': ['terung'],
  'mentimun': ['mentimun', 'timun'],
  'kentang': ['kentang'],
  'tebu': ['tebu'],
  'tembakau': ['tembakau'],
  'buncis': ['buncis'],
  'pepaya': ['pepaya'],
  'pisang': ['pisang'],
  'nanas': ['nanas'],
  'wortel': ['wortel'],
  'kubis': ['kubis'],
  'vanili': ['vanili'],
  'ubi-jalar': ['ubi jalar', 'ubi'],
  'kacang-tanah': ['kacang tanah'],
};

export function checkCommodityMatch(commodityId, title, tags) {
  const aliases = commodityAliases[commodityId] || [commodityId.replace(/-/g, ' ')];
  const searchTarget = `${title} ${tags.join(' ')}`.toLowerCase();

  return aliases.some((alias) => {
    // Word boundary or substring check for multi-word
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    return regex.test(searchTarget);
  });
}

function runAudit() {
  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md')).sort();
  console.log(`Checking commodity assignments for ${files.length} articles...`);

  let totalAssignments = 0;
  let invalidAssignments = 0;
  const errors = [];

  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) continue;

    const fm = fmMatch[1];
    const title = (fm.match(/title:\s*"([^"]+)"/) || [])[1] || '';
    const tagsStr = (fm.match(/tags:\r?\n((?:\s+-\s*"[^"]+"\r?\n?)*)/) || [])[1] || '';
    const tags = Array.from(tagsStr.matchAll(/-\s*"([^"]+)"/g)).map((m) => m[1]);

    const commStr = (fm.match(/commodities:\r?\n((?:\s+-\s*"[^"]+"\r?\n?)*)/) || [])[1] || '';
    const assignedCommodities = Array.from(commStr.matchAll(/-\s*"([^"]+)"/g)).map((m) => m[1]);

    if (assignedCommodities.length > 3) {
      errors.push(`${file}: Too many commodities assigned (${assignedCommodities.length} > 3)`);
    }

    for (const comm of assignedCommodities) {
      totalAssignments++;
      if (!validCommodityIds.has(comm)) {
        errors.push(`${file}: Unknown commodity ID "${comm}" (not in commodities.json)`);
        invalidAssignments++;
        continue;
      }

      const match = checkCommodityMatch(comm, title, tags);
      if (!match) {
        errors.push(`${file}: Commodity "${comm}" is NOT supported by title ("${title}") or tags`);
        invalidAssignments++;
      }
    }
  }

  console.log(`Total commodity assignments: ${totalAssignments}`);
  console.log(`Invalid / unsupported assignments: ${invalidAssignments}`);

  if (errors.length > 0) {
    console.error('\n--- FAILED COMMODITY AUDIT ---');
    errors.forEach((e) => console.error(`  ✖ ${e}`));
    return false;
  }

  console.log('\n✔ All commodity assignments strictly verified against article title + tags!');
  return true;
}

// Only run standalone if executed directly
if (process.argv[1] && process.argv[1].endsWith('check-commodities.mjs')) {
  const success = runAudit();
  if (!success) {
    process.exit(1);
  }
}
