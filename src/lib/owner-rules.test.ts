import { test } from 'node:test';
import assert from 'node:assert/strict';
// @ts-ignore -- plain ESM build script, no type declarations
import { checkPage } from '../../scripts/check-owner-rules.mjs';

const page = (main: string, outside = '') => `<html><body>${outside}<main id="isi">${main}</main><footer><a href="https://wa.me/1">wa</a><h4 class="uppercase">F</h4></footer></body></html>`;

test('clean page passes; footer WhatsApp and footer uppercase are ignored', () => {
  assert.deepEqual(checkPage(page('<p class="text-sm">ok</p>'), '/produk/'), []);
});

test('forbidden names fail anywhere on the page', () => {
  assert.equal(checkPage(page('', '<p>© PT Agritani Internasional</p>'), '/x/').length, 1);
  assert.equal(checkPage(page('<a href="https://petanisejahtera.com/">x</a>'), '/x/').length, 1);
  assert.equal(checkPage(page('<p>Prof. Arif Prabowo</p>'), '/x/').length, 1);
});

test('no WhatsApp inside main on product, home, and hub pages', () => {
  const wa = '<div data-cta="whatsapp"><a href="https://wa.me/62">Tanya</a></div>';
  assert.equal(checkPage(page(wa), '/produk/aussie/').length, 1);
  assert.equal(checkPage(page(wa), '/').length, 1);
  assert.equal(checkPage(page(wa), '/jurnal/komoditas/cabai/').length, 1);
  assert.deepEqual(checkPage(page(wa), '/penulis/arif-prabowo/'), []);
  assert.deepEqual(checkPage(page(wa), '/tentang-kami/'), []); // one sales CTA allowed since DEC-021
});

test('at most one WhatsApp CTA block elsewhere', () => {
  const two = '<div data-cta="whatsapp"></div><div data-cta="whatsapp"></div>';
  assert.equal(checkPage(page(two), '/alat/kalkulator-dosis/').length, 1);
});

test('shadow and uppercase utilities inside main fail, including variants', () => {
  assert.equal(checkPage(page('<div class="card shadow-lg"></div>'), '/x/').length, 1);
  assert.equal(checkPage(page('<p class="text-xs uppercase tracking-wider">K</p>'), '/x/').length, 1);
  assert.equal(checkPage(page('<a class="hover:shadow-xs">a</a>'), '/x/').length, 1);
  assert.equal(checkPage(page('<div class="shadow"></div>'), '/x/').length, 1);
  assert.equal(checkPage(page('<div class="!shadow-md"></div>'), '/x/').length, 1);
  assert.equal(checkPage(page('<div class="drop-shadow-lg"></div>'), '/x/').length, 1);
  assert.deepEqual(checkPage(page('<div class="shadowless md:shadow-none text-shadow-foo"></div>'), '/x/'), []);
});

test('a page without <main> fails, except the 404 page', () => {
  assert.equal(checkPage('<html><body><p>x</p></body></html>', '/x/').length, 1);
  assert.deepEqual(checkPage('<html><body><p>x</p></body></html>', '/404.html'), []);
});
