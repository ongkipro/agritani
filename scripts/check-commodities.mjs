import fs from 'node:fs';
import path from 'node:path';

const articlesDir = path.resolve('docs/content/articles');
const commoditiesFile = path.resolve('src/data/commodities.json');

const commodities = JSON.parse(fs.readFileSync(commoditiesFile, 'utf-8'));
const validCommodityIds = new Set(commodities.map((c) => c.id));

// Alias mapping for checking whether a commodity is truly supported by title or tags
export const commodityAliases = {
  'padi': ['padi', 'gabah', 'beras', 'sawah', 'wereng', 'blast', 'kresek', 'sundep', 'beluk', 'walang sangit', 'keong mas', 'rebah'],
  'jagung': ['jagung', 'bulai', 'faw', 'spodoptera', 'tongkol'],
  'cabai': ['cabai', 'cabe', 'patek', 'antraknosa', 'keriting kuning', 'gemini virus', 'thrips', 'tungau merah', 'pewiwitan'],
  'tomat': ['tomat'],
  'bawang-merah': ['bawang merah', 'bawang', 'moler'],
  'kelapa-sawit': ['kelapa sawit', 'sawit', 'ganoderma', 'tbs', 'kumbang tanduk', 'ulat kantung', 'kumbang moncong', 'alb'],
  'sayuran-daun': ['sayuran daun', 'sayur daun', 'sayuran', 'sayur', 'selada', 'sawi', 'kangkung', 'bayam', 'pakcoy', 'pak choi', 'hidroponik', 'afid', 'kutu daun', 'pengorok daun'],
  'kedelai': ['kedelai'],
  'semangka': ['semangka'],
  'melon': ['melon', 'powdery mildew', 'embun tepung'],
  'kopi': ['kopi', 'karat daun kopi', 'hemileia'],
  'kakao': ['kakao', 'cokelat', 'pbk', 'vsd', 'busuk buah kakao', 'helopeltis'],
  'cengkeh': ['cengkeh'],
  'durian': ['durian', 'kanker batang durian'],
  'mangga': ['mangga'],
  'alpukat': ['alpukat'],
  'jeruk': ['jeruk', 'sitrus', 'kudis jeruk', 'kanker sitrus', 'degreening'],
  'terung': ['terung'],
  'mentimun': ['mentimun', 'timun', 'mosaik mentimun', 'cmv'],
  'kentang': ['kentang', 'granola', 'nematoda kista'],
  'tebu': ['tebu', 'rendemen gula'],
  'tembakau': ['tembakau', 'krosok'],
  'buncis': ['buncis'],
  'pepaya': ['pepaya', 'calina', 'california'],
  'pisang': ['pisang', 'sigatoka'],
  'nanas': ['nanas'],
  'wortel': ['wortel'],
  'kubis': ['kubis', 'akar gada', 'plasmodiophora', 'ulat daun'],
  'vanili': ['vanili'],
  'ubi-jalar': ['ubi jalar', 'ubi', 'boleng', 'sapu setan'],
  'kacang-tanah': ['kacang tanah', 'kacang', 'lalat bibit kacang'],
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
