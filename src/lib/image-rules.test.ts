import { test } from 'node:test';
import assert from 'node:assert/strict';
// @ts-ignore -- plain ESM build script, no type declarations
import { checkImagesInHtml, nonWebpSources } from '../../scripts/check-images.mjs';
import { articleImageAlt } from './image-alt.ts';

test('a WebP image with a descriptive alt passes', () => {
  assert.deepEqual(checkImagesInHtml('<img src="/_astro/cabai.webp" alt="Ilustrasi cabai: Pengendalian Antraknosa">'), []);
});

test('empty, bare, short, generic alt and non-WebP src fail', () => {
  assert.equal(checkImagesInHtml('<img src="/a.webp" alt>').length, 1);
  assert.equal(checkImagesInHtml('<img src="/a.webp" alt="">').length, 1);
  assert.equal(checkImagesInHtml('<img src="/a.webp" alt="Cabai">').length, 1);
  assert.equal(checkImagesInHtml('<img src="/a.webp" alt="Ilustrasi">').length, 1);
  assert.equal(checkImagesInHtml('<img src="/a.jpg?w=2" alt="Ilustrasi cabai merah di lahan">').length, 1);
  assert.deepEqual(checkImagesInHtml('<img src="/icons/x.svg" alt="Ikon cuaca cerah berawan">'), []);
});

test('only OG and apple-touch PNGs may stay non-WebP', () => {
  assert.deepEqual(nonWebpSources(['public/og/jurnal.png', 'public/apple-touch-icon.png', 'src/assets/a.webp', 'public/favicon.svg']), []);
  assert.deepEqual(nonWebpSources(['src/assets/images/foto.jpg', 'public/banner.png']), ['src/assets/images/foto.jpg', 'public/banner.png']);
});

test('articleImageAlt uses the commodity (or topic) and the title, max 125 chars', () => {
  assert.equal(articleImageAlt({ title: 'Pengendalian Wereng Batang Coklat', topic: 'proteksi-tanaman', commodities: ['padi'] }), 'Ilustrasi padi: Pengendalian Wereng Batang Coklat');
  assert.match(articleImageAlt({ title: 'Mengenal Tanah Liat', topic: 'tanah-nutrisi' }), /^Ilustrasi tanah & nutrisi: /);
  const long = articleImageAlt({ title: 'x '.repeat(100), topic: 'budidaya', commodities: ['bawang-merah'] });
  assert.ok(long.length <= 125 && long.startsWith('Ilustrasi bawang merah: '));
});
