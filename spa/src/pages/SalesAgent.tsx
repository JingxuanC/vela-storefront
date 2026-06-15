// ============================================================================
// SalesAgent — full-page AI Assistant (Route: /admin-chat)
// ============================================================================
import { useEffect, useRef, useState } from "react";
import { api, shopId } from "~/api";
import { useChat, QUICK_PROMPTS } from "~/components/useChat";
import VoiceInput from "~/components/VoiceInput";
import AudioPlayButton from "~/components/AudioPlayButton";
import { ChatMarkdown } from "~/components/ChatMarkdown";

export default function SalesAgent() {
  const { msgs, input, setInput, loading, loaded, typing, send, streamSend, abort, endRef, abortRef } =
    useChat({ initialSummary: true });
  const inputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<{
    totalConversations: number;
    productsRecommended: number;
    discountsGenerated: number;
    intentToBuy: number;
    topProducts: { name: string; recommended: number }[];
    topObjections: { reason: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    if (loaded) return;
    api<{
      success: boolean;
      totalConversations: number;
      productsRecommended: number;
      discountsGenerated: number;
      intentToBuy: number;
      topProducts: { name: string; recommended: number }[];
      topObjections: { reason: string; count: number }[];
    }>("/api/shop/sales-agent/stats")
      .then((st) => {
        if (st) setStats(st);
      })
      .catch(() => {});
  }, [loaded]);

  useEffect(() => {
    if (loaded) inputRef.current?.focus();
  }, [loaded]);

  const shop = shopId().replace(".myshopify.com", "") || "your store";
  const isEmpty = msgs.length === 0 && loaded;

  return (
    <div
      style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}
    >
      <style>{`
        .chat-md strong { font-weight: 700; color: var(--amber); } .chat-md em { font-style: italic; opacity: .85; } .chat-md h2,.chat-md h3 { font-family: var(--font-display); font-size: 16px; font-weight: 600; margin: 14px 0 6px; } .chat-md code { background: var(--amber-soft); color: var(--amber); padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: var(--font-mono); } .chat-md blockquote { border-left: 2px solid var(--amber); margin: 8px 0; padding: 4px 14px; color: var(--text-secondary); font-style: italic; } .chat-md .md-list { margin: 6px 0; padding-left: 18px; } .chat-md .md-list li { margin-bottom: 4px; line-height: 1.6; } .chat-md .md-list li::marker { color: var(--amber); } .chat-md ol.md-list { list-style: none; padding-left: 0; } .chat-md ol.md-list li { display: flex; gap: 8px; } .chat-md ol.md-list li::before { content: attr(data-num) "."; color: var(--amber); font-weight: 700; min-width: 18px; }
        .msg-row { display: flex; gap: 14px; max-width: 82%; animation: msgIn .35s cubic-bezier(.34,1.56,.64,1) both; } .msg-row.user { align-self: flex-end; flex-direction: row-reverse; }
        @keyframes msgIn { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .msg-avatar { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; } .msg-avatar.ai { background: var(--amber-soft); color: var(--amber); } .msg-avatar.user { background: var(--bg-raised); color: var(--text-primary); }
        .msg-bubble { padding: 14px 18px; border-radius: 20px; font-size: 13.5px; line-height: 1.7; } .msg-bubble.ai { background: var(--bg-raised); border: 1px solid var(--border); border-bottom-left-radius: 6px; } .msg-bubble.user { background: var(--amber-soft); border-bottom-right-radius: 6px; }
        .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-tertiary); display: inline-block; animation: typeBounce 1.4s ease-in-out infinite; } .typing-dot:nth-child(2) { animation-delay: .2s; } .typing-dot:nth-child(3) { animation-delay: .4s; } @keyframes typeBounce { 0%,80%,100% { transform: scale(.6); opacity: .4; } 40% { transform: scale(1); opacity: 1; } }
        .chat-header { text-align: center; padding: 40px 20px 32px; } .chat-header-icon { width: 72px; height: 72px; border-radius: 22px; background: var(--amber-soft); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; } .chat-quick { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 20px; } .chat-quick button { padding: 8px 16px; border-radius: 100px; border: 1px solid var(--border-strong); background: var(--bg-base); font-size: 12px; font-family: var(--font-body); color: var(--text-secondary); cursor: pointer; transition: all .2s var(--ease); } .chat-quick button:hover { border-color: var(--amber-border); color: var(--amber); background: var(--amber-soft); transform: translateY(-1px); } .chat-suggest { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; } .chat-suggest button { padding: 5px 12px; border-radius: 100px; border: 1px solid var(--border); background: var(--bg-base); font-size: 11px; font-family: var(--font-body); color: var(--text-secondary); cursor: pointer; transition: all .15s var(--ease); } .chat-suggest button:hover { border-color: var(--amber-border); color: var(--amber); }
        .chat-bar { display: flex; gap: 10px; padding: 16px 0 0; border-top: 1px solid var(--border); } .chat-bar input { flex: 1; padding: 13px 18px; border-radius: 14px; border: 1px solid var(--border-strong); background: var(--bg-deep); color: var(--text-primary); font-family: var(--font-body); font-size: 13.5px; outline: none; transition: all .2s var(--ease); } .chat-bar input:focus { border-color: var(--amber); box-shadow: 0 0 0 4px var(--amber-soft); } .chat-bar input::placeholder { color: var(--text-tertiary); }
      `}</style>

      {isEmpty ? (
        <div className="chat-header">
          <div className="chat-header-icon">✦</div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>
            AI Assistant
          </h1>
          <p className="page-subtitle">Powered by your store's data — {shop}</p>
          <div className="chat-quick">
            {QUICK_PROMPTS.map((q) => (
              <button key={q} onClick={() => streamSend(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <h1 className="page-title">AI Assistant</h1>
          <p className="page-subtitle">
            Ask about returns, products, trends, or inventory
          </p>
          {stats && (
            <>
            <div className="kpi-grid" style={{ marginTop: 12, marginBottom: 0 }}>
              <div className="card kpi-card">
                <div className="stat-value sm">{stats.totalConversations}</div>
                <div className="stat-label">Conversations</div>
              </div>
              <div className="card kpi-card">
                <div
                  className="stat-value sm"
                  style={{ color: "var(--amber)" }}
                >
                  {stats.productsRecommended}
                </div>
                <div className="stat-label">Recommended</div>
              </div>
              <div className="card kpi-card">
                <div
                  className="stat-value sm"
                  style={{ color: "var(--mint)" }}
                >
                  {stats.discountsGenerated}
                </div>
                <div className="stat-label">Discounts</div>
              </div>
              <div className="card kpi-card">
                <div
                  className="stat-value sm"
                  style={{ color: "var(--violet)" }}
                >
                  {stats.intentToBuy}
                </div>
                <div className="stat-label">Intent to Buy</div>
              </div>
            </div>
            <div className="detail-grid" style={{ marginTop: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 16 }}>🏆</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    热门推荐产品
                  </span>
                </div>
                {stats.topProducts && stats.topProducts.length > 0 ? (
                  stats.topProducts.slice(0, 5).map((p, i) => (
                    <div key={p.name} className="metric-row">
                      <span className="metric-key">
                        <span style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 600, minWidth: 16 }}>
                          {i + 1}
                        </span>
                        {p.name}
                      </span>
                      <span className="metric-val">
                        <span title="推荐次数">荐 {p.recommended}</span>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="faint" style={{ fontSize: 12, textAlign: "center", padding: "20px 0" }}>
                    No product data yet
                  </div>
                )}
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 16 }}>💬</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    顾客疑虑
                  </span>
                </div>
                {stats.topObjections && stats.topObjections.length > 0 ? (
                  stats.topObjections.slice(0, 5).map((o, i) => (
                    <div key={o.reason} className="metric-row">
                      <span className="metric-key">
                        <span style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 600, minWidth: 16 }}>
                          {i + 1}
                        </span>
                        {o.reason}
                      </span>
                      <span className="metric-val" style={{ color: "var(--rose)" }}>
                        {o.count} 次
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="faint" style={{ fontSize: 12, textAlign: "center", padding: "20px 0" }}>
                    No objection data yet
                  </div>
                )}
              </div>
            </div>
            </>
          )}
        </div>
      )}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 0",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {!loaded && <div className="spinner" />}
        {msgs.map((m, i) => (
          <div key={i} className={`msg-row ${m.role}`}>
            <div className={`msg-avatar ${m.role}`}>
              {m.role === "assistant" ? "✦" : "U"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className={`msg-bubble ${m.role}`}>
                {m.role === "assistant" ? (
                  <ChatMarkdown text={m.content} />
                ) : (
                  m.content
                )}
              </div>
              {m.role === "assistant" && (
                <div style={{ marginTop: 4 }}>
                  <AudioPlayButton text={m.content} size="md" />
                </div>
              )}
              {m.suggested &&
                m.suggested.length > 0 &&
                i === msgs.length - 1 && (
                  <div className="chat-suggest">
                    {m.suggested.map((s) => (
                      <button key={s} onClick={() => streamSend(s)} disabled={loading}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="msg-row assistant">
            <div className="msg-avatar ai">✦</div>
            <div className="msg-bubble ai">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-bar">
        <VoiceInput onText={(t) => streamSend(t)} disabled={loading} />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              streamSend(input);
            }
          }}
          placeholder="Ask about your store..."
          disabled={loading}
        />
        {loading ? (
          <button
            className="btn"
            onClick={() => abort()}
            style={{
              color: "var(--rose)",
              borderColor: "rgba(216,92,110,0.2)",
            }}
          >
            Stop
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => streamSend(input)}
            disabled={!input.trim()}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
