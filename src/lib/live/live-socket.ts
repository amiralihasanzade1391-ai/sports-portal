/**
 * Live Scores Realtime Client (WebSocket-ready architecture)
 *
 * Current State: HTTP Long-Polling Fallback (30s interval)
 * Future State: Bzzoiro Live WebSocket Tier (wss://sports.bzzoiro.com/ws/live/)
 */

export type LiveSocketState = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "FALLBACK_POLLING";

export interface LiveScorePayload {
  matchId: string;
  minute: number | null;
  homeScore: number | null;
  awayScore: number | null;
  status: "LIVE" | "HT" | "FT" | string;
  period?: string;
  timestamp: string;
}

type LiveListener = (payload: LiveScorePayload[]) => void;

class LiveSocketManager {
  private state: LiveSocketState = "DISCONNECTED";
  private listeners: Set<LiveListener> = new Set();
  private pollInterval: NodeJS.Timeout | null = null;
  private ws: WebSocket | null = null;
  private wsUrl: string | null = null;

  constructor() {
    // In production with Bzzoiro WebSocket tier, set BZZOIRO_WS_URL in env
    if (typeof window !== "undefined") {
      this.wsUrl = process.env.NEXT_PUBLIC_BZZOIRO_WS_URL || null;
    }
  }

  public getState(): LiveSocketState {
    return this.state;
  }

  public connect(endpoint?: string) {
    if (typeof window === "undefined") return;
    if (this.state === "CONNECTED" || this.state === "FALLBACK_POLLING") return;

    if (endpoint || this.wsUrl) {
      this.connectWebSocket(endpoint || this.wsUrl!);
    } else {
      this.startPollingFallback();
    }
  }

  private connectWebSocket(url: string) {
    try {
      this.state = "CONNECTING";
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.state = "CONNECTED";
        console.log("[LiveSocket] Realtime WebSocket connected to sports provider.");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(Array.isArray(data) ? data : [data]);
        } catch (err) {
          console.warn("[LiveSocket] Error parsing message:", err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn("[LiveSocket] WebSocket error, switching to polling fallback:", err);
        this.startPollingFallback();
      };

      this.ws.onclose = () => {
        console.log("[LiveSocket] WebSocket closed, using polling fallback.");
        this.startPollingFallback();
      };
    } catch {
      this.startPollingFallback();
    }
  }

  private startPollingFallback() {
    this.state = "FALLBACK_POLLING";
    if (this.pollInterval) clearInterval(this.pollInterval);

    // Initial fetch
    this.pollNow();

    // Poll every 30 seconds
    this.pollInterval = setInterval(() => {
      this.pollNow();
    }, 30000);
  }

  public async pollNow() {
    try {
      const res = await fetch("/api/matches?status=LIVE");
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const payload: LiveScorePayload[] = json.data.map((m: any) => ({
          matchId: m.id,
          minute: m.minute,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: m.status === "HALF_TIME" ? "HT" : m.status === "FINISHED" ? "FT" : "LIVE",
          timestamp: new Date().toISOString(),
        }));
        this.notifyListeners(payload);
      }
    } catch (err) {
      console.warn("[LiveSocket] Polling error:", err);
    }
  }

  public subscribe(listener: LiveListener): () => void {
    this.listeners.add(listener);
    if (this.state === "DISCONNECTED") {
      this.connect();
    }
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.disconnect();
      }
    };
  }

  private notifyListeners(data: LiveScorePayload[]) {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error("[LiveSocket] Listener error:", err);
      }
    });
  }

  public disconnect() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.state = "DISCONNECTED";
  }
}

export const liveSocket = new LiveSocketManager();
