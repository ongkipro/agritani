/**
 * Calculate reading time in Indonesian from text content
 * Assumes average reading speed of 200 words per minute
 */
export function getReadingTime(content: string): {
  minutes: number;
  text: string;
  words: number;
} {
  if (!content || typeof content !== 'string') {
    return { minutes: 1, text: '1 menit baca', words: 0 };
  }

  // Strip Markdown formatting, HTML tags, and code blocks for accurate word count
  const clean = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[#*_~>]/g, ' ')
    .trim();

  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return {
    minutes,
    text: `${minutes} menit baca`,
    words,
  };
}
