import { cn } from "@/lib/utils";
import { formatChange, formatPct } from "@/lib/format";
import { usePriceColors } from "@/lib/store";
import { Triangle } from "lucide-react";

export function PriceChange({
  change,
  changePct,
  size = "sm",
  showAmount = true,
  className,
}: {
  change: number;
  changePct: number;
  size?: "xs" | "sm" | "md";
  showAmount?: boolean;
  className?: string;
}) {
  const colors = usePriceColors();
  const up = changePct > 0;
  const flat = changePct === 0;
  const color = flat
    ? "text-muted-foreground"
    : up
      ? colors.up
      : colors.down;

  const textSize =
    size === "xs" ? "text-[11px]" : size === "md" ? "text-sm" : "text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium tabular",
        textSize,
        color,
        className,
      )}
    >
      {!flat && (
        <Triangle
          className={cn(
            "size-2 fill-current",
            !up && "rotate-180",
          )}
          strokeWidth={0}
        />
      )}
      {showAmount && <span>{formatChange(change)}</span>}
      <span>({formatPct(changePct)})</span>
    </span>
  );
}

export function PriceValue({
  value,
  changePct,
  size = "md",
  className,
}: {
  value: number;
  changePct?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const colors = usePriceColors();
  const color =
    changePct === undefined || changePct === 0
      ? "text-foreground"
      : changePct > 0
        ? colors.up
        : colors.down;

  const textSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base";

  return (
    <span
      className={cn(
        "font-semibold tabular tracking-tight",
        textSize,
        color,
        className,
      )}
    >
      {new Intl.NumberFormat("ko-KR").format(
        value >= 100 ? Math.round(value) : value,
      )}
    </span>
  );
}
