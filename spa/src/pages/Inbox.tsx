// ============================================================================
// Inbox — Merchant customer conversation inbox (Route: /inbox)
// ============================================================================
import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "~/api";

// ── Types ─────────────────────────────────────────────────────────────────
interface Conversation {
  id: string;
  customer_name: string;
  customer_email: string;
  last_message: string;
  last_message_at: string;
  status: "active" | "resolved";
}

interface Message {
  id: string;
  role: "customer" | "ai" | "merchant";
  content: string;
  created_at: string;
}

interface ConversationDetail extends Conversation {
  messages: Message[];
}

// ── Helpers ───────────────────────────────────────────────────────────────
function timeAgo(ts: string): string {
  if (!ts) return "";
  const d = new Date(ts);
  const now = Date.now();
  const sec = Math.floor((now - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

const roleLabel: Record<string, string> = {
  customer: "👤 Customer",
  ai: "✦ Vela AI",
  merchant: "🛒 You",
};

// ── Component ─────────────────────────────────────────────────────────────
export default function Inbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"active" | "resolved">("active");
  const msgEndRef = useRef<HTMLDivElement>(null);

  // ── Fetch conversation list ───────────────────────────────────────────
  const fetchList = useCallback(() => {
    api<{ conversations: Conversation[] }>(
      `/api/inbox/conversations?status=${statusFilter}`
    ).then((d) => {
      if (d?.conversations) setConversations(d.conversations);
      setListLoading(false);
    }).catch(() => setListLoading(false));
  }, [statusFilter]);

  // initial load
  useEffect(() => { fetchList(); }, [fetchList]);

  // poll every 10s
  useEffect(() => {
    const iv = setInterval(fetchList, 10_000);
    return () => clearInterval(iv);
  }, [fetchList]);

  // ── Fetch conversation detail ─────────────────────────────────────────
  const fetchDetail = useCallback((id: string) => {
    setDetailLoading(true);
    api<{ conversation: ConversationDetail }>(`/api/inbox/conversations/${id}`)
      .then((d) => {
        if (d?.conversation) setDetail(d.conversation);
        setDetailLoading(false);
      })
      .catch(() => setDetailLoading(false));
  }, []);

  useEffect(() => {
    if (selectedId) fetchDetail(selectedId);
    else setDetail(null);
  }, [selectedId, fetchDetail]);

  // poll detail when a conversation is selected
  useEffect(() => {
    if (!selectedId) return;
    const iv = setInterval(() => fetchDetail(selectedId), 10_000);
    return () => clearInterval(iv);
  }, [selectedId, fetchDetail]);

  // scroll to bottom on new messages
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages]);

  // ── Send reply ────────────────────────────────────────────────────────
  const sendReply = async () => {
    if (!reply.trim() || !selectedId || sending) return;
    setSending(true);
    const ok = await api(`/api/inbox/conversations/${selectedId}/reply`, {
      method: "POST",
      body: JSON.stringify({ message: reply.trim() }),
    });
    if (ok) {
      setReply("");
      fetchDetail(selectedId);
      fetchList();
    }
    setSending(false);
  };

  // ── Resolve conversation ──────────────────────────────────────────────
  const resolveConv = async () => {
    if (!selectedId || resolving) return;
    setResolving(true);
    const ok = await api(`/api/inbox/conversations/${selectedId}/resolve`, {
      method: "POST",
    });
    if (ok) {
      fetchList();
      setDetail((prev) => prev ? { ...prev, status: "resolved" } : prev);
    }
    setResolving(false);
  };

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      <style>{`
        .inbox-layout { display: flex; flex: 1; min-height: 0; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--bg-base); box-shadow: var(--shadow-sm); }
        .inbox-list { width: 300px; min-width: 300px; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: var(--bg-raised); }
        .inbox-list-header { padding: 16px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .inbox-list-title { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .inbox-filter { display: flex; gap: 4px; }
        .inbox-filter-btn { padding: 4px 12px; border-radius: 100px; border: 1px solid var(--border); background: var(--bg-base); font-size: 11px; font-family: var(--font-body); font-weight: 600; color: var(--text-secondary); cursor: pointer; transition: all .15s var(--ease); }
        .inbox-filter-btn.active { background: var(--amber-soft); color: var(--amber); border-color: var(--amber-border); }
        .inbox-filter-btn:hover { border-color: var(--amber-border); color: var(--amber); }
        .inbox-list-body { flex: 1; overflow-y: auto; }
        .inbox-item { padding: 14px 18px; border-bottom: 1px solid var(--border-subtle); cursor: pointer; transition: background .12s var(--ease); display: flex; flex-direction: column; gap: 4px; }
        .inbox-item:hover { background: rgba(0,0,0,0.02); }
        .inbox-item.active { background: var(--amber-soft); border-left: 3px solid var(--amber); padding-left: 15px; }
        .inbox-item-top { display: flex; justify-content: space-between; align-items: center; }
        .inbox-item-name { font-weight: 600; font-size: 13px; color: var(--text-primary); }
        .inbox-item-time { font-size: 11px; color: var(--text-tertiary); font-family: var(--font-mono); }
        .inbox-item-msg { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
        .inbox-item-badge { display: inline-block; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
        .inbox-detail { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .inbox-detail-header { padding: 16px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--bg-base); }
        .inbox-detail-customer { display: flex; align-items: center; gap: 10px; }
        .inbox-detail-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--bg-raised); display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--text-secondary); border: 1px solid var(--border); }
        .inbox-detail-name { font-weight: 600; font-size: 14px; color: var(--text-primary); }
        .inbox-detail-email { font-size: 12px; color: var(--text-tertiary); }
        .inbox-detail-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
        .inbox-msg { display: flex; gap: 10px; max-width: 80%; animation: msgIn .3s cubic-bezier(.34,1.56,.64,1) both; }
        .inbox-msg.merchant { align-self: flex-end; flex-direction: row-reverse; }
        .inbox-msg-avatar { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
        .inbox-msg-avatar.customer { background: var(--bg-raised); color: var(--text-secondary); border: 1px solid var(--border); }
        .inbox-msg-avatar.ai { background: var(--amber-soft); color: var(--amber); }
        .inbox-msg-avatar.merchant { background: var(--amber); color: #fff; }
        .inbox-msg-bubble { padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.65; word-break: break-word; }
        .inbox-msg-bubble.customer { background: var(--bg-raised); border: 1px solid var(--border); border-bottom-left-radius: 4px; color: var(--text-primary); }
        .inbox-msg-bubble.ai { background: var(--amber-soft); border: 1px solid var(--amber-border); border-bottom-left-radius: 4px; color: var(--text-primary); }
        .inbox-msg-bubble.merchant { background: var(--amber); color: #fff; border-bottom-right-radius: 4px; }
        .inbox-msg-time { font-size: 10px; color: var(--text-tertiary); margin-top: 3px; }
        .inbox-msg-time.merchant { text-align: right; color: rgba(255,255,255,0.7); }
        .inbox-reply-bar { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; align-items: flex-end; background: var(--bg-base); }
        .inbox-reply-bar textarea { flex: 1; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-strong); background: var(--bg-deep); color: var(--text-primary); font-family: var(--font-body); font-size: 13px; outline: none; resize: none; min-height: 44px; max-height: 120px; line-height: 1.5; transition: all .2s var(--ease); }
        .inbox-reply-bar textarea:focus { border-color: var(--amber); box-shadow: 0 0 0 3px var(--amber-soft); }
        .inbox-reply-bar textarea::placeholder { color: var(--text-tertiary); }
        .inbox-detail-empty { flex: 1; display: flex; align-items: center; justify-content: center; }
        .inbox-count { font-size: 11px; color: var(--text-tertiary); font-weight: 500; }
        @keyframes msgIn { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (max-width: 768px) {
          .inbox-list { width: 100%; min-width: 0; border-right: none; }
          .inbox-detail { display: none; }
          .inbox-detail.open { display: flex; position: absolute; inset: 0; z-index: 10; }
        }
      `}</style>

      <div style={{ marginBottom: 16 }}>
        <h1 className="page-title">Inbox</h1>
        <p className="page-subtitle">Manage customer conversations across your store</p>
      </div>

      <div className="inbox-layout">
        {/* ── Left: Conversation List ─────────────────────────────────── */}
        <div className="inbox-list">
          <div className="inbox-list-header">
            <span className="inbox-list-title">Conversations</span>
            <div className="inbox-filter">
              <button
                className={`inbox-filter-btn${statusFilter === "active" ? " active" : ""}`}
                onClick={() => { setStatusFilter("active"); setSelectedId(null); setListLoading(true); }}
              >
                Active
              </button>
              <button
                className={`inbox-filter-btn${statusFilter === "resolved" ? " active" : ""}`}
                onClick={() => { setStatusFilter("resolved"); setSelectedId(null); setListLoading(true); }}
              >
                Resolved
              </button>
            </div>
          </div>
          <div className="inbox-list-body">
            {listLoading ? (
              <div className="spinner" style={{ margin: "40px auto" }} />
            ) : conversations.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-icon">✉</div>
                <div className="empty-title">No conversations</div>
                <div className="empty-desc">
                  {statusFilter === "active"
                    ? "No active conversations at the moment."
                    : "No resolved conversations yet."}
                </div>
              </div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  className={`inbox-item${selectedId === c.id ? " active" : ""}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="inbox-item-top">
                    <span className="inbox-item-name">
                      {c.customer_name || c.customer_email}
                    </span>
                    <span className="inbox-item-time">{timeAgo(c.last_message_at)}</span>
                  </div>
                  <div className="inbox-item-msg">{truncate(c.last_message, 60)}</div>
                  <div>
                    <span
                      className="inbox-item-badge"
                      style={{
                        background: c.status === "active" ? "var(--amber-soft)" : "var(--mint-soft)",
                        color: c.status === "active" ? "var(--amber)" : "var(--mint)",
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ padding: "8px 18px", borderTop: "1px solid var(--border-subtle)" }}>
            <span className="inbox-count">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* ── Right: Conversation Detail ─────────────────────────────── */}
        <div className="inbox-detail">
          {!selectedId ? (
            <div className="inbox-detail-empty">
              <div className="empty-state">
                <div className="empty-icon">✉</div>
                <div className="empty-title">Select a conversation</div>
                <div className="empty-desc">Choose a conversation from the list to view messages.</div>
              </div>
            </div>
          ) : detailLoading ? (
            <div className="spinner" />
          ) : detail ? (
            <>
              {/* Header */}
              <div className="inbox-detail-header">
                <div className="inbox-detail-customer">
                  <div className="inbox-detail-avatar">👤</div>
                  <div>
                    <div className="inbox-detail-name">
                      {detail.customer_name || detail.customer_email}
                    </div>
                    <div className="inbox-detail-email">{detail.customer_email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    className="inbox-item-badge"
                    style={{
                      background: detail.status === "active" ? "var(--amber-soft)" : "var(--mint-soft)",
                      color: detail.status === "active" ? "var(--amber)" : "var(--mint)",
                    }}
                  >
                    {detail.status}
                  </span>
                  {detail.status === "active" && (
                    <button
                      className="btn"
                      onClick={resolveConv}
                      disabled={resolving}
                      style={{
                        color: "var(--mint)",
                        borderColor: "var(--mint-border)",
                        background: "var(--mint-soft)",
                      }}
                    >
                      {resolving ? "Resolving…" : "✓ Resolve"}
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="inbox-detail-body">
                {detail.messages.length === 0 ? (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <div className="empty-icon">💬</div>
                    <div className="empty-title">No messages yet</div>
                    <div className="empty-desc">This conversation has no messages.</div>
                  </div>
                ) : (
                  detail.messages.map((m) => (
                    <div key={m.id} className={`inbox-msg ${m.role}`}>
                      <div className={`inbox-msg-avatar ${m.role}`}>
                        {m.role === "customer" ? "👤" : m.role === "ai" ? "✦" : "🛒"}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {roleLabel[m.role] || m.role}
                        </div>
                        <div className={`inbox-msg-bubble ${m.role}`}>
                          {m.content}
                        </div>
                        <div className={`inbox-msg-time ${m.role}`}>
                          {m.created_at ? new Date(m.created_at).toLocaleString() : ""}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={msgEndRef} />
              </div>

              {/* Reply bar (only for active) */}
              {detail.status === "active" && (
                <div className="inbox-reply-bar">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                    placeholder="Type your reply…"
                    rows={1}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={sendReply}
                    disabled={!reply.trim() || sending}
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⚠</div>
              <div className="empty-title">Failed to load</div>
              <div className="empty-desc">Could not load conversation. Try again.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
