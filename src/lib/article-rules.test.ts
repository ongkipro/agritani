import { test } from 'node:test';
import assert from 'node:assert/strict';
// @ts-ignore -- plain ESM build script, no type declarations
import { checkArticle } from '../../scripts/check-articles.mjs';

const make = (over: Record<string, string> = {}, body = '\nIsi artikel.\n') => {
  const fm: Record<string, string> = {
    title: '"Pengendalian Wereng Batang Coklat pada Padi Sawah"',
    metaTitle: '"Pengendalian Wereng Batang Coklat Padi: Cegah Puso"',
    description: '"Panduan mengenali gejala hopperburn, ambang ekonomi, dan pengendalian wereng batang coklat terpadu pada padi sawah bersama musuh alami di lahan."',
    slug: '"pengendalian-wereng-batang-coklat-padi"',
    pubDate: '"2026-09-30"',
    author: '"Arif Prabowo"',
    topic: '"proteksi-tanaman"',
    draft: 'false',
    ...over,
  };
  const lines = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join('\n')}\ntags:\n  - "wereng batang coklat"\n---\n${body}`;
};

test('a complete published article passes', () => {
  assert.deepEqual(checkArticle(make()), []);
});

test('metaTitle and description lengths are enforced (DEC-022)', () => {
  assert.ok(checkArticle(make({ metaTitle: '"Wereng Padi"' })).some((p: string) => p.includes('metaTitle')));
  assert.ok(checkArticle(make({ description: '"Terlalu pendek."' })).some((p: string) => p.includes('description')));
});

test('hype words, pipe separator, and unknown topic are rejected', () => {
  assert.ok(checkArticle(make({ title: '"Rahasia Ampuh Basmi Wereng Padi Sawah"' })).some((p: string) => p.includes('klaim berlebihan')));
  assert.ok(checkArticle(make({ metaTitle: '"Pengendalian Wereng Batang Coklat | Cegah Puso Padi"' })).some((p: string) => p.includes('"|"')));
  assert.ok(checkArticle(make({ topic: '"hama"' })).some((p: string) => p.includes('topic')));
});

test('forbidden names and placeholders are rejected anywhere', () => {
  assert.ok(checkArticle(make({}, '\nDitulis oleh Prof. Arif Prabowo.\n')).length > 0);
  assert.ok(checkArticle(make({}, '\nTODO(OQ-3) rujukan.\n')).length > 0);
});

test('drafts only need a valid slug', () => {
  assert.deepEqual(checkArticle(make({ draft: 'true', metaTitle: '"x"', description: '"y"' })), []);
  assert.ok(checkArticle(make({ draft: 'true', slug: '"Slug Salah"' })).length > 0);
});

test('updatedDate must be YYYY-MM-DD, not before pubDate, not in the future', () => {
  assert.deepEqual(checkArticle(make({ updatedDate: '"2026-09-30"' })), []);
  assert.ok(checkArticle(make({ updatedDate: '"30-09-2026"' })).some((p: string) => p.includes('updatedDate')));
  assert.ok(checkArticle(make({ updatedDate: '"2026-09-01"' })).some((p: string) => p.includes('sebelum pubDate')));
  assert.ok(checkArticle(make({ updatedDate: '"2999-01-01"' })).some((p: string) => p.includes('masa depan')));
});
