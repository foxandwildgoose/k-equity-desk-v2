import { useCallback, useEffect, useState } from "react";
import type { OfficialReport } from "@/lib/us-official-parse";

const KEY = "kx-us-research-saved-v1";

export function useSavedReports() {
  const [items, setItems] = useState<OfficialReport[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OfficialReport[];
        if (Array.isArray(parsed)) setItems(parsed.filter((r) => r && typeof r.id === "string"));
      }
    } catch {
      /* ignore broken local storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items.slice(0, 40)));
    } catch {
      /* ignore quota */
    }
  }, [items, ready]);

  const has = useCallback((id: string) => items.some((r) => r.id === id), [items]);

  const toggle = useCallback((report: OfficialReport) => {
    setItems((prev) => {
      if (prev.some((r) => r.id === report.id)) return prev.filter((r) => r.id !== report.id);
      return [report, ...prev].slice(0, 40);
    });
  }, []);

  return { items, ready, has, toggle };
}
