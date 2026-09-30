/**
 * src/lib/rehype-external-links.mjs
 * Lightweight native rehype plugin for qualifying Markdown outbound links (DESIGN §4.4.12)
 * Zero external dependencies.
 */

function isExternal(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    return host !== 'agritani.com' && host !== 'www.agritani.com' && !host.endsWith('.agritani.com') && host !== 'localhost' && host !== '127.0.0.1';
  } catch {
    return false;
  }
}

export function rehypeExternalLinks() {
  return (tree) => {
    function visit(node) {
      if (!node || typeof node !== 'object') return;

      if (node.type === 'element' && node.tagName === 'a') {
        const href = node.properties?.href;
        if (href && isExternal(href)) {
          // 1. Force target="_blank"
          node.properties.target = '_blank';

          // 2. Qualify rel (noopener always, nofollow if WhatsApp, never noreferrer)
          const isWa = /wa\.me|api\.whatsapp\.com/i.test(href);
          node.properties.rel = isWa ? 'noopener nofollow' : 'noopener';

          // 3. Append ArrowUpRight 12px SVG icon and sr-only notice
          if (!Array.isArray(node.children)) {
            node.children = [];
          }

          const iconSvg = {
            type: 'element',
            tagName: 'svg',
            properties: {
              xmlns: 'http://www.w3.org/2000/svg',
              width: 12,
              height: 12,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: 2,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              className: ['inline-block', 'ml-1', 'shrink-0', 'align-baseline'],
              ariaHidden: 'true',
            },
            children: [
              {
                type: 'element',
                tagName: 'path',
                properties: { d: 'M7 7h10v10' },
                children: [],
              },
              {
                type: 'element',
                tagName: 'path',
                properties: { d: 'M7 17 17 7' },
                children: [],
              },
            ],
          };

          const srNotice = {
            type: 'element',
            tagName: 'span',
            properties: {
              className: ['sr-only'],
            },
            children: [
              {
                type: 'text',
                value: ' (membuka tab baru)',
              },
            ],
          };

          node.children.push(iconSvg, srNotice);
        }
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          visit(child);
        }
      }
    }

    visit(tree);
  };
}
