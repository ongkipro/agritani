/**
 * src/lib/rehype-external-links.mjs
 * Native rehype plugin for:
 * 1. Qualifying Markdown outbound links with target="_blank", rel="noopener" (DESIGN §4.4.12)
 * 2. Enhancing GitHub-style blockquote callouts ([!NOTE], [!TIP], etc.) into clean editorial panels
 * Zero external dependencies.
 */

function isExternal(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    return (
      host !== 'agritani.com' &&
      host !== 'www.agritani.com' &&
      !host.endsWith('.agritani.com') &&
      host !== 'localhost' &&
      host !== '127.0.0.1'
    );
  } catch {
    return false;
  }
}

export function rehypeExternalLinks() {
  return (tree) => {
    function visit(node) {
      if (!node || typeof node !== 'object') return;

      // 1. Transform outbound links
      if (node.type === 'element' && node.tagName === 'a') {
        const href = node.properties?.href;
        if (href && isExternal(href)) {
          node.properties.target = '_blank';
          const isWa = /wa\.me|api\.whatsapp\.com/i.test(href);
          node.properties.rel = isWa ? 'noopener nofollow' : 'noopener';

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

      // 2. Transform GitHub-style blockquote callouts ([!NOTE], [!TIP], etc.)
      if (node.type === 'element' && node.tagName === 'blockquote') {
        const children = Array.isArray(node.children) ? node.children : [];
        const firstP = children.find((c) => c.type === 'element' && c.tagName === 'p');
        if (firstP && Array.isArray(firstP.children) && firstP.children[0]?.type === 'text') {
          const textVal = firstP.children[0].value || '';
          const match = textVal.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/i);
          if (match) {
            const kind = match[1].toLowerCase();
            const rest = match[2];

            if (!node.properties) node.properties = {};
            const existingClasses = Array.isArray(node.properties.className)
              ? node.properties.className
              : node.properties.className
              ? [node.properties.className]
              : [];
            node.properties.className = [...existingClasses, 'callout', `callout-${kind}`];

            if (rest.trim()) {
              firstP.children[0].value = rest;
            } else {
              firstP.children.shift();
            }

            const labelMap = {
              note: 'Catatan Lapangan',
              tip: 'Tips Agronomi',
              important: 'Penting Diperhatikan',
              warning: 'Peringatan Hama',
              caution: 'Perhatian Khusus',
            };
            const labelText = labelMap[kind] || 'Catatan Lapangan';

            const badgeNode = {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['callout-badge'],
              },
              children: [
                {
                  type: 'element',
                  tagName: 'span',
                  properties: { className: ['callout-dot'] },
                  children: [],
                },
                {
                  type: 'element',
                  tagName: 'span',
                  properties: { className: ['callout-label'] },
                  children: [{ type: 'text', value: labelText }],
                },
              ],
            };

            node.children.unshift(badgeNode);
          }
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
