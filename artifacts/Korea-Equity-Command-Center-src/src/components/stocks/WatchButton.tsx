import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function WatchButton({
  code,
  size = "icon-sm",
  className,
}: {
  code: string;
  size?: "icon-sm" | "sm" | "icon";
  className?: string;
}) {
  const watched = useAppStore((s) => s.watchlist.includes(code));
  const toggle = useAppStore((s) => s.toggleWatchlist);

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn(className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(code);
      }}
      aria-label={watched ? "관심종목 제거" : "관심종목 추가"}
      title={watched ? "관심종목 제거" : "관심종목 추가"}
    >
      <Star
        className={cn(
          "size-3.5",
          watched
            ? "fill-amber-400 text-amber-400"
            : "text-muted-foreground",
        )}
      />
    </Button>
  );
}
