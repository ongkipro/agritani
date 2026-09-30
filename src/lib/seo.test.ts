import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSeo, formatCanonicalUrl, SITE_URL } from './seo.ts';

describe('SEO & Metadata Builder (DESIGN §4.4)', () => {
  it('adds site suffix to standard page title', () => {
    const seo = buildSeo({
      title: 'Diagnosa Gejala Tanaman',
      description: 'Panduan identifikasi gejala penyakit tanaman di lapangan.',
    });
    assert.equal(seo.title, 'Diagnosa Gejala Tanaman | Agritani');
    assert.equal(seo.og.title, 'Diagnosa Gejala Tanaman | Agritani');
  });

  it('uses metaTitle verbatim without suffix when provided (articles)', () => {
    const seo = buildSeo({
      title: 'Mengapa Jamur Ganoderma Kebal Terhadap Fungisida Kimia?',
      metaTitle: 'Cara Mengatasi Ganoderma Sawit dan Imunitas Alami',
      description: 'Panduan memulihkan kebun kelapa sawit dari busuk pangkal batang.',
    });
    assert.equal(seo.title, 'Cara Mengatasi Ganoderma Sawit dan Imunitas Alami');
    assert.equal(seo.og.title, 'Cara Mengatasi Ganoderma Sawit dan Imunitas Alami');
  });

  it('formats canonical URL with trailing slash and strips query parameters', () => {
    const canonical = formatCanonicalUrl('/alat/kalender-tanam?k=cabai&t=2026-10-12');
    assert.equal(canonical, `${SITE_URL}/alat/kalender-tanam/`);
  });

  it('handles empty canonical path gracefully with root trailing slash', () => {
    const canonical = formatCanonicalUrl();
    assert.equal(canonical, `${SITE_URL}/`);
  });

  it('sets noindex robots tag when noindex is true', () => {
    const seo = buildSeo({
      title: 'Halaman Tidak Ditemukan',
      description: 'Halaman yang Anda cari tidak ditemukan.',
      noindex: true,
    });
    assert.equal(seo.robots, 'noindex, nofollow');
  });

  it('sets full index robots directive when noindex is false', () => {
    const seo = buildSeo({
      title: 'Alat Tani',
      description: 'Kumpulan kalkulator dan alat bantu agronomi.',
    });
    assert.ok(seo.robots.includes('index, follow'));
    assert.ok(seo.robots.includes('max-image-preview:large'));
  });

  it('generates schema.org @graph with Organization, WebSite, and BreadcrumbList', () => {
    const seo = buildSeo({
      title: 'Diagnosa',
      description: 'Identifikasi penyakit',
      canonicalPath: '/alat/diagnosa-gejala/',
      breadcrumbs: [
        { name: 'Beranda', url: '/' },
        { name: 'Alat Tani', url: '/alat/' },
        { name: 'Diagnosa Gejala', url: '/alat/diagnosa-gejala/' },
      ],
    });

    const graph = (seo.jsonLd as any)['@graph'];
    assert.ok(Array.isArray(graph));
    assert.equal(graph.length, 3);
    assert.equal(graph[0]['@type'], 'Organization');
    assert.equal(graph[1]['@type'], 'WebSite');
    assert.equal(graph[2]['@type'], 'BreadcrumbList');
    assert.equal(graph[2].itemListElement.length, 3);
  });

  it('generates Article schema with Person author when ogType is article', () => {
    const pubDate = new Date('2026-09-29T00:00:00Z');
    const seo = buildSeo({
      title: 'Inovasi Proteksi Sawit',
      description: 'Ulasan ilmiah imunitas sawit',
      canonicalPath: '/jurnal/inovasi-sawit/',
      ogType: 'article',
      article: {
        pubDate,
        author: 'Arif Prabowo',
        tags: ['sawit', 'ganoderma'],
      },
    });

    const graph = (seo.jsonLd as any)['@graph'];
    const articleNode = graph.find((n: any) => n['@type'] === 'Article');
    assert.ok(articleNode);
    assert.equal(articleNode.headline, 'Inovasi Proteksi Sawit');
    assert.equal(articleNode.author['@type'], 'Person');
    assert.equal(articleNode.author.name, 'Arif Prabowo');
    assert.equal(articleNode.datePublished, pubDate.toISOString());
    assert.equal(articleNode.image, undefined, 'Image property must be omitted when heroImage is absent (DESIGN §4.4.5)');

    const personNode = graph.find((n: any) => n['@type'] === 'Person');
    assert.ok(personNode);
    assert.equal(personNode.jobTitle, 'Konsultan Pertanian Senior');
    assert.equal(personNode.honorificPrefix, undefined);
    assert.deepEqual(personNode.worksFor, { '@id': 'https://agritani.com/#organization' });
  });

  it('includes image property on Article schema only when heroImage is present (DESIGN §4.4.5)', () => {
    const pubDate = new Date('2026-09-29T00:00:00Z');
    const seo = buildSeo({
      title: 'Inovasi Proteksi Sawit',
      description: 'Ulasan ilmiah imunitas sawit',
      canonicalPath: '/jurnal/inovasi-sawit/',
      ogType: 'article',
      article: {
        pubDate,
        author: 'Arif Prabowo',
        tags: ['sawit', 'ganoderma'],
        heroImage: '/images/hero-sawit.webp',
      },
    });

    const graph = (seo.jsonLd as any)['@graph'];
    const articleNode = graph.find((n: any) => n['@type'] === 'Article');
    assert.ok(articleNode);
    assert.deepEqual(articleNode.image, ['https://agritani.com/images/hero-sawit.webp']);
  });
});
