/**
 * src/lib/seo.ts
 * Dynamic SEO metadata and JSON-LD schema builder adhering to DESIGN §4.4
 */

export const SITE_URL = 'https://agritani.com';
export const SITE_NAME = 'Agritani';
export const PUBLISHER_NAME = 'Agritani Official';
export const DEFAULT_OG_IMAGE = 'https://agritani.com/og/default.png';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SeoArticleMeta {
  pubDate: Date;
  updatedDate?: Date;
  author?: string;
  topic?: string;
  tags?: string[];
  heroImage?: string;
  references?: Array<{
    title: string;
    doi?: string;
    url?: string;
  }>;
}

export interface SeoInput {
  title: string;
  metaTitle?: string;
  description: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  pageType?: 'website' | 'article' | 'profile' | 'about' | 'collection';
  article?: SeoArticleMeta;
  breadcrumbs?: BreadcrumbItem[];
}

export interface SeoOutput {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  author: string;
  publisher: string;
  og: {
    title: string;
    description: string;
    url: string;
    image: string;
    imageWidth: string;
    imageHeight: string;
    imageAlt: string;
    type: 'website' | 'article' | 'profile';
    siteName: string;
    locale: string;
    article?: {
      publishedTime: string;
      modifiedTime: string;
      author: string;
      section?: string;
    };
  };
  twitter: {
    card: 'summary_large_image';
    title: string;
    description: string;
    image: string;
    imageAlt: string;
  };
  jsonLd: Record<string, unknown>;
}

export function formatCanonicalUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) return `${SITE_URL}/`;

  const urlStr = pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;

  try {
    const parsed = new URL(urlStr);
    let pathname = parsed.pathname;
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }
    return `${parsed.protocol}//${parsed.host}${pathname}`;
  } catch {
    return `${SITE_URL}/`;
  }
}

export function getDefaultOgImage(canonicalPath?: string, topic?: string): string {
  if (!canonicalPath || canonicalPath === '/') return DEFAULT_OG_IMAGE;

  if (canonicalPath.startsWith('/jurnal')) {
    if (topic) {
      const topicSlug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const topicFile = `https://agritani.com/og/topik-${topicSlug}.png`;
      return topicFile;
    }
    return 'https://agritani.com/og/jurnal.png';
  }

  if (canonicalPath.startsWith('/alat/diagnosa-gejala')) return 'https://agritani.com/og/alat-diagnosa-gejala.png';
  if (canonicalPath.startsWith('/alat/kalender-tanam')) return 'https://agritani.com/og/alat-kalender-tanam.png';
  if (canonicalPath.startsWith('/alat/cuaca-tani')) return 'https://agritani.com/og/alat-cuaca-tani.png';
  if (canonicalPath.startsWith('/alat/kalkulator-dosis')) return 'https://agritani.com/og/alat-kalkulator-dosis.png';
  if (canonicalPath.startsWith('/alat')) return 'https://agritani.com/og/alat-diagnosa-gejala.png';
  if (canonicalPath.startsWith('/produk')) return 'https://agritani.com/og/produk.png';

  return DEFAULT_OG_IMAGE;
}

export function assertSeo(input: SeoInput): void {
  if (!input.title || input.title.trim().length === 0) {
    throw new Error('SEO validation failed: title cannot be empty.');
  }
  if (!input.description || input.description.trim().length === 0) {
    throw new Error('SEO validation failed: description cannot be empty.');
  }
}

