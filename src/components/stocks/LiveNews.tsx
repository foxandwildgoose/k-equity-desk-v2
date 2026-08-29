import type { NewsItem, DisclosureItem } from "@/server/naver-market";
import { DisclosureList } from "@/components/stocks/DisclosureViewer";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink } from "lucide-react";

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("ko-KR", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function LiveNews({
  news,
  disclosures,
  title = "뉴스 · 공시",
}: {
  news: NewsItem[];
  disclosures: DisclosureItem[];
  title?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <DisclosureList items={disclosures} title={`${title.split("·")[0]?.trim() || "공시"} · 공시`} />

      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-3 py-2.5">
          <h2 className="text-sm font-semibold">뉴스</h2>
          <p className="text-[11px] text-muted-foreground">
            네이버 증권 뉴스 (실제 기사 링크)
          </p>
        </div>
        {news.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            최근 뉴스 없음
          </div>
        ) : (
          <ul className="divide-y divide-border max-h-[360px] overflow-y-auto scroll-thin">
            {news.map((n) => (
              <li key={n.id}>
                <a
                  href={n.url || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors"
                >
                  <Badge variant="news" className="mt-0.5 gap-1 shrink-0">
                    <Newspaper className="size-3" /> 뉴스
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-snug line-clamp-2">
                      {n.title}
                    </div>
                    {n.body && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                        {n.body}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{n.source}</span>
                      <span className="tabular">{fmtTime(n.datetime)}</span>
                      {n.url && (
                        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-primary">
                          원문 보기 <ExternalLink className="size-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
