import { useState, useEffect } from "react";
import { api } from "~/api";

interface MarketingFlow {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config?: Record<string, unknown>;
  conditions?: unknown[];
  actions?: unknown[];
  enabled: boolean;
  run_count?: number;
  created_at?: string;
  description?: string;
}

interface FlowRun {
  id: string;
  customer_email: string;
  trigger_event: string;
  status: string;
  executed_at: string;
  error_message?: string;
}

const PRESET_FLOWS = [
  { icon: "👋", name: "Welcome 系列", desc: "新客欢迎3封系列邮件 (Day 0 / 3 / 7)", trigger: "order.created" },
  { icon: "🛒", name: "弃单挽回", desc: "1h / 24h / 72h 三连弃单挽回序列", trigger: "checkout.abandoned" },
  { icon: "🔄", name: "复购提醒", desc: "收货14天后自动复购提醒", trigger: "order.fulfilled" },
  { icon: "💤", name: "沉睡唤醒", desc: "30天 / 60天沉睡客户折扣唤醒", trigger: "customer.dormant" },
  { icon: "📦", name: "物流关怀", desc: "已发货 → 派送中 → 已签收 全流程通知", trigger: "fulfillment.status_changed" },
];

function Skeleton({ w = "100%", h = 20 }: { w?: string; h?: number }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: "var(--bg-raised)", opacity: .5 }} />;
}

function ToggleSwitch({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!enabled); }}
      disabled={disabled}
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none",
        background: enabled ? "var(--mint)" : "var(--border-strong)",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative", transition: "background .2s var(--ease)",
        opacity: disabled ? 0.5 : 1, flexShrink: 0,
      }}
      aria-label={enabled ? "禁用" : "启用"}
    >
      <span style={{
        position: "absolute", top: 2, left: enabled ? 22 : 2,
        width: 20, height: 20, borderRadius: 10,
        background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.15)",
        transition: "left .2s var(--ease)",
      }} />
    </button>
  );
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  sent:    { bg: "var(--mint-soft)",    color: "var(--mint)",    label: "已发送" },
  pending: { bg: "var(--amber-soft)",   color: "var(--amber)",   label: "待处理" },
  failed:  { bg: "var(--rose-soft)",    color: "var(--rose)",    label: "失败" },
  delivered: { bg: "var(--sky-soft)",   color: "var(--sky)",     label: "已送达" },
  opened:  { bg: "var(--violet-soft)",  color: "var(--violet)",  label: "已打开" },
};

