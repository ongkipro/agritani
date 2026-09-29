/**
 * src/lib/triage.ts
 * Pure filtering and triage logic for Diagnosa Gejala (REQ-06, ARCHITECTURE §3.1, DEC-015)
 */

export interface SymptomEntry {
  id: string;
  commodity: string;
  part: 'daun' | 'batang-pangkal' | 'buah-bunga' | 'akar';
  causeType: 'penyakit' | 'hama' | 'hara' | 'lingkungan';
  symptom: string;
  diagnosis: string;
  scientificName?: string;
  distinguishingSign: string;
  article: string;
  reviewedBy?: string;
  seededFrom?: string;
}

export interface CommodityItem {
  id: string;
  name: string;
}

/**
 * Filter symptoms based on reviewedBy status (ARCHITECTURE §3.1, DEC-015).
 * In production builds, only reviewed symptoms are shown.
 * In draft preview mode (PUBLIC_INCLUDE_DRAFTS=true), unreviewed symptoms are also shown.
 */
export function filterVisibleSymptoms<
  T extends { data: { reviewedBy?: string } } | { reviewedBy?: string }
>(
  symptoms: T[],
  isDraftPreview: boolean
): T[] {
  if (isDraftPreview) {
    return symptoms;
  }
  return symptoms.filter((s) => {
    const reviewed = 'data' in s && s.data ? s.data.reviewedBy : (s as { reviewedBy?: string }).reviewedBy;
    return Boolean(reviewed && reviewed.trim().length > 0);
  });
}

/**
 * Derive unique active commodities that actually have visible symptoms
 */
export function getActiveCommodities(
  visibleSymptoms: Array<{ commodity: string }>,
  commodityMap: Map<string, string>
): CommodityItem[] {
  const uniqueIds = Array.from(new Set(visibleSymptoms.map((s) => s.commodity)));
  return uniqueIds
    .map((id) => ({
      id,
      name: commodityMap.get(id) || id,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
