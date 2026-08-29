import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function PageStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("page-stack", className)}>{children}</div>
  );
}

export function DeskGrid({
  children,
  className,
  cols = 12,
}: {
  children: ReactNode;
  className?: string;
  cols?: 2 | 4 | 6 | 12;
}) {
  return (
    <div
      className={cn(
        "desk-grid",
        cols === 2 && "desk-grid-2",
        cols === 4 && "desk-grid-4",
        cols === 6 && "desk-grid-6",
        cols === 12 && "desk-grid-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GridSpan({
  children,
  span = 12,
  className,
}: {
  children: ReactNode;
  span?: 3 | 4 | 6 | 8 | 12;
  className?: string;
}) {
  return (
    <div className={cn(`span-${span}`, className)}>{children}</div>
  );
}

export function Panel({
  title,
  kicker,
  hint,
  href,
  hrefLabel = "전체",
  tone,
  children,
  className,
}: {
  title: ReactNode;
  kicker?: string;
  hint?: string;
  href?: string;
  hrefLabel?: string;
  tone?: "gold" | "teal" | "indigo" | "navy" | "rose";
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "desk-card p-4 md:p-5 flex flex-col gap-3 min-w-0",
        tone === "gold" && "desk-card-gold",
        tone === "teal" && "desk-card-teal",
        tone === "indigo" && "desk-card-indigo",
        tone === "navy" && "desk-card-navy",
        tone === "rose" && "desk-card-rose",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {kicker ? <p className="desk-kicker mb-1">{kicker}</p> : null}
          <h2 className="desk-section-title">{title}</h2>
          {hint ? (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {hint}
            </p>
          ) : null}
        </div>
        {href ? (
          <Link
            to={href}
            className="shrink-0 inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline min-h-9"
          >
            {hrefLabel} <ArrowRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("desk-toolbar", className)}>{children}</div>;
}
