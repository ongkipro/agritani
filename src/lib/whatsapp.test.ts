import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { waLink, DEFAULT_WA_PHONE } from './whatsapp.ts';

describe('WhatsApp Link Generator (DESIGN §2.7, G-6)', () => {
  it('generates wa.me link with first line as bracketed source code', () => {
    const url = waLink({ source: 'Web·Konsultasi' });
    const expectedPrefix = `https://wa.me/${DEFAULT_WA_PHONE}?text=`;
    assert.ok(url.startsWith(expectedPrefix));

    const text = decodeURIComponent(url.replace(expectedPrefix, ''));
    const lines = text.split('\n');
    assert.equal(lines[0], '[Web·Konsultasi]');
  });

  it('correctly encodes Indonesian characters, spaces, and newlines', () => {
    const url = waLink({
      source: 'Web·Konsultasi',
      fields: [
        { label: 'Komoditas', value: 'Cabai Rawit Merah' },
        { label: 'Masalah', value: 'Buah busuk melingkar & daun rontok' },
        { label: 'Lokasi', value: 'Kab. Garut, Jawa Barat' },
      ],
      note: '(Saya akan kirim foto setelah pesan ini)',
    });

    const query = new URL(url).searchParams.get('text');
    assert.ok(query);
    const decoded = query;
    assert.ok(decoded.includes('[Web·Konsultasi]'));
    assert.ok(decoded.includes('Komoditas: Cabai Rawit Merah'));
    assert.ok(decoded.includes('Masalah: Buah busuk melingkar & daun rontok'));
    assert.ok(decoded.includes('Lokasi: Kab. Garut, Jawa Barat'));
    assert.ok(decoded.includes('(Saya akan kirim foto setelah pesan ini)'));
  });

  it('supports article-specific source codes [Web·Artikel:{slug}]', () => {
    const url = waLink({ source: 'Web·Artikel:ganoderma-sawit' });
    const query = new URL(url).searchParams.get('text');
    assert.equal(query, '[Web·Artikel:ganoderma-sawit]');
  });

  it('cleans up non-numeric characters from custom phone numbers', () => {
    const url = waLink({ source: 'Web·Kemitraan', phone: '+62 812-3456-7890' });
    assert.ok(url.startsWith('https://wa.me/6281234567890?text='));
  });

  it('filters out undefined and null fields cleanly', () => {
    const url = waLink({
      source: 'Web·Diagnosa',
      fields: [
        { label: 'Komoditas', value: 'Padi' },
        undefined,
        null,
        false,
        { label: 'Gejala', value: 'Daun kuning' },
      ],
    });
    const query = new URL(url).searchParams.get('text');
    assert.ok(query);
    const lines = query.split('\n');
    assert.equal(lines.length, 3);
    assert.equal(lines[0], '[Web·Diagnosa]');
    assert.equal(lines[1], 'Komoditas: Padi');
    assert.equal(lines[2], 'Gejala: Daun kuning');
  });
});
