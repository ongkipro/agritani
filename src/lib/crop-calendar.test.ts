/**
 * src/lib/crop-calendar.test.ts
 * Behavioral and table-driven unit tests for Kalender Tanam logic & ICS generation (REQ-09)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays,
  filterVisibleCalendars,
  calculateCropPlan,
} from './crop-calendar.ts';
import type { CropCalendarEntry } from './crop-calendar.ts';
import { generateCropCalendarIcs, formatIcsDate } from './ics.ts';

// Mock Rice Crop Calendar Entry
const mockPadiCalendar: CropCalendarEntry = {
  id: 'padi',
  type: 'semusim',
  cycleDays: { min: 105, max: 125 },
  phases: [
    {
      id: 'persemaian',
      name: 'Persemaian',
      startDay: -21,
      endDay: 0,
      activities: ['Olah tanah', 'Rendam benih'],
      watch: [{ name: 'Keong Mas', article: 'keong-mas-padi' }],
    },
    {
      id: 'vegetatif-awal',
      name: 'Vegetatif Awal',
      startDay: 1,
      endDay: 25,
      activities: ['Pindah tanam', 'Pupuk dasar'],
      watch: [{ name: 'Kresek', article: 'kresek-padi' }],
    },
    {
      id: 'vegetatif-aktif',
      name: 'Vegetatif Aktif',
      startDay: 26,
      endDay: 50,
      activities: ['Pupuk susulan', 'Pengairan berselang'],
      watch: [{ name: 'Wereng Coklat', article: 'wereng-coklat' }],
    },
    {
      id: 'generatif-bunting',
      name: 'Generatif Bunting',
      startDay: 51,
      endDay: 80,
      activities: ['Genangi air dangkal', 'Pupuk K'],
      watch: [{ name: 'Blas', article: 'blas-padi' }],
    },
    {
      id: 'pemasakan-panen',
      name: 'Pemasakan & Panen',
      startDay: 81,
      endDay: 125,
      activities: ['Keringkan sawah', 'Panen gabah'],
      watch: [{ name: 'Walang Sangit', article: 'walang-sangit' }],
    },
  ],
  annualTasks: [],
  seasons: [
    { code: 'MT1', label: 'Rendengan', plantMonths: [10, 11, 12], harvestMonths: [2, 3, 4] },
  ],
  sources: ['Bahan awal internal: agrimarket docs/spec/KALENDER-TANAM-NASIONAL.md'],
  seededFrom: 'agrimarket',
  reviewedBy: undefined, // unreviewed by default
};

const mockSawitCalendar: CropCalendarEntry = {
  id: 'kelapa-sawit',
  type: 'tahunan',
  phases: [],
  annualTasks: [
    { months: [1, 7], task: 'Pemupukan makro semesteran' },
    { months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], task: 'Panen rotasi TBS' },
  ],
  seasons: [
    { code: 'MT1', label: 'Semester I', plantMonths: [1, 2, 3, 4, 5, 6], harvestMonths: [1, 2, 3, 4, 5, 6] },
  ],
  sources: ['Bahan awal internal: agrimarket docs/spec/KALENDER-TANAM-NASIONAL.md'],
  reviewedBy: undefined,
};

describe('Crop Calendar Date & Calculation Engine (REQ-09)', () => {
  it('correctly calculates past planting date (positive HST and current phase detection)', () => {
    // Planting date: 2026-09-01, Reference today: 2026-10-05 (34 days after planting)
    const plantDate = new Date(2026, 8, 1); // Sept 1, 2026
    const today = new Date(2026, 9, 5); // Oct 5, 2026 (HST 34)

    const plan = calculateCropPlan(mockPadiCalendar, plantDate, today);

    assert.equal(plan.type, 'semusim');
    assert.equal(plan.currentHst, 34);
    assert.ok(plan.currentPhase !== null);
    assert.equal(plan.currentPhase?.id, 'vegetatif-aktif');
    assert.equal(plan.currentPhase?.name, 'Vegetatif Aktif');
    assert.equal(plan.currentPhase?.isCurrent, true);

    // Verify other phases status
    const vegAwal = plan.computedPhases.find((p) => p.id === 'vegetatif-awal');
    const generatif = plan.computedPhases.find((p) => p.id === 'generatif-bunting');
    assert.equal(vegAwal?.isPast, true);
    assert.equal(generatif?.isFuture, true);

    // Verify harvest window estimation
    assert.ok(plan.harvestRangeStr !== null);
    assert.ok(plan.harvestRangeStr?.includes('Des 2026') || plan.harvestRangeStr?.includes('Jan 2027'));
  });

  it('handles future planned planting date (null HST and future phases)', () => {
    // Planting date: 2026-11-01, Today: 2026-10-01
    const plantDate = new Date(2026, 10, 1); // Nov 1, 2026
    const today = new Date(2026, 9, 1); // Oct 1, 2026

    const plan = calculateCropPlan(mockPadiCalendar, plantDate, today);

    assert.equal(plan.currentHst, null);
    assert.equal(plan.currentPhase, null);
    assert.ok(plan.computedPhases.every((p) => p.isFuture || p.id === 'persemaian'));
  });

  it('handles leap year calculations correctly across February 29', () => {
    // Leap year: 2024 (Feb has 29 days)
    // Plant on 2024-02-20. 10 days later should be 2024-03-01.
    const plantDate = new Date(2024, 1, 20); // Feb 20, 2024
    const next10Days = addDays(plantDate, 10);

    assert.equal(next10Days.getFullYear(), 2024);
    assert.equal(next10Days.getMonth(), 2); // March
    assert.equal(next10Days.getDate(), 1); // March 1st

    const plan = calculateCropPlan(mockPadiCalendar, plantDate, plantDate);
    const vegAwal = plan.computedPhases.find((p) => p.id === 'vegetatif-awal');
    // StartDay 1: Feb 21. EndDay 25: Feb 20 + 25 days = 9 days in Feb (21-29) + 16 days in March = March 16.
    assert.equal(vegAwal?.endDate.getMonth(), 2); // March
    assert.equal(vegAwal?.endDate.getDate(), 16);
  });

  it('handles cross-year boundary transitions gracefully', () => {
    // Plant on 2026-12-15
    const plantDate = new Date(2026, 11, 15); // Dec 15, 2026
    const plan = calculateCropPlan(mockPadiCalendar, plantDate);

    // Harvest window: 105 to 125 days later -> Late March to mid April 2027
    assert.ok(plan.harvestStart !== null);
    assert.ok(plan.harvestEnd !== null);
    assert.equal(plan.harvestStart?.getFullYear(), 2027);
    assert.equal(plan.harvestEnd?.getFullYear(), 2027);
    assert.equal(plan.harvestStart?.getMonth(), 2); // March (month 2 is March)
  });

  it('handles perennial crops (kelapa-sawit) with annual tasks and no HST', () => {
    const plantDate = new Date(2026, 0, 1);
    const plan = calculateCropPlan(mockSawitCalendar, plantDate);

    assert.equal(plan.type, 'tahunan');
    assert.equal(plan.currentHst, null);
    assert.equal(plan.currentPhase, null);
    assert.equal(plan.harvestRangeStr, null);
    assert.equal(plan.computedPhases.length, 0);
    assert.equal(plan.annualTasks.length, 2);
  });

  it('filters unreviewed calendars in production while allowing them in draft preview (ARCHITECTURE §3.1)', () => {
    const list = [
      { id: 'padi', reviewedBy: undefined },
      { id: 'cabai', reviewedBy: 'Arif Prabowo' },
      { id: 'tomat', reviewedBy: '' },
    ];

    // Production mode (isDraftPreview: false) -> only reviewed commodities visible
    const prodVisible = filterVisibleCalendars(list, false);
    assert.equal(prodVisible.length, 1);
    assert.equal(prodVisible[0].id, 'cabai');

    // Draft preview mode (isDraftPreview: true) -> all commodities visible
    const previewVisible = filterVisibleCalendars(list, true);
    assert.equal(previewVisible.length, 3);
  });
});

describe('iCalendar (.ics) Generation (RFC 5545)', () => {
  it('generates valid RFC 5545 format with all-day VEVENT and exclusive DTEND', () => {
    const plantDate = new Date(2026, 8, 1); // Sept 1, 2026
    const plan = calculateCropPlan(mockPadiCalendar, plantDate);

    const icsContent = generateCropCalendarIcs(plan, 'Padi');

    assert.ok(icsContent.startsWith('BEGIN:VCALENDAR'));
    assert.ok(icsContent.includes('VERSION:2.0'));
    assert.ok(icsContent.includes('PRODID:-//PT Agritani Internasional//Kalender Tanam//ID'));
    assert.ok(icsContent.includes('BEGIN:VEVENT'));
    assert.ok(icsContent.includes('SUMMARY:[Padi] Vegetatif Awal'));
    assert.ok(icsContent.includes('SUMMARY:🌾 Perkiraan Panen: Padi'));
    assert.ok(icsContent.includes('END:VCALENDAR'));

    // Check DTEND exclusivity for an all-day event
    // Vegetatif awal: startDay 1 (Sept 2), endDay 25 (Sept 26).
    // RFC 5545 requires DTEND to be exclusive (+1 day), so DTEND should be Sept 27.
    assert.ok(icsContent.includes('DTSTART;VALUE=DATE:20260902'));
    assert.ok(icsContent.includes('DTEND;VALUE=DATE:20260927'));
  });

  it('formats dates to YYYYMMDD correctly', () => {
    const date = new Date(2027, 0, 5); // Jan 5, 2027
    assert.equal(formatIcsDate(date), '20270105');
  });
});
