import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { promoteDepths, promoteHeadingsHtml } from './headings.ts';

describe('promoteDepths (no h1 -> h3 skip)', () => {
  const cases: Array<[string, number[], number[]]> = [
    ['only ### sections become h2', [3, 3, 3], [2, 2, 2]],
    ['### with #### children keep their nesting', [3, 4, 3], [2, 3, 2]],
    ['leading ### before the first ## are promoted; later ones kept', [3, 2, 3, 2], [2, 2, 3, 2]],
    ['already correct outline is unchanged', [2, 3, 2], [2, 3, 2]],
    ['empty', [], []],
  ];
  for (const [name, input, expected] of cases) {
    it(name, () => assert.deepEqual(promoteDepths(input), expected));
  }
});

describe('promoteHeadingsHtml', () => {
  it('rewrites tags, keeps ids and inner markup, ignores escaped code', () => {
    const html = '<h3 id="a">A <em>x</em></h3><p>&lt;h3&gt;code&lt;/h3&gt;</p><h4 id="b">B</h4><h2 id="c">C</h2><h3 id="d">D</h3>';
    assert.equal(
      promoteHeadingsHtml(html),
      '<h2 id="a">A <em>x</em></h2><p>&lt;h3&gt;code&lt;/h3&gt;</p><h3 id="b">B</h3><h2 id="c">C</h2><h3 id="d">D</h3>'
    );
  });
});
