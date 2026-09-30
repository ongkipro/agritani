import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assertContentIntegrity, mapCategoryToTopic, type ArticleData } from './content-integrity.ts';

const validAnswer =
  'Penyakit busuk pangkal batang akibat Ganoderma boninense dapat dikendalikan melalui sanitasi mekanis dan aplikasi aktivator imun. Pengamatan rutin pada piringan pohon setiap bulan mendeteksi infeksi lebih awal sehingga penyebaran miselium terhenti sebelum kerusakan vaskular permanen meluas ke seluruh tegakan kelapa sawit.';

const validArticle: ArticleData = {
  slug: 'uji-sawit',
  title: 'Pengendalian Ganoderma pada Kelapa Sawit Berbasis Sains',
  metaTitle: 'Pengendalian Ganoderma Sawit - Agritani',
  description: 'Panduan lengkap pengendalian Ganoderma boninense pada tanaman kelapa sawit dengan metode sanitasi dan imunisasi.',
  answer: validAnswer,
  author: 'Arif Prabowo',
  commodities: ['kelapa-sawit'],
  references: [
    {
      authors: 'Prabowo, A. et al.',
      year: 2024,
      title: 'Inovasi Penanganan Ganoderma di Lahan Basah',
      source: 'Jurnal Proteksi Perkebunan',
      doi: '10.1234/jpp.2024.01',
    },
  ],
  draft: false,
};

describe('Content Integrity Assertions', () => {
  it('passes on valid published article with all requirements', () => {
    assert.doesNotThrow(() => {
      assertContentIntegrity({
        articles: [validArticle],
        commodities: [{ id: 'kelapa-sawit', name: 'Kelapa Sawit' }],
      });
    });
  });

  it('allows a published general article without commodities (DEC-020)', () => {
    const general = { ...validArticle, slug: 'artikel-umum', commodities: [] };
    assert.doesNotThrow(() => assertContentIntegrity({ articles: [general] }));
  });

  it('ensures articles without commodities do not get secretly defaulted to kelapa-sawit', () => {
    const draftGeneralArticle: ArticleData = {
      slug: 'sains-lignin',
      title: 'Sains Biosintesis Lignin Memperkokoh Batang',
      draft: true,
      commodities: [],
    };
    // Should stay empty array, never defaulted to kelapa-sawit
    assert.deepEqual(draftGeneralArticle.commodities, []);
    assert.doesNotThrow(() => {
      assertContentIntegrity({
        articles: [draftGeneralArticle],
        isDraftPreview: true,
      });
    });
  });

  it('allows a published article without references; none are invented (DEC-020)', () => {
    const noRef = { ...validArticle, slug: 'artikel-tanpa-ref', references: [] };
    assert.doesNotThrow(() => assertContentIntegrity({ articles: [noRef] }));
  });

  it('allows a published article without a short answer (DEC-020)', () => {
    const noAnswer = { ...validArticle, slug: 'artikel-tanpa-answer', answer: '' };
    assert.doesNotThrow(() => assertContentIntegrity({ articles: [noAnswer] }));
  });

  it('fails when published article answer word count is outside 40-60 words', () => {
    const invalid = { ...validArticle, slug: 'jawaban-terlalu-pendek', answer: 'Hanya sepuluh kata pendek untuk menguji batas kata jawaban.' };
    assert.throws(
      () => {
        assertContentIntegrity({ articles: [invalid] });
      },
      (err: Error) => {
        assert.match(err.message, /jawaban-terlalu-pendek/);
        assert.match(err.message, /40–60 kata/);
        return true;
      }
    );
  });

  it('fails when published articles have duplicate metaTitle', () => {
    const art1 = { ...validArticle, slug: 'art-1' };
    const art2 = { ...validArticle, slug: 'art-2' };
    assert.throws(
      () => {
        assertContentIntegrity({ articles: [art1, art2] });
      },
      (err: Error) => {
        assert.match(err.message, /metaTitle ganda/);
        assert.match(err.message, /art-2/);
        return true;
      }
    );
  });

  it('fails when published articles have duplicate description', () => {
    const art1 = { ...validArticle, slug: 'art-1', metaTitle: 'Meta Title 1' };
    const art2 = { ...validArticle, slug: 'art-2', metaTitle: 'Meta Title 2' };
    assert.throws(
      () => {
        assertContentIntegrity({ articles: [art1, art2] });
      },
      (err: Error) => {
        assert.match(err.message, /description ganda/);
        assert.match(err.message, /art-2/);
        return true;
      }
    );
  });

  it('fails when symptom points to a fictitious article slug', () => {
    assert.throws(
      () => {
        assertContentIntegrity({
          articles: [validArticle],
          symptoms: [
            {
              id: 'gejala-daun-kuning',
              diagnosis: 'Bercak Daun Fiktif',
              article: 'slug-tidak-ada',
            },
          ],
          isDraftPreview: true,
        });
      },
      (err: Error) => {
        assert.match(err.message, /gejala-daun-kuning/);
        assert.match(err.message, /slug-tidak-ada/);
        return true;
      }
    );
  });

  it('fails in production build when reviewed symptom points to a draft article', () => {
    const draftArticle: ArticleData = { ...validArticle, slug: 'artikel-draf', draft: true };
    assert.throws(
      () => {
        assertContentIntegrity({
          articles: [draftArticle],
          symptoms: [
            {
              id: 'gejala-busuk',
              article: 'artikel-draf',
              reviewedBy: 'Arif Prabowo',
            },
          ],
          isDraftPreview: false,
        });
      },
      (err: Error) => {
        assert.match(err.message, /gejala-busuk/);
        assert.match(err.message, /belum terbit/);
        return true;
      }
    );
  });

  it('allows unreviewed symptom to point to a draft article in production build (A.8)', () => {
    const draftArticle: ArticleData = { ...validArticle, slug: 'artikel-draf', draft: true };
    assert.doesNotThrow(() => {
      assertContentIntegrity({
        articles: [draftArticle],
        symptoms: [
          {
            id: 'gejala-tersembunyi',
            article: 'artikel-draf',
            // reviewedBy omitted
          },
        ],
        isDraftPreview: false,
      });
    });
  });

  it('fails when crop calendar points to unknown commodity', () => {
    assert.throws(
      () => {
        assertContentIntegrity({
          articles: [validArticle],
          commodities: [{ id: 'cabai', name: 'Cabai' }],
          cropCalendars: [{ id: 'komoditas-palsu' }],
        });
      },
      (err: Error) => {
        assert.match(err.message, /komoditas-palsu/);
        return true;
      }
    );
  });
});

