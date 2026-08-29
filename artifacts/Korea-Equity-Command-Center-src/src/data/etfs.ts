/** ETF UI types — market data is live from server/etf-market. */
export type EtfMarketBucket =
  | "retirement"
  | "all"
  | "new"
  | "theme"
  | "us"
  | "bond";

export const ETF_BUCKET_LABEL: Record<EtfMarketBucket, string> = {
  retirement: "퇴직연금 가능",
  all: "전체 ETF",
  new: "신규 상장",
  theme: "국내 테마",
  us: "미국·해외",
  bond: "채권·혼합",
};

export const ETF_BUCKET_HINT: Record<EtfMarketBucket, string> = {
  retirement:
    "레버리지·인버스·2X 등 파생 ETF를 제외한 목록입니다. DC·IRP 공통 제한을 반영한 1차 필터이며, 운영사(미래에셋 등) 최종 허용 목록과 100% 일치하지 않을 수 있습니다.",
  all: "한국거래소 상장 ETF 전체(네이버 금융 실시간 목록).",
  new: "최근 3개월 이내 상장 후보. 상장일은 YYYY-MM-DD. 3개월 등락률은 성립하지 않아 표시하지 않습니다.",
  theme: "국내 업종·테마형 (퇴직연금 필터 적용).",
  us: "미국·해외 주식형 및 미국 테마 (퇴직연금 필터 적용).",
  bond: "채권·혼합·기타 (퇴직연금 필터 적용).",
};
