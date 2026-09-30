/**
 * src/lib/content-integrity.ts
 * Pure validation functions for content integrity across collections (ARCHITECTURE §3.1)
 */

export interface ArticleData {
  slug: string;
  title?: string;
  metaTitle?: string;
  description?: string;
  answer?: string;
  author?: string;
  commodities?: Array<string | { id: string }>;
  references?: Array<{
    authors: string;
    year: number;
    title: string;
    source: string;
    doi?: string;
    url?: string;
  }>;
  draft?: boolean;
  [key: string]: unknown;
}

export interface SymptomData {
  id?: string;
  diagnosis?: string;
  article: string;
  reviewedBy?: string;
  [key: string]: unknown;
}

export interface CropCalendarData {
  id: string; // commodity slug
  reviewedBy?: string;
  [key: string]: unknown;
}

export interface CommodityData {
  id: string;
  name?: string;
  [key: string]: unknown;
}

export interface ContentIntegrityInput {
  articles: ArticleData[];
  symptoms?: SymptomData[];
  cropCalendars?: CropCalendarData[];
  commodities?: CommodityData[];
  isDraftPreview?: boolean;
}

// Map 47 legacy manuscript categories to 6 fixed topics (ARCHITECTURE §3.0)
export function mapCategoryToTopic(cat?: string): string {
  if (!cat) return 'budidaya';
  const c = cat.trim();

  // 1. Air & Irigasi (match exact category or whole words 'air' / 'irigasi')
  if (
    c === 'Manajemen Air & Sistem Irigasi Pertanian' ||
    /\b(irigasi)\b/i.test(c) ||
    /\b(air)\b/i.test(c)
  ) {
    return 'air-irigasi';
  }

  // 2. Pascapanen & Agribisnis
  if (
    c === 'Bioteknologi, Agribisnis & Pasca Panen' ||
    /\b(pasca\s*panen|pascapanen|agribisnis)\b/i.test(c)
  ) {
    return 'pascapanen-agribisnis';
  }

  // 3. Sains Tanaman (Fisiologi & Anatomi Tumbuhan, Fisiologi Tanaman & Perawatan)
  if (
    c === 'Fisiologi & Anatomi Tumbuhan' ||
    c === 'Fisiologi Tanaman & Perawatan' ||
    /\b(anatomi)\b/i.test(c) ||
    /\bfisiologi tanaman\b/i.test(c)
  ) {
    return 'sains-tanaman';
  }

  // 4. Proteksi Tanaman (hama, patologi, bioproteksi, penyakit)
  if (
    /\b(hama|patologi|bioproteksi|proteksi)\b/i.test(c)
  ) {
    return 'proteksi-tanaman';
  }

  // 5. Tanah & Nutrisi (tanah, nutrisi, pupuk, biostimulan, kesuburan, kompos, mikrobioma)
  if (
    /\b(tanah|nutrisi|biostimulan|kesuburan|pupuk|kompos|mikrobioma)\b/i.test(c)
  ) {
    return 'tanah-nutrisi';
  }

  // 6. Budidaya (default for technical cultivation, planting, seeds, urban farming, commodities)
  return 'budidaya';
}

function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export function assertContentIntegrity(input: ContentIntegrityInput): void {
  const {
    articles,
    symptoms = [],
    cropCalendars = [],
    commodities = [],
    isDraftPreview = false,
  } = input;

  // 1. Unique article slugs
  const slugSet = new Set<string>();
  for (const art of articles) {
    if (slugSet.has(art.slug)) {
      throw new Error(`Slug artikel ganda ditemukan: "${art.slug}"`);
    }
    slugSet.add(art.slug);
  }

  // 2. Crop calendar commodity references
  if (commodities.length > 0) {
    const validCommodityIds = new Set(commodities.map((c) => c.id));
    for (const cal of cropCalendars) {
      if (!validCommodityIds.has(cal.id)) {
        throw new Error(
          `Kalender tanam id "${cal.id}" menunjuk komoditas yang tidak terdaftar di commodities.json`
        );
      }
    }
  }

  // 3. Published articles validation
  const publishedMetaTitles = new Map<string, string>();
  const publishedDescriptions = new Map<string, string>();
  const publishedSlugs = new Set<string>();

  for (const art of articles) {
    const isDraft = art.draft !== false;
    if (!isDraft) {
      publishedSlugs.add(art.slug);

      // Author required
      if (!art.author || art.author.trim() === '') {
        throw new Error(`Artikel terbit "${art.slug}" wajib memiliki author terisi`);
      }

      // DEC-020 (owner 2026-09-30): commodities, references, and the short answer are optional for
      // published articles; each block renders only when present. Never invent them to pass a check.
      if (art.answer && art.answer.trim() !== '') {
        const words = countWords(art.answer);
        if (words < 40 || words > 60) {
          throw new Error(
            `Artikel terbit "${art.slug}" memiliki Jawaban Singkat ${words} kata; harus 40–60 kata bila diisi`
          );
        }
      }

      // Unique metaTitle among published
      if (art.metaTitle) {
        if (publishedMetaTitles.has(art.metaTitle)) {
          throw new Error(
            `metaTitle ganda pada artikel terbit: "${art.metaTitle}" (konflik: "${art.slug}" dan "${publishedMetaTitles.get(art.metaTitle)}")`
          );
        }
        publishedMetaTitles.set(art.metaTitle, art.slug);
      }

      // Unique description among published
      if (art.description) {
        if (publishedDescriptions.has(art.description)) {
          throw new Error(
            `description ganda pada artikel terbit: "${art.description}" (konflik: "${art.slug}" dan "${publishedDescriptions.get(art.description)}")`
          );
        }
        publishedDescriptions.set(art.description, art.slug);
      }
    }
  }

  // 4. Symptoms must point to valid articles (ARCHITECTURE §3.1, DEC-015, A.8)
  for (const sym of symptoms) {
    const label = sym.id || sym.diagnosis || 'tanpa-id';
    const isVisible = Boolean(sym.reviewedBy && sym.reviewedBy.trim() !== '');

    if (isDraftPreview) {
      // In draft preview, can point to draft or published, but article must exist in manuscripts
      if (!slugSet.has(sym.article)) {
        throw new Error(
          `Gejala "${label}" menunjuk slug artikel fiktif: "${sym.article}"`
        );
      }
    } else {
      // In production build, only VISIBLE symptoms (reviewedBy set) must point to published articles.
      // Unreviewed symptoms are hidden in production and do not fail the build if pointing to draft.
      if (isVisible) {
        if (!publishedSlugs.has(sym.article)) {
          throw new Error(
            `Gejala "${label}" menunjuk artikel yang belum terbit atau fiktif: "${sym.article}"`
          );
        }
      } else {
        // Hidden symptoms must still point to a recognized manuscript slug to catch typos
        if (!slugSet.has(sym.article)) {
          throw new Error(
            `Gejala "${label}" menunjuk slug artikel fiktif: "${sym.article}"`
          );
        }
      }
    }
  }
}
