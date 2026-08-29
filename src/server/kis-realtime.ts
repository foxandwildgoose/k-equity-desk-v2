import WebSocket from "ws";

/**
 * Korea Investment & Securities (KIS) domestic-stock KRX realtime adapter.
 * Server only. App key/secret never leave the server.
 *
 * Official KRX realtime trade TR: H0STCNT0.
 * Keep the Naver adapter as a snapshot/failover source, not as a tick stream.
 */

export type KisRealtimeTrade = {
  code: string;
  tradeTime: string;
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  ask: number;
  bid: number;
  tradeVolume: number;
  accumulatedVolume: number;
  accumulatedValue: number;
  tradeStrength: number;
  businessDate: string;
  marketControlCode: string;
  source: "kis-krx-websocket";
  receivedAt: string;
};

export type KisStreamStatus = {
  enabled: boolean;
  connected: boolean;
  provider: "kis";
  source: "kis-krx-websocket";
  message?: string;
};

type Listener = (trade: KisRealtimeTrade) => void;
type StatusListener = (status: KisStreamStatus) => void;

const APPROVAL_URL =
  process.env.KIS_APPROVAL_URL ??
  "https://openapi.koreainvestment.com:9443/oauth2/approval";
const WS_URL = process.env.KIS_WS_URL ?? "ws://ops.koreainvestment.com:21000";
const TR_ID = "H0STCNT0";
const APPROVAL_TTL_MS = 12 * 60 * 60 * 1000;

function n(v: unknown): number {
  const out = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(out) ? out : 0;
}

function enabled(): boolean {
  return Boolean(process.env.KIS_APP_KEY && process.env.KIS_APP_SECRET);
}

let approvalCache: { key: string; at: number } | null = null;

async function getApprovalKey(): Promise<string> {
  if (!enabled()) throw new Error("KIS credentials are not configured");
  if (approvalCache && Date.now() - approvalCache.at < APPROVAL_TTL_MS) {
    return approvalCache.key;
  }

  const res = await fetch(APPROVAL_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      appkey: process.env.KIS_APP_KEY,
      secretkey: process.env.KIS_APP_SECRET,
    }),
  });
  if (!res.ok) throw new Error(`KIS approval HTTP ${res.status}`);
  const json = (await res.json()) as { approval_key?: string };
  if (!json.approval_key) throw new Error("KIS approval_key missing");
  approvalCache = { key: json.approval_key, at: Date.now() };
  return json.approval_key;
}

function parseTradePayload(payload: string): KisRealtimeTrade | null {
  const f = payload.split("^");
  if (f.length < 46) return null;
  const code = f[0]?.trim();
  if (!code || !/^\d{6}$/.test(code)) return null;
  const signCode = f[3] ?? "3";
  const direction =
    signCode === "4" || signCode === "5" ? -1 : signCode === "3" ? 0 : 1;
  const change = direction * Math.abs(n(f[4]));
  const changePct = direction * Math.abs(n(f[5]));
  return {
    code,
    tradeTime: f[1] ?? "",
    price: n(f[2]),
    change,
    changePct,
    open: n(f[7]),
    high: n(f[8]),
    low: n(f[9]),
    ask: n(f[10]),
    bid: n(f[11]),
    tradeVolume: n(f[12]),
    accumulatedVolume: n(f[13]),
    accumulatedValue: n(f[14]),
    tradeStrength: n(f[18]),
    businessDate: f[33] ?? "",
    marketControlCode: f[44] ?? "",
    source: "kis-krx-websocket",
    receivedAt: new Date().toISOString(),
  };
}

class KisRealtimeHub {
  private socket: WebSocket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private statusListeners = new Set<StatusListener>();
  private approvalKey: string | null = null;
  private connectPromise: Promise<void> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;

