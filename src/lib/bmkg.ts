/**
 * src/lib/bmkg.ts
 * BMKG Public Weather Forecast client & formatting utilities (REQ-10, ARCHITECTURE §5b, DEC-014).
 * Runs browser-direct with localStorage caching (max 1 hour) and graceful error handling.
 */

export interface BmkgLocation {
  adm1: string;
  adm2: string;
  adm3: string;
  adm4: string;
  provinsi: string;
  kotkab: string;
  kecamatan: string;
  desa: string;
  lon: number;
  lat: number;
  timezone: string;
}

export interface BmkgRawSlot {
  datetime: string;
  utc_datetime?: string;
  local_datetime: string;
  t: number; // Suhu Celcius
  tcc: number; // Tutupan awan %
  tp: number; // Presipitasi / hujan mm
  weather: number; // Kode cuaca
  weather_desc: string;
  weather_desc_en?: string;
  wd_deg: number;
  wd: string; // Kode arah angin (e.g. "NE")
  wd_to?: string;
  ws: number; // Kecepatan angin km/jam
  hu: number; // Kelembapan relatif %
  analysis_date: string;
  image?: string;
}

export interface BmkgApiResponse {
  lokasi: BmkgLocation;
  data: Array<{
    lokasi: BmkgLocation;
    cuaca: BmkgRawSlot[][]; // 3 hari, per hari ada slot 3-jam
  }>;
}

export interface DayForecast {
  dateStr: string; // e.g. "Rabu, 30 Sep 2026"
  dateIso: string; // e.g. "2026-09-30"
  slots: BmkgRawSlot[];
}

export interface ProcessedForecast {
  location: BmkgLocation;
  analysisDate: string;
  isStale: boolean; // True if analysis_date > 24 hours old
  days: DayForecast[];
}

const WIND_DIRECTIONS: Record<string, string> = {
  N: 'Utara',
  NNE: 'Utara Timur Laut',
  NE: 'Timur Laut',
  ENE: 'Timur Timur Laut',
  E: 'Timur',
  ESE: 'Timur Tenggara',
  SE: 'Tenggara',
  SSE: 'Selatan Tenggara',
  S: 'Selatan',
  SSW: 'Selatan Barat Daya',
  SW: 'Barat Daya',
  WSW: 'Barat Barat Daya',
  W: 'Barat',
  WNW: 'Barat Barat Laut',
  NW: 'Barat Laut',
  NNW: 'Utara Barat Laut',
  VARIABLE: 'Berubah-ubah',
  CALM: 'Tenang',
};

export function formatWindDirection(code: string): string {
  return WIND_DIRECTIONS[code.toUpperCase()] || code;
}

export function isAnalysisStale(analysisDateStr: string, referenceNow = new Date()): boolean {
  if (!analysisDateStr) return false;
  try {
    const analysisTime = new Date(analysisDateStr.replace(' ', 'T')).getTime();
    if (isNaN(analysisTime)) return false;
    const now = referenceNow.getTime();
    const diffHours = (now - analysisTime) / (1000 * 60 * 60);
    return diffHours > 24;
  } catch {
    return false;
  }
}

export function formatSlotTime(localDatetimeStr: string): string {
  // e.g. "2026-09-30 07:00:00" -> "07.00"
  const match = localDatetimeStr.match(/\b(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}.${match[2]}`;
  }
  return localDatetimeStr;
}

export function formatDateHeading(dateObj: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const dayName = days[dateObj.getDay()];
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch BMKG Weather Forecast browser-direct (DEC-014)
 */
export async function fetchBmkgForecast(adm4: string): Promise<ProcessedForecast> {
  const cacheKey = `agritani_bmkg_${adm4}`;

  // 1. Try reading from localStorage cache
  try {
    const cachedStr = window.localStorage.getItem(cacheKey);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      if (cached && cached.timestamp && Date.now() - cached.timestamp < CACHE_TTL_MS && cached.data) {
        return processBmkgData(cached.data);
      }
    }
  } catch {
    // localStorage might be blocked or unavailable; proceed with network
  }

  // 2. Fetch directly from BMKG API with 10s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encodeURIComponent(adm4)}`;

  let json: BmkgApiResponse;
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`BMKG server mengembalikan respons HTTP ${res.status}`);
    }

    json = await res.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Koneksi ke BMKG melebihi batas waktu (10 detik). Periksa sinyal internet Anda.');
    }
    throw new Error(err.message || 'Gagal terhubung ke layanan BMKG');
  } finally {
    clearTimeout(timeoutId);
  }

  if (!json || !json.data || json.data.length === 0 || !json.data[0].cuaca) {
    throw new Error('Data cuaca tidak ditemukan untuk wilayah ini pada basis data BMKG.');
  }

  // 3. Save to cache
  try {
    window.localStorage.setItem(
      cacheKey,
      JSON.stringify({
        timestamp: Date.now(),
        data: json,
      })
    );
  } catch {
    // Ignore storage quota or blocked errors
  }

  return processBmkgData(json);
}

export function processBmkgData(json: BmkgApiResponse): ProcessedForecast {
  const location = json.lokasi || json.data[0].lokasi;
  const rawDays = json.data[0].cuaca;

  let firstAnalysisDate = '';
  const days: DayForecast[] = [];

  rawDays.forEach((daySlots, dayIdx) => {
    if (!daySlots || daySlots.length === 0) return;

    if (!firstAnalysisDate && daySlots[0]?.analysis_date) {
      firstAnalysisDate = daySlots[0].analysis_date;
    }

    // Determine representative date from the first slot
    const firstLocal = daySlots[0].local_datetime;
    const datePart = firstLocal.split(' ')[0] || '';
    const dateObj = new Date(datePart);
    const dateHeading = !isNaN(dateObj.getTime())
      ? formatDateHeading(dateObj)
      : `Hari ke-${dayIdx + 1}`;

    days.push({
      dateStr: dateHeading,
      dateIso: datePart,
      slots: daySlots,
    });
  });

  return {
    location,
    analysisDate: firstAnalysisDate,
    isStale: isAnalysisStale(firstAnalysisDate),
    days,
  };
}
