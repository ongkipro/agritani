/**
 * src/lib/whatsapp.ts
 * Centralized WhatsApp link generator adhering to DESIGN §2.7 & §2.8
 * All outbound WhatsApp links MUST pass through this function.
 */

// TODO(OQ-1): Nomor WhatsApp resmi PT Agritani Internasional dari pemilik
export const DEFAULT_WA_PHONE = '6281234567890';

export interface WaField {
  label: string;
  value: string;
}

export interface WaLinkOptions {
  source: string; // e.g. "Web·Konsultasi", "Web·Diagnosa", "Web·Artikel:ganoderma"
  fields?: Array<WaField | undefined | null | false>;
  note?: string; // Optional closing note
  phone?: string;
}

export function waLink(options: WaLinkOptions): string {
  const { source, fields = [], note, phone = DEFAULT_WA_PHONE } = options;

  // Clean phone number: remove any non-digit
  const cleanPhone = phone.replace(/\D/g, '');

  // Line 1 is always the bracketed source code (G-6)
  const lines: string[] = [`[${source}]`];

  for (const f of fields) {
    if (f && typeof f === 'object' && f.label && f.value) {
      lines.push(`${f.label}: ${f.value}`);
    }
  }

  if (note && note.trim()) {
    lines.push(note.trim());
  }

  const message = lines.join('\n');
  const encoded = encodeURIComponent(message);

  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}
