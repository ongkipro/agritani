// Shared Jurnal listing data (T-58A): one source for visible articles, pagination size, and commodity hub counts,
// so /jurnal/, /jurnal/halaman/{n}/, hubs, tag pages, and TopicSidebar never disagree.
import { getCollection, type CollectionEntry } from 'astro:content';

/** Articles per Jurnal page: /jurnal/ shows 1..30, /jurnal/halaman/2/ starts at 31 (DESIGN §4.2.3). */
export const JOURNAL_PAGE_SIZE = 30;
/** A commodity hub is built only with at least this many visible articles (DESIGN §4.2.3). */
export const COMMODITY_HUB_MIN = 3;

const includeDrafts = () => import.meta.env.PUBLIC_INCLUDE_DRAFTS === 'true' || import.meta.env.DEV;

type Ref = string | { id: string };
export const refId = (x: Ref): string => (typeof x === 'string' ? x : x.id);

/** Published articles (plus drafts in draft-preview mode), newest first. */
export async function getVisibleArticles(): Promise<CollectionEntry<'articles'>[]> {
  const all = await getCollection('articles');
  return all
    .filter((a) => includeDrafts() || !a.data.draft)
    .sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());
}

export interface CommodityCount {
  id: string;
  name: string;
  count: number;
}

/** Commodities that have a built hub, most articles first (ties by name). */
export async function getCommodityCounts(): Promise<CommodityCount[]> {
  const [articles, commodities] = await Promise.all([getVisibleArticles(), getCollection('commodities')]);
  return commodities
    .map((c) => ({
      id: c.id,
      name: c.data.name,
      count: articles.filter((a) => a.data.commodities.some((x: Ref) => refId(x) === c.id)).length,
    }))
    .filter((c) => c.count >= COMMODITY_HUB_MIN)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'id'));
}
