// Single source for Jurnal topics (DESIGN §3.1.1). Colour lives in CSS as `.topic-<slug>` → `--topic`.
export const TOPICS = [
  { slug: 'proteksi-tanaman', name: 'Proteksi Tanaman', title: 'Proteksi Tanaman: Hama & Penyakit' },
  { slug: 'tanah-nutrisi', name: 'Tanah & Nutrisi', title: 'Tanah & Nutrisi Tanaman' },
  { slug: 'budidaya', name: 'Budidaya', title: 'Teknik Budidaya & Pembibitan' },
  { slug: 'air-irigasi', name: 'Air & Irigasi', title: 'Manajemen Air & Sistem Irigasi' },
  { slug: 'pascapanen-agribisnis', name: 'Pascapanen & Agribisnis', title: 'Pascapanen & Agribisnis' },
  { slug: 'sains-tanaman', name: 'Sains Tanaman', title: 'Sains Tanaman & Fisiologi' },
] as const;

export const topicName = (slug: string): string =>
  TOPICS.find((t) => t.slug === slug)?.name ?? slug;
