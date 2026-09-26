# 환경 변수 (Environment variables)

모든 변수는 **서버 전용**입니다. `VITE_` 접두사를 붙이지 마세요(브라우저로 노출됩니다).
저장소에 `.env` 파일을 만들지 않습니다. 로컬에서는 셸에서 `export` 하거나, Vercel에서는
Project Settings → Environment Variables에 등록합니다. 값이 없으면 각 기능은 아래 표의
동작으로 자연스럽게 축소됩니다.

| 변수 | 용도 | 없을 때 |
|---|---|---|
| `KIS_APP_KEY`, `KIS_APP_SECRET` | 한국투자증권 Open API: 기존 KRX 실시간 체결(WebSocket, `H0STCNT0`) + 선택적 KIS 종합 시황/공시 제목(F1.1, `FHKST01011800`) | 네이버 스냅샷 사용, KIS 뉴스 소스 비활성 |
| `SEC_USER_AGENT` | SEC fair-access User-Agent. 실제 연락처 포함, 예: `KEDesk you@your-domain` | 기존 UA 유지 + 소스 상태 페이지에 `SEC UA 미설정` 표시 |
| `FINNHUB_API_KEY` | 선택: 미국 기업 뉴스 추가 소스 | 소스 비활성 |
| `NEWS_BLOOMBERG_ENABLED` | Bloomberg RSS 킬 스위치. 기본 `true` | `true`로 간주 (`false`면 모든 화면에서 제거) |
| `AI_BRIEFING_ENABLED` | 선택 F9 AI 브리핑 레이어 스위치 (`true`일 때만) | F9 UI 숨김 |
| `AI_PROVIDER` | `anthropic` 또는 `xai` | F9 숨김 |
| `AI_MODEL` | 공급자 모델 ID (코드에 하드코딩하지 않음) | F9 숨김 |
| `ANTHROPIC_API_KEY` / `XAI_API_KEY` | 선택한 공급자 키 | F9 숨김 |
| `AI_DAILY_CAP` | F9 일일 호출 상한 (기본 50) | 50 |

기존 선택 변수(변경 없음): `KIS_APPROVAL_URL`, `KIS_WS_URL` 등 `src/server/kis-realtime.ts`가
읽는 KIS 엔드포인트 재정의 값.

## 참고
- 소스별 on/off 스위치와 상태: 앱의 `/status/sources` (소스 상태) 페이지.
- Bloomberg 인앱 토글: `알림 설정`/뉴스 설정의 소스 토글(브라우저에 저장).
- 네트워크가 제한된 환경에서 작업했다면, 일반 인터넷이 되는 머신에서
  `npm run verify:sources`를 실행해 `docs/upgrade/SOURCES_STATUS.md`를 갱신하세요.
