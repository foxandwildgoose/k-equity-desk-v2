import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { ResearchReport, ResearchCategory } from "@/server/naver-market";
import {
  fetchResearchDeepDetail,
  mergeResearchDeep,
  openResearchPdfUrl,
} from "@/lib/research-deep";
import { latestReportPerBroker, median, reportHasInvestmentView } from "@/lib/research-utils";

const CONSENSUS_MAX_AGE_DAYS = 180;
import { formatPrice } from "@/lib/format";
import { usePriceColors } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ReadableClamp } from "@/components/ui/ReadableProse";
import { toReadableDoc } from "@/lib/readable-text";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ExternalLink, FileText, Loader2, ChevronRight, Factory, LineChart, Globe2, Building2 } from "lucide-react";

type Pack = {
  company: ResearchReport[];
  industry: ResearchReport[];
  market: ResearchReport[];
  economy: ResearchReport[];
};

const TABS: { id: ResearchCategory; label: string; icon: typeof Building2 }[] = [
  { id: "company", label: "기업", icon: Building2 },
  { id: "industry", label: "산업", icon: Factory },
  { id: "market", label: "전략", icon: LineChart },
  { id: "economy", label: "매크로", icon: Globe2 },
];

function RatingBadge({ rating }: { rating?: string }) {
  if (!rating) return null;
  const buy = /매수|비중확대|BUY|OUTPERFORM|OVERWEIGHT/i.test(rating);
  const sell = /매도|비중축소|SELL|UNDERPERFORM|UNDERWEIGHT/i.test(rating);
  return (
    <span className={cn(
      "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
      buy && "bg-price-up/15 text-price-up",
      sell && "bg-price-down/15 text-price-down",
      !buy && !sell && "bg-amber-500/15 text-amber-400",
    )}>
      {rating}
    </span>
  );
}

function reportList(pack: Pack, tab: ResearchCategory) {
  const raw = pack[tab];
  const sorted = [...raw].sort((a, b) => b.date.localeCompare(a.date));
  // Company view is intentionally signal-only. Unrated notes no longer dilute the decision panel.
  return tab === "company" ? sorted.filter(reportHasInvestmentView) : sorted;
}

