import type { UsLinkPillar } from "./types";

/** Curated Korea equities that feed US demand / security / onshoring. */
export interface UsLinkedName {
  code: string;
  pillar: UsLinkPillar;
  /** Why the US needs / benefits from this name */
  usAngle: string;
}

export const US_LINK_PILLARS: {
  id: UsLinkPillar;
  nameKo: string;
  nameEn: string;
  thesis: string;
  accent: "gold" | "teal" | "copper" | "indigo" | "navy" | "rose";
  /** Where to read primary material for this pillar */
  sourceUrl: string;
  moreSources?: { label: string; url: string }[];
}[] = [
  {
    id: "ai-semiconductor",
    nameKo: "AI·반도체 공급망",
    nameEn: "AI & Semiconductor Supply Chain",
    thesis:
      "미국 AI 데이터센터·HBM 수요가 한국 메모리·장비·소재 실적을 견인. CHIPS Act·수출통제 동향이 핵심 리스크/기회.",
    accent: "gold",
    sourceUrl: "https://www.bis.doc.gov/",
    moreSources: [
      { label: "CHIPS (NIST)", url: "https://www.nist.gov/chips" },
      { label: "반도체 산업 리서치", url: "https://finance.naver.com/research/industry_list.naver" },
    ],
  },
  {
    id: "battery-ira",
    nameKo: "배터리·IRA 현지화",
    nameEn: "Battery & IRA Localization",
    thesis:
      "미국 IRA 세액공제·현지 생산 요건이 셀·소재 투자와 JV를 결정. 북미 공장 램프업과 원가 경쟁력이 주가 드라이버.",
    accent: "teal",
    sourceUrl: "https://www.irs.gov/credits-deductions/credits-for-new-clean-vehicles-purchased-in-2023-or-after",
    moreSources: [
      { label: "DOE", url: "https://www.energy.gov/" },
      { label: "2차전지 리서치", url: "https://finance.naver.com/research/industry_list.naver" },
    ],
  },
  {
    id: "defense-ship",
    nameKo: "방산·조선·해양",
    nameEn: "Defense, Shipbuilding & Marine",
    thesis:
      "미국·동맹 방산 예산과 해군력 강화, LNG·컨테이너 선박 수요가 한국 조선·방산 수출 파이프라인을 지지.",
    accent: "copper",
    sourceUrl: "https://www.defense.gov/",
    moreSources: [
      { label: "미 해군", url: "https://www.navy.mil/" },
      { label: "방산 리서치", url: "https://finance.naver.com/research/industry_list.naver" },
    ],
  },
  {
    id: "nuclear-power",
    nameKo: "원전·전력기기",
    nameEn: "Nuclear & Grid Equipment",
    thesis:
      "미국 원전 재가동·SMR·AI 전력 수요가 한국 원전 기자재·변압기·가스터빈 수혜로 연결.",
    accent: "indigo",
    sourceUrl: "https://www.energy.gov/nuclear",
    moreSources: [
      { label: "DOE", url: "https://www.energy.gov/" },
      { label: "전력 리서치", url: "https://finance.naver.com/research/industry_list.naver" },
    ],
  },
  {
    id: "bio-cdmo",
    nameKo: "바이오 CDMO",
    nameEn: "Bio CDMO / Pharma Supply",
    thesis:
      "미국 바이오텍 임상·상업 생산 아웃소싱. FDA 규제·환율이 밸류에이션에 영향.",
    accent: "rose",
    sourceUrl: "https://www.fda.gov/",
    moreSources: [
      { label: "FDA", url: "https://www.fda.gov/" },
      { label: "바이오 리서치", url: "https://finance.naver.com/research/industry_list.naver" },
    ],
  },
  {
    id: "auto-export",
    nameKo: "자동차·전장 수출",
    nameEn: "Auto & EV Exports",
    thesis:
      "미국 판매·믹스, 관세·IRA 자동차 조항, 전장 부품 채택이 완성차·부품 실적 좌우.",
    accent: "navy",
    sourceUrl: "https://ustr.gov/",
    moreSources: [
      { label: "USTR", url: "https://ustr.gov/" },
      { label: "자동차 리서치", url: "https://finance.naver.com/research/industry_list.naver" },
    ],
  },
];

