/**
 * Chart price-alert evaluator (F7 alerts / AT-33). Pure: given the alert and
 * the latest price, decide whether the line was crossed since the last
 * evaluation. The first observation only records the side (no fire).
 */
import type { PriceAlert } from "../store-migrate.ts";

export type Side = "above" | "below";

export function sideOf(price: number, level: number): Side {
  return price >= level ? "above" : "below";
}

export function evaluatePriceAlert(alert: PriceAlert, price: number, nowIso: string): { fired: boolean; direction: "up" | "down" | null; next: PriceAlert } {
  if (!alert.active || alert.kind !== "price-cross" || alert.level == null || !Number.isFinite(price) || price <= 0) {
    return { fired: false, direction: null, next: alert };
  }
  const side = sideOf(price, alert.level);
  const prev = alert.lastSide;
  if (!prev) return { fired: false, direction: null, next: { ...alert, lastSide: side } };
  const dir = prev === "below" && side === "above" ? "up" : prev === "above" && side === "below" ? "down" : null;
  const fired = dir != null && (alert.direction === "any" || alert.direction === dir);
  const next: PriceAlert = { ...alert, lastSide: side };
  if (fired) {
    next.lastFiredAt = nowIso;
    if (alert.repeat === "once") next.active = false;
  }
  return { fired, direction: fired ? dir : null, next };
}

/** Evaluate every active price alert for one instrument; returns fired ids + updated list. */
export function evaluateAlertsFor(alerts: readonly PriceAlert[], market: "KR" | "US", code: string, price: number, nowIso: string): { fired: PriceAlert[]; alerts: PriceAlert[] } {
  const fired: PriceAlert[] = [];
  const out = alerts.map((a) => {
    if (a.market !== market || a.code.toUpperCase() !== code.toUpperCase()) return a;
    const r = evaluatePriceAlert(a, price, nowIso);
    if (r.fired) fired.push(r.next);
    return r.next;
  });
  return { fired, alerts: out };
}
