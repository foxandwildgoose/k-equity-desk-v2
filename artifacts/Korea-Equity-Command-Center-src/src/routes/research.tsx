import { createFileRoute } from "@tanstack/react-router";
import { useResearchDesk } from "@/lib/use-market";
import { ResearchDeskPanel } from "@/components/stocks/ResearchDesk";
import { DATA_LABEL } from "@/data/market";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type ResearchSearch = {
  tab?: "industry" | "market" | "economy" | "featured";
  sector?: import("@/data/types").SectorId;
};

export const Route = createFileRoute("/research")({
  component: ResearchPage,
  validateSearch: (s: Record<string, unknown>): ResearchSearch => {
    const tab = s.tab;
    if (
      tab === "industry" ||
      tab === "market" ||
      tab === "economy" ||
      tab === "featured"
    ) {
      const sector = typeof s.sector === "string" ? s.sector : undefined;
      return { tab, sector: sector as ResearchSearch["sector"] };
    }
    return { tab: "industry", sector: typeof s.sector === "string" ? s.sector as ResearchSearch["sector"] : undefined };
  },
  head: () => ({
    meta: [{ title: "리서치 데스크 · Korea Equity Command Center" }],
  }),
});

function ResearchPage() {
  const { tab, sector } = Route.useSearch();
  const { data, isLoading, isError, dataUpdatedAt } = useResearchDesk();

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            리서치 데스크
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            산업·시황·전략·경제 리포트를 한 곳에서 탐색합니다.
            핵심요약을 먼저 읽고 산업·기간·증권사·키워드로 즉시 좁힐 수 있습니다.
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
        showHeader={false}
      />
    </div>
  );
}
