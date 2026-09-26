import { createFileRoute, Link } from "@tanstack/react-router";
import { useResearchDesk } from "@/lib/use-market";
import { ResearchDeskPanel } from "@/components/stocks/ResearchDesk";
import { DATA_LABEL } from "@/data/market";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type ResearchSearch = {
  tab?: "industry" | "market" | "economy" | "featured";
  sector?: import("@/data/types").SectorId;
  market?: "kr" | "us";
};

export const Route = createFileRoute("/research")({
  component: ResearchPage,
  validateSearch: (s: Record<string, unknown>): ResearchSearch => {
    const tab = s.tab;
    const market = s.market === "us" || s.market === "kr" ? s.market : undefined;
    const sector = typeof s.sector === "string" ? (s.sector as ResearchSearch["sector"]) : undefined;
    if (
      tab === "industry" ||
      tab === "market" ||
      tab === "economy" ||
      tab === "featured"
    ) {
      return { tab, sector, market };
    }
    return { tab: "industry", sector, market };
  },
  head: () => ({
    meta: [{ title: "리서치 데스크 · Korea Equity Command Center" }],
  }),
});

function ResearchPage() {
  const { tab, sector, market } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data, isLoading, isError, dataUpdatedAt } = useResearchDesk();

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            리서치 데스크
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            한국 주식은 산업·시황·경제 리포트, 미국 주식은 월가·투자은행이 공개한 등급과 기사입니다.
            공식 SEC·연준 원문은{" "}
            <Link to="/us-research" className="text-primary underline">
              Research
            </Link>
            에 있습니다.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isLoading && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Loader2 className="size-3 animate-spin" /> 리서치 수신
            </span>
          )}
          {dataUpdatedAt > 0 && (
            <span className="text-[10px] text-muted-foreground tabular">
              갱신 {new Date(dataUpdatedAt).toLocaleTimeString("ko-KR")}
            </span>
          )}
          <Badge variant="outline" className="text-[10px] font-normal">
            {DATA_LABEL}
          </Badge>
        </div>
      </header>

      {isError && (
        <p className="text-sm text-price-down">
          리서치 조회에 실패했습니다. 잠시 후 자동 재시도됩니다.
        </p>
      )}

      <ResearchDeskPanel
        pack={
          data
            ? {
                industry: data.industry,
                market: data.market,
                economy: data.economy,
                featured: data.featured,
              }
            : null
        }
        loading={isLoading}
        defaultTab={tab ?? "industry"}
        defaultSector={sector}
        defaultMarket={market === "us" ? "US" : "KR"}
        onMarketChange={(next) => {
          void navigate({
            search: (prev) => ({
              ...prev,
              market: next === "US" ? "us" : "kr",
            }),
          });
        }}
        showHeader={false}
      />
    </div>
  );
}