export function buildSeo(input: SeoInput): SeoOutput {
  assertSeo(input);

  const {
    title,
    metaTitle,
    description,
    canonicalPath,
    noindex = false,
    ogImage,
    ogType = 'website',
    pageType,
    article,
    breadcrumbs,
  } = input;

  // Title (DESIGN §4.4.2): metaTitle wins over title; every page except home ends with " - Agritani".
  // Final <title> must be 55–70 characters (owner rule 2026-09-30, enforced by scripts/check-seo.mjs).
  const base = metaTitle || title;
  const suffix = ` - ${SITE_NAME}`;
  const resolvedTitle = canonicalPath === '/' || base.endsWith(suffix) ? base : `${base}${suffix}`;

  const canonical = formatCanonicalUrl(canonicalPath);
  const fallbackOg = getDefaultOgImage(canonicalPath, article?.topic);
  const chosenOg = ogImage || fallbackOg;
  const resolvedOgImage = chosenOg.startsWith('http') ? chosenOg : `${SITE_URL}${chosenOg}`;

  const robots = noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  // Build JSON-LD @graph (DESIGN §4.4.3, §4.4.5 & DEC-007)
  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Agritani',
      alternateName: 'Agritani Official',
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/apple-touch-icon.png`,
        width: 180,
        height: 180,
      },
      description: 'Portal pertanian resmi Agritani yang dikelola Arif Prabowo, menghadirkan empat produk unggulan dan panduan agronomi lapangan.',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      inLanguage: 'id-ID',
    },
  ];

  // Breadcrumbs schema: use input breadcrumbs, or infer standard hierarchy for articles
  const resolvedBreadcrumbs =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs
      : ogType === 'article' && canonicalPath
      ? [
          { name: 'Beranda', url: '/' },
          { name: 'Jurnal Tani', url: '/jurnal/' },
          ...(article?.topic
            ? [
                {
                  name: article.topic,
                  url: `/jurnal/topik/${article.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
                },
              ]
            : []),
          { name: title, url: canonicalPath },
        ]
      : [];

  if (resolvedBreadcrumbs.length > 0) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: resolvedBreadcrumbs.map((b, idx, arr) => {
        const isLast = idx === arr.length - 1;
        const itemObj: Record<string, unknown> = {
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
        };
        // In Google guidelines and DESIGN §4.4.4: last item is current page
        if (!isLast) {
          itemObj.item = formatCanonicalUrl(b.url);
        } else {
          itemObj.item = canonical;
        }
        return itemObj;
      }),
    });
  }

  // WebPage schema node (when pageType is provided or for article pages)
  if (pageType || ogType === 'article') {
    const resolvedPageType =
      pageType === 'about'
        ? 'AboutPage'
        : pageType === 'profile'
        ? 'ProfilePage'
        : pageType === 'collection'
        ? 'CollectionPage'
        : 'WebPage';

    const webPageNode: Record<string, unknown> = {
      '@type': resolvedPageType,
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: resolvedTitle,
      description,
      inLanguage: 'id-ID',
      isPartOf: {
        '@id': `${SITE_URL}/#website`,
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
    };
    if (resolvedBreadcrumbs.length > 0) {
      webPageNode.breadcrumb = {
        '@id': `${canonical}#breadcrumb`,
      };
    }
    graph.push(webPageNode);
  }

  // Article schema
  let articleOgMeta: { publishedTime: string; modifiedTime: string; author: string; section?: string } | undefined;
  if (ogType === 'article' && article) {
    const authorName = article.author || 'Arif Prabowo';
    const authorUrl = `${SITE_URL}/penulis/arif-prabowo/`;
    const publishedTime = article.pubDate.toISOString();
    const modifiedTime = (article.updatedDate || article.pubDate).toISOString();

    articleOgMeta = {
      publishedTime,
      modifiedTime,
      author: authorUrl,
      section: article.topic,
    };

    const articleNode: Record<string, unknown> = {
      '@type': 'Article',
      '@id': `${canonical}#article`,
      isPartOf: {
        '@id': `${SITE_URL}/#website`,
      },
      mainEntityOfPage: {
        '@id': `${canonical}#webpage`,
      },
      headline: title,
      description,
      datePublished: publishedTime,
      dateModified: modifiedTime,
      mainEntity: canonical,
      inLanguage: 'id-ID',
      author: {
        '@type': 'Person',
        '@id': `${SITE_URL}/penulis/arif-prabowo/#person`,
        name: authorName,
        url: authorUrl,
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      keywords: article.tags?.join(', '),
    };

    // DESIGN §4.4.5: without heroImage, image property is omitted from Article schema
    if (article.heroImage) {
      articleNode.image = [
        article.heroImage.startsWith('http') ? article.heroImage : `${SITE_URL}${article.heroImage}`,
      ];
    }

    if (article.topic) {
      articleNode.articleSection = article.topic;
    }

    if (article.references && article.references.length > 0) {
      articleNode.citation = article.references.map((ref) => {
        const cleanDoi = ref.doi ? ref.doi.replace(/^https?:\/\/doi\.org\//, '') : undefined;
        return {
          '@type': 'ScholarlyArticle',
          name: ref.title,
          ...(cleanDoi ? { sameAs: `https://doi.org/${cleanDoi}` } : ref.url ? { sameAs: ref.url } : {}),
        };
      });
    }

    graph.push(articleNode);

    // Person schema node for author (DEC-016, DESIGN §4.4.5)
    graph.push({
      '@type': 'Person',
      '@id': `${SITE_URL}/penulis/arif-prabowo/#person`,
      name: authorName,
      jobTitle: 'Konsultan Pertanian Senior',
      worksFor: {
        '@id': `${SITE_URL}/#organization`,
      },
      url: authorUrl,
    });
  }

  return {
    title: resolvedTitle,
    description,
    canonical,
    robots,
    // meta author/publisher on every page (owner 2026-09-30): articles by Arif Prabowo; other pages and publisher = Agritani Official
    author: article?.author || (ogType === 'article' ? 'Arif Prabowo' : PUBLISHER_NAME),
    publisher: PUBLISHER_NAME,
    og: {
      title: resolvedTitle,
      description,
      url: canonical,
      image: resolvedOgImage,
      imageWidth: '1200',
      imageHeight: '630',
      imageAlt: resolvedTitle,
      type: ogType,
      siteName: SITE_NAME,
      locale: 'id_ID',
      article: articleOgMeta,
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description,
      image: resolvedOgImage,
      imageAlt: resolvedTitle,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': graph,
    },
  };
}

/** Owner SEO lengths (2026-09-30): final <title> 55–70 chars incl. " - Agritani"; meta description 120–155 chars. */
export const TITLE_RANGE = { min: 55, max: 70 } as const;
export const DESC_RANGE = { min: 120, max: 155 } as const;

/** Trim at a word boundary to `max` characters without a dangling separator. */
export function clipWords(text: string, max: number): string {
  if (text.length <= max) return text;
  const space = text.lastIndexOf(' ', max);
  const cut = space > 0 ? text.slice(0, space) : text.slice(0, max);
  return cut.replace(/[\s,.;:–-]+$/, '');
}

/**
 * First candidate whose length (plus `extra`, e.g. the 11-char " - Agritani" suffix) lands in [min, max];
 * otherwise the longest candidate clipped at a word boundary. Used for generated titles and descriptions.
 */
export function fitText(candidates: string[], range: { min: number; max: number }, extra = 0): string {
  const hit = candidates.find((c) => c.length + extra >= range.min && c.length + extra <= range.max);
  if (hit) return hit;
  if (candidates.length === 0) return '';
  const longest = [...candidates].sort((a, b) => b.length - a.length)[0];
  const clipped = clipWords(longest, range.max - extra);
  // Prefer ending at a clause boundary with a full stop over a mid-phrase cut.
  const boundary = Math.max(clipped.lastIndexOf(','), clipped.lastIndexOf(':'));
  if (boundary < 0) return clipped;
  const clause = clipped.slice(0, boundary);
  return clause.length + extra + 1 >= range.min ? `${clause}.` : clipped;
}
