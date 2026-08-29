/** Client-side technical indicators used by the pro trading chart. */

export function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i]!;
    if (i >= period) sum -= values[i - period]!;
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

export function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;
  for (let i = 0; i < values.length; i++) {
    const v = values[i]!;
    if (i < period - 1) {
      out.push(null);
      continue;
    }
    if (prev == null) {
      let s = 0;
      for (let j = i - period + 1; j <= i; j++) s += values[j]!;
      prev = s / period;
    } else {
      prev = v * k + prev * (1 - k);
    }
    out.push(prev);
  }
  return out;
}

export function bollinger(
  closes: number[],
  period = 20,
  mult = 2,
): { mid: (number | null)[]; upper: (number | null)[]; lower: (number | null)[] } {
  const mid = sma(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (mid[i] == null) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const d = closes[j]! - mid[i]!;
      sumSq += d * d;
    }
    const sd = Math.sqrt(sumSq / period);
    upper.push(mid[i]! + mult * sd);
    lower.push(mid[i]! - mult * sd);
  }
  return { mid, upper, lower };
}

export function rsi(closes: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = [null];
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i < closes.length; i++) {
    const ch = closes[i]! - closes[i - 1]!;
    const gain = Math.max(ch, 0);
    const loss = Math.max(-ch, 0);
    if (i < period) {
      avgGain += gain;
      avgLoss += loss;
      out.push(null);
      continue;
    }
    if (i === period) {
      avgGain = (avgGain + gain) / period;
      avgLoss = (avgLoss + loss) / period;
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    if (avgLoss === 0) out.push(100);
    else {
      const rs = avgGain / avgLoss;
      out.push(100 - 100 / (1 + rs));
    }
  }
  return out;
}

export function macd(
  closes: number[],
  fast = 12,
  slow = 26,
  signal = 9,
): {
  macd: (number | null)[];
  signal: (number | null)[];
  hist: (number | null)[];
} {
  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);
  const macdLine: (number | null)[] = closes.map((_, i) =>
    emaFast[i] != null && emaSlow[i] != null ? emaFast[i]! - emaSlow[i]! : null,
  );
  // signal on non-null macd
  const compact: number[] = [];
  const idxMap: number[] = [];
  macdLine.forEach((v, i) => {
    if (v != null) {
      compact.push(v);
      idxMap.push(i);
    }
  });
  const sigCompact = ema(compact, signal);
  const signalLine: (number | null)[] = closes.map(() => null);
  const hist: (number | null)[] = closes.map(() => null);
  idxMap.forEach((orig, j) => {
    signalLine[orig] = sigCompact[j];
    if (macdLine[orig] != null && sigCompact[j] != null) {
      hist[orig] = macdLine[orig]! - sigCompact[j]!;
    }
  });
  return { macd: macdLine, signal: signalLine, hist };
}

/**
 * VWAP. For intraday, pass sessionKeys (e.g. YYYY-MM-DD) to reset each KRX session.
 * Without keys, computes one cumulative series (daily “anchored” style — label accordingly).
 */
export function vwap(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[],
  sessionKeys?: string[],
): (number | null)[] {
  const out: (number | null)[] = [];
  let cumPV = 0;
  let cumV = 0;
  let prevKey: string | undefined;
  for (let i = 0; i < closes.length; i++) {
    const key = sessionKeys?.[i];
    if (key != null && prevKey != null && key !== prevKey) {
      cumPV = 0;
      cumV = 0;
    }
    if (key != null) prevKey = key;
    const tp = (highs[i]! + lows[i]! + closes[i]!) / 3;
    const v = Math.max(volumes[i]!, 0);
    cumPV += tp * v;
    cumV += v;
    out.push(cumV > 0 ? cumPV / cumV : null);
  }
  return out;
}

/** Last non-null ATR value helper */
export function lastNumber(arr: (number | null)[]): number | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != null) return arr[i]!;
  }
  return null;
}

/** Pivot highs/lows for auto support & resistance. */
export function findPivots(
  highs: number[],
  lows: number[],
  left = 3,
  right = 3,
): { highIdx: number[]; lowIdx: number[] } {
  const highIdx: number[] = [];
  const lowIdx: number[] = [];
  for (let i = left; i < highs.length - right; i++) {
    let isH = true;
    let isL = true;
    for (let j = i - left; j <= i + right; j++) {
      if (j === i) continue;
      if (highs[j]! > highs[i]!) isH = false;
      if (lows[j]! < lows[i]!) isL = false;
    }
    if (isH) highIdx.push(i);
    if (isL) lowIdx.push(i);
  }
  return { highIdx, lowIdx };
}

export function atr(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14,
): (number | null)[] {
  const tr: number[] = [];
  for (let i = 0; i < highs.length; i++) {
    if (i === 0) tr.push(highs[i]! - lows[i]!);
    else {
      tr.push(
        Math.max(
          highs[i]! - lows[i]!,
          Math.abs(highs[i]! - closes[i - 1]!),
          Math.abs(lows[i]! - closes[i - 1]!),
        ),
      );
    }
  }
  return sma(tr, period);
}
