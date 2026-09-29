import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const commodities = defineCollection({
  loader: file('./src/data/commodities.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    group: z.enum(['perkebunan', 'pangan', 'hortikultura', 'urban']),
  }),
});

const reference_ = z.object({
  authors: z.string(),
  year: z.number().int(),
  title: z.string(),
  source: z.string(),
  doi: z.string().optional(),
  url: z.string().url().optional(),
});

const fieldTakeaways = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('masalah'),
    problem: z.string(),
    typicalSymptom: z.string(),
    firstStep: z.string(),
    dosagePer16LTank: z.string().optional(),
    applicationTiming: z.string().optional(),
  }),
  z.object({
    kind: z.literal('panduan'),
    goal: z.string(),
    materials: z.string().optional(),
    keySteps: z.string(),
    timing: z.string().optional(),
  }),
]);

// Map 47 legacy manuscript categories to 6 fixed topics (ARCHITECTURE §3.0)
function mapCategoryToTopic(cat?: string): string {
  if (!cat) return 'budidaya';
  const c = cat.toLowerCase();
  if (
    c.includes('hama') ||
    c.includes('patologi') ||
    c.includes('bioproteksi') ||
    c.includes('proteksi')
  ) {
    return 'proteksi-tanaman';
  }
  if (
    c.includes('tanah') ||
    c.includes('nutrisi') ||
    c.includes('biostimulan') ||
    c.includes('kesuburan')
  ) {
    return 'tanah-nutrisi';
  }
  if (c.includes('air') || c.includes('irigasi')) {
    return 'air-irigasi';
  }
  if (c.includes('pasca panen') || c.includes('pascapanen') || c.includes('agribisnis')) {
    return 'pascapanen-agribisnis';
  }
  if (c.includes('fisiologi') || c.includes('anatomi') || c.includes('sains')) {
    return 'sains-tanaman';
  }
  return 'budidaya';
}

const articles = defineCollection({
  loader: glob({ pattern: '*.md', base: './docs/content/articles' }),
  schema: ({ image }) =>
    z.preprocess(
      (raw: any) => {
        if (!raw || typeof raw !== 'object') return raw;
        const metaTitle = raw.metaTitle ?? raw.meta_title ?? raw.title;
        const description = raw.description ?? raw.meta_description ?? '';
        const pubDate = raw.pubDate ?? raw.published_date ?? new Date();
        const author = raw.author ?? 'Arif Prabowo';
        const topic = raw.topic ?? mapCategoryToTopic(raw.category);
        const commoditiesList = raw.commodities ?? ['kelapa-sawit'];
        const tags = Array.isArray(raw.tags) && raw.tags.length > 0 ? raw.tags : ['pertanian'];
        const draft = raw.draft !== undefined ? raw.draft : true;
        return {
          ...raw,
          metaTitle,
          description,
          pubDate,
          author,
          topic,
          commodities: commoditiesList,
          tags,
          draft,
        };
      },
      z.object({
        title: z.string().min(20).max(110),
        metaTitle: z.string().min(30).max(60),
        description: z.string().min(120).max(160),
        answer: z.string().optional(),
        slug: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        author: z.string().default('Arif Prabowo'),
        reviewedBy: z.string().optional(),
        topic: z.enum([
          'proteksi-tanaman',
          'tanah-nutrisi',
          'budidaya',
          'air-irigasi',
          'pascapanen-agribisnis',
          'sains-tanaman',
        ]),
        commodities: z.array(reference('commodities')).min(1),
        tags: z.array(z.string()).min(1),
        featured: z.boolean().default(false),
        heroImage: z
          .object({ src: image(), alt: z.string().min(5).max(125), credit: z.string() })
          .optional(),
        fieldTakeaways: fieldTakeaways.optional(),
        references: z.array(reference_).default([]),
        draft: z.boolean().default(true),
      })
    ),
});

const products = defineCollection({
  loader: file('./src/data/products.json'),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      name: z.string(),
      tagline: z.string().optional(),
      role: z.string(),
      commodities: z.array(reference('commodities')).min(1),
      summary: z.string(),
      composition: z.string().optional(),
      form: z.string().optional(),
      applicationMethods: z.array(z.string()),
      dosage: z.string().optional(),
      registrationNumber: z.string().optional(),
      registrationCategory: z.string().optional(),
      authenticityCheck: z.string().optional(),
      packshot: image().optional(),
    }),
});

const symptoms = defineCollection({
  loader: file('./src/data/symptoms.json'),
  schema: z.object({
    id: z.string(),
    commodity: reference('commodities'),
    part: z.enum(['daun', 'batang-pangkal', 'buah-bunga', 'akar']),
    causeType: z.enum(['penyakit', 'hama', 'hara', 'lingkungan']),
    symptom: z.string(),
    diagnosis: z.string(),
    scientificName: z.string().optional(),
    distinguishingSign: z.string(),
    article: z.string(),
    seededFrom: z.string().optional(),
    reviewedBy: z.string().optional(),
  }),
});

const phase = z.object({
  id: z.string(),
  name: z.string(),
  startDay: z.number().int(),
  endDay: z.number().int(),
  activities: z.array(z.string()).max(4),
  watch: z.array(z.object({ name: z.string(), article: z.string().optional() })).default([]),
});

const cropCalendars = defineCollection({
  loader: file('./src/data/crop-calendars.json'),
  schema: z.object({
    id: z.string(),
    type: z.enum(['semusim', 'tahunan']),
    cycleDays: z.object({ min: z.number().int(), max: z.number().int() }).optional(),
    phases: z.array(phase).default([]),
    annualTasks: z
      .array(
        z.object({
          months: z.array(z.number().int().min(1).max(12)),
          task: z.string(),
        })
      )
      .default([]),
    seasons: z
      .array(
        z.object({
          code: z.enum(['MT1', 'MT2', 'MT3']),
          label: z.string(),
          plantMonths: z.array(z.number().int()),
          harvestMonths: z.array(z.number().int()),
        })
      )
      .default([]),
    sources: z.array(z.string()).min(1),
    seededFrom: z.string().optional(),
    reviewedBy: z.string().optional(),
    reviewedAt: z.coerce.date().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(120).max(160),
    updatedDate: z.coerce.date().optional(),
    reviewedBy: z.string().optional(),
  }),
});

export const collections = {
  commodities,
  articles,
  products,
  symptoms,
  cropCalendars,
  pages,
};