export const US_LINKED_NAMES: UsLinkedName[] = [
  { code: "005930", pillar: "ai-semiconductor", usAngle: "HBM·파운드리·AI 서버 메모리 — 미국 빅테크 수요 직결" },
  { code: "000660", pillar: "ai-semiconductor", usAngle: "HBM 점유율 핵심. AI 가속기 메모리 공급" },
  { code: "042700", pillar: "ai-semiconductor", usAngle: "본딩 장비 — HBM 후공정 병목" },
  { code: "058470", pillar: "ai-semiconductor", usAngle: "테스트 소켓 — 글로벌 OSAT/IDM 공급" },
  { code: "240810", pillar: "ai-semiconductor", usAngle: "증착/식각 장비 — 메모리 투자 사이클" },
  { code: "039030", pillar: "ai-semiconductor", usAngle: "레이저 장비 — 첨단 패키징" },
  { code: "000990", pillar: "ai-semiconductor", usAngle: "파운드리 특화 — 미국 팹리스 수요" },
  { code: "373220", pillar: "battery-ira", usAngle: "북미 셀 생산·JV — IRA 핵심 수혜" },
  { code: "006400", pillar: "battery-ira", usAngle: "미국 ESS·EV 셀 공급" },
  { code: "005490", pillar: "battery-ira", usAngle: "양극재·리튬 밸류체인, 미국 소재 파트너" },
  { code: "051910", pillar: "battery-ira", usAngle: "양극재·분리막 — 미국 공장 연계" },
  { code: "247540", pillar: "battery-ira", usAngle: "하이니켈 양극재 — 미국 셀사 공급" },
  { code: "003670", pillar: "battery-ira", usAngle: "양극재 — 북미 현지화" },
  { code: "086520", pillar: "battery-ira", usAngle: "소재 홀딩 — 미국 전기차 밸류체인" },
  { code: "012450", pillar: "defense-ship", usAngle: "엔진·유도무기 — 미 동맹 방산 수출" },
  { code: "047810", pillar: "defense-ship", usAngle: "항공기·수리온 계열 — 동맹 수요" },
  { code: "079550", pillar: "defense-ship", usAngle: "유도무기 — 미 안보 협력" },
  { code: "272210", pillar: "defense-ship", usAngle: "레이다·전자전 — 미 해군/공군 생태계" },
  { code: "009540", pillar: "defense-ship", usAngle: "LNG·특수선 — 미국 에너지 안보 운송" },
  { code: "042660", pillar: "defense-ship", usAngle: "해양·방산 조선" },
  { code: "329180", pillar: "defense-ship", usAngle: "대형 조선 — 미 상선·해군 관심" },
  { code: "034020", pillar: "nuclear-power", usAngle: "원전·가스터빈 — 미국 원전/전력 수요" },
  { code: "015760", pillar: "nuclear-power", usAngle: "전력 유틸 — 한-미 원전 패키지" },
  { code: "052690", pillar: "nuclear-power", usAngle: "원전 설계 — 해외 원전 수주" },
  { code: "267260", pillar: "nuclear-power", usAngle: "변압기·전력기기 — 미국 그리드 병목" },
  { code: "010120", pillar: "nuclear-power", usAngle: "전력기기·자동화 — 데이터센터 전력" },
  { code: "298040", pillar: "nuclear-power", usAngle: "초고압 변압기 — 미국 교체 수요" },
  { code: "207940", pillar: "bio-cdmo", usAngle: "글로벌 CDMO — 미국 바이오텍 생산 아웃소싱" },
  { code: "068270", pillar: "bio-cdmo", usAngle: "바이오시밀러 — 미국 시장 점유" },
  { code: "326030", pillar: "bio-cdmo", usAngle: "중추신경계 신약 — 미국 임상/상업" },
  { code: "196170", pillar: "bio-cdmo", usAngle: "ADC 플랫폼 — 미국 빅파마 파트너십" },
  { code: "005380", pillar: "auto-export", usAngle: "미국 판매·믹스·IRA 자동차 조항" },
  { code: "000270", pillar: "auto-export", usAngle: "미국 EV·하이브리드 점유" },
  { code: "012330", pillar: "auto-export", usAngle: "전장·모듈 — 미국 완성차 공급" },
  { code: "204320", pillar: "auto-export", usAngle: "ADAS·전장 — 미국 티어1" },
];

export const US_LINKED_CODES = [...new Set(US_LINKED_NAMES.map((x) => x.code))];

export function usLinkForCode(code: string): UsLinkedName | undefined {
  return US_LINKED_NAMES.find((x) => x.code === code);
}

