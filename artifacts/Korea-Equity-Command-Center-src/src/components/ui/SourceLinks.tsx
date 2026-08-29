import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type SourceItem = { label: string; url: string };

/**
 * Always-visible "원문 보기" block for desk briefs, pillars, reports.
 * Design intent: every summary/editorial card must offer at least one primary original source.
 */
export function SourceLinks({
  primaryUrl,
  primaryLabel = "원문 보기",
  more = [],
  searchQuery,
  className,
  size = "md",
}: {
  primaryUrl?: string | null;
  primaryLabel?: string;
  more?: SourceItem[];
  /** If primary missing, builds a Google search fallback so the control never disappears */
  searchQuery?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const fallback =
    !primaryUrl && searchQuery
      ? `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
      : null;
  const main = primaryUrl || fallback;
  if (!main && more.length === 0) return null;

  const text = size === "sm" ? "text-xs" : "text-sm";
  const gap = size === "sm" ? "gap-1.5" : "gap-2";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className={cn("flex flex-wrap items-center", gap)}>
        {main && (
          <a
            href={main}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2.5 py-1.5 font-semibold text-primary hover:bg-primary/25 min-h-9",
              text,
            )}
          >
            {primaryUrl ? primaryLabel : "관련 원문 검색"}
            <ExternalLink className="size-3.5 shrink-0" />
          </a>
        )}
        {more.map((s) => (
          <a
            key={s.url + s.label}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-foreground hover:bg-muted/50 min-h-9",
              text,
            )}
          >
            {s.label}
            <ExternalLink className="size-3 shrink-0 opacity-70" />
          </a>
        ))}
      </div>
      {!primaryUrl && fallback && (
        <p className="text-[11px] text-muted-foreground">
          1차 공식 링크가 없어 관련 검색으로 연결합니다. 가능하면 공식·증권사 원문을 확인하세요.
        </p>
      )}
    </div>
  );
}
