import { createFileRoute } from "@tanstack/react-router";
import { ResearchHome } from "@/components/research/ResearchHome";

type ResearchSearch = { ticker?: string };

export const Route = createFileRoute("/us-research/")({
  validateSearch: (s: Record<string, unknown>): ResearchSearch => ({
    ticker: typeof s.ticker === "string" ? s.ticker.slice(0, 12).toUpperCase() : undefined,
  }),
  component: ResearchIndex,
  head: () => ({
    meta: [{ title: "Research · Official US filings and policy" }],
  }),
});

function ResearchIndex() {
  const { ticker } = Route.useSearch();
  return <ResearchHome initialTicker={ticker} />;
}
