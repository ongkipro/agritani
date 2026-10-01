import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { externalLink, isExternalUrl, resolveLinkKind } from './links.ts';

describe('Outbound Link Qualification Engine (DESIGN §4.4.12)', () => {
  it('qualifies scientific & government reference links (nofollow with noopener, DEC-024)', () => {
    const attrs = externalLink('reference');
    assert.equal(attrs.target, '_blank');
    assert.equal(attrs.rel, 'noopener nofollow');
    assert.equal(attrs.tabNotice, '(membuka tab baru)');
    assert.equal(attrs.isExternal, true);
    // MUST NOT contain noreferrer
    assert.equal(attrs.rel.includes('noreferrer'), false);
  });

  it('qualifies WhatsApp links with nofollow and noopener', () => {
    const attrs = externalLink('whatsapp');
    assert.equal(attrs.target, '_blank');
    assert.equal(attrs.rel, 'noopener nofollow');
    assert.equal(attrs.rel.includes('noreferrer'), false);
  });

  it('qualifies sponsored partner links', () => {
    const attrs = externalLink('sponsored');
    assert.equal(attrs.target, '_blank');
    assert.equal(attrs.rel, 'sponsored nofollow noopener');
    assert.equal(attrs.rel.includes('noreferrer'), false);
  });

  it('qualifies user generated content links', () => {
    const attrs = externalLink('ugc');
    assert.equal(attrs.target, '_blank');
    assert.equal(attrs.rel, 'nofollow ugc noopener');
    assert.equal(attrs.rel.includes('noreferrer'), false);
  });

  it('correctly discriminates external vs internal URLs', () => {
    assert.equal(isExternalUrl('https://doi.org/10.1016/j.cropro.2020.105152'), true);
    assert.equal(isExternalUrl('https://www.bmkg.go.id/cuaca/'), true);
    assert.equal(isExternalUrl('https://wa.me/6287770457256'), true);
    assert.equal(isExternalUrl('http://example.com'), true);

    // Internal
    assert.equal(isExternalUrl('/jurnal/topik/proteksi-tanaman/'), false);
    assert.equal(isExternalUrl('https://agritani.com/alat/'), false);
    assert.equal(isExternalUrl('https://www.agritani.com/produk/'), false);
    assert.equal(isExternalUrl('http://localhost:4321/'), false);
    assert.equal(isExternalUrl(''), false);
  });

  it('auto-resolves wa.me links to whatsapp kind', () => {
    assert.equal(resolveLinkKind('https://wa.me/6287770457256'), 'whatsapp');
    assert.equal(resolveLinkKind('https://api.whatsapp.com/send?phone=62877'), 'whatsapp');
    assert.equal(resolveLinkKind('https://doi.org/10.1000/xyz'), 'reference');
  });
});
