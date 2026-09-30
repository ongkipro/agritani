import type { ImageMetadata } from 'astro';

// Topic-specific licensed dummy images from src/assets/images/dummy/
import proteksiImg from '../assets/images/dummy/topik-proteksi-tanaman.webp';
import tanahImg from '../assets/images/dummy/topik-tanah-nutrisi.webp';
import budidayaImg from '../assets/images/dummy/topik-budidaya.webp';
import airImg from '../assets/images/dummy/topik-air-irigasi.webp';
import pascapanenImg from '../assets/images/dummy/topik-pascapanen-agribisnis.webp';
import sainsImg from '../assets/images/dummy/topik-sains-tanaman.webp';

export const topicDummyImages: Record<string, ImageMetadata> = {
  'proteksi-tanaman': proteksiImg,
  'tanah-nutrisi': tanahImg,
  'budidaya': budidayaImg,
  'air-irigasi': airImg,
  'pascapanen-agribisnis': pascapanenImg,
  'sains-tanaman': sainsImg,
};

export function getTopicImage(topic: string): ImageMetadata {
  return topicDummyImages[topic] || proteksiImg;
}

// Commodity dummy images (komoditas-<slug>.webp, credited in CREDITS.md); fallback to the topic image.
const commodityImages = import.meta.glob<{ default: ImageMetadata }>('../assets/images/dummy/komoditas-*.webp', { eager: true });

function commodityImage(slug: string): ImageMetadata | undefined {
  return Object.entries(commodityImages).find(([path]) => path.endsWith(`komoditas-${slug}.webp`))?.[1].default;
}

/** Lead/thumbnail image for an article: first commodity with a photo, else its topic image. */
export function getArticleImage(data: { topic: string; commodities?: Array<string | { id: string }> }): ImageMetadata {
  for (const c of data.commodities ?? []) {
    const img = commodityImage(typeof c === 'string' ? c : c.id);
    if (img) return img;
  }
  return getTopicImage(data.topic);
}

