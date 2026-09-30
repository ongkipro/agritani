import type { ImageMetadata } from 'astro';

import aussieImg from '../assets/images/dummy/produk-aussie.webp';
import kojienImg from '../assets/images/dummy/produk-kojien.webp';
import bensuImg from '../assets/images/dummy/produk-bensu.webp';
import saratogaImg from '../assets/images/dummy/produk-saratoga.webp';

export const productImages: Record<string, ImageMetadata> = {
  aussie: aussieImg,
  kojien: kojienImg,
  bensu: bensuImg,
  saratoga: saratogaImg,
};

export function getProductImage(productId: string): ImageMetadata {
  return productImages[productId] || aussieImg;
}