export function BrokerReports({
  pack,
  companyReports,
  currentPrice,
  loading,
}: {
  pack?: Pack;
  companyReports?: ResearchReport[];
  currentPrice: number;
  loading?: boolean;
}) {
  const data: Pack = pack ?? { company: companyReports ?? [], industry: [], market: [], economy: [] };
  const [tab, setTab] = useState<ResearchCategory>("company");
  const [active, setActive] = useState<ResearchReport | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [deepLoading, setDeepLoading] = useState(false);
  const colors = usePriceColors();

  const list = useMemo(() => reportList(data, tab).slice(0, 30), [data, tab]);

  const consensus = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - CONSENSUS_MAX_AGE_DAYS);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const latestAll = latestReportPerBroker(data.company);
    const latest = latestAll.filter((r) => !r.date || r.date >= cutoffStr);
    const staleDropped = latestAll.length - latest.length;
    const views = latest.filter(reportHasInvestmentView);
    const rated = views.filter((r) => r.rating);
    const targets = views
      .map((r) => r.targetPrice)
      .filter((x): x is number => x != null && x > 0)
      .sort((a, b) => a - b);

    let buy = 0, hold = 0, sell = 0;
    for (const r of rated) {
      if (/매수|비중확대|BUY|OUTPERFORM|OVERWEIGHT/i.test(r.rating!)) buy++;
      else if (/매도|비중축소|SELL|UNDERPERFORM|UNDERWEIGHT/i.test(r.rating!)) sell++;
      else hold++;
    }

    const med = median(targets);
    const average = targets.length
      ? Math.round(targets.reduce((sum, x) => sum + x, 0) / targets.length)
      : null;
    const upside = med && currentPrice > 0 ? ((med / currentPrice) - 1) * 100 : null;
    const asOf = views.map((r) => r.date).sort().at(-1) ?? null;

    return {
      brokerCount: latest.length,
      viewCount: views.length,
      buy,
      hold,
      sell,
      med,
      average,
      low: targets[0] ?? null,
      high: targets[targets.length - 1] ?? null,
      upside,
      rows: views.sort((a, b) => b.date.localeCompare(a.date)),
      staleDropped,
      maxAgeDays: CONSENSUS_MAX_AGE_DAYS,
      asOf,
    };
  }, [data.company, currentPrice]);

  async function openDetail(report: ResearchReport) {
    setActive(report);
    setDeepLoading(true);
    try {
      const deep = await fetchResearchDeepDetail(report);
      setActive((prev) =>
        prev && prev.researchId === report.researchId
          ? mergeResearchDeep(prev, deep)
          : prev,
      );
    } catch {
      /* keep shallow fields */
    } finally {
      setDeepLoading(false);
    }
  }

  async function openPdf(report: ResearchReport) {
    setPdfLoading(true);
    try {
      // Always deep-resolve so missing list-level PDF/TP get filled
      const deep = await fetchResearchDeepDetail(report);
      const merged = mergeResearchDeep(report, deep);
      setActive((prev) =>
        prev && prev.researchId === report.researchId ? merged : prev,
      );
      openResearchPdfUrl(merged.pdfUrl || merged.pageUrl);
    } catch {
      openResearchPdfUrl(report.pdfUrl || report.pageUrl);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-3 py-3 md:px-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <FileText className="size-3.5" /> 리서치 & 컨센서스
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              최신 증권사별 1건만 집계 · 기업 탭은 의견/목표가 확인 가능한 리포트만 표시
            </p>
          </div>
          {loading && <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Loader2 className="size-3 animate-spin" /> 수신 중</span>}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <ConsensusMetric label="커버리지" value={`${consensus.viewCount} / ${consensus.brokerCount}사`} sub="투자의견 또는 목표가 확인" />
          <ConsensusMetric label="의견 분포" value={`${consensus.buy} 매수 · ${consensus.hold} 중립 · ${consensus.sell} 매도`} sub={`증권사별 최신 · ${consensus.maxAgeDays}일 이내${consensus.staleDropped ? ` · 제외 ${consensus.staleDropped}` : ""}${consensus.asOf ? ` · as-of ${consensus.asOf}` : ""}`} />
          <ConsensusMetric
            label="목표가 중앙값"
            value={consensus.med ? formatPrice(consensus.med) : "—"}
            sub={consensus.upside == null ? "현재가 대비 계산 대기" : `현재가 대비 ${consensus.upside >= 0 ? "+" : ""}${consensus.upside.toFixed(1)}%`}
            className={consensus.upside == null ? undefined : consensus.upside >= 0 ? colors.up : colors.down}
          />
          <ConsensusMetric
            label="목표가 범위"
            value={consensus.low && consensus.high ? `${formatPrice(consensus.low)} ~ ${formatPrice(consensus.high)}` : "—"}
            sub={consensus.average ? `평균 ${formatPrice(consensus.average)}` : "표본 부족"}
          />
        </div>
      </div>

      <div className="px-3 py-3 md:px-4 space-y-3">
        <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const count = reportList(data, t.id).length;
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium",
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}>
                <Icon className="size-3" /> {t.label} <span className="tabular opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {tab !== "company" && (
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>{tab === "industry" ? "해당 종목 산업 키워드와 매칭된 리포트" : "전 시장 공통 리서치 피드"}</span>
            <Link to="/research" search={{ tab }} className="text-primary hover:underline">리서치 데스크 →</Link>
          </div>
        )}

        <ul className="flex flex-col gap-2">
          {list.length === 0 ? (
            <li className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
              {loading ? "리포트 수신 중…" : "현재 조건에서 표시할 리포트가 없습니다."}
            </li>
          ) : list.map((r) => (
            <li key={`${r.category}-${r.researchId}`} className="rounded-lg border border-border bg-background/40 overflow-hidden">
              <button type="button" onClick={() => void openDetail(r)} className="w-full px-3 py-3 text-left hover:bg-muted/30">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{r.categoryLabel}</Badge>
                  <span className="text-xs font-medium">{r.broker}</span>
                  <RatingBadge rating={r.rating} />
                  {r.targetPrice != null && r.targetPrice > 0 && <span className="text-[11px] font-semibold tabular">TP {formatPrice(r.targetPrice)}</span>}
                  <span className="ml-auto text-[10px] tabular text-muted-foreground">{r.date}</span>
                </div>
                <div className="mt-1 text-sm font-medium leading-snug">{r.title}</div>
                <div className="mt-2 rounded-md bg-muted/35 px-2.5 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">핵심요약</div>
                  <ReadableClamp raw={r.summary || r.preview || r.title} lines={3} className="mt-1" />
                </div>
              </button>
            </li>
          ))}
        </ul>

        {tab === "company" && consensus.rows.length > 1 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/35 text-muted-foreground"><tr><th className="px-2 py-1.5 text-left">증권사</th><th className="px-2 py-1.5 text-left">의견</th><th className="px-2 py-1.5 text-right">목표가</th><th className="px-2 py-1.5 text-right">일자</th></tr></thead>
              <tbody className="divide-y divide-border">
                {consensus.rows.map((r) => <tr key={`cons-${r.broker}`}><td className="px-2 py-1.5 font-medium">{r.broker}</td><td className="px-2 py-1.5"><RatingBadge rating={r.rating} /></td><td className="px-2 py-1.5 text-right tabular">{r.targetPrice ? formatPrice(r.targetPrice) : "—"}</td><td className="px-2 py-1.5 text-right tabular text-muted-foreground">{r.date}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto scroll-thin p-0">
          {active && <>
            <SheetHeader className="sticky top-0 z-10 border-b border-border bg-card">
              <SheetTitle className="pr-6 text-base leading-snug">{active.title}</SheetTitle>
              <SheetDescription asChild><div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-medium text-foreground">{active.broker}</span><span>{active.date}</span><RatingBadge rating={active.rating} />{deepLoading && <span className="inline-flex items-center gap-1 text-muted-foreground"><Loader2 className="size-3 animate-spin" /> 원문 상세 조회</span>}</div></SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-4 py-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-1.5" disabled={pdfLoading || deepLoading} onClick={() => void openPdf(active)}>{pdfLoading ? <Loader2 className="size-3.5 animate-spin" /> : <ExternalLink className="size-3.5" />} PDF / 원문</Button>
                {active.pageUrl && (
                  <Button asChild size="sm" variant="outline">
                    <a href={active.pageUrl} target="_blank" rel="noopener noreferrer">리서치 페이지 원문</a>
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-muted/25 p-3">
                  <div className="text-[10px] text-muted-foreground">투자의견</div>
                  <div className="mt-1 min-h-6">
                    {active.rating ? <RatingBadge rating={active.rating} /> : (
                      <span className="text-xs text-muted-foreground">{deepLoading ? "조회 중…" : "원문에 의견 없음/미추출"}</span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/25 p-3">
                  <div className="text-[10px] text-muted-foreground">목표주가</div>
                  <div className="mt-1 text-lg font-semibold tabular min-h-7">
                    {active.targetPrice ? formatPrice(active.targetPrice) : (
                      <span className="text-xs font-normal text-muted-foreground">{deepLoading ? "조회 중…" : "—"}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <h3 className="text-sm font-semibold">핵심요약</h3>
                <div className="mt-2 space-y-3 text-base leading-[1.75] text-pretty text-foreground/95">
                  {toReadableDoc(active.summary || active.preview || active.title, { extractHints: false }).paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">목록은 빠르게 표시하고, 상세·PDF 클릭 시 네이버 리서치 API·원문 페이지에서 목표가·의견·PDF를 깊게 조회합니다. 최종 판단은 PDF 원문과 공시를 교차 확인하세요.</p>
            </div>
          </>}
        </SheetContent>
      </Sheet>
    </section>
  );
}

function ConsensusMetric({ label, value, sub, className }: { label: string; value: string; sub: string; className?: string }) {
  return <div className="rounded-lg border border-border bg-muted/20 p-2.5"><div className="text-[10px] text-muted-foreground">{label}</div><div className={cn("mt-0.5 text-sm font-semibold tabular", className)}>{value}</div><div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div></div>;
}
