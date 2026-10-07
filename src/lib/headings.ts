/**
 * src/lib/headings.ts
 * Heading outline repair for article bodies (DESIGN §4.3.2). Most manuscripts open their sections with
 * `###`, so the page jumps from the <h1> title to <h3>. Until the first real `##`, every heading moves up
 * one level (h3 -> h2, h4 -> h3); from the first `##` on, the author's levels are kept.
 * Applied at build to the rendered HTML and to the TOC heading list with the same rule.
 */

/** New depth for each heading depth, in document order. */
export function promoteDepths(depths: number[]): number[] {
  let seenH2 = false;
  return depths.map((d) => {
    if (d === 2) seenH2 = true;
    return !seenH2 && d > 2 ? d - 1 : d;
  });
}

/** Same rule on rendered HTML (`<hN ...>…</hN>` from the Markdown renderer; escaped code is untouched). */
export function promoteHeadingsHtml(html: string): string {
  const re = /<h([2-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g;
  const depths = [...html.matchAll(re)].map((m) => Number(m[1]));
  const next = promoteDepths(depths);
  let i = 0;
  return html.replace(re, (_m, _d, attrs = '', inner) => {
    const d = next[i++];
    return `<h${d}${attrs}>${inner}</h${d}>`;
  });
}
