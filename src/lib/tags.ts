/**
 * src/lib/tags.ts
 * Tag slugification and formatting utilities for Jurnal Tani article tags.
 */

/**
 * Converts a raw tag string into a clean, URL-safe slug.
 * e.g. "pengendalian wereng coklat padi" -> "pengendalian-wereng-coklat-padi"
 */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Formats a tag string for display titles if needed.
 */
export function formatTagTitle(tag: string): string {
  return tag
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
