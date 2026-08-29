import type { Sector } from "./types";

export const SECTORS: Sector[] = [
  {
    id: "us-linked",
    nameKo: "미국 연계 산업",
    nameEn: "US-Linked Korea Supply Chain",
    thesis:
      "미국 AI·안보·에너지·IRA가 필요로 하는 한국 공급망. 반도체·배터리·방산·원전·CDMO·자동차 수출을 한 화면에서.",
    focus: true,
    accent: "gold",
    sourceUrl: "https://ustr.gov/",
    moreSources: [
      { label: "미국 연계 데스크", url: "/us-link" },
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
    ],
  },
  {
    id: "semiconductors",
    nameKo: "반도체",
    nameEn: "Semiconductors & Memory",
    thesis:
      "HBM·DRAM 사이클과 글로벌 AI 서버 수요가 실적 방향을 좌우. 삼성전자·SK하이닉스 중심의 메모리 슈퍼사이클과 장비·소재 공급망이 핵심.",
    focus: true,
    accent: "gold",
    sourceUrl: "https://www.semi.org/en/news-resources",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=semiconductors" },
    ],
  },
  {
    id: "electronics",
    nameKo: "전자·IT",
    nameEn: "Electronics & IT Hardware",
    thesis:
      "스마트폰·디스플레이·부품 수출 및 세트 수요에 민감. OLED, 카메라 모듈, 전장용 부품 비중 확대가 중장기 성장 축.",
    accent: "indigo",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=electronics" },
    ],
  },
  {
    id: "auto",
    nameKo: "자동차·부품",
    nameEn: "Automobiles & Auto Parts",
    thesis:
      "완성차 판매·믹스 개선과 전장·자율주행 부품 채택이 실적 드라이버. 미국·유럽 수요와 환율이 마진에 큰 영향.",
    accent: "navy",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=auto" },
    ],
  },
  {
    id: "battery",
    nameKo: "2차전지·소재",
    nameEn: "Batteries & Materials",
    thesis:
      "EV 수요 둔화 국면에서도 IRA·유럽 현지화와 소재(양극재·음극재) 가격·재고 사이클이 주가 변동성 핵심.",
    focus: true,
    accent: "teal",
    sourceUrl: "https://www.energy.gov/",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=battery" },
    ],
  },
  {
    id: "bio",
    nameKo: "바이오·제약",
    nameEn: "Bio / Pharma / Healthcare",
    thesis:
      "CMO/CDMO 수주, 바이오시밀러 점유율, 임상 파이프라인 이슈가 섹터 모멘텀. 환율·미국 바이오텍 센티먼트와 연동.",
    focus: true,
    accent: "rose",
    sourceUrl: "https://www.fda.gov/",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=bio" },
    ],
  },
  {
    id: "finance",
    nameKo: "금융",
    nameEn: "Finance & Insurance",
    thesis:
      "금리·NIM, 충당금, 배당·자사주 정책이 밸류에이션 핵심. 부동산 PF 리스크와 자본규제 이슈를 주시.",
    accent: "copper",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=finance" },
    ],
  },
  {
    id: "shipbuilding",
    nameKo: "조선·중공업",
    nameEn: "Shipbuilding & Heavy Industry",
    thesis:
      "LNG·컨테이너 선가와 수주 잔고가 중장기 실적 가시성 제공. 방산 시너지와 해양 플랜트 수주도 관심.",
    accent: "copper",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=shipbuilding" },
    ],
  },
  {
    id: "chemicals",
    nameKo: "화학",
    nameEn: "Chemicals & Petrochemicals",
    thesis:
      "스프레드·가동률 사이클과 중국 공급 과잉이 업황을 결정. 스페셜티·배터리 소재 비중 확대가 차별화 포인트.",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=chemicals" },
    ],
  },
  {
    id: "energy",
    nameKo: "에너지·유틸리티",
    nameEn: "Energy & Utilities",
    thesis:
      "유가·발전 믹스·요금 규제와 원전·재생에너지 정책이 실적 방향. 전력 수요 증가와 AI 데이터센터 테마 주목.",
    accent: "indigo",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=energy" },
    ],
  },
  {
    id: "telecom",
    nameKo: "통신·미디어",
    nameEn: "Telecom & Media",
    thesis:
      "5G·B2B·클라우드·콘텐츠 IP가 ARPU 방어 축. 규제 요금제와 미디어 광고 경기가 단기 센티먼트에 영향.",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=telecom" },
    ],
  },
  {
    id: "consumer",
    nameKo: "소비재·유통",
    nameEn: "Consumer / Retail / Food",
    thesis:
      "내수 소비심리·관광 회복과 해외 브랜드 확장(K-뷰티·식품)이 성장 축. 비용 인플레이션 전가 능력 중요.",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=consumer" },
    ],
  },
  {
    id: "construction",
    nameKo: "건설·부동산",
    nameEn: "Construction & Real Estate",
    thesis:
      "주택 분양·수주와 해외 플랜트, 부동산 가격·PF 리스크가 핵심. 금리 경로와 정책 지원이 센티먼트 좌우.",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=construction" },
    ],
  },
  {
    id: "steel",
    nameKo: "철강·금속",
    nameEn: "Steel & Metals",
    thesis:
      "철광석·석탄 원가와 판가 스프레드, 중국 수요가 실적 사이클. 전기로·친환경 강재 전환이 중장기 테마.",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=steel" },
    ],
  },
  {
    id: "robotics",
    nameKo: "로봇·자동화·AI",
    nameEn: "Robotics, Automation & AI",
    thesis:
      "스마트팩토리·협동로봇·물류 자동화와 AI 소프트웨어 접목이 성장 스토리. 수주·레퍼런스 확대가 밸류 정당화 열쇠.",
    focus: true,
    accent: "teal",
    sourceUrl: "https://finance.naver.com/research/industry_list.naver",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=robotics" },
    ],
  },
  {
    id: "defense",
    nameKo: "방산·항공우주",
    nameEn: "Defense & Aerospace",
    thesis:
      "폴란드·중동 등 수출 수주와 국방 예산 증액이 중장기 파이프라인. 항공우주·위성·유도무기 다각화도 주목.",
    accent: "copper",
    sourceUrl: "https://www.defense.gov/",
    moreSources: [
      { label: "산업 리서치 (네이버)", url: "https://finance.naver.com/research/industry_list.naver" },
      { label: "앱 리서치 데스크", url: "/research?tab=industry&sector=defense" },
    ],
  },
];

export const SECTOR_BY_ID = Object.fromEntries(
  SECTORS.map((s) => [s.id, s]),
) as Record<string, Sector>;

export const FOCUS_SECTOR_IDS = SECTORS.filter((s) => s.focus).map((s) => s.id);
