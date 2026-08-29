import type { Market, SectorId } from "@/data/types";

export function inferSectorId(name: string): SectorId {
  const n = name.replace(/\s/g, "");
  if (/바이오|제약|헬스케어|의료|백신|신약|진단|셀트리온|녹십자|유한양행/.test(n))
    return "bio";
  if (
    /배터리|2차전지|이차전지|양극|음극|에코프로|에너지솔루션|퓨처엠|SDI|대주전자재료/.test(
      n,
    )
  )
    return "battery";
  if (
    /삼성전자|하이닉|반도체|팹리스|파운드리|HBM|웨이퍼|마이크론|DB하이텍|세미콘/.test(
      n,
    )
  )
    return "semiconductors";
  if (/방산|항공우주|미사일|무기|위성|에어로스페이스|쎄트렉|풍산/.test(n))
    return "defense";
  if (/로봇|로보틱스|로보티즈|로보스타|클로봇|자동화/.test(n)) return "robotics";
  if (/자동차|모비스|기아|현대차|타이어|만도|한온/.test(n)) return "auto";
  if (/은행|증권|보험|금융|카드|캐피탈/.test(n)) return "finance";
  if (/조선|해양|현대중공업|한국조선|한화오션|한화엔진|STX엔진/.test(n))
    return "shipbuilding";
  if (
    /전력|원전|가스|에너지|전력공사|퓨얼셀|에너빌리티|일렉트릭|일진전기|효성중공업|한국전력|가스공사|S-Oil|에쓰오일/.test(
      n,
    )
  )
    return "energy";
  if (/철강|제철|포스코|POSCO|고려아연|알루미늄/.test(n)) return "steel";
  if (/화학|케미칼|정유|유화|이노베이션/.test(n)) return "chemicals";
  if (/통신|텔레콤|네이버|NAVER|카카오|크래프톤|넷마블|펄어비스/.test(n))
    return "telecom";
  if (/건설|건자재|시멘트|산업개발|인프라코어|건설기계/.test(n))
    return "construction";
  if (
    /식품|유통|화장품|패션|여행|카지노|콜마|코스맥스|아모레|오리온|농심|CJ|대상|삼양/.test(
      n,
    )
  )
    return "consumer";
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

/**
 * KRX stock (6 digits) or ETF (6 alphanumerics, e.g. 0226A0).
 * NEVER strip letters first — that turns 0226A0 into 002260 (wrong name).
 */
export function normalizeKrTicker(raw: string): string {
  const t = raw.trim().toUpperCase();
  if (/^[0-9A-Z]{6}$/.test(t)) return t;
  const compact = t.replace(/[\s\-_./]/g, "");
  if (/^[0-9A-Z]{6}$/.test(compact)) return compact;
  const d = t.replace(/\D/g, "");
  if (d.length >= 1 && d.length <= 6 && !/[A-Z]/.test(compact)) {
    return d.padStart(6, "0").slice(-6);
  }
  return compact.slice(0, 8);
}

export function isKrTicker(raw: string): boolean {
  return /^[0-9A-Z]{6}$/.test(normalizeKrTicker(raw));
}

export function isDigitTicker(raw: string): boolean {
  return /^\d{6}$/.test(normalizeKrTicker(raw));
}

export function isAlphanumericTicker(raw: string): boolean {
  const t = normalizeKrTicker(raw);
  return /^[0-9A-Z]{6}$/.test(t) && /[A-Z]/.test(t);
}

const ETF_BRAND_RE =
  /\b(ETF|ETN|KODEX|TIGER|ACE|PLUS|SOL|RISE|HANARO|KBSTAR)\b/i;
const ETF_KO_RE = /인버스|레버리지|곱버스|상장지수/;

export function looksLikeEtf(code: string, name?: string | null): boolean {
  if (isAlphanumericTicker(code)) return true;
  if (!name) return false;
  return ETF_BRAND_RE.test(name) || ETF_KO_RE.test(name);
}

/** Route KRX cash equities vs ETFs. 6-digit KODEX/TIGER names are ETFs too. */
export function isEtfTicker(code: string, name?: string | null): boolean {
  return looksLikeEtf(code, name);
}

export function shouldRouteToEtf(
  code: string,
  name?: string | null,
  isEtfFlag?: boolean,
): boolean {
  if (isEtfFlag) return true;
  return looksLikeEtf(code, name);
}
