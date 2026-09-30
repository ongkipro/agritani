/**
 * src/lib/links.ts
 * Outbound link helper and qualification engine (DESIGN §4.4.12, REQ-08)
 *
 * Enforces Google outbound link rules and WCAG G201:
 * - Editorial academic/gov references (DOI, BMKG, Kementan) = target="_blank" rel="noopener" (dofollow)
 * - WhatsApp = target="_blank" rel="noopener nofollow"
 * - Commercial partners = target="_blank" rel="sponsored noopener"
 * - User/unreviewed = target="_blank" rel="nofollow ugc noopener"
 * - STRICTLY FORBIDDEN: noreferrer (Referrer-Policy header handles privacy)
 * - Notice: sr-only "(membuka tab baru)" + 12px ArrowUpRight icon
 */

export type ExternalLinkKind = 'reference' | 'whatsapp' | 'sponsored' | 'ugc';

export interface ExternalLinkAttrs {
  target: '_blank';
  rel: string;
  tabNotice: string;
  isExternal: true;
}

/**
 * Returns canonical target and rel attributes for an outbound link.
 * Never includes "noreferrer".
 */
export function externalLink(kind: ExternalLinkKind = 'reference'): ExternalLinkAttrs {
  let rel: string;

  switch (kind) {
    case 'whatsapp':
      rel = 'noopener nofollow';
      break;
    case 'sponsored':
      rel = 'sponsored noopener';
      break;
    case 'ugc':
      rel = 'nofollow ugc noopener';
      break;
    case 'reference':
    default:
      rel = 'noopener';
      break;
  }

  return {
    target: '_blank',
    rel,
    tabNotice: '(membuka tab baru)',
    isExternal: true,
  };
}

/**
 * Determines if a given URL is external to agritani.com
 */
export function isExternalUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    return host !== 'agritani.com' && host !== 'www.agritani.com' && !host.endsWith('.agritani.com') && host !== 'localhost' && host !== '127.0.0.1';
  } catch {
    return false;
  }
}

/**
 * Resolves link kind from URL automatically (e.g. wa.me is always whatsapp).
 */
export function resolveLinkKind(url: string, explicitKind?: ExternalLinkKind): ExternalLinkKind {
  if (explicitKind) return explicitKind;
  if (/wa\.me|api\.whatsapp\.com/i.test(url)) {
    return 'whatsapp';
  }
  return 'reference';
}
