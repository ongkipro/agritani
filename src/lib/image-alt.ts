import { topicName } from './topics.ts';
/**
 * Keyword ALT for any article image (owner rule 2026-10-01, AGENTS.md "Images"): commodity (or topic) + article title,
 * trimmed at a word to at most 125 characters. Used for lead images, list thumbnails, and related-article cards.
 */
export function articleImageAlt(data: { title: string; topic: string; commodities?: Array<string | { id: string }> }): string {
  const first = data.commodities?.[0];
  const commodity = first ? (typeof first === 'string' ? first : first.id).replace(/-/g, ' ') : '';
  const label = commodity || topicName(data.topic).toLowerCase();
  const text = `Ilustrasi ${label}: ${data.title}`;
  if (text.length <= 125) return text;
  return text.slice(0, text.lastIndexOf(' ', 125)).replace(/[\s,.;:–-]+$/, '');
}
