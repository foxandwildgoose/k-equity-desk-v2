/**
 * Safe HTML → reader-friendly plain text.
 * Never render raw HTML from market feeds; always pass through here first.
 */

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      const code = parseInt(h, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    })
    .replace(/&amp;/gi, "&");
}

/** Strip tags, normalize breaks, keep paragraph structure. */
export function htmlToReadableText(raw?: string | null): string {
  if (!raw?.trim()) return "";
  let s = raw
    .replace(/\r\n/g, "\n")
    // block / break → newline before stripping tags
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*(p|div|li|h[1-6]|tr|section|article)\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<\/\s*td\s*>/gi, " ")
    .replace(/<\/\s*th\s*>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "");

  s = decodeHtmlEntities(s)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return s;
}

export function splitParagraphs(text: string): string[] {
  if (!text.trim()) return [];
  let parts = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // One giant block → split on Korean/English sentence ends
  if (parts.length === 1 && parts[0]!.length > 220) {
    parts = parts[0]!
      .split(/(?<=다\.|요\.|니다\.|습니다\.|임\.|[.!?])\s+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 8);
  }
  return parts;
}

export function summarizeText(paragraphs: string[], maxLen = 160): string {
  const first = paragraphs[0] ?? "";
  if (first.length <= maxLen) return first;
  return first.slice(0, maxLen - 1).replace(/\s+\S*$/, "") + "…";
}

export interface ReadableDoc {
  plain: string;
  paragraphs: string[];
  summary: string;
  bullets: string[];
}

/** Full pipeline for product blurbs, research HTML, etc. */
export function toReadableDoc(
  raw?: string | null,
  opts?: { maxBullets?: number; extractHints?: boolean },
): ReadableDoc {
  const plain = htmlToReadableText(raw);
  const paragraphs = splitParagraphs(plain);
  const summary = summarizeText(paragraphs);
  const bullets: string[] = [];

  if (opts?.extractHints !== false && plain) {
    const patterns: [RegExp, (m: RegExpMatchArray) => string][] = [
      [
        /기초지수[는은]?\s*([^.\n]{6,90})/,
        (m) => `기초지수: ${m[1]!.trim()}`,
      ],
      [/총보수[^\d]*([\d.]+)\s*%/, (m) => `총보수 ${m[1]}%`],
      [/구성\s*(\d+)\s*종목/, (m) => `포트폴리오 ${m[1]}종목`],
      [/TOP\s*(\d+)/i, (m) => `핵심 TOP${m[1]} 집중`],
      [/밸류\s*체인|가치사슬/, () => "밸류체인 분산 투자"],
      [/추적[^.!\n]{0,24}목표/, () => "지수 수익률 추종"],
      [/공정공시|잠정실적|영업실적/, () => "실적·공정공시 관련"],
    ];
    for (const [re, fn] of patterns) {
      const m = plain.match(re);
      if (m) {
        const b = fn(m).slice(0, 90);
        if (!bullets.includes(b)) bullets.push(b);
      }
    }
  }

  return {
    plain,
    paragraphs,
    summary,
    bullets: bullets.slice(0, opts?.maxBullets ?? 6),
  };
}
