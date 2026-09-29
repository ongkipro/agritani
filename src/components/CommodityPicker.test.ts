import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

export function resolveCommodityHeroTarget({
  slug,
  hasReviewedSymptoms,
  activeHubSlugs,
}: {
  slug: string;
  hasReviewedSymptoms: boolean;
  activeHubSlugs: Set<string>;
}): { href: string; questionLabel: string } {
  if (hasReviewedSymptoms) {
    return {
      href: `/alat/diagnosa-gejala/?k=${slug}`,
      questionLabel: 'Pilih Tanaman Anda:',
    };
  }

  const questionLabel = 'Pilih tanaman Anda untuk panduan penanganannya:';
  if (activeHubSlugs.has(slug)) {
    return {
      href: `/jurnal/komoditas/${slug}/`,
      questionLabel,
    };
  }

  return {
    href: `/jurnal/`,
    questionLabel,
  };
}

describe('Commodity Hero Destination Resolution (T-08 REVISE)', () => {
  it('links to diagnosa gejala when symptoms are reviewed', () => {
    const activeHubs = new Set(['cabai', 'padi']);
    const result = resolveCommodityHeroTarget({
      slug: 'cabai',
      hasReviewedSymptoms: true,
      activeHubSlugs: activeHubs,
    });

    assert.equal(result.href, '/alat/diagnosa-gejala/?k=cabai');
    assert.equal(result.questionLabel, 'Pilih Tanaman Anda:');
  });

  it('links to published commodity hub when no symptoms are reviewed in production', () => {
    const activeHubs = new Set(['cabai', 'padi']);
    const result = resolveCommodityHeroTarget({
      slug: 'cabai',
      hasReviewedSymptoms: false,
      activeHubSlugs: activeHubs,
    });

    assert.equal(result.href, '/jurnal/komoditas/cabai/');
    assert.equal(result.questionLabel, 'Pilih tanaman Anda untuk panduan penanganannya:');
  });

  it('falls back to /jurnal/ if commodity hub is not built (less than 3 published articles)', () => {
    const activeHubs = new Set(['cabai', 'padi']); // jagung only has 2 published articles in batch 1
    const result = resolveCommodityHeroTarget({
      slug: 'jagung',
      hasReviewedSymptoms: false,
      activeHubSlugs: activeHubs,
    });

    assert.equal(result.href, '/jurnal/');
    assert.equal(result.questionLabel, 'Pilih tanaman Anda untuk panduan penanganannya:');
  });
});
