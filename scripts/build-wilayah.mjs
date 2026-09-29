/**
 * scripts/build-wilayah.mjs
 * Builds tiered hierarchical JSON files for Indonesian administrative regions
 * based on official Kemendagri codes compatible with BMKG adm4 endpoint (REQ-10, ARCHITECTURE §5b).
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const RAW_SQL_URL = 'https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/wilayah.sql';
const OUTPUT_DIR = path.resolve('public/wilayah');
const CACHE_FILE = path.resolve('node_modules/.cache/wilayah.sql');

async function getSqlData() {
  if (fs.existsSync(CACHE_FILE)) {
    console.log(`Using cached SQL from ${CACHE_FILE}`);
    return fs.readFileSync(CACHE_FILE, 'utf-8');
  }

  console.log(`Fetching Kemendagri dataset from ${RAW_SQL_URL}...`);
  const res = await fetch(RAW_SQL_URL);
  if (!res.ok) {
    throw new Error(`Failed to download wilayah.sql: HTTP ${res.status}`);
  }
  const sql = await res.text();
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, sql, 'utf-8');
  return sql;
}

function parseSql(sql) {
  console.log('Parsing SQL records...');
  const records = new Map(); // kode -> nama

  // Pattern: ('kode', 'nama')
  const regex = /\('([0-9\.]+)',\s*'([^']+)'\)/g;
  let match;
  while ((match = regex.exec(sql)) !== null) {
    const [, kode, nama] = match;
    records.set(kode, nama);
  }

  console.log(`Parsed ${records.size} total regional entities.`);
  return records;
}

function organizeHierarchy(records) {
  console.log('Organizing tiered hierarchy (Provinsi -> Kabupaten -> Kecamatan -> Desa)...');

  const provinces = [];
  const regenciesByProv = new Map(); // provKode -> [{ kode, nama }]
  const districtDataByReg = new Map(); // regKode -> { kode, nama, kecamatan: [{ kode, nama, desa: [{ kode, nama }] }] }

  // 1. Provinces (length of segments = 1, e.g. "11", "32")
  for (const [kode, nama] of records) {
    const parts = kode.split('.');
    if (parts.length === 1) {
      provinces.push({ kode, nama });
    }
  }
  provinces.sort((a, b) => a.kode.localeCompare(b.kode));

  // 2. Regencies / Kota (length of segments = 2, e.g. "11.01", "32.04")
  for (const [kode, nama] of records) {
    const parts = kode.split('.');
    if (parts.length === 2) {
      const provKode = parts[0];
      if (!regenciesByProv.has(provKode)) {
        regenciesByProv.set(provKode, []);
      }
      regenciesByProv.get(provKode).push({ kode, nama });

      districtDataByReg.set(kode, {
        kode,
        nama,
        kecamatan: [],
      });
    }
  }

  for (const list of regenciesByProv.values()) {
    list.sort((a, b) => a.kode.localeCompare(b.kode));
  }

  // 3. Districts / Kecamatan (length of segments = 3, e.g. "11.01.01", "32.04.10")
  const districtMap = new Map(); // distKode -> district object
  for (const [kode, nama] of records) {
    const parts = kode.split('.');
    if (parts.length === 3) {
      const regKode = `${parts[0]}.${parts[1]}`;
      const reg = districtDataByReg.get(regKode);
      if (reg) {
        const distObj = {
          kode,
          nama,
          desa: [],
        };
        reg.kecamatan.push(distObj);
        districtMap.set(kode, distObj);
      }
    }
  }

  for (const reg of districtDataByReg.values()) {
    reg.kecamatan.sort((a, b) => a.kode.localeCompare(b.kode));
  }

  // 4. Villages / Desa / Kelurahan (length of segments = 4, e.g. "11.01.01.2001", "32.04.10.2001")
  for (const [kode, nama] of records) {
    const parts = kode.split('.');
    if (parts.length === 4) {
      const distKode = `${parts[0]}.${parts[1]}.${parts[2]}`;
      const dist = districtMap.get(distKode);
      if (dist) {
        dist.desa.push({ kode, nama });
      }
    }
  }

  for (const dist of districtMap.values()) {
    dist.desa.sort((a, b) => a.kode.localeCompare(b.kode));
  }

  return { provinces, regenciesByProv, districtDataByReg };
}

function writeTieredFiles({ provinces, regenciesByProv, districtDataByReg }) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Writing public/wilayah/provinsi.json...');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'provinsi.json'), JSON.stringify(provinces), 'utf-8');

  console.log('Writing province regency files (e.g. 32.json)...');
  for (const [provKode, regList] of regenciesByProv) {
    fs.writeFileSync(path.join(OUTPUT_DIR, `${provKode}.json`), JSON.stringify(regList), 'utf-8');
  }

  console.log('Writing regency detail files with districts & villages (e.g. 32.04.json)...');
  let maxGzipSize = 0;
  let maxFile = '';

  for (const [regKode, regData] of districtDataByReg) {
    const jsonStr = JSON.stringify(regData);
    const filePath = path.join(OUTPUT_DIR, `${regKode}.json`);
    fs.writeFileSync(filePath, jsonStr, 'utf-8');

    const gzSize = zlib.gzipSync(Buffer.from(jsonStr)).length;
    if (gzSize > maxGzipSize) {
      maxGzipSize = gzSize;
      maxFile = `${regKode}.json (${regData.nama})`;
    }
  }

  console.log(`Successfully generated tiered JSON files in ${OUTPUT_DIR}:`);
  console.log(`  Provinces: ${provinces.length}`);
  console.log(`  Regency list files: ${regenciesByProv.size}`);
  console.log(`  Regency detail files: ${districtDataByReg.size}`);
  console.log(`  Max file gzip size: ${(maxGzipSize / 1024).toFixed(2)} KB [${maxFile}]`);

  if (maxGzipSize > 40 * 1024) {
    throw new Error(`File size violation: ${maxFile} is ${(maxGzipSize / 1024).toFixed(2)} KB (budget < 40 KB gzip)`);
  }
}

async function main() {
  const sql = await getSqlData();
  const records = parseSql(sql);
  const data = organizeHierarchy(records);
  writeTieredFiles(data);
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