/** Editorial briefings — expert desk context. Paired with live clickable sources. */
export const US_POLICY_BRIEFS: {
  id: string;
  category: "ai-race" | "policy" | "industry" | "risk";
  title: string;
  summary: string;
  whyItMatters: string;
  marketImpact: string;
  watchItems: string[];
  tags: string[];
  source: string;
  /** Primary official / first-party source — always required for 원문 보기 */
  sourceUrl: string;
  /** Extra primary docs (USTR, Fed, Naver research, etc.) */
  moreSources?: { label: string; url: string }[];
  relatedCodes: string[];
}[] = [
  {
    id: "ai-export-controls",
    category: "ai-race",
    title: "미중 AI 패권 전쟁: 첨단 칩·장비 수출통제가 공급망을 가른다",
    summary:
      "미국은 AI 학습·추론에 쓰이는 첨단 GPU/가속기와 제조 장비·소프트웨어에 대해 대중 수출통제를 강화해 왔다. 목표는 중국의 프론티어 AI·군사 역량 지연이다. 한국은 HBM·메모리·후공정·소부장 병목 공급자이면서 중국 팹 매출 익스포저도 보유한다.",
    whyItMatters:
      "통제 확대 시 중국향 매출 하방과 미국·동맹 고객 프리미엄이 동시에 움직인다. 주가는 중국 비중×규제 강도와 미국 AI capex 스프레드로 설명되는 경우가 많다.",
    marketImpact:
      "단기 규제 헤드라인 변동성. 중기 HBM·패키징 점유 기업 구조 프리미엄. 리스크: 중국 보복·라이선스·재고 조정.",
    watchItems: [
      "BIS Entity List·라이선스 업데이트",
      "빅테크 capex / GPU 가이던스",
      "HBM 출하·ASP·고객 배분",
      "중국 팹·국산 장비 대체 속도",
    ],
    tags: ["수출통제", "BIS", "HBM", "AI", "CHIPS"],
    source: "데스크 관점",
    sourceUrl: "https://www.bis.doc.gov/",
    moreSources: [
      { label: "Entity List", url: "https://www.bis.doc.gov/index.php/policy-guidance/lists-of-parties-of-concern/entity-list" },
      { label: "Federal Register 수출통제", url: "https://www.federalregister.gov/agencies/industry-and-security-bureau" },
    ],
    relatedCodes: ["005930", "000660", "042700", "240810", "058470"],
  },
  {
    id: "ai-hbm-bottleneck",
    category: "ai-race",
    title: "병목은 연산이 아니라 HBM·패키징·전력",
    summary:
      "AI 가속기 제약은 로직 칩을 넘어 HBM 스택, 첨단 패키징(본딩), 데이터센터 전력·냉각으로 이동했다. 한국 메모리·후공정 장비가 병목 레버다.",
    whyItMatters:
      "병목 레이어 가격결정력이 이익 레버리지. HBM 믹스·수율·qual 뉴스가 실적 서프라이즈 선행 지표.",
    marketImpact:
      "HBM 비중 메모리·본딩/테스트 장비 실적 상향 사이클. 전력기기·원전은 AI capex 2차 수혜.",
    watchItems: ["HBM 램프업", "본딩 장비 수주", "데이터센터 전력·변압기 리드타임"],
    tags: ["HBM", "패키징", "전력", "데이터센터"],
    source: "데스크 관점",
    sourceUrl: "https://www.nist.gov/chips",
    moreSources: [
      { label: "CHIPS for America", url: "https://www.nist.gov/chips" },
      { label: "반도체 산업 리서치", url: "https://finance.naver.com/research/industry_list.naver" },
    ],
    relatedCodes: ["000660", "005930", "042700", "267260", "298040"],
  },
  {
    id: "ai-allies-premium",
    category: "ai-race",
    title: "동맹 공급망 프리미엄: 신뢰 가능한 제조가 밸류 축",
    summary:
      "미국은 첨단 기술을 우호국 중심으로 재배치하려 한다. 미국·일본·유럽 고객 비중이 높을수록 중국 규제 민감도는 낮아지고 지정학 프리미엄이 붙을 수 있다.",
    whyItMatters: "동일 업종이라도 고객 지리적 믹스에 따라 멀티플이 갈린다. 지역별 매출 추적이 필수.",
    marketImpact: "미국 현지 투자·JV는 리레이팅 촉매. 중국 익스포저 과다는 디스카운트.",
    watchItems: ["미국 팹/패키징 투자", "지역별 매출", "동맹 조달 계약"],
    tags: ["동맹", "공급망", "리쇼어링"],
    source: "데스크 관점",
    sourceUrl: "https://www.commerce.gov/",
    moreSources: [
      { label: "CHIPS (NIST)", url: "https://www.nist.gov/chips" },
      { label: "미 상무부 무역", url: "https://www.commerce.gov/issues/trade-enforcement" },
    ],
    relatedCodes: ["005930", "000660", "373220", "012450"],
  },
  {
    id: "chips-act-guardrail",
    category: "policy",
    title: "CHIPS Act: 보조금의 대가인 가드레일",
    summary:
      "미국 반도체 보조금은 매력적이나 중국 첨단 확장 제한 등 가드레일을 동반한다. 한국 기업은 미국 인센티브와 중국 성장 시장 사이 포트폴리오 최적화가 필요하다.",
    whyItMatters: "투자 NPV는 보조금율만이 아니라 가드레일 준수·기회비용을 반영해야 한다.",
    marketImpact: "미국 투자 확정 시 장비·유틸 수혜. 중국 확장 차질 시 성장 스토리 하향.",
    watchItems: ["CHIPS 어워드 문구", "중국 캐파 계획", "주·지방 인센티브"],
    tags: ["CHIPS", "보조금", "가드레일"],
    source: "데스크 관점",
    sourceUrl: "https://www.nist.gov/chips",
    moreSources: [
      { label: "CHIPS 공고·가드레일", url: "https://www.nist.gov/chips" },
      { label: "미 상무부", url: "https://www.commerce.gov/" },
    ],
    relatedCodes: ["005930", "000660"],
  },
  {
    id: "ira-localization",
    category: "policy",
    title: "IRA·청정차량 세액공제와 북미 셀·소재 현지화",
    summary:
      "세액공제 적격 물량은 북미 조립·핵심광물 요건을 충족하는 공급망에 집중된다. 한국 셀·양극재의 미국 공장·JV 램프업이 실적 가시성.",
    whyItMatters: "정책 문구 한 줄이 ASP·점유율을 바꾼다. 요건 완화/강화는 섹터 베타 이벤트.",
    marketImpact: "북미 램프업 프리미엄, 중국 의존 소재 디스카운트. 완성차는 미국 믹스.",
    watchItems: ["IRS 가이던스", "미국 가동률", "핵심광물 소싱"],
    tags: ["IRA", "배터리", "현지화"],
    source: "데스크 관점",
    sourceUrl:
      "https://www.irs.gov/credits-deductions/credits-for-new-clean-vehicles-purchased-in-2023-or-after",
    moreSources: [
      { label: "IRS IRA 안내", url: "https://www.irs.gov/credits-deductions/credits-for-new-clean-vehicles-purchased-in-2023-or-after" },
      { label: "DOE", url: "https://www.energy.gov/" },
    ],
    relatedCodes: ["373220", "006400", "051910", "247540", "005380"],
  },
  {
    id: "fed-fx-beta",
    category: "policy",
    title: "연준 금리·달러: 한국 수출주 공통 베타",
    summary:
      "미국 금리 경로와 달러는 외국인 수급, 달러 원가, 성장주 할인율을 동시에 움직인다.",
    whyItMatters: "FOMC·CPI 데이에 반도체·2차전지 고베타 포지션 조정이 집중된다.",
    marketImpact: "인하 기대 시 기술 리레이팅, 달러 급등 시 외국인 이탈.",
    watchItems: ["FOMC SEP", "실질금리", "원/달러", "외국인 순매수"],
    tags: ["연준", "달러", "수급"],
    source: "데스크 관점",
    sourceUrl: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
    moreSources: [
      { label: "FOMC 일정", url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" },
      { label: "FOMC 성명", url: "https://www.federalreserve.gov/monetarypolicy/fomcstatements.htm" },
    ],
    relatedCodes: ["005930", "000660", "373220"],
  },
  {
    id: "tariff-auto",
    category: "policy",
    title: "관세·통상: 자동차·배터리 마진 가정 재작성",
    summary:
      "미국 관세·통상 조치는 완성차·부품 착지원가와 점유율에 직결. 배터리·소재 원산지 이슈도 불거질 수 있다.",
    whyItMatters: "관세율 1%p가 영업이익 민감도로 연결. 현지 생산 헤지 여부 확인.",
    marketImpact: "미국 현지 생산 비중 높은 기업 상대 우위.",
    watchItems: ["USTR", "원산지 규정", "미국 공장"],
    tags: ["관세", "통상", "자동차"],
    source: "데스크 관점",
    sourceUrl: "https://ustr.gov/",
    moreSources: [
      { label: "USTR 보도자료", url: "https://ustr.gov/about-us/policy-offices/press-office/press-releases" },
      { label: "USITC", url: "https://www.usitc.gov/" },
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
    ],
    relatedCodes: ["005380", "000270", "012330"],
  },
  {
    id: "ind-semi-upcycle",
    category: "industry",
    title: "산업 리포트: AI 메모리 슈퍼사이클 vs 중국 레거시 리스크",
    summary:
      "증권사 산업 리포트는 AI 서버 DRAM/HBM 수요 상향과 중국 레거시·규제 리스크를 동시에 다룬다. 레이어별 이익 레버리지가 다르다.",
    whyItMatters: "업종 평균이 아니라 레이어 선택이 알파. 수요·가격 가정 추적.",
    marketImpact: "HBM 노출 아웃퍼폼, 범용 레거시는 변동성.",
    watchItems: ["산업 리포트 가정", "비트그로스", "재고 주수"],
    tags: ["산업", "반도체", "리포트"],
    source: "데스크 관점",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "네이버 산업 리서치", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "SEMI", url: "https://www.semi.org/en/news-resources" },
    ],
    relatedCodes: ["005930", "000660", "042700"],
  },
  {
    id: "ind-battery-ess",
    category: "industry",
    title: "배터리 산업: EV 둔화 속 ESS·미국 공급망",
    summary:
      "EV 둔화에도 미국 ESS·정책 지원 물량이 셀·소재 수주를 지탱. 원가와 북미 램프업이 관건.",
    whyItMatters: "성장 서사가 미국 ESS+적격 공급망으로 이동. 지역별 물량 가정이 핵심.",
    marketImpact: "미국 노출 셀·양극재 선별 강세.",
    watchItems: ["ESS 수주", "미국 가동률", "메탈 가격"],
    tags: ["배터리", "ESS", "IRA"],
    source: "데스크 관점",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "IRA 청정차량 (IRS)", url: "https://www.irs.gov/credits-deductions/credits-for-new-clean-vehicles-purchased-in-2023-or-after" },
      { label: "DOE", url: "https://www.energy.gov/" },
    ],
    relatedCodes: ["373220", "006400", "051910"],
  },
  {
    id: "ind-power-defense",
    category: "industry",
    title: "전력·원전·방산: 미국 안보·인프라 수요",
    summary:
      "AI 전력, 그리드 노후화, 동맹 방산 예산이 한국 원전 기자재·변압기·방산·조선 수출의 중기 수요 풀.",
    whyItMatters: "수주 잔고·납기·미국 인증이 밸류 배수 결정.",
    marketImpact: "수주·협력 뉴스 리레이팅, 납기 지연 디스카운트.",
    watchItems: ["수주 잔고", "미국 인증", "DOE/DoD 예산"],
    tags: ["원전", "전력", "방산", "조선"],
    source: "데스크 관점",
    sourceUrl: "https://www.energy.gov/",
    moreSources: [
      { label: "DOE", url: "https://www.energy.gov/" },
      { label: "방산·산업 리서치", url: "https://finance.naver.com/research/industry_list.naver" },
    ],
    relatedCodes: ["034020", "267260", "012450", "009540"],
  },
  {
    id: "risk-china-retaliation",
    category: "risk",
    title: "리스크: 중국 보복·희토류·고객 이탈",
    summary:
      "미국 통제에 대한 중국 대응(희토류·조달 배제)은 한국 소재·장비에 2차 충격을 줄 수 있다.",
    whyItMatters: "단일 국가 매출 집중 리스크. 포지션 사이징으로 대응.",
    marketImpact: "헤드라인 리스크오프 시 중국 익스포저 종목 급변동.",
    watchItems: ["중국 수출통제", "희토류", "고객 다변화"],
    tags: ["리스크", "중국", "보복"],
    source: "데스크 관점",
    sourceUrl: "https://www.bis.doc.gov/",
    moreSources: [
      { label: "BIS Entity List", url: "https://www.bis.doc.gov/index.php/policy-guidance/lists-of-parties-of-concern/entity-list" },
      { label: "미 상무부", url: "https://www.commerce.gov/" },
    ],
    relatedCodes: ["005930", "000660", "051910"],
  },
];

export const US_LINK_CATEGORY_LABEL = {
  "ai-race": "미중 AI 패권 전쟁",
  policy: "미국 정책",
  industry: "산업 리포트",
  risk: "리스크",
} as const;
