import { alertStore } from "@/lib/alert-store";
import { DemoAlertSource } from "@/lib/alert-sources/demo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Shared demo source (starts once, feeds alertStore)
let demoStarted = false;
function ensureDemoSource() {
  if (demoStarted) return;
  demoStarted = true;
  const demo = new DemoAlertSource();
  demo.onAlert((alert) => alertStore.add(alert));
  demo.start(8000);
}

/**
 * SSE endpoint: streams new alerts to connected clients.
 * GET /api/alerts/stream
 */
export async function GET(): Promise<Response> {
  // In demo mode, start the demo source
  ensureDemoSource();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`)
      );

      // Send recent alerts as initial payload
      const recent = alertStore.getRecent(50);
      if (recent.length > 0) {
        controller.enqueue(
          encoder.encode(`event: initial\ndata: ${JSON.stringify(recent)}\n\n`)
        );
      }

      // Subscribe to new alerts
      const unsubscribe = alertStore.subscribe((alert) => {
        try {
          controller.enqueue(
            encoder.encode(`event: alert\ndata: ${JSON.stringify(alert)}\n\n`)
          );
        } catch {
          unsubscribe();
        }
      });

      // Heartbeat every 15 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 15000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
