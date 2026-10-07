/**
 * src/lib/related.ts
 * "Bacaan terkait" selection (DESIGN §4.3.1 block 17). Pure and deterministic, computed once at build
 * across every visible article so internal links spread instead of piling onto the same strong matches.
 */

export interface RelatedCandidate {
  slug: string;
  topic: string;
  commodities: string[];
  tags: string[];
}

export const RELATED_LIMIT = 4;

/**
 * Relevance of `cand` for a reader of `art`; 0 = never link.
 * Shared commodity dominates, then shared tags, then same topic. Two articles about different specific
 * crops never cross-link; a general (no-commodity) article links to a crop article only via shared tags.
 */
export function relatedScore(art: RelatedCandidate, cand: RelatedCandidate): number {
  if (art.slug === cand.slug) return 0;
  const sharedCommodities = art.commodities.filter((c) => cand.commodities.includes(c)).length;
  const artGeneral = art.commodities.length === 0;
  const candGeneral = cand.commodities.length === 0;
  if (!artGeneral && !candGeneral && sharedCommodities === 0) return 0;

  const candTags = new Set(cand.tags.map((t) => t.toLowerCase()));
  const sharedTags = art.tags.filter((t) => candTags.has(t.toLowerCase())).length;
  const sameTopic = art.topic === cand.topic ? 1 : 0;

  if (sharedCommodities > 0) return sharedCommodities * 100 + sharedTags * 10 + sameTopic;
  if (artGeneral && candGeneral) return sharedTags * 10 + sameTopic;
  return sharedTags > 0 ? sharedTags * 10 + sameTopic : 0;
}

/**
 * Related slugs per article. Higher score always wins; among equal scores the candidate with the fewest
 * inbound related links so far wins (then slug), so orphan articles get picked up. Articles are processed
 * in slug order, which keeps the result stable for a given set of articles regardless of input order.
 */
export function buildRelatedMap(
  articles: RelatedCandidate[],
  limit = RELATED_LIMIT
): Map<string, string[]> {
  const sorted = [...articles].sort((a, b) => a.slug.localeCompare(b.slug));
  const inbound = new Map<string, number>(sorted.map((a) => [a.slug, 0]));
  const result = new Map<string, string[]>();

  for (const art of sorted) {
    const picks = sorted
      .map((cand) => ({ slug: cand.slug, score: relatedScore(art, cand) }))
      .filter((c) => c.score > 0)
      .sort(
        (x, y) =>
          y.score - x.score ||
          inbound.get(x.slug)! - inbound.get(y.slug)! ||
          x.slug.localeCompare(y.slug)
      )
      .slice(0, limit)
      .map((c) => c.slug);
    for (const s of picks) inbound.set(s, inbound.get(s)! + 1);
    result.set(art.slug, picks);
  }
  return result;
}

/** Number of articles that no other article links to from its related block. */
export function countOrphans(map: Map<string, string[]>): number {
  const linked = new Set([...map.values()].flat());
  return [...map.keys()].filter((s) => !linked.has(s)).length;
}