export default function Marketing() {
  const [flows, setFlows] = useState<MarketingFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [runs, setRuns] = useState<FlowRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsError, setRunsError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Load flows
  useEffect(() => {
    api<{ success: boolean; flows: MarketingFlow[] }>("/api/marketing/flows").then(d => {
      if (d?.flows) setFlows(d.flows);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Load runs when a flow is selected
  useEffect(() => {
    if (!activeFlowId) { setRuns([]); return; }
    setRunsLoading(true);
    setRunsError("");
    api<{ success: boolean; runs: FlowRun[] }>(`/api/marketing/flows/${activeFlowId}/runs`).then(d => {
      if (d?.runs) setRuns(d.runs);
      else setRunsError("未返回执行记录");
      setRunsLoading(false);
    }).catch(() => { setRunsError("加载失败"); setRunsLoading(false); });
  }, [activeFlowId]);

  async function toggleFlow(flow: MarketingFlow) {
    setTogglingId(flow.id);
    const res = await api<{ success: boolean }>(`/api/marketing/flows/${flow.id}`, {
      method: "PUT",
      body: JSON.stringify({ enabled: !flow.enabled }),
    });
    if (res?.success) {
      setFlows(prev => prev.map(f => f.id === flow.id ? { ...f, enabled: !f.enabled } : f));
    }
    setTogglingId(null);
  }

  const activeFlows = flows.filter(f => f.enabled).length;
  const totalRuns = flows.reduce((s, f) => s + (f.run_count || 0), 0);

  // Merge preset metadata with API data
  const displayFlows = PRESET_FLOWS.map(preset => {
    const apiFlow = flows.find(f => f.trigger_type === preset.trigger || f.name === preset.name);
    return {
      ...preset,
      id: apiFlow?.id || "",
      enabled: apiFlow?.enabled ?? false,
      exists: !!apiFlow,
    };
  });

  return (
    <div>
      <h1 className="page-title">营销自动化</h1>
      <p className="page-subtitle">基于事件的自动化营销流 — 触发器 → 条件 → 动作</p>

      {/* Stats */}
      <div className="kpi-grid" style={{ marginTop: 0, marginBottom: 28 }}>
        <div className="card kpi-card">
          <div className="kpi-accent-line" style={{ background: "var(--mint)" }} />
          <div className="kpi-icon">⚡</div>
          <div className="stat-value sm" style={{ color: "var(--mint)" }}>
            {loading ? "—" : activeFlows}
          </div>
          <div className="stat-label">启用的流</div>
          <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>共 {displayFlows.length} 个预设</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-accent-line" style={{ background: "var(--sky)" }} />
          <div className="kpi-icon">◈</div>
          <div className="stat-value sm" style={{ color: "var(--sky)" }}>
            {loading ? "—" : totalRuns.toLocaleString()}
          </div>
          <div className="stat-label">总执行次数</div>
          <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>累计</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-accent-line" style={{ background: "var(--amber)" }} />
          <div className="kpi-icon">↗</div>
          <div className="stat-value sm" style={{ color: "var(--amber)" }}>
            {loading ? "—" : "5"}
          </div>
          <div className="stat-label">预设模板</div>
          <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>开箱即用</div>
        </div>
      </div>

      {/* Flow Cards */}
      {loading ? (
        <div className="detail-grid" style={{ marginTop: 0 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div className="card" key={i} style={{ opacity: 0.6 }}>
              <Skeleton w={40} h={40} />
              <div style={{ marginTop: 12 }}><Skeleton w="70%" h={18} /></div>
              <div style={{ marginTop: 6 }}><Skeleton w="90%" h={14} /></div>
              <div style={{ marginTop: 12 }}><Skeleton w={44} h={24} /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="detail-grid" style={{ marginTop: 0 }}>
          {displayFlows.map(flow => {
            const isActive = activeFlowId === flow.id;
            return (
              <div
                className="card"
                key={flow.trigger}
                style={{
                  cursor: flow.exists ? "pointer" : "default",
                  borderColor: isActive ? "var(--violet)" : undefined,
                  boxShadow: isActive ? "0 0 0 2px var(--violet)" : undefined,
                  opacity: flow.exists ? 1 : 0.5,
                  transition: "all .2s var(--ease)",
                }}
                onClick={() => {
                  if (!flow.exists) return;
                  setActiveFlowId(isActive ? null : flow.id);
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ fontSize: 28 }}>{flow.icon}</div>
                  {flow.exists && (
                    <ToggleSwitch
                      enabled={flow.enabled}
                      onChange={() => {
                        const f = flows.find(x => x.id === flow.id);
                        if (f) toggleFlow(f);
                      }}
                      disabled={togglingId === flow.id}
                    />
                  )}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{flow.name}</h3>
                <div className="faint" style={{ fontSize: 12 }}>{flow.desc}</div>
                <div style={{ marginTop: 10 }}>
                  {flow.exists ? (
                    <span className={`badge ${flow.enabled ? "badge-mint" : ""}`} style={!flow.enabled ? { background: "var(--bg-raised)", color: "var(--text-tertiary)" } : {}}>
                      {flow.enabled ? "运行中" : "已暂停"}
                    </span>
                  ) : (
                    <span className="badge" style={{ background: "var(--bg-raised)", color: "var(--text-tertiary)" }}>
                      未创建
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Execution History */}
      {activeFlowId && (
        <div className="card reveal-1" style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>
              执行历史
            </h3>
            <button
              className="btn"
              onClick={() => { setActiveFlowId(null); setRuns([]); }}
              style={{ fontSize: 12 }}
            >
              ✕ 关闭
            </button>
          </div>

          {runsLoading ? (
            <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 12 }}>
              <Skeleton h={14} />
              <Skeleton h={14} w="80%" />
              <Skeleton h={14} w="60%" />
              <Skeleton h={14} />
            </div>
          ) : runsError ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">⚠</div>
              <div className="empty-title">加载失败</div>
              <div className="empty-desc">{runsError}</div>
              <button className="btn" onClick={() => setActiveFlowId(activeFlowId)}>重试</button>
            </div>
          ) : runs.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">◈</div>
              <div className="empty-title">暂无执行记录</div>
              <div className="empty-desc">启用该流后，匹配的触发事件将自动执行并记录在此</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    {["Customer Email", "Trigger Event", "Status", "Executed At"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r, i) => {
                    const badge = STATUS_BADGE[r.status] || STATUS_BADGE.pending;
                    return (
                      <tr key={r.id || i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", fontSize: 12 }}>{r.customer_email || "—"}</td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-secondary)" }}>{r.trigger_event || "—"}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span className="badge" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}20` }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                          {r.executed_at ? new Date(r.executed_at).toLocaleString("zh-CN") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!activeFlowId && !loading && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-tertiary)", fontSize: 13 }}>
          点击卡片查看执行历史 · 使用开关控制流启用状态
        </div>
      )}
    </div>
  );
}
