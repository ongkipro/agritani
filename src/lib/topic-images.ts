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
