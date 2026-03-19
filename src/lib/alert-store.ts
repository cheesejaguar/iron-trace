import type { NormalizedAlert } from "@/types";

type AlertListener = (alert: NormalizedAlert) => void;

/**
 * In-memory alert store with KV-compatible interface.
 * Supports deduplication, TTL eviction, and event broadcasting.
 */
class AlertStore {
  private alerts = new Map<string, { alert: NormalizedAlert; expiresAt: number }>();
  private listeners = new Set<AlertListener>();
  private ttlMs: number;

  constructor(ttlMs = 24 * 60 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  /** Add an alert, deduplicate by ID, broadcast to listeners */
  add(alert: NormalizedAlert): boolean {
    // Dedup check
    if (this.alerts.has(alert.id)) {
      return false;
    }

    this.alerts.set(alert.id, {
      alert,
      expiresAt: Date.now() + this.ttlMs,
    });

    // Broadcast to SSE listeners
    for (const listener of this.listeners) {
      try {
        listener(alert);
      } catch {
        // Remove broken listeners
        this.listeners.delete(listener);
      }
    }

    // Lazy TTL cleanup
    this.evictExpired();
    return true;
  }

  /** Get recent alerts, sorted by timestamp descending */
  getRecent(limit = 100, since?: string): NormalizedAlert[] {
    const now = Date.now();
    const sinceTime = since ? new Date(since).getTime() : 0;
    const results: NormalizedAlert[] = [];

    for (const { alert, expiresAt } of this.alerts.values()) {
      if (expiresAt > now && new Date(alert.timestamp).getTime() > sinceTime) {
        results.push(alert);
      }
    }

    return results
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /** Get all alerts (for analysis pipeline) */
  getAll(): NormalizedAlert[] {
    const now = Date.now();
    const results: NormalizedAlert[] = [];
    for (const { alert, expiresAt } of this.alerts.values()) {
      if (expiresAt > now) {
        results.push(alert);
      }
    }
    return results.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  /** Subscribe to new alerts (for SSE) */
  subscribe(listener: AlertListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  get size(): number {
    return this.alerts.size;
  }

  get subscriberCount(): number {
    return this.listeners.size;
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [id, entry] of this.alerts) {
      if (entry.expiresAt <= now) {
        this.alerts.delete(id);
      }
    }
  }
}

/** Singleton alert store */
export const alertStore = new AlertStore();