  getStatus(): KisStreamStatus {
    return {
      enabled: enabled(),
      connected: this.socket?.readyState === WebSocket.OPEN,
      provider: "kis",
      source: "kis-krx-websocket",
      message: enabled()
        ? undefined
        : "KIS_APP_KEY / KIS_APP_SECRET 미설정 — 스냅샷 모드",
    };
  }

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  async subscribe(code: string, listener: Listener): Promise<() => void> {
    if (!/^\d{6}$/.test(code)) throw new Error("Invalid KRX code");
    const set = this.listeners.get(code) ?? new Set<Listener>();
    const first = set.size === 0;
    set.add(listener);
    this.listeners.set(code, set);

    if (enabled()) {
      const wasOpen = this.socket?.readyState === WebSocket.OPEN;
      await this.ensureConnected();
      if (first && wasOpen) this.sendSubscription(code, "1");
    }

    return () => {
      const current = this.listeners.get(code);
      if (!current) return;
      current.delete(listener);
      if (current.size === 0) {
        this.listeners.delete(code);
        this.sendSubscription(code, "0");
      }
    };
  }

  private emitStatus(message?: string) {
    const status = {
      ...this.getStatus(),
      message: message ?? this.getStatus().message,
    };
    for (const listener of this.statusListeners) listener(status);
  }

  private async ensureConnected(): Promise<void> {
    if (!enabled()) return;
    if (this.socket?.readyState === WebSocket.OPEN) return;
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = (async () => {
      this.approvalKey = await getApprovalKey();
      await new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(WS_URL);
        this.socket = ws;
        const timeout = setTimeout(
          () => reject(new Error("KIS WebSocket connect timeout")),
          10_000,
        );

        ws.once("open", () => {
          clearTimeout(timeout);
          this.reconnectAttempt = 0;
          this.emitStatus("KRX 실시간 연결");
          for (const code of this.listeners.keys()) {
            this.sendSubscription(code, "1");
          }
          resolve();
        });
        ws.once("error", () => {
          clearTimeout(timeout);
          this.emitStatus("KIS WebSocket 오류");
          reject(new Error("KIS WebSocket error"));
        });
        ws.on("close", () => {
          clearTimeout(timeout);
          this.socket = null;
          this.connectPromise = null;
          this.emitStatus("KIS 연결 끊김 — 재연결 대기");
          this.scheduleReconnect();
        });
        ws.on("message", (data: WebSocket.RawData) => {
          const text =
            typeof data === "string"
              ? data
              : Buffer.isBuffer(data)
                ? data.toString("utf8")
                : Buffer.from(data as ArrayBuffer).toString("utf8");
          this.handleMessage(text);
        });
      });
    })().finally(() => {
      this.connectPromise = null;
    });

    return this.connectPromise;
  }

  private scheduleReconnect() {
    if (!enabled() || this.listeners.size === 0 || this.reconnectTimer) return;
    const delay = Math.min(30_000, 1_000 * 2 ** this.reconnectAttempt++);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.ensureConnected().catch(() => this.scheduleReconnect());
    }, delay);
  }

  private sendSubscription(code: string, trType: "0" | "1") {
    if (!this.approvalKey || this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(
      JSON.stringify({
        header: {
          approval_key: this.approvalKey,
          custtype: "P",
          tr_type: trType,
          "content-type": "utf-8",
        },
        body: { input: { tr_id: TR_ID, tr_key: code } },
      }),
    );
  }

  private handleMessage(raw: string) {
    if (!raw) return;
    if (raw.startsWith("0|") || raw.startsWith("1|")) {
      const parts = raw.split("|");
      if (parts[1] !== TR_ID) return;
      const trade = parseTradePayload(parts[3] ?? "");
      if (!trade) return;
      for (const listener of this.listeners.get(trade.code) ?? []) {
        listener(trade);
      }
      return;
    }

    try {
      const msg = JSON.parse(raw) as {
        header?: { tr_id?: string };
        body?: { rt_cd?: string; msg1?: string };
      };
      if (msg.header?.tr_id === "PINGPONG") {
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.socket.pong(raw);
        }
        return;
      }
      if (
        msg.body?.rt_cd === "1" &&
        !String(msg.body.msg1 ?? "").includes("ALREADY IN SUBSCRIBE")
      ) {
        this.emitStatus(msg.body.msg1 ?? "KIS subscription error");
      }
    } catch {
      /* ignore control noise */
    }
  }
}

export const kisRealtimeHub = new KisRealtimeHub();
