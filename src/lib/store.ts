import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SectorId } from "@/data/types";
import { FOCUS_SECTOR_IDS } from "@/data/sectors";

export type ColorConvention = "korea" | "global";
export type ThemeMode = "dark" | "light";

interface AppState {
  watchlist: string[];
  theme: ThemeMode;
  colorConvention: ColorConvention;
  focusMode: boolean;
  preferredSectors: SectorId[];
  sidebarOpen: boolean;
  addToWatchlist: (code: string) => void;
  removeFromWatchlist: (code: string) => void;
  toggleWatchlist: (code: string) => void;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  setColorConvention: (c: ColorConvention) => void;
  setFocusMode: (v: boolean) => void;
  setSidebarOpen: (v: boolean) => void;
  isWatched: (code: string) => boolean;
}

const DEFAULT_WATCHLIST = [
  "005930",
  "000660",
  "373220",
  "207940",
  "277810",
  "012450",
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      watchlist: DEFAULT_WATCHLIST,
      theme: "dark",
      colorConvention: "korea",
      focusMode: false,
      preferredSectors: FOCUS_SECTOR_IDS as SectorId[],
      sidebarOpen: false,
      addToWatchlist: (code) =>
        set((s) =>
          s.watchlist.includes(code)
            ? s
            : { watchlist: [...s.watchlist, code] },
        ),
      removeFromWatchlist: (code) =>
        set((s) => ({
          watchlist: s.watchlist.filter((c) => c !== code),
        })),
      toggleWatchlist: (code) => {
        const { watchlist } = get();
        if (watchlist.includes(code)) {
          get().removeFromWatchlist(code);
        } else {
          get().addToWatchlist(code);
        }
      },
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setColorConvention: (colorConvention) => set({ colorConvention }),
      setFocusMode: (focusMode) => set({ focusMode }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      isWatched: (code) => get().watchlist.includes(code),
    }),
    {
      name: "korea-equity-cc",
      partialize: (s) => ({
        watchlist: s.watchlist,
        theme: s.theme,
        colorConvention: s.colorConvention,
        focusMode: s.focusMode,
        preferredSectors: s.preferredSectors,
      }),
    },
  ),
);

/** Korea: red up / blue down. Global: green up / red down. */
export function usePriceColors() {
  const convention = useAppStore((s) => s.colorConvention);
  if (convention === "korea") {
    return {
      up: "text-price-up",
      down: "text-price-down",
      upBg: "bg-price-up/10",
      downBg: "bg-price-down/10",
      upSolid: "bg-price-up",
      downSolid: "bg-price-down",
      label: "상승 빨강 · 하락 파랑 (한국)",
    };
  }
  return {
    up: "text-price-up-global",
    down: "text-price-down-global",
    upBg: "bg-price-up-global/10",
    downBg: "bg-price-down-global/10",
    upSolid: "bg-price-up-global",
    downSolid: "bg-price-down-global",
    label: "상승 초록 · 하락 빨강 (글로벌)",
  };
}
