import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { KisRealtimeTrade, KisStreamStatus } from "@/server/kis-realtime";

function uniqueCodes(codes: string[]) {
  return [...new Set(codes.map((c) => c.replace(/\D/g, "").padStart(6, "0")))]
    .filter((c) => /^\d{6}$/.test(c))
    .slice(0, 40);
}

export function useMarketStream(codes: string[]) {
  const queryClient = useQueryClient();
  const normalized = useMemo(() => uniqueCodes(codes), [codes.join(",")]);
  const [status, setStatus] = useState<KisStreamStatus>({
    enabled: false,
    connected: false,
    provider: "kis",
    source: "kis-krx-websocket",
  });

  useEffect(() => {
    if (!normalized.length || typeof EventSource === "undefined") return;
    const es = new EventSource(`/api/market-stream?codes=${encodeURIComponent(normalized.join(","))}`);

    const onStatus = (event: MessageEvent<string>) => {
      try { setStatus(JSON.parse(event.data) as KisStreamStatus); } catch { /* ignore */ }
    };
    const onTrade = (event: MessageEvent<string>) => {
      let trade: KisRealtimeTrade;
      try { trade = JSON.parse(event.data) as KisRealtimeTrade; } catch { return; }

      queryClient.setQueryData(["market-quotes"], (old: any) => {
        if (!old?.quotes) return old;
        return {
          ...old,
          source: "kis-krx-websocket",
          live: true,
          fetchedAt: trade.receivedAt,
          quotes: old.quotes.map((q: any) =>
            q.code === trade.code
              ? {
                  ...q,
                  price: trade.price,
                  change: trade.change,
                  changePct: trade.changePct,
                  open: trade.open,
                  high: trade.high,
                  low: trade.low,
                  volume: trade.accumulatedVolume,
                  tradedAt: `${trade.businessDate} ${trade.tradeTime}`,
                  source: "kis-krx-websocket",
                }
              : q,
          ),
        };
      });

      queryClient.setQueryData(["stock-bundle", trade.code], (old: any) => {
        if (!old?.quote) return old;
        return {
          ...old,
          fetchedAt: trade.receivedAt,
          quote: {
            ...old.quote,
            price: trade.price,
            change: trade.change,
            changePct: trade.changePct,
            open: trade.open,
            high: trade.high,
            low: trade.low,
            volume: trade.accumulatedVolume,
            tradedAt: `${trade.businessDate} ${trade.tradeTime}`,
            source: "kis-krx-websocket",
          },
        };
      });
    };

    es.addEventListener("status", onStatus as EventListener);
    es.addEventListener("trade", onTrade as EventListener);
    es.onerror = () => setStatus((s) => ({ ...s, connected: false, message: "실시간 스트림 재연결 중" }));

    return () => es.close();
  }, [normalized.join(","), queryClient]);

  return status;
}
