/**
 * src/lib/crop-calendar.ts
 * Calculation logic and date utilities for Kalender Tanam (REQ-09, DESIGN §2.6.1, ARCHITECTURE §5b)
 */

export interface Phase {
  id: string;
  name: string;
  startDay: number;
  endDay: number;
  activities: string[];
  watch: Array<{ name: string; article?: string }>;
}

export interface Season {
  code: 'MT1' | 'MT2' | 'MT3';
  label: string;
  plantMonths: number[];
  harvestMonths: number[];
}

export interface AnnualTask {
  months: number[];
  task: string;
}

export interface CropCalendarEntry {
  id: string;
  type: 'semusim' | 'tahunan';
  cycleDays?: { min: number; max: number };
  phases: Phase[];
  annualTasks: AnnualTask[];
  seasons: Season[];
  sources: string[];
  seededFrom?: string;
  reviewedBy?: string;
  reviewedAt?: Date | string;
}

export interface ComputedPhase extends Phase {
  startDate: Date;
  endDate: Date;
  startDateStr: string;
  endDateStr: string;
  dateRangeStr: string;
  isCurrent: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export interface CropPlanResult {
  commodityId: string;
  plantDate: Date;
  plantDateStr: string;
  type: 'semusim' | 'tahunan';
  currentHst: number | null; // null if future plant date
  currentPhase: ComputedPhase | null;
  harvestStart: Date | null;
  harvestEnd: Date | null;
  harvestRangeStr: string | null;
  computedPhases: ComputedPhase[];
  annualTasks: AnnualTask[];
  seasons: Season[];
  sources: string[];
  reviewedBy?: string;
}

/**
 * Add days to a Date object without timezone drift
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate difference in calendar days between two dates: (dateA - dateB)
 */
export function diffDays(dateA: Date, dateB: Date): number {
  const utcA = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const utcB = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  return Math.floor((utcA - utcB) / (1000 * 60 * 60 * 24));
}

/**
 * Format date in Indonesian locale (e.g., "12 Feb 2027")
 */
export function formatDateId(date: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format date range in Indonesian locale (e.g., "12–26 Feb 2027" or "25 Des 2026 – 5 Jan 2027")
 */
export function formatDateRangeId(start: Date, end: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = months[start.getMonth()];
  const endMonth = months[end.getMonth()];
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      if (startDay === endDay) {
        return `${startDay} ${startMonth} ${startYear}`;
      }
      return `${startDay}–${endDay} ${startMonth} ${startYear}`;
    }
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }
  return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
}

/**
 * Parse YYYY-MM-DD string into local midnight Date
 */
export function parseIsoDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    throw new Error(`Format tanggal tidak valid (harus YYYY-MM-DD): "${dateStr}"`);
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  if (isNaN(date.getTime()) || date.getDate() !== day) {
    throw new Error(`Tanggal kalender tidak valid: "${dateStr}"`);
  }
  return date;
}

/**
 * Filter calendars that are eligible for display based on reviewedBy and draft mode
 * (ARCHITECTURE §3.1: unreviewed calendars are hidden in production)
 */
export function filterVisibleCalendars<T extends { reviewedBy?: string }>(
  calendars: T[],
  isDraftPreview: boolean
): T[] {
  if (isDraftPreview) {
    return calendars;
  }
  return calendars.filter((cal) => Boolean(cal.reviewedBy && cal.reviewedBy.trim().length > 0));
}

/**
 * Compute the full crop schedule timeline from plant date
 */
export function calculateCropPlan(
  calendar: CropCalendarEntry,
  plantDateInput: Date | string,
  referenceToday?: Date
): CropPlanResult {
  const plantDate = typeof plantDateInput === 'string' ? parseIsoDate(plantDateInput) : plantDateInput;
  const today = referenceToday ? new Date(referenceToday.getFullYear(), referenceToday.getMonth(), referenceToday.getDate()) : new Date();
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const daysSincePlanting = diffDays(todayNormalized, plantDate);
  const isPastOrToday = daysSincePlanting >= 0;
  const currentHst = isPastOrToday ? daysSincePlanting : null;

  if (calendar.type === 'tahunan') {
    return {
      commodityId: calendar.id,
      plantDate,
      plantDateStr: formatDateId(plantDate),
      type: 'tahunan',
      currentHst: null,
      currentPhase: null,
      harvestStart: null,
      harvestEnd: null,
      harvestRangeStr: null,
      computedPhases: [],
      annualTasks: calendar.annualTasks,
      seasons: calendar.seasons,
      sources: calendar.sources,
      reviewedBy: calendar.reviewedBy,
    };
  }

  // Semusim calculation
  let currentPhase: ComputedPhase | null = null;
  const computedPhases: ComputedPhase[] = calendar.phases.map((ph) => {
    const startDate = addDays(plantDate, ph.startDay);
    const endDate = addDays(plantDate, ph.endDay);

    const isCurrent = isPastOrToday && daysSincePlanting >= ph.startDay && daysSincePlanting <= ph.endDay;
    const isPast = daysSincePlanting > ph.endDay;
    const isFuture = daysSincePlanting < ph.startDay;

    const compPhase: ComputedPhase = {
      ...ph,
      startDate,
      endDate,
      startDateStr: formatDateId(startDate),
      endDateStr: formatDateId(endDate),
      dateRangeStr: formatDateRangeId(startDate, endDate),
      isCurrent,
      isPast,
      isFuture,
    };

    if (isCurrent && !currentPhase) {
      currentPhase = compPhase;
    }

    return compPhase;
  });

  // Calculate estimated harvest window
  // Harvest window typically corresponds to the last phase or cycleDays
  let harvestStart: Date | null = null;
  let harvestEnd: Date | null = null;
  let harvestRangeStr: string | null = null;

  const lastPhase = calendar.phases[calendar.phases.length - 1];
  if (calendar.cycleDays) {
    harvestStart = addDays(plantDate, calendar.cycleDays.min);
    harvestEnd = addDays(plantDate, calendar.cycleDays.max);
    harvestRangeStr = formatDateRangeId(harvestStart, harvestEnd);
  } else if (lastPhase) {
    harvestStart = addDays(plantDate, lastPhase.startDay);
    harvestEnd = addDays(plantDate, lastPhase.endDay);
    harvestRangeStr = formatDateRangeId(harvestStart, harvestEnd);
  }

  return {
    commodityId: calendar.id,
    plantDate,
    plantDateStr: formatDateId(plantDate),
    type: 'semusim',
    currentHst,
    currentPhase,
    harvestStart,
    harvestEnd,
    harvestRangeStr,
    computedPhases,
    annualTasks: calendar.annualTasks,
    seasons: calendar.seasons,
    sources: calendar.sources,
    reviewedBy: calendar.reviewedBy,
  };
}
