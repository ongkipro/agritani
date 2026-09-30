import type { ImageMetadata } from 'astro';

import aussieImg from '../assets/images/dummy/produk-aussie.webp';
import kojienImg from '../assets/images/dummy/produk-kojien.webp';
import bensuImg from '../assets/images/dummy/produk-bensu.webp';
import saratogaImg from '../assets/images/dummy/produk-saratoga.webp';

import aussieLahan from '../assets/images/products/aussie-lahan.webp';
import aussieSawit from '../assets/images/products/aussie-sawit.webp';

import kojienPadi from '../assets/images/products/kojien-padi.webp';

import bensuAplikasi from '../assets/images/products/bensu-aplikasi.webp';

import saratogaBunga from '../assets/images/products/saratoga-bunga.webp';
import saratogaBuah from '../assets/images/products/saratoga-buah.webp';

export const productImages: Record<string, ImageMetadata> = {
  aussie: aussieImg,
  kojien: kojienImg,
  bensu: bensuImg,
  saratoga: saratogaImg,
};

export function getProductImage(productId: string): ImageMetadata {
  return productImages[productId] || aussieImg;
}

export interface ProductFieldPhoto {
  image: ImageMetadata;
  caption: string;
  tag: string;
}

// Field photos are illustrations only (owner-approved dummy/AI imagery): captions describe what is
// in the picture, never a product result, partner, or customer (AGENTS.md content integrity).
// Portraits of people were removed: an invented farmer must not read as a partner or testimonial.
const ILUSTRASI = 'Foto ilustrasi';

export const productFieldVisuals: Record<string, ProductFieldPhoto[]> = {
  aussie: [
    { image: aussieLahan, caption: 'Kebun kelapa sawit dengan tandan buah di pokok.', tag: ILUSTRASI },
    { image: aussieSawit, caption: 'Tajuk dan pangkal batang kelapa sawit di kebun.', tag: ILUSTRASI },
  ],
  kojien: [
    { image: kojienPadi, caption: 'Malai padi di sawah menjelang panen.', tag: ILUSTRASI },
  ],
  bensu: [
    { image: bensuAplikasi, caption: 'Penyemprotan tanaman di lahan terbuka.', tag: ILUSTRASI },
  ],
  saratoga: [
    { image: saratogaBunga, caption: 'Bedengan cabai bermulsa di lahan terbuka.', tag: ILUSTRASI },
    { image: saratogaBuah, caption: 'Lahan melon dan semangka menjelang panen.', tag: ILUSTRASI },
  ],
};

export function getProductFieldPhotos(productId: string): ProductFieldPhoto[] {
  return productFieldVisuals[productId] ?? [];
}
