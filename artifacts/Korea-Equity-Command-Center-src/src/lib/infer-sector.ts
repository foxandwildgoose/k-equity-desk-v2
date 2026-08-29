import type { Market, SectorId } from "@/data/types";

export function inferSectorId(name: string): SectorId {
  const n = name.replace(/\s/g, "");
  if (/바이오|제약|헬스케어|의료|백신|신약|진단/.test(n)) return "bio";
  if (/반도체|하이닉|팹리스|파운드리|HBM|웨이퍼/.test(n)) return "semiconductors";
  if (/배터리|2차전지|이차전지|양극|음극|에코프로|에너지솔루션/.test(n))
    return "battery";
  if (/조선|해양|중공업|엔진/.test(n)) return "shipbuilding";
  if (/자동차|모비스|기아|현대차|타이어/.test(n)) return "auto";
  if (/은행|증권|보험|금융|카드|캐피탈/.test(n)) return "finance";
  if (/철강|제철|포스코/.test(n)) return "steel";
  if (/방산|항공우주|미사일|무기/.test(n)) return "defense";
  if (/로봇|자동화/.test(n)) return "robotics";
  if (/화학|케미칼/.test(n)) return "chemicals";
  if (/전력|원전|가스|에너지|전력공사/.test(n)) return "energy";
  if (/통신|텔레콤/.test(n)) return "telecom";
  if (/건설|건자재|시멘트/.test(n)) return "construction";
  if (/식품|유통|화장품|패션|여행|카지노/.test(n)) return "consumer";
  if (/디스플레이|전자|전기|이노텍/.test(n)) return "electronics";
  return "electronics";
}

export function inferMarket(typeCode?: string | null, typeName?: string | null): Market {
  const s = `${typeCode ?? ""} ${typeName ?? ""}`.toUpperCase();
  if (s.includes("KOSDAQ") || s.includes("코스닥") || /\bKQ\b/.test(s)) return "KOSDAQ";
  return "KOSPI";
}

/** Detect KOSPI vs KOSDAQ from any mix of Naver/Yahoo labels. */
export function detectKrMarket(...parts: Array<string | null | undefined>): Market {
  const s = parts.filter(Boolean).join(" ").toUpperCase();
  if (s.includes("KOSDAQ") || s.includes("코스닥") || s.includes(".KQ") || /\bKQ\b/.test(s)) {
    return "KOSDAQ";
  }
  return "KOSPI";
}

/** KRX stock (6 digits) or ETF (6 alphanumerics, e.g. 0226A0). */
export function normalizeKrTicker(raw: string): string {
  const t = raw.trim().toUpperCase();
  if (/^[0-9A-Z]{6}$/.test(t)) return t;
  const d = t.replace(/\D/g, "");
  if (d.length) return d.padStart(6, "0").slice(-6);
  return t;
}

export function isKrTicker(raw: string): boolean {
  return /^[0-9A-Z]{6}$/.test(normalizeKrTicker(raw));
}