describe('mapCategoryToTopic Table-Driven Tests', () => {
  const cases = [
    { input: 'Manajemen Air & Sistem Irigasi Pertanian', expected: 'air-irigasi' },
    { input: 'Bioteknologi, Agribisnis & Pasca Panen', expected: 'pascapanen-agribisnis' },
    { input: 'Fisiologi & Anatomi Tumbuhan', expected: 'sains-tanaman' },
    { input: 'Fisiologi Tanaman & Perawatan', expected: 'sains-tanaman' },
    { input: 'Hama & Proteksi Tanaman', expected: 'proteksi-tanaman' },
    { input: 'Perkebunan & Patologi Tanaman', expected: 'proteksi-tanaman' },
    { input: 'Patologi Tanaman & Hortikultura', expected: 'proteksi-tanaman' },
    { input: 'Ilmu Tanah & Kesuburan Lahan', expected: 'tanah-nutrisi' },
    { input: 'Nutrisi Tanaman, Pupuk & Biostimulan', expected: 'tanah-nutrisi' },
    { input: 'Teknik Budidaya & Manajemen Lahan', expected: 'budidaya' },
    { input: 'Tanaman Pangan & Budidaya Padi', expected: 'budidaya' },
    { input: 'Urban Farming & Hidroponik', expected: 'budidaya' },
    // Robustness test: "Cairan Nutrisi Organik" should map to tanah-nutrisi, NOT air-irigasi
    { input: 'Cairan Nutrisi Organik', expected: 'tanah-nutrisi' },
  ];

  for (const { input, expected } of cases) {
    it(`maps "${input}" correctly to "${expected}"`, () => {
      assert.equal(mapCategoryToTopic(input), expected);
    });
  }
});

