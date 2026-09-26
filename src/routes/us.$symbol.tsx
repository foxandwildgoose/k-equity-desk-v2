import { createFileRoute, Link } from "@tanstack/react-router";
import { TradingChart } from "@/components/stocks/TradingChart";
import { UsResearchDesk } from "@/components/stocks/UsResearchDesk";
import { CompanyOfficial } from "@/components/research/CompanyOfficial";
import { yahooUsSymbol } from "@/lib/valuation-series";

export const Route = createFileRoute("/us/$symbol")({
  component: UsStockPage,
  head: ({ params }) => ({
    meta: [{ title: `${params.symbol.toUpperCase()} · 미국 주식` }],
  }),
});

function UsStockPage() {
  const { symbol } = Route.useParams();
  const ticker = yahooUsSymbol(symbol) ?? symbol.trim().toUpperCase();
  const valid = yahooUsSymbol(ticker) != null || yahooUsSymbol(symbol) != null;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-desk-teal">미국 상장</p>
            <h1 className="text-2xl font-semibold tracking-tight">{ticker}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Chart, then official SEC filings, then public Wall Street opinion. Opinion is not a filing.
            </p>
          </div>
          <Link to="/etfs" className="text-sm text-primary hover:underline">
            ETF 목록
          </Link>
        </div>
      </header>
      {valid ? (
        <>
          <TradingChart code={ticker} market="US" />
          <CompanyOfficial symbol={ticker} />
          <section className="rounded-xl border border-desk-slate/40 bg-muted/30 p-3 md:p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-desk-slate">OPINION</p>
            <h2 className="mt-1 text-sm font-semibold">Analyst opinion</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Public ratings and headlines for {ticker}. These are opinions, historically skewed toward Buy, and they are not SEC filings.
              월가 공개 의견입니다.
            </p>
            <div className="mt-3">
              <UsResearchDesk symbol={ticker} />
            </div>
          </section>
        </>
      ) : (
        <p className="px-4 py-16 text-center text-sm text-muted-foreground">
          {symbol} 는 미국 티커로 읽지 못했습니다.
        </p>
      )}
    </div>
  );
}