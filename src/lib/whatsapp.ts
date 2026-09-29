/**
 * src/lib/whatsapp.ts
 * Centralized WhatsApp link generator adhering to DESIGN §2.7 & §2.8
 * All outbound WhatsApp links MUST pass through this function.
 */

// TODO(OQ-1): Nomor WhatsApp resmi PT Agritani Internasional dari pemilik
export const DEFAULT_WA_PHONE = '';
export const DEV_PLACEHOLDER_PHONE = '62000000000';

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
  const { source, fields = [], note, phone } = options;
  let targetPhone = phone || DEFAULT_WA_PHONE;

  if (!targetPhone) {
    const isProd =
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ||
      (typeof import.meta !== 'undefined' &&
        Boolean((import.meta as any).env?.PROD) &&
        (import.meta as any).env?.PUBLIC_INCLUDE_DRAFTS !== 'true');

    if (isProd) {
      throw new Error(
        '[OQ-1] Nomor WhatsApp resmi PT Agritani Internasional belum diisi (DEFAULT_WA_PHONE is empty). Dilarang build produksi dengan nomor kosong.'
      );
    }
    targetPhone = DEV_PLACEHOLDER_PHONE;
  }

  // Clean phone number: remove any non-digit
  const cleanPhone = targetPhone.replace(/\D/g, '');

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
