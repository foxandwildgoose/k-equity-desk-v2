# Korea Equity Command Center

한국 주식·ETF 투자 데스크 웹앱입니다.  
TanStack Start (React 19) + 실시간 시세 / TradingView형 차트 / ETF 공식 편입비중 / 공시 / 리서치.

이 zip은 **실행 가능한 전체 소스 프로젝트**입니다. GitHub·GitLab·로컬 폴더에 그대로 올리면 됩니다.

## GitHub에 올리기

1. 이 zip을 받아 압축을 풉니다.
2. GitHub에서 빈 저장소를 만듭니다.
3. 아래를 실행합니다.

```bash
cd Korea-Equity-Command-Center
git init
git add .
git commit -m "Initial commit: Korea Equity Command Center"
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repo>.git
git push -u origin main
```

Cursor / VS Code / Claude Code 등에서 그 저장소를 clone 하면 이어서 작업할 수 있습니다.

## 포함 기능

- 전종목 검색 (KOSPI·KOSDAQ, `0226A0` 같은 영문 ETF 코드 포함)
- 종목 상세: 분·일·주·월 차트, 추세선·피보나치·RSI, PER/PBR 밴드, 수급, 리서치
- 퇴직연금 ETF: 운용사 공식 비중만 사용(추정 없음), 실시간 시세, 동일 트레이딩 차트
- 수출 × KOSPI, 미국 연계, 공시(DART/KRX), 관심종목

## 로컬에서 실행

Node.js 22 필요.

```bash
npm install
cp .env.example .env   # 선택: KIS Open API 키
npm run dev
```

기본 주소: `http://localhost:8080`

```bash
npm run typecheck
npm run build
```

## 환경 변수

| 변수 | 용도 |
|---|---|
| `KIS_APP_KEY` / `KIS_APP_SECRET` | 한국투자증권 Open API 실시간 시세 (없으면 네이버 스냅샷) |

`VITE_` 접두사를 붙이지 마세요. 브라우저로 키가 노출됩니다.

## 디렉터리

```
src/routes/        화면 (ETF, 종목, 수출데스크, 리서치, 공시)
src/server/        네이버·WiseReport·PLUS·FRED·DART 어댑터
src/components/    차트, 테이블, 레이아웃
src/data/          유니버스·섹터·테마 설정
attachments/       마스터 프롬프트
```

시세·편입·공시는 제3자 공개 경로를 사용합니다. 투자 자문이 아니며, 실주문 전 증권사 HTS/MTS에서 재확인하세요.

## 라이선스 / 브랜딩

Grok Build 템플릿(PWA·배너) 파일이 `public/__grok`, `scripts/grok-pwa-*`, `server/` 에 포함되어 있습니다. 배포 시 필요하면 유지하거나 제거하세요.
