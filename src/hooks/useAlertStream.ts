"use client";

import { useEffect, useRef } from "react";
import { useAlertStore } from "@/stores/alert-store";
import type { NormalizedAlert } from "@/types";

/**
 * SSE client hook: connects to /api/alerts/stream,
 * auto-reconnects on disconnect, feeds alerts into Zustand store.
 */
export function useAlertStream(): void {
  const addAlert = useAlertStore((s) => s.addAlert);
  const setAlerts = useAlertStore((s) => s.setAlerts);
  const setConnected = useAlertStore((s) => s.setConnected);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let closed = false;

    function connect() {
      if (closed) return;

      eventSource = new EventSource("/api/alerts/stream");

      eventSource.addEventListener("connected", () => {
        setConnected(true);
      });

      eventSource.addEventListener("initial", (event) => {
        try {
          const alerts: NormalizedAlert[] = JSON.parse(event.data);
          setAlerts(alerts);
        } catch {
          // ignore parse errors
        }
      });

      eventSource.addEventListener("alert", (event) => {
        try {
          const alert: NormalizedAlert = JSON.parse(event.data);
          addAlert(alert);
        } catch {
          // ignore parse errors
        }
      });

      eventSource.onerror = () => {
        setConnected(false);
        eventSource?.close();
        // Reconnect after 2 seconds
        if (!closed) {
          reconnectRef.current = setTimeout(connect, 2000);
        }
      };
    }

    connect();

    return () => {
      closed = true;
      eventSource?.close();
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      setConnected(false);
    };
  }, [addAlert, setAlerts, setConnected]);
}
