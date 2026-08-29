export interface FredPoint {
  period: string;
  valueUsd: number;
}

export function parseFredCsv(csv: string, _seriesId?: string): FredPoint[] {
  const lines = csv.trim().split(/\r?\n/);
  const out: FredPoint[] = [];
  for (const line of lines.slice(1)) {
    const [date, raw] = line.split(",");
    if (!date || raw == null) continue;
    const v = Number(raw);
    if (!Number.isFinite(v)) continue;
    out.push({ period: date.slice(0, 7), valueUsd: v });
  }
  return out;
}
