import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  kicker,
  title,
  lead,
  aside,
  className,
}: {
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "page-header flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {kicker ? <p className="desk-kicker mb-1.5">{kicker}</p> : null}
        <h1 className="page-title">{title}</h1>
        {lead ? <div className="page-lead">{lead}</div> : null}
      </div>
      {aside ? <div className="shrink-0 sm:text-right">{aside}</div> : null}
    </header>
  );
}
