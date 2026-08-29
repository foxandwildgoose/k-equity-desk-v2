import { useQuery } from "@tanstack/react-query";
import { getLiveTradeBundle } from "@/server/export-live";

export function useLiveTrade() {
  return useQuery({
    queryKey: ["export-live-trade"],
    queryFn: () => getLiveTradeBundle(),
    staleTime: 30 * 60_000,
    retry: 1,
    retryDelay: 1500,
    refetchOnWindowFocus: false,
  });
}
