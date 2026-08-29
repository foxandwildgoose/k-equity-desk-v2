export function resolveRegionalCapability(
  geo: string,
  classification: string,
  cfg?: {
    forbiddenCombos?: { geo: string; classification: string; reason: string }[];
    levels?: { id: string; available?: boolean; reason?: string }[];
  },
): { available: boolean; reason?: string } {
  const forbidden = (cfg?.forbiddenCombos ?? []).find(
    (f) => f.geo === geo && f.classification === classification,
  );
  if (forbidden) return { available: false, reason: forbidden.reason };
  const level = (cfg?.levels ?? []).find((l) => l.id === geo);
  if (level && level.available === false) {
    return { available: false, reason: level.reason };
  }
  if (!cfg && geo === "SIGUNGU" && classification === "HSK10") {
    return {
      available: false,
      reason: "시군구 × HSK-10 공식 시계열이 없습니다. 숫자를 합성하지 않습니다.",
    };
  }
  return { available: true };
}
