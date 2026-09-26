import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { KeyFigureTable, OriginalLink } from "@/components/research/OfficialReportCard";
import { useSavedReports } from "@/components/research/saved-reports";
import { Button } from "@/components/ui/button";
import { useUsOfficialReport } from "@/lib/use-market";
import {
  badgeTone,
  formatDay,
  RESEARCH_DISCLAIMER,
  RESEARCH_DISCLAIMER_KO,
} from "@/lib/us-official-parse";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/us-research/$reportId")({
  component: ReportDetailPage,
  head: ({ params }) => ({
    meta: [{ title: `Research · ${params.reportId}` }],
  }),
});

function ReportDetailPage() {
  const { reportId } = Route.useParams();
  const q = useUsOfficialReport(reportId);
  const saved = useSavedReports();
  const report = q.data;

  return (
    <div className="page-stack pb-24 md:pb-0">
      <Link to="/us-research" className="text-sm text-primary hover:underline">
        Back to Research
      </Link>
      {q.isLoading ? (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading this document from the official source. No summary is shown until it returns.
        </p>
      ) : null}
      {q.isError ? <p className="text-sm text-destructive">The report request failed. Nothing was estimated.</p> : null}
      {!q.isLoading && !report ? (
        <p className="text-sm text-muted-foreground">
          This id was not found in SEC submissions or the cached official pages. Original link unavailable.
        </p>
      ) : null}
      {report ? (
        <article className="rounded-xl border border-border bg-card p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-xs font-medium", badgeTone(report.kind))}>
              {report.badge}
              <span className="ml-1 opacity-80">{report.badgeKo}</span>
            </span>
            <span className="text-xs text-muted-foreground">FACT</span>
            <time className="text-xs tabular text-muted-foreground">{formatDay(report.publishedAt)}</time>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">{report.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{report.titleKo}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {report.sourceName}
            {report.tickers.length ? ` · ${report.tickers.join(", ")}` : ""}
            {report.sectors.length ? ` · ${report.sectors.join(", ")}` : ""}
            {report.accession ? ` · Accession ${report.accession}` : ""}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{RESEARCH_DISCLAIMER}</p>
          <p className="text-xs text-muted-foreground">{RESEARCH_DISCLAIMER_KO}</p>
          {report.summaryLabel ? <p className="mt-4 text-sm text-desk-gold">{report.summaryLabel}</p> : <p className="mt-4 text-sm text-muted-foreground">Summary not retrieved.</p>}
          {report.bottomLine ? <p className="mt-3 text-base leading-relaxed">{report.bottomLine}</p> : null}
          {report.bullets.length ? (
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {report.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No extract is available. Use the original document.
            </p>
          )}
          {report.keyFigures.length ? <KeyFigureTable figures={report.keyFigures} /> : null}
          {report.whatChanged ? (
            <p className="mt-4 text-sm leading-relaxed">
              <span className="font-medium">What changed. </span>
              {report.whatChanged}
            </p>
          ) : null}
          {report.risks.length ? (
            <div className="mt-4">
              <h2 className="text-sm font-semibold">Risks mentioned in the extract</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {report.risks.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {report.implications ? <p className="mt-4 text-sm text-muted-foreground">{report.implications}</p> : null}
          {report.nextWatch ? (
            <p className="mt-2 text-sm">
              <span className="font-medium">Next watch. </span>
              {report.nextWatch}
            </p>
          ) : null}
          <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
            {report.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <OriginalLink url={report.url} />
            {report.pdfUrl ? <OriginalLink url={report.pdfUrl} label="PDF" /> : null}
            {report.indexUrl ? <OriginalLink url={report.indexUrl} label="Filing index" /> : null}
            <Button type="button" variant={saved.has(report.id) ? "secondary" : "outline"} size="sm" onClick={() => saved.toggle(report)}>
              {saved.has(report.id) ? "Saved" : "Save"}
            </Button>
          </div>
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card p-3 md:hidden">
            <OriginalLink url={report.url} className="w-full" />
          </div>
        </article>
      ) : null}
    </div>
  );
}
