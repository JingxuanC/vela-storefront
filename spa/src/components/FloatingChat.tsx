// ============================================================================
// FloatingChat — floating AI Assistant bubble (rendered globally in App)
// ============================================================================
import { useState, useEffect, useMemo } from "react";
import { useChat, QUICK_PROMPTS, TRACKING_STATUS_LABELS } from "~/components/useChat";
import VoiceInput from "~/components/VoiceInput";
import AudioPlayButton from "~/components/AudioPlayButton";
import { ChatMarkdown } from "~/components/ChatMarkdown";

/** Map tracking status to CSS colour */
const TRACKING_COLOR: Record<string, string> = {
  IN_TRANSIT: "var(--sky)",
  OUT_FOR_DELIVERY: "var(--mint)",
  DELIVERED: "var(--text-tertiary)",
  ATTEMPTED_DELIVERY: "var(--amber)",
};

function trackingStatusColor(status?: string): string {
  return status ? TRACKING_COLOR[status] || "var(--sky)" : "var(--sky)";
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const { msgs, input, setInput, loading, loaded, typing, send, abort, loadSummary, endRef } =
    useChat({ initialSummary: false });

  // Lazy-load summary when panel first opens
  const [didLoad, setDidLoad] = useState(false);
  useEffect(() => {
    if (open && !didLoad) {
      setDidLoad(true);
      loadSummary();
    }
  }, [open, didLoad, loadSummary]);

  // Tracking notification badge: show when there are unread system tracking messages
  const hasTrackingNotification = useMemo(
    () => msgs.some((m) => m.role === "system" && m.tracking?.length),
    [msgs],
  );

  return (
    <>
      <style>{`
        .floating-md strong { font-weight: 700; color: var(--amber); } .floating-md code { background: var(--amber-soft); color: var(--amber); padding: 1px 4px; border-radius: 3px; font-size: 11px; }
        .fab { position: fixed; bottom: 24px; right: 24px; width: 52px; height: 52px; border-radius: 16px; background: var(--amber); color: #fff; border: none; cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(212,128,24,.3); z-index: 9999; transition: all .2s var(--ease); }
        .fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(212,128,24,.4); }
        .fab-panel { position: fixed; bottom: 88px; right: 24px; width: 380px; max-height: calc(100vh - 140px); background: var(--bg-base); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 12px 48px rgba(0,0,0,.1); z-index: 9999; display: flex; flex-direction: column; overflow: hidden; animation: fabIn .25s cubic-bezier(.16,1,.3,1); }
        @keyframes fabIn { from { opacity: 0; transform: translateY(16px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .fab-header { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg-base); }
        .fab-body { flex: 1; overflow-y: auto; padding: 14px 18px; display: flex; flex-direction: column; gap: 12px; min-height: 120px; }
        .fab-msg { display: flex; gap: 8px; max-width: 92%; animation: fabIn .25s ease; } .fab-msg.user { align-self: flex-end; flex-direction: row-reverse; }
        .fab-msg.system { align-self: stretch; max-width: 100%; }
        .fab-avatar { width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; } .fab-avatar.ai { background: var(--amber-soft); color: var(--amber); } .fab-avatar.user { background: var(--bg-raised); }
        .fab-avatar.system { background: var(--sky-soft); color: var(--sky); }
        .fab-bubble { padding: 8px 12px; border-radius: 12px; font-size: 12px; line-height: 1.55; } .fab-bubble.ai { background: var(--bg-raised); border: 1px solid var(--border); border-bottom-left-radius: 3px; } .fab-bubble.user { background: var(--amber-soft); border-bottom-right-radius: 3px; }
        .fab-bubble.system { background: var(--sky-soft); border: 1px solid rgba(59,138,217,0.12); border-radius: 12px; padding: 0; overflow: hidden; }
        .fab-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; } .fab-chips button { padding: 3px 8px; border-radius: 100px; border: 1px solid var(--border); background: var(--bg-base); font-size: 10px; color: var(--text-secondary); cursor: pointer; } .fab-chips button:hover { border-color: var(--amber-border); color: var(--amber); }
        .fab-input { display: flex; gap: 6px; padding: 10px 14px; border-top: 1px solid var(--border); } .fab-input input { flex: 1; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border-strong); background: var(--bg-deep); font-size: 12px; outline: none; } .fab-input input:focus { border-color: var(--amber); }
        @media (max-width: 480px) { .fab-panel { width: calc(100vw - 16px); right: 8px; bottom: 76px; } }
        /* Tracking card */
        .tracking-card-header { padding: 10px 14px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(0,0,0,0.04); }
        .tracking-card-header .tracking-icon { font-size: 20px; flex-shrink: 0; }
        .tracking-card-header .tracking-title { font-size: 12px; font-weight: 600; line-height: 1.3; }
        .tracking-card-header .tracking-status-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 100px; white-space: nowrap; }
        .tracking-timeline { padding: 6px 14px 10px; }
        .tracking-event { display: flex; gap: 8px; padding: 5px 0; font-size: 11px; align-items: flex-start; }
        .tracking-event:last-child { padding-bottom: 0; }
        .tracking-event-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }
        .tracking-event-body { flex: 1; min-width: 0; }
        .tracking-event-desc { color: var(--text-primary); line-height: 1.4; }
        .tracking-event-meta { font-size: 10px; color: var(--text-tertiary); margin-top: 1px; display: flex; gap: 8px; }
        .tracking-empty { padding: 10px 14px; font-size: 11px; color: var(--text-tertiary); }
        /* Notification badge on FAB */
        .fab-notif-badge { position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; border-radius: 9px; background: var(--rose); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 5px; box-shadow: 0 2px 8px rgba(216,92,110,.3); animation: badgePop .3s var(--ease-spring); }
        @keyframes badgePop { from { transform: scale(0); } to { transform: scale(1); } }
      `}</style>

      {!open && (
        <button className="fab" onClick={() => setOpen(true)}>
          ✦
          {hasTrackingNotification && (
            <span className="fab-notif-badge">!</span>
          )}
        </button>
      )}

      {open && (
        <div className="fab-panel">
          <div className="fab-header">
            <div style={{ fontWeight: 600, fontSize: 13 }}>AI Assistant</div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                color: "var(--text-tertiary)",
              }}
            >
              ✕
            </button>
          </div>
          <div className="fab-body">
            {!loaded && (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div className="spinner" />
              </div>
            )}
            {loaded && msgs.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✦</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginBottom: 10,
                  }}
                >
                  Ask me anything about your store
                </div>
                <div className="fab-chips" style={{ justifyContent: "center" }}>
                  {QUICK_PROMPTS.map((q) => (
                    <button key={q} onClick={() => send(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => {
              // ── System / tracking message ──
              if (m.role === "system" && m.tracking?.length) {
                const accentColor = trackingStatusColor(m.trackingStatus);
                const statusLabel =
                  TRACKING_STATUS_LABELS[m.trackingStatus || ""] ||
                  m.trackingStatus ||
                  "Processing";
                return (
                  <div key={i} className="fab-msg system">
                    <div className="fab-bubble system">
                      <div
                        className="tracking-card-header"
                        style={{ background: `color-mix(in srgb, ${accentColor} 6%, transparent)` }}
                      >
                        <span className="tracking-icon">📦</span>
                        <span className="tracking-title" style={{ color: "var(--text-primary)" }}>
                          {m.content}
                        </span>
                        <span
                          className="tracking-status-tag"
                          style={{
                            background: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
                            color: accentColor,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div className="tracking-timeline">
                        {m.tracking.map((ev, j) => {
                          const isLatest = j === 0;
                          return (
                            <div key={j} className="tracking-event">
                              <div
                                className="tracking-event-dot"
                                style={{
                                  background: accentColor,
                                  opacity: isLatest ? 1 : 0.35,
                                  boxShadow: isLatest
                                    ? `0 0 0 3px color-mix(in srgb, ${accentColor} 20%, transparent)`
                                    : "none",
                                }}
                              />
                              <div className="tracking-event-body">
                                <div className="tracking-event-desc">
                                  {ev.description || ev.status}
                                </div>
                                <div className="tracking-event-meta">
                                  {ev.location && <span>📍 {ev.location}</span>}
                                  {ev.timestamp && <span>{ev.timestamp}</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              // ── Plain system message (no tracking data) ──
              if (m.role === "system") {
                return (
                  <div key={i} className="fab-msg system">
                    <div className="fab-avatar system">📦</div>
                    <div className="fab-bubble system" style={{ padding: "8px 12px" }}>
                      {m.content}
                    </div>
                  </div>
                );
              }

              // ── User / Assistant ──
              return (
                <div key={i} className={`fab-msg ${m.role}`}>
                  <div className={`fab-avatar ${m.role}`}>
                    {m.role === "assistant" ? "✦" : "U"}
                  </div>
                  <div>
                    <div className={`fab-bubble ${m.role}`}>
                      {m.role === "assistant" ? (
                        <ChatMarkdown text={m.content} className="floating-md" />
                      ) : (
                        m.content
                      )}
                    </div>
                    {m.role === "assistant" && (
                      <div style={{ marginTop: 4 }}>
                        <AudioPlayButton text={m.content} />
                      </div>
                    )}
                    {m.suggested &&
                      m.suggested.length > 0 &&
                      i === msgs.length - 1 && (
                        <div className="fab-chips">
                          {m.suggested.map((s) => (
                            <button
                              key={s}
                              onClick={() => send(s)}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="fab-msg assistant">
                <div className="fab-avatar ai">✦</div>
                <div className="fab-bubble ai">Thinking...</div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="fab-input">
            <VoiceInput onText={(t) => send(t)} disabled={loading} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about your store..."
              disabled={loading}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => send(input)}
              disabled={!input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
