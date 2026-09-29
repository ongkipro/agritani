/**
 * src/lib/spray-window.ts
 * Pure spray suitability evaluation engine (REQ-10, ARCHITECTURE §5b, DEC-014).
 * Enforces review gating: if thresholds are null or unreviewed, status is null.
 */
import { z } from 'zod';

export const sprayThresholdsSchema = z
  .object({
    rainTundaMm: z.number(), // tp slot ini atau slot berikut >= nilai -> Tunda
    windTundaKmh: z.number(), // ws >= nilai -> Tunda
    windHatiKmh: z.number(), // ws >= nilai -> Hati-hati
    tempHatiC: z.number(), // t >= nilai -> Hati-hati
    humidityHatiPct: z.number(), // hu <= nilai -> Hati-hati
    reviewedBy: z.string().optional(),
    sources: z.array(z.string()),
  })
  .nullable();

export type SprayThresholds = z.infer<typeof sprayThresholdsSchema>;

export interface WeatherSlot {
  local_datetime: string;
  datetime: string;
  t: number; // Suhu Celcius
  hu: number; // Kelembapan %
  tp: number; // Curah hujan mm
  ws: number; // Kecepatan angin km/h
  wd: string; // Arah angin
  weather_desc: string;
  image?: string;
  analysis_date?: string;
}

export interface SprayWindowResult {
  status: 'layak' | 'hati-hati' | 'tunda' | null;
  reasons: string[];
}

/**
 * Pure calculation function to evaluate spray suitability for a given weather slot (REQ-10, ARCHITECTURE §5b).
 * Invariant: If thresholds is null or reviewedBy is empty/undefined, indicator is hidden (status: null, reasons: []).
 */
export function sprayWindow(
  currentSlot: WeatherSlot,
  nextSlot: WeatherSlot | null | undefined,
  thresholds: SprayThresholds
): SprayWindowResult {
  if (!thresholds || !thresholds.reviewedBy || thresholds.reviewedBy.trim().length === 0) {
    return { status: null, reasons: [] };
  }

  const reasons: string[] = [];
  let isTunda = false;
  let isHatiHati = false;

  // 1. Rain check: current slot or next slot (spray needs rainfastness window)
  if (currentSlot.tp >= thresholds.rainTundaMm) {
    isTunda = true;
    reasons.push(`Peluang hujan ${currentSlot.tp} mm berisiko mencuci larutan`);
  } else if (nextSlot && nextSlot.tp >= thresholds.rainTundaMm) {
    isTunda = true;
    reasons.push(`Hujan diperkirakan ${nextSlot.tp} mm dalam slot berikutnya`);
  }

  // 2. Wind check: Tunda vs Hati-hati
  if (currentSlot.ws >= thresholds.windTundaKmh) {
    isTunda = true;
    reasons.push(`Angin kencang ${currentSlot.ws} km/jam berisiko drift tinggi`);
  } else if (currentSlot.ws >= thresholds.windHatiKmh) {
    isHatiHati = true;
    reasons.push(`Kecepatan angin ${currentSlot.ws} km/jam perlu diwaspadai`);
  }

  // 3. Temperature check: Hati-hati
  if (currentSlot.t >= thresholds.tempHatiC) {
    isHatiHati = true;
    reasons.push(`Suhu ${currentSlot.t}°C meningkatkan laju penguapan`);
  }

  // 4. Humidity check: Hati-hati
  if (currentSlot.hu <= thresholds.humidityHatiPct) {
    isHatiHati = true;
    reasons.push(`Kelembapan rendah ${currentSlot.hu}% mempercepat kristalisasi droplet`);
  }

  if (isTunda) {
    return { status: 'tunda', reasons };
  }

  if (isHatiHati) {
    return { status: 'hati-hati', reasons };
  }

  return {
    status: 'layak',
    reasons: ['Kondisi cuaca mendukung penyemprotan'],
  };
}
