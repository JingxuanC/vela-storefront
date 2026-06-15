// ============================================================================
// useChat — shared chat logic for SalesAgent + FloatingChat
// ============================================================================
import { useState, useRef, useEffect } from "react";
import { api, shopId } from "~/api";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  suggested?: string[];
  /** Logistics tracking events (for system messages) */
  tracking?: TrackingEvent[];
  /** Overall tracking status for styling: IN_TRANSIT | OUT_FOR_DELIVERY | DELIVERED | ATTEMPTED_DELIVERY */
  trackingStatus?: string;
}

export interface TrackingEvent {
  status: string;
  location?: string;
  timestamp?: string;
  description?: string;
}

export const TRACKING_STATUS_LABELS: Record<string, string> = {
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  ATTEMPTED_DELIVERY: "Attempted Delivery",
};

export const QUICK_PROMPTS = [
  "How's business today?",
  "Which products have the highest return rate?",
  "What's trending in my category?",
  "Any inventory alerts I should know about?",
  "Where's my order?",
];

interface UseChatOptions {
  /** Load initial summary from /api/admin/chat/summary on mount */
  initialSummary?: boolean;
}

export function useChat(options: UseChatOptions = {}) {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Initial summary ──
  useEffect(() => {
    if (!options.initialSummary || loaded) return;
    api<{ success: boolean; answer: string; suggested_questions: string[]; recent_order_id?: string }>(
      "/api/admin/chat/summary"
    )
      .then((d) => {
        if (d?.success && d.answer)
          setMsgs([
            {
              role: "assistant",
              content: d.answer,
              suggested: d.suggested_questions,
            },
          ]);
        setLoaded(true);
        if (d?.recent_order_id) {
          fetchTrackingStatus(d.recent_order_id);
        }
      })
      .catch(() => setLoaded(true));
  }, [loaded, options.initialSummary]);

  // ── Auto-scroll ──
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // ── Manual summary load (for lazy-init like FloatingChat) ──
  function loadSummary() {
    if (loaded) return;
    api<{ success: boolean; answer: string; suggested_questions: string[]; recent_order_id?: string }>(
      "/api/admin/chat/summary"
    )
      .then((d) => {
        if (d?.success && d.answer)
          setMsgs([
            {
              role: "assistant",
              content: d.answer,
              suggested: d.suggested_questions,
            },
          ]);
        setLoaded(true);
        // Also fetch tracking if a recent order ID is available
        if (d?.recent_order_id) {
          fetchTrackingStatus(d.recent_order_id);
        }
      })
      .catch(() => setLoaded(true));
  }

  // ── Fetch logistics tracking ──
  async function fetchTrackingStatus(orderId: string) {
    if (!orderId) return;
    try {
      const data = await api<{
        success: boolean;
        status: string;
        events: TrackingEvent[];
      }>(`/api/fulfillment/events/${encodeURIComponent(orderId)}`);
      if (data?.success && data.events?.length) {
        const statusLabel = TRACKING_STATUS_LABELS[data.status] || data.status || "Processing";
        setMsgs((p) => [
          ...p,
          {
            role: "system",
            content: `📦 Order #${orderId.slice(-8)} — ${statusLabel}`,
            tracking: data.events,
            trackingStatus: data.status,
          },
        ]);
      }
    } catch {
      // Silently fail — tracking is non-critical
    }
  }

  // ── Send message ──
  async function send(q: string) {
    if (!q.trim() || loading) return;
    abortRef.current?.abort();
    setMsgs((p) => [...p, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    setTyping(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const historyWithCurrent = [
        ...msgs.slice(-5).map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: q },
      ];
      const data = await api<{
        success: boolean;
        answer: string;
        suggested_questions: string[];
      }>("/api/admin/chat/ask", {
        method: "POST",
        body: JSON.stringify({
          question: q,
          history: historyWithCurrent,
        }),
        signal: ctrl.signal,
      });
      if (data?.success)
        setMsgs((p) => [
          ...p,
          {
            role: "assistant",
            content: data.answer || "",
            suggested: data.suggested_questions,
          },
        ]);
    } catch (err: any) {
      if (err.name !== "AbortError")
        setMsgs((p) => [
          ...p,
          {
            role: "assistant",
            content: "I'm having trouble connecting. Please try again.",
          },
        ]);
    } finally {
      setLoading(false);
      setTyping(false);
      abortRef.current = null;
    }
  }

  // ── Stream send (SSE) ──
  async function streamSend(q: string) {
    if (!q.trim() || loading) return;
    abortRef.current?.abort();
    const historyMsgs = [
      ...msgs.slice(-5).map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: q },
    ];
    setMsgs((p) => [...p, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    setTyping(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    // Add empty assistant placeholder to stream into
    setMsgs((p) => [...p, { role: "assistant", content: "" }]);
    try {
      const shop = shopId();
      const url = `/api/admin/chat/stream?shop_id=${encodeURIComponent(shop)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history: historyMsgs }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`Stream request failed: ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream reader");
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let suggested: string[] | undefined;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;
          try {
            const event = JSON.parse(jsonStr);
            if (typeof event.token === "string") {
              fullContent += event.token;
              setMsgs((p) => {
                const copy = [...p];
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: fullContent };
                return copy;
              });
            } else if (event.done) {
              suggested = event.suggested;
              setMsgs((p) => {
                const copy = [...p];
                copy[copy.length - 1] = {
                  ...copy[copy.length - 1],
                  content: fullContent,
                  suggested,
                };
                return copy;
              });
            } else if (typeof event.error === "string") {
              // Record error but continue processing stream
              // (backend sends done after error; don't break the connection)
              console.warn("admin_chat stream error:", event.error);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue; // skip malformed JSON lines
            throw e;
          }
        }
      }
      // Drain residual buffer (incomplete line after stream ends)
      if (buffer.trim()) {
        const line = buffer.trim();
        if (line.startsWith("data:")) {
          try {
            const event = JSON.parse(line.slice(5).trim());
            if (event.done) {
              suggested = event.suggested;
              setMsgs((p) => {
                const copy = [...p];
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: fullContent, suggested };
                return copy;
              });
            }
          } catch { /* ignore malformed residual */ }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMsgs((p) => {
          const copy = [...p];
          const last = copy[copy.length - 1];
          if (last && last.role === "assistant") {
            if (!last.content) {
              copy[copy.length - 1] = { ...last, content: "I'm having trouble connecting. Please try again." };
            } else {
              // Append disconnect marker to partial content
              copy[copy.length - 1] = { ...last, content: last.content + "\n\n*[连接中断]*" };
            }
          }
          return copy;
        });
      }
    } finally {
      setLoading(false);
      setTyping(false);
      // Only clear our own AbortController (prevents race with new requests)
      if (abortRef.current === ctrl) {
        abortRef.current = null;
      }
    }
  }

  function abort() {
    abortRef.current?.abort();
  }

  return {
    msgs,
    input,
    setInput,
    loading,
    loaded,
    typing,
    send,
    streamSend,
    abort,
    loadSummary,
    fetchTrackingStatus,
    endRef,
    abortRef,
  };
}
