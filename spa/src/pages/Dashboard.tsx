import { useState, useEffect, useRef, type ReactNode } from "react";
import { api } from "~/api";

interface AISummary { date: string; replies_generated: number; replies_published: number; replies_failed: number; discount_codes_sent: number; recovery_revenue: number; chat_conversations: number; purchase_intents: number; discounts_issued: number; products_recommended: number; content_generated: number; content_published: number; total_api_calls: number; total_tokens_in: number; total_tokens_out: number; estimated_cost_usd: number; returns_handled: number; exchange_recommendations: number; }
interface AttrChannel { channel: string; attributed_revenue: number; percentage: number; touchpoint_count: number; }

function Counter({ v }: { v: number }) { const [d, setD] = useState(0); const r = useRef(false); useEffect(() => { if (r.current) return; r.current = true; const s = performance.now(); function t(n: number) { const p = Math.min((n - s) / 1500, 1); setD(Math.round(v * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(t); } requestAnimationFrame(t); }, [v]); return <>{d.toLocaleString()}</>; }

function Stat({ v, l, c }: { v: ReactNode; l: string; c?: string }) {
  return <div className="stat-item"><div className="stat-value" style={{ color: c || "var(--text-primary)" }}>{v}</div><div className="stat-label">{l}</div></div>;
}
function Skeleton({ w = "100%", h = 20 }: { w?: string; h?: number }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: "var(--bg-raised)", opacity: .5 }} />;
}

