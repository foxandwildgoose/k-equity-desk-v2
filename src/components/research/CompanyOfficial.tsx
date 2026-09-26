import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { OfficialReportCard } from "@/components/research/OfficialReportCard";
import { useSavedReports } from "@/components/research/saved-reports";
import { useUsOfficialCompany, useUsOfficialPolicy } from "@/lib/use-market";
import {
  kindPolicyTag,
  policyTagsForSic,
  RESEARCH_DISCLAIMER,
  RESEARCH_DISCLAIMER_KO,
  type OfficialReport,
} from "@/lib/us-official-parse";

export function CompanyOfficial({ symbol }: { symbol: string }) {
  const ticker = symbol.trim().toUpperCase();
  const company = useUsOfficialCompany(ticker);
  const policy = useUsOfficialPolicy();
  const saved = useSavedReports();
  const data = company.data;
  const sic = data?.sic ?? "";
  const tags = new Set(policyTagsForSic(sic));
  const related = (policy.data?.macro ?? [])
    .filter((r) => tags.has(kindPolicyTag(r.kind, r.title)))
    .slice(0, 4);

  return (
    <section className="rounded-xl border border-border bg-card p-3 md:p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-desk-navy">FACT · Company research</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            {data?.name ?? ticker}
            <span className="ml-2 text-sm font-normal text-muted-foreground">{ticker}</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            회사 공시 · SEC EDGAR. Titles stay in English.
            {data?.cik ? ` CIK ${data.cik}.` : ""}
            {sic ? ` SIC: ${sic}.` : ""}
          </p>
        </div>
        <Link to="/us-research" className="text-sm text-primary hover:underline">
          Open in Research
        </Link>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{RESEARCH_DISCLAIMER}</p>
      <p className="text-xs text-muted-foreground">{RESEARCH_DISCLAIMER_KO}</p>

      {company.isLoading ? (
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading SEC submissions for {ticker}. Figures are not filled in while this runs.
        </p>
      ) : null}
      {company.isError ? (
        <p className="mt-4 text-sm text-destructive">SEC filings could not be loaded. Nothing was estimated.</p>
      ) : null}
      {data?.errors.map((e) => (
        <p key={e} className="mt-2 text-sm text-muted-foreground">
          {e}
        </p>
      ))}

      {data && !data.investorWebsite && !data.website ? (
        <p className="mt-3 text-xs text-muted-foreground">
          SEC submissions did not list an https investor-relations site, so no IR button is shown.
        </p>
      ) : null}
      {data?.investorWebsite || data?.website ? (
        <p className="mt-3 text-sm">
          {data.investorWebsite ? (
            <a className="mr-3 underline" href={data.investorWebsite} target="_blank" rel="noopener noreferrer">
              Investor site listed on SEC
            </a>
          ) : null}
          {data.website ? (
            <a className="underline" href={data.website} target="_blank" rel="noopener noreferrer">
              Company site listed on SEC
            </a>
          ) : null}
        </p>
      ) : null}

      <ReportGroup title="Latest 10-Q and 10-K" empty="No 10-Q or 10-K in the recent SEC feed." reports={filingsOf(data?.filings, ["10-Q", "10-K"])} saved={saved} />
      <ReportGroup title="Earnings package" empty="No item 2.02 8-K was in the recent feed." reports={data?.earnings ?? []} saved={saved} />
      <ReportGroup title="Other filings" empty="No proxy or other 8-K rows." reports={(data?.filings ?? []).filter((r) => r.kind !== "10-Q" && r.kind !== "10-K")} saved={saved} />
      <ReportGroup title="Form 4" empty="No recent Form 4." reports={data?.form4 ?? []} saved={saved} />
      <ReportGroup title="13F filed by this CIK" empty="This issuer has no 13F-HR in the recent feed. Holder 13Fs are a different search and are not invented here." reports={data?.holdings ?? []} saved={saved} />

      <div className="mt-6">
        <h3 className="text-sm font-semibold">Related macro</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Desk map from the SIC text on the SEC submission, not a sentence in the filing.
          {sic ? ` Tags: ${[...tags].join(", ")}.` : ""}
        </p>
        {policy.isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading Fed, BEA, and BLS documents…</p>
        ) : null}
        {related.length === 0 && !policy.isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">No matching official macro card was retrieved.</p>
        ) : (
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {related.map((r) => (
              <OfficialReportCard key={r.id} report={r} compact saved={saved.has(r.id)} onToggleSave={saved.toggle} />
            ))}
          </div>
        )}
      </div>
      {data ? (
        <p className="mt-4 text-xs tabular text-muted-foreground">
          SEC pull {new Date(data.fetchedAt).toLocaleString("en-US")}
        </p>
      ) : null}
    </section>
  );
}

function filingsOf(rows: OfficialReport[] | undefined, kinds: OfficialReport["kind"][]) {
  return (rows ?? []).filter((r) => kinds.includes(r.kind));
}

function ReportGroup({
  title,
  empty,
  reports,
  saved,
}: {
  title: string;
  empty: string;
  reports: OfficialReport[];
  saved: ReturnType<typeof useSavedReports>;
}) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {reports.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {reports.map((r) => (
            <OfficialReportCard key={r.id} report={r} saved={saved.has(r.id)} onToggleSave={saved.toggle} />
          ))}
        </div>
      )}
    </div>
  );
}
