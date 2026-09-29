/**
 * src/lib/seo.ts
 * Dynamic SEO metadata and JSON-LD schema builder adhering to DESIGN §4.4
 */

export const SITE_URL = 'https://agritani.com';
export const SITE_NAME = 'Agritani';
export const DEFAULT_OG_IMAGE = 'https://agritani.com/og/og-beranda.png';

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
}

export interface SeoInput {
  title: string;
  metaTitle?: string;
  description: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article';
  article?: SeoArticleMeta;
  breadcrumbs?: BreadcrumbItem[];
}

export interface SeoOutput {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  og: {
    title: string;
    description: string;
    url: string;
    image: string;
    type: 'website' | 'article';
    siteName: string;
    locale: string;
  };
  twitter: {
    card: 'summary_large_image';
    title: string;
    description: string;
    image: string;
  };
  jsonLd: Record<string, unknown>;
}

export function formatCanonicalUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) return `${SITE_URL}/`;

  let urlStr = pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;

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

export function buildSeo(input: SeoInput): SeoOutput {
  const {
    title,
    metaTitle,
    description,
    canonicalPath,
    noindex = false,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    article,
    breadcrumbs,
  } = input;

  // Title: metaTitle takes precedence verbatim (DESIGN §4.4.2); otherwise append site suffix
  const resolvedTitle = metaTitle ? metaTitle : `${title} | ${SITE_NAME}`;

  const canonical = formatCanonicalUrl(canonicalPath);
  const resolvedOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  const robots = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  // Build JSON-LD @graph (DESIGN §4.4.3 & DEC-007)
  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'PT Agritani Internasional',
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
      description: 'Distributor resmi sarana produksi dan biostimulan pertanian presisi.',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      inLanguage: 'id',
    },
  ];

  // Breadcrumbs schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: formatCanonicalUrl(b.url),
      })),
    });
  }

  // Article schema
  if (ogType === 'article' && article) {
    const authorName = article.author || 'Arif Prabowo';
    graph.push({
      '@type': 'Article',
      '@id': `${canonical}#article`,
      isPartOf: {
        '@id': `${SITE_URL}/#website`,
      },
      headline: title,
      description,
      datePublished: article.pubDate.toISOString(),
      dateModified: (article.updatedDate || article.pubDate).toISOString(),
      mainEntityOfPage: canonical,
      image: resolvedOgImage,
      inLanguage: 'id',
      author: {
        '@type': 'Person',
        name: authorName,
        url: `${SITE_URL}/penulis/arif-prabowo/`,
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      keywords: article.tags?.join(', '),
    });
  }

  return {
    title: resolvedTitle,
    description,
    canonical,
    robots,
    og: {
      title: resolvedTitle,
      description,
      url: canonical,
      image: resolvedOgImage,
      type: ogType,
      siteName: SITE_NAME,
      locale: 'id_ID',
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description,
      image: resolvedOgImage,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': graph,
    },
  };
}
