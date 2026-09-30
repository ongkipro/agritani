/**
 * src/lib/ics.ts
 * RFC 5545 compliant iCalendar (.ics) generator for Kalender Tanam (REQ-09, DESIGN §2.6.1)
 */

import { addDays } from './crop-calendar.ts';
import type { CropPlanResult } from './crop-calendar.ts';

/**
 * Format a Date object to RFC 5545 date string format: YYYYMMDD
 */
export function formatIcsDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Format a Date object to UTC timestamp: YYYYMMDDTHHMMSSZ
 */
export function formatIcsTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escape text for RFC 5545 iCalendar values
 */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Fold lines longer than 75 octets per RFC 5545 §3.1
 */
export function foldIcsLine(line: string): string {
  const maxLen = 75;
  if (line.length <= maxLen) return line;

  let result = '';
  let remaining = line;
  let first = true;

  while (remaining.length > 0) {
    if (first) {
      result += remaining.slice(0, maxLen);
      remaining = remaining.slice(maxLen);
      first = false;
    } else {
      result += '\r\n ' + remaining.slice(0, maxLen - 1);
      remaining = remaining.slice(maxLen - 1);
    }
  }

  return result;
}

/**
 * Generate complete .ics file content from a CropPlanResult
 */
export function generateCropCalendarIcs(plan: CropPlanResult, commodityName: string): string {
  const now = new Date();
  const dtstamp = formatIcsTimestamp(now);
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Agritani//Kalender Tanam//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Jadwal Tanam ${commodityName} - Agritani`,
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  // 1. Add VEVENT for each computed phase
  plan.computedPhases.forEach((phase) => {
    // In RFC 5545, DTEND for VALUE=DATE is non-inclusive, so add 1 day
    const dtstart = formatIcsDate(phase.startDate);
    const dtend = formatIcsDate(addDays(phase.endDate, 1));
    const uid = `agritani-${plan.commodityId}-${phase.id}-${dtstart}@agritani.com`;

    let desc = `Rencana fase budidaya ${commodityName}.\\n\\nKegiatan Lapangan:\\n`;
    phase.activities.forEach((act) => {
      desc += `- ${act}\\n`;
    });

    if (phase.watch.length > 0) {
      desc += `\\nWaspadai Hama / Penyakit:\\n`;
      phase.watch.forEach((w) => {
        desc += `- ${w.name}\\n`;
      });
    }

    desc += `\\nPanduan selengkapnya: https://agritani.com/alat/kalender-tanam/`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
    lines.push(`DTEND;VALUE=DATE:${dtend}`);
    lines.push(`SUMMARY:${escapeIcsText(`[${commodityName}] ${phase.name}`)}`);
    lines.push(`DESCRIPTION:${desc}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:TRANSPARENT');
    lines.push('END:VEVENT');
  });

  // 2. Add Harvest Reminder Event if harvest window exists
  if (plan.harvestStart && plan.harvestEnd) {
    const dtstart = formatIcsDate(plan.harvestStart);
    const dtend = formatIcsDate(addDays(plan.harvestEnd, 1));
    const uid = `agritani-${plan.commodityId}-harvest-${dtstart}@agritani.com`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
    lines.push(`DTEND;VALUE=DATE:${dtend}`);
    lines.push(`SUMMARY:${escapeIcsText(`🌾 Perkiraan Panen: ${commodityName}`)}`);
    lines.push(
      `DESCRIPTION:${escapeIcsText(
        `Perkiraan jendela waktu panen untuk ${commodityName} (${plan.harvestRangeStr}). Siapkan tenaga kerja, alat panen, dan penanganan pascapanen.\\n\\nKunjungi https://agritani.com`
      )}`
    );
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:TRANSPARENT');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.map((line) => foldIcsLine(line)).join('\r\n') + '\r\n';
}
