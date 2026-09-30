/**
 * src/lib/triage.test.ts
 * Unit tests for triage symptoms filtering and review gating (REQ-06, ARCHITECTURE §3.1, DEC-015)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterVisibleSymptoms, getActiveCommodities } from './triage.ts';

describe('Triage Review Gating (ARCHITECTURE §3.1, DEC-015)', () => {
  const sampleSymptoms = [
    { id: 'sym-1', commodity: 'cabai', diagnosis: 'Antraknosa', reviewedBy: undefined },
    { id: 'sym-2', commodity: 'padi', diagnosis: 'Blas Daun', reviewedBy: 'Arif Prabowo' },
    { id: 'sym-3', commodity: 'jagung', diagnosis: 'Bulai Jagung', reviewedBy: '' },
    { id: 'sym-4', commodity: 'kelapa-sawit', diagnosis: 'Ganoderma', reviewedBy: '   ' },
  ];

  const commodityMap = new Map([
    ['cabai', 'Cabai'],
    ['padi', 'Padi'],
    ['jagung', 'Jagung'],
    ['kelapa-sawit', 'Kelapa Sawit'],
  ]);

  it('filters out unreviewed symptoms in production mode (isDraftPreview: false)', () => {
    const visible = filterVisibleSymptoms(sampleSymptoms, false);

    assert.equal(visible.length, 1);
    assert.equal(visible[0].id, 'sym-2');
    assert.equal(visible[0].diagnosis, 'Blas Daun');
    assert.equal(visible[0].reviewedBy, 'Arif Prabowo');
  });

  it('includes unreviewed symptoms in draft preview mode (isDraftPreview: true)', () => {
    const visible = filterVisibleSymptoms(sampleSymptoms, true);

    assert.equal(visible.length, 4);
    assert.deepEqual(
      visible.map((s) => s.id),
      ['sym-1', 'sym-2', 'sym-3', 'sym-4']
    );
  });

  it('returns empty array when all symptoms are unreviewed in production', () => {
    const unreviewedList = [
      { id: 'sym-1', commodity: 'cabai', reviewedBy: undefined },
      { id: 'sym-2', commodity: 'padi', reviewedBy: '' },
    ];

    const visible = filterVisibleSymptoms(unreviewedList, false);
    assert.equal(visible.length, 0);

    const activeCommodities = getActiveCommodities(visible, commodityMap);
    assert.equal(activeCommodities.length, 0);
  });

  it('derives active commodities only from visible symptoms', () => {
    // Only sym-2 (padi) is visible in production
    const visible = filterVisibleSymptoms(sampleSymptoms, false);
    const activeCommodities = getActiveCommodities(visible, commodityMap);

    assert.equal(activeCommodities.length, 1);
    assert.equal(activeCommodities[0].id, 'padi');
    assert.equal(activeCommodities[0].name, 'Padi');
  });
});
