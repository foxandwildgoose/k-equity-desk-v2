import { useState } from "react";
import { cn } from "@/lib/utils";
import { toReadableDoc, type ReadableDoc } from "@/lib/readable-text";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * Reader-first long-form block for market copy (ETF blurbs, research, notes).
 * Always strips HTML — never injects raw markup.
 */
export function ReadableProse({
  raw,
  doc: docProp,
  title,
  className,
  collapsedParagraphs = 2,
  showBullets = true,
  density = "comfortable",
}: {
  raw?: string | null;
  doc?: ReadableDoc;
  title?: string;
  className?: string;
  collapsedParagraphs?: number;
  showBullets?: boolean;
  density?: "comfortable" | "compact";
}) {
  const [open, setOpen] = useState(false);
  const doc = docProp ?? toReadableDoc(raw);
  if (!doc.plain && doc.bullets.length === 0) return null;

  const paras = open
    ? doc.paragraphs
    : doc.paragraphs.slice(0, collapsedParagraphs);
  const canToggle = doc.paragraphs.length > collapsedParagraphs;

  const bodyCls =
    density === "comfortable"
      ? "text-base md:text-[1.0625rem] leading-[1.8]"
      : "text-sm md:text-[0.95rem] leading-[1.65]";

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card/80 p-5 md:p-6 space-y-4",
        className,
      )}
    >
      {(title || canToggle) && (
        <div className="flex items-center justify-between gap-3">
          {title ? (
            <h2 className="text-lg font-semibold tracking-tight text-balance">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {canToggle && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline min-h-11"
            >
              {open ? (
                <>
                  접기 <ChevronUp className="size-4" />
                </>
              ) : (
                <>
                  전체 보기 <ChevronDown className="size-4" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {showBullets && doc.bullets.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {doc.bullets.map((b) => (
            <li
              key={b}
              className="rounded-lg border border-border bg-muted/30 px-3.5 py-2.5 text-[0.95rem] leading-snug text-foreground/95"
            >
              {b}
            </li>
          ))}
        </ul>
      )}

      <div className={cn("space-y-4 text-pretty text-foreground/95", bodyCls)}>
        {paras.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {!open && canToggle && (
        <p className="text-sm text-muted-foreground">
          …외 {doc.paragraphs.length - collapsedParagraphs}개 단락 · 전체 보기로
          펼치기
        </p>
      )}
    </section>
  );
}

/** One-line clamp for lists (cards, tables) — always plain text. */
export function ReadableClamp({
  raw,
  lines = 3,
  className,
}: {
  raw?: string | null;
  lines?: 2 | 3 | 4;
  className?: string;
}) {
  const text = toReadableDoc(raw, { extractHints: false }).summary || toReadableDoc(raw).plain;
  if (!text) return null;
  return (
    <p
      className={cn(
        "text-sm leading-relaxed text-foreground/90 text-pretty",
        lines === 2 && "line-clamp-2",
        lines === 3 && "line-clamp-3",
        lines === 4 && "line-clamp-4",
        className,
      )}
    >
      {text}
    </p>
  );
}
