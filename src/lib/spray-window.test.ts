/**
 * src/lib/spray-window.test.ts
 * Table-driven behavioral tests for Spray Suitability Window (REQ-10, ARCHITECTURE §5b).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sprayWindow, type SprayThresholds, type WeatherSlot } from './spray-window.ts';

describe('Spray Suitability Window (REQ-10, ARCHITECTURE §5b)', () => {
  const activeThresholds: SprayThresholds = {
    rainTundaMm: 1.0,
    windTundaKmh: 15.0,
    windHatiKmh: 10.0,
    tempHatiC: 30.0,
    humidityHatiPct: 60.0,
    reviewedBy: 'Arif Prabowo',
    sources: ['Standar GAP Kementan RI', 'Pedoman Kalibrasi Sprayer'],
  };

  const baseSlot: WeatherSlot = {
    local_datetime: '2026-09-30 07:00:00',
    datetime: '2026-09-30T00:00:00Z',
    t: 26,
    hu: 80,
    tp: 0,
    ws: 5,
    wd: 'E',
    weather_desc: 'Cerah',
  };

  it('hides indicator when thresholds is null', () => {
    const res = sprayWindow(baseSlot, null, null);
    assert.equal(res.status, null);
    assert.deepEqual(res.reasons, []);
  });

  it('hides indicator when thresholds has empty or whitespace reviewedBy', () => {
    const unreviewed: SprayThresholds = {
      ...activeThresholds,
      reviewedBy: '   ',
    };
    const res = sprayWindow(baseSlot, null, unreviewed);
    assert.equal(res.status, null);
    assert.deepEqual(res.reasons, []);
  });

  it('returns "layak" when all weather parameters are within optimal ranges', () => {
    const res = sprayWindow(baseSlot, null, activeThresholds);
    assert.equal(res.status, 'layak');
    assert.ok(res.reasons.length > 0);
  });

  it('returns "tunda" when rain in current slot exceeds threshold', () => {
    const rainySlot: WeatherSlot = { ...baseSlot, tp: 2.5 };
    const res = sprayWindow(rainySlot, null, activeThresholds);
    assert.equal(res.status, 'tunda');
    assert.ok(res.reasons.some((r) => r.includes('berisiko mencuci')));
  });

  it('returns "tunda" when rain in next slot exceeds threshold (rainfastness risk)', () => {
    const nextRainy: WeatherSlot = { ...baseSlot, tp: 1.5 };
    const res = sprayWindow(baseSlot, nextRainy, activeThresholds);
    assert.equal(res.status, 'tunda');
    assert.ok(res.reasons.some((r) => r.includes('slot berikutnya')));
  });

  it('returns "tunda" when wind speed exceeds tunda threshold', () => {
    const windySlot: WeatherSlot = { ...baseSlot, ws: 18.0 };
    const res = sprayWindow(windySlot, null, activeThresholds);
    assert.equal(res.status, 'tunda');
    assert.ok(res.reasons.some((r) => r.includes('drift tinggi')));
  });

  it('returns "hati-hati" when wind speed is moderate', () => {
    const moderateWind: WeatherSlot = { ...baseSlot, ws: 12.0 };
    const res = sprayWindow(moderateWind, null, activeThresholds);
    assert.equal(res.status, 'hati-hati');
    assert.ok(res.reasons.some((r) => r.includes('perlu diwaspadai')));
  });

  it('returns "hati-hati" when temperature is high', () => {
    const hotSlot: WeatherSlot = { ...baseSlot, t: 33 };
    const res = sprayWindow(hotSlot, null, activeThresholds);
    assert.equal(res.status, 'hati-hati');
    assert.ok(res.reasons.some((r) => r.includes('penguapan')));
  });

  it('returns "hati-hati" when relative humidity is low', () => {
    const drySlot: WeatherSlot = { ...baseSlot, hu: 45 };
    const res = sprayWindow(drySlot, null, activeThresholds);
    assert.equal(res.status, 'hati-hati');
    assert.ok(res.reasons.some((r) => r.includes('kristalisasi droplet')));
  });

  it('prioritizes "tunda" over "hati-hati" when multiple conditions occur', () => {
    // Both high temperature (hati-hati) and high wind (tunda)
    const combinedSlot: WeatherSlot = { ...baseSlot, t: 34, ws: 16.5 };
    const res = sprayWindow(combinedSlot, null, activeThresholds);
    assert.equal(res.status, 'tunda');
    assert.equal(res.reasons.length, 2);
  });
});
