import { createFileRoute } from "@tanstack/react-router";
import { kisRealtimeHub } from "@/server/kis-realtime";

const encoder = new TextEncoder();

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export const Route = createFileRoute("/api/market-stream")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const codes = [...new Set((url.searchParams.get("codes") ?? "")
          .split(",")
          .map((x) => x.replace(/\D/g, "").padStart(6, "0"))
          .filter((x) => /^\d{6}$/.test(x)))]
          .slice(0, 40);

        if (!codes.length) {
          return Response.json({ error: "codes_required" }, { status: 400 });
        }

        let cleanup: Array<() => void> = [];
        let heartbeat: ReturnType<typeof setInterval> | null = null;

        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(sse("status", kisRealtimeHub.getStatus()));

            const offStatus = kisRealtimeHub.onStatus((status) => {
              try { controller.enqueue(sse("status", status)); } catch { /* closed */ }
            });
            cleanup.push(offStatus);

            void Promise.all(
              codes.map((code) =>
                kisRealtimeHub.subscribe(code, (trade) => {
                  try { controller.enqueue(sse("trade", trade)); } catch { /* closed */ }
                }),
              ),
            ).then((offs) => cleanup.push(...offs)).catch((error) => {
              try {
                controller.enqueue(sse("status", {
                  ...kisRealtimeHub.getStatus(),
                  connected: false,
                  message: error instanceof Error ? error.message : "KIS stream error",
                }));
              } catch { /* closed */ }
            });

            heartbeat = setInterval(() => {
              try { controller.enqueue(encoder.encode(": heartbeat\n\n")); } catch { /* closed */ }
            }, 15_000);

            request.signal.addEventListener("abort", () => {
              if (heartbeat) clearInterval(heartbeat);
              for (const off of cleanup.splice(0)) off();
              try { controller.close(); } catch { /* already closed */ }
            }, { once: true });
          },
          cancel() {
            if (heartbeat) clearInterval(heartbeat);
            for (const off of cleanup.splice(0)) off();
          },
        });

        return new Response(stream, {
          headers: {
            "content-type": "text/event-stream; charset=utf-8",
            "cache-control": "no-cache, no-transform",
            connection: "keep-alive",
            "x-accel-buffering": "no",
          },
        });
      },
    },
  },
});