export default function Dashboard() {
  const [s, setS] = useState<AISummary | null>(null);
  const [attr, setAttr] = useState<{ total_revenue: number; total_orders: number; channel_summary: AttrChannel[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const [usage, setUsage] = useState<{monthly_credits_used:number;monthly_credits_total:number;plan:string}|null>(null);
  useEffect(() => { Promise.all([
    api<{ summary: AISummary }>("/api/analytics/ai-summary?days=7"),
    api<{ total_revenue: number; total_orders: number; channel_summary: AttrChannel[] }>("/api/analytics/attribution?days=30&cached=true"),
    api<{ balances: {provider:string;total_balance:number;currency:string}[] }>("/api/llm/balance"),
    api<{ monthly_credits_used:number; monthly_credits_total:number; plan:string }>("/api/shop/usage"),
  ]).then(([ai, at, bal, us]) => {
    if (ai?.summary) { const s = ai.summary; if (bal?.balances?.length) { const ds = bal.balances.find(b=>b.provider==="deepseek"); if (ds) s.estimated_cost_usd = Math.max(0, ds.total_balance); } setS(s); }
    if (at?.channel_summary) setAttr(at);
    if (us) setUsage(us);
    setLoading(false);
  }).catch(() => setLoading(false)); }, []);

  const vals = s || { date: "—", replies_generated: 0, replies_published: 0, replies_failed: 0, discount_codes_sent: 0, recovery_revenue: 0, chat_conversations: 0, purchase_intents: 0, discounts_issued: 0, products_recommended: 0, content_generated: 0, content_published: 0, total_api_calls: 0, total_tokens_in: 0, total_tokens_out: 0, estimated_cost_usd: 0, returns_handled: 0, exchange_recommendations: 0 };
  const fmt = (n: number) => loading ? "—" : n.toLocaleString();
  const fmt$ = (n: number) => loading ? "—" : `$${n.toLocaleString()}`;

  return (
    <div>
      <h1 className="page-title">Daily Briefing</h1>
      <p className="page-subtitle">Your AI operations, measured and attributed — last 7 days</p>

      <div className="hero-card reveal-1">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span className="pulse" /><span className="badge badge-mint">Live</span>
          <span className="faint" style={{ fontSize: 12 }}>{loading ? "Loading..." : s?.date || "—"}</span>
        </div>
        <div className="stat-grid">
          <Stat v={loading ? <Skeleton h={28} /> : <Counter v={vals.total_api_calls} />} l="AI Calls" c="var(--sky)" />
          <Stat v={loading ? <Skeleton h={28} /> : <Counter v={vals.replies_published} />} l="Replies Posted" c="var(--amber)" />
          <Stat v={loading ? <Skeleton h={28} /> : <Counter v={vals.content_generated} />} l="Content Pieces" c="var(--violet)" />
          <Stat v={loading ? <Skeleton h={28} /> : <span className="mono">$<Counter v={Math.round(vals.recovery_revenue)} /></span>} l="Recovery Revenue" c="var(--mint)" />
          <Stat v={loading ? <Skeleton h={28} /> : <span className="mono">${vals.estimated_cost_usd.toFixed(2)}</span>} l="AI Balance" c="var(--text-tertiary)" />
          {usage && <Stat v={loading ? <Skeleton h={28} /> : <span className="mono">{usage.monthly_credits_used}/{usage.monthly_credits_total}</span>} l={`Credits · ${usage.plan}`} c="var(--amber)" />}
        </div>
      </div>

      <div className="kpi-grid reveal-2">
        {[
          ["◇", "var(--sky)", "Sales Chats", loading ? "—" : fmt(vals.chat_conversations), `${fmt(vals.purchase_intents)} signals · ${fmt(vals.discounts_issued)} discounts`],
          ["★", "var(--amber)", "Auto Replies", loading ? "—" : fmt(vals.replies_generated), `${fmt(vals.replies_published)} published · ${fmt(vals.discount_codes_sent)} codes`],
          ["✎", "var(--violet)", "Content Generated", loading ? "—" : fmt(vals.content_generated), `${fmt(vals.content_published)} published`],
          ["↩", "var(--mint)", "Returns Handled", loading ? "—" : fmt(vals.returns_handled), `${fmt(vals.exchange_recommendations)} exchanges`],
        ].map(([icon, accent, label, value, sub]) => (
          <div className="card kpi-card" key={label as string}>
            <div className="kpi-accent-line" style={{ background: accent as string }} />
            <div className="kpi-icon" style={{ color: accent as string }}>{icon as string}</div>
            <div className="stat-value sm" style={{ color: accent as string }}>{loading ? <Skeleton h={24} w="60%" /> : value as string}</div>
            <div className="stat-label">{label as string}</div>
            <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>{sub as string}</div>
          </div>
        ))}
      </div>

      <div className="card reveal-3" style={{ marginTop: 28 }}>
        <h3 className="section-title">Channel Attribution <span className="faint" style={{ fontSize: 13, fontWeight: 400 }}>— 30 days</span></h3>
        {loading ? <Skeleton h={60} /> : (attr && attr.channel_summary.length > 0 ? (
          <>
            <div className="stat-grid" style={{ marginBottom: 20 }}>
              {attr.channel_summary.map(ch => (
                <div key={ch.channel}><div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-secondary)", marginBottom: 6 }}>{ch.channel}</div>
                  <div className="stat-value sm">${ch.attributed_revenue.toLocaleString()}</div>
                  <div className="faint" style={{ fontSize: 11 }}>{ch.percentage}% · {ch.touchpoint_count} tp</div>
                  <div className="attr-bar-bg"><div className="attr-bar-fill" style={{ width: `${ch.percentage}%`, background: "var(--amber)" }} /></div>
                </div>))}
            </div>
            <div className="faint" style={{ fontSize: 12 }}>Total: ${attr.total_revenue?.toLocaleString()} from {attr.total_orders} orders</div>
          </>
        ) : <div className="faint" style={{ textAlign: "center", padding: 20 }}>Attribution data will appear after orders are synced</div>)}
      </div>

      <div className="detail-grid reveal-4">
        <div className="card"><h3 className="section-title">Auto Reply</h3>
          <div className="metric-row"><span className="metric-key">✅ Published</span><span className="metric-val">{loading ? "—" : fmt(vals.replies_published)}</span></div>
          <div className="metric-row"><span className="metric-key">🏷️ Codes sent</span><span className="metric-val">{loading ? "—" : fmt(vals.discount_codes_sent)}</span></div>
          <div className="metric-row"><span className="metric-key">💰 Recovery revenue</span><span className="metric-val">{loading ? "—" : fmt$(vals.recovery_revenue)}</span></div>
        </div>
        <div className="card"><h3 className="section-title">Sales Agent</h3>
          <div className="metric-row"><span className="metric-key">💬 Conversations</span><span className="metric-val">{loading ? "—" : fmt(vals.chat_conversations)}</span></div>
          <div className="metric-row"><span className="metric-key">🎯 Purchase intents</span><span className="metric-val">{loading ? "—" : fmt(vals.purchase_intents)}</span></div>
          <div className="metric-row"><span className="metric-key">🛍️ Recommended</span><span className="metric-val">{loading ? "—" : fmt(vals.products_recommended)}</span></div>
        </div>
        <div className="card"><h3 className="section-title">Content Factory</h3>
          <div className="metric-row"><span className="metric-key">📄 Generated</span><span className="metric-val">{loading ? "—" : fmt(vals.content_generated)}</span></div>
          <div className="metric-row"><span className="metric-key">📢 Published</span><span className="metric-val">{loading ? "—" : fmt(vals.content_published)}</span></div>
        </div>
        <div className="card"><h3 className="section-title">AI Usage</h3>
          <div className="metric-row"><span className="metric-key">🔢 API calls</span><span className="metric-val">{loading ? "—" : fmt(vals.total_api_calls)}</span></div>
          <div className="metric-row"><span className="metric-key">💵 Est. cost</span><span className="metric-val">{loading ? "—" : `$${vals.estimated_cost_usd.toFixed(2)}`}</span></div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3 className="section-title">Quick Actions</h3>
        <div className="btn-group">
          {[
            ["Auto Reply","/review-auto-reply"],
            ["Content Factory","/content-factory"],
            ["Cart Recovery","/cart-recovery"],
            ["Returns","/returns"],
            ["Analytics","/analytics"],
            ["Plans","/plans"]
          ].map(([a, href]) => (
            <a key={a} href={`/app${href}`} className="btn">{a}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
