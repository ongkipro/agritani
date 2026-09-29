/**
 * src/lib/bmkg.test.ts
 * Behavioral and table-driven unit tests for BMKG date formatting, wind direction, and staleness.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatAnalysisDate,
  formatSlotTime,
  formatWindDirection,
  isAnalysisStale,
} from './bmkg.ts';

describe('BMKG Utilities & Formatters (REQ-10)', () => {
  it('formats UTC analysis_date into Indonesian WIB datetime string (29 Sep 2026, 19.00 WIB)', () => {
    // Case 1: Raw BMKG format without Z (12:00 UTC = 19:00 WIB)
    const rawUtc = '2026-09-29 12:00:00';
    const formatted = formatAnalysisDate(rawUtc);
    assert.equal(formatted, '29 Sep 2026, 19.00 WIB');

    // Case 2: ISO string with Z
    const isoUtc = '2026-09-29T12:00:00Z';
    assert.equal(formatAnalysisDate(isoUtc), '29 Sep 2026, 19.00 WIB');

    // Case 3: Empty string returns fallback dash
    assert.equal(formatAnalysisDate(''), '-');

    // Case 4: Invalid date string returns input safely
    assert.equal(formatAnalysisDate('invalid-date'), 'invalid-date');
  });

  it('formats 3-hour slot time string to HH.mm format', () => {
    assert.equal(formatSlotTime('2026-09-30 07:00:00'), '07.00');
    assert.equal(formatSlotTime('2026-09-30 13:00:00'), '13.00');
    assert.equal(formatSlotTime('2026-09-30 22:30:00'), '22.30');
  });

  it('translates compass wind directions to authentic Indonesian terms', () => {
    assert.equal(formatWindDirection('N'), 'Utara');
    assert.equal(formatWindDirection('NE'), 'Timur Laut');
    assert.equal(formatWindDirection('S'), 'Selatan');
    assert.equal(formatWindDirection('WSW'), 'Barat Barat Daya');
    assert.equal(formatWindDirection('CALM'), 'Tenang');
  });

  it('detects stale analysis dates older than 24 hours', () => {
    const now = new Date('2026-09-30T12:00:00Z');
    // 12 hours ago -> not stale
    assert.equal(isAnalysisStale('2026-09-30 00:00:00', now), false);
    // 25 hours ago -> stale
    assert.equal(isAnalysisStale('2026-09-29 11:00:00', now), true);
  });
});
