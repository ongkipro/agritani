import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildRelatedMap, countOrphans, relatedScore, type RelatedCandidate } from './related.ts';

const a = (slug: string, topic: string, commodities: string[], tags: string[]): RelatedCandidate => ({ slug, topic, commodities, tags });

describe('relatedScore (DESIGN §4.3.1 block 17)', () => {
  const cases: Array<[string, RelatedCandidate, RelatedCandidate, (s: number) => boolean]> = [
    ['self never links', a('x', 't', ['padi'], ['a']), a('x', 't', ['padi'], ['a']), (s) => s === 0],
    ['different specific crops never cross-link', a('x', 't', ['padi'], ['a']), a('y', 't', ['cabai'], ['a']), (s) => s === 0],
    ['shared commodity outranks tags + topic', a('x', 't', ['padi'], []), a('y', 'u', ['padi'], []), (s) => s >= 100],
    ['general vs crop needs a shared tag', a('x', 't', [], ['hama']), a('y', 't', ['padi'], ['lain']), (s) => s === 0],
    ['general vs crop with shared tag (case-insensitive)', a('x', 't', [], ['Hama']), a('y', 't', ['padi'], ['hama']), (s) => s === 11],
    ['two general articles: same topic alone is enough', a('x', 't', [], ['p']), a('y', 't', [], ['q']), (s) => s === 1],
  ];
  for (const [name, art, cand, ok] of cases) {
    it(name, () => {
      const s = relatedScore(art, cand);
      assert.ok(ok(s), `score ${s}`);
    });
  }
});

describe('buildRelatedMap', () => {
  it('higher score always wins over coverage', () => {
    const arts = [
      a('a', 't', ['padi'], ['x', 'y']),
      a('b', 't', ['padi'], ['x', 'y']), // strong match for a
      a('c', 't', ['padi'], []), // weak match for a
    ];
    assert.deepEqual(buildRelatedMap(arts, 1).get('a'), ['b']);
  });

  it('ties go to the candidate with fewer inbound links, spreading coverage', () => {
    // Every article ties with every other; with limit 1 the naive "first by slug" picks would leave d orphaned.
    const arts = ['a', 'b', 'c', 'd'].map((s) => a(s, 't', ['padi'], []));
    const map = buildRelatedMap(arts, 1);
    assert.equal(countOrphans(map), 0);
  });

  it('is deterministic regardless of input order and respects the limit', () => {
    const arts = ['e', 'a', 'd', 'b', 'c', 'f'].map((s, i) => a(s, i % 2 ? 't' : 'u', ['padi'], [String(i % 3)]));
    const m1 = buildRelatedMap(arts, 4);
    const m2 = buildRelatedMap([...arts].reverse(), 4);
    assert.deepEqual([...m1.entries()].sort(), [...m2.entries()].sort());
    for (const picks of m1.values()) assert.ok(picks.length <= 4);
  });

  it('never links unrelated crops even when slots stay empty', () => {
    const map = buildRelatedMap([a('a', 't', ['padi'], ['x']), a('b', 't', ['cabai'], ['x'])]);
    assert.deepEqual(map.get('a'), []);
    assert.equal(countOrphans(map), 2);
  });
});
