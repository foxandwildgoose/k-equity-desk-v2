import { Link, useRouterState } from "@tanstack/react-router";
import { SECTORS, FOCUS_SECTOR_IDS } from "@/data/sectors";
import { sectorStatsFromQuotes } from "@/data/stocks";
import { useAppStore, usePriceColors } from "@/lib/store";
import { useMarketQuotes } from "@/lib/use-market";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Star,
  Crosshair,
  Library,
  Layers,
  Flag,
  Ship,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const NAV: Array<{
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  tone?: string;
}> = [
  { to: "/", label: "대시보드", icon: LayoutDashboard, exact: true },
  { to: "/etfs", label: "퇴직연금 ETF", icon: Layers, tone: "text-desk-gold" },
  { to: "/us-link", label: "미국 연계", icon: Flag, tone: "text-desk-teal" },
  { to: "/export-desk", label: "수출 × KOSPI", icon: Ship, tone: "text-desk-gold" },
  { to: "/research", label: "리서치 데스크", icon: Library },
  { to: "/disclosures", label: "주요 공시", icon: FileText },
  { to: "/watchlist", label: "관심종목", icon: Star },
];

export function Sidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const focusMode = useAppStore((s) => s.focusMode);
  const setFocusMode = useAppStore((s) => s.setFocusMode);
  const colors = usePriceColors();
  const { data } = useMarketQuotes();
  const quotes = data?.quotes ?? [];

  const sectors = focusMode
    ? SECTORS.filter((s) => FOCUS_SECTOR_IDS.includes(s.id) || s.focus)
    : SECTORS;

  return (
    <aside
      className={cn(
        "shell-sidebar flex h-full w-60 flex-col text-white",
        className,
      )}
    >
      <div className="px-3.5 py-3.5 border-b border-white/[0.08]">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-desk-gold to-amber-700 text-xs font-bold text-black shadow">
            KX
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight text-white">
              Korea Equity
            </span>
            <span className="block text-[9px] font-medium uppercase tracking-[0.14em] text-white/45">
              Command Center
            </span>
          </span>
        </Link>
      </div>

      <nav className="px-2 py-2.5 space-y-0.5">
        <div className="px-2.5 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">
          Workspace
        </div>
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "nav-item",
                active ? "nav-item-active" : "nav-item-idle",
              )}
            >
              <Icon className={cn("size-3.5 shrink-0", item.tone || "opacity-80")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-2.5 my-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-2">
        <label className="flex items-center justify-between gap-2 text-xs text-white/90">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Crosshair className="size-3 text-desk-gold" />
            Focus 모드
          </span>
          <Switch
            checked={focusMode}
            onCheckedChange={setFocusMode}
            aria-label="Focus 모드"
          />
        </label>
        <p className="mt-1 text-[10px] text-white/50 leading-snug">
          미국 연계 · 반도체 · 전지 · 바이오 · 로봇
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin px-2 pb-3">
        <div className="px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">
          Sectors · 산업
        </div>
        <div className="space-y-0.5">
          {sectors.map((s) => {
            const stats = sectorStatsFromQuotes(s.id, quotes);
            const to = `/industry/${s.id}`;
            const active = pathname === to || pathname.startsWith(`${to}/`);
            const up = stats.avgChangePct > 0;
            const color =
              !stats.count || stats.avgChangePct === 0
                ? "text-white/40"
                : up
                  ? "text-rose-300"
                  : "text-sky-300";
            return (
              <Link
                key={s.id}
                to="/industry/$sectorId"
                params={{ sectorId: s.id }}
                onClick={onNavigate}
                className={cn(
                  "nav-item justify-between",
                  active ? "nav-item-active" : "nav-item-idle",
                  s.id === "us-linked" && !active && "ring-1 ring-desk-gold/35",
                )}
              >
                <span className="truncate text-[13px]">
                  {s.id === "us-linked" ? (
                    <span className="text-desk-gold mr-1">★</span>
                  ) : null}
                  {s.nameKo}
                </span>
                <span className={cn("text-[11px] tabular shrink-0 font-medium font-mono", color)}>
                  {stats.count ? formatPct(stats.avgChangePct) : "—"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
