import { useState, useEffect, useRef } from "react";
import { api } from "~/api";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ObsSyncStats {
  products: number;
  orders: number;
  customers: number;
}

interface ObsAIStats {
  calls: number;
  tokens: number;
}

interface ObsLogEntry {
  timestamp: string;
  module: string;
  message: string;
  level: string;
}

interface ObsSummary {
  success: boolean;
  sync: ObsSyncStats;
  ai: ObsAIStats;
  errors: ObsLogEntry[];
  uptime: string;
}

interface ObsLogsResponse {
  success: boolean;
  logs: ObsLogEntry[];
  total: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function Skeleton({ w = "100%", h = 20 }: { w?: string; h?: number }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: "var(--bg-raised)", opacity: 0.5 }} />;
}

function KpiCard({ icon, accent, label, value, sub }: {
  icon: string;
  accent: string;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="card kpi-card">
      <div className="kpi-accent-line" style={{ background: accent }} />
      <div className="kpi-icon" style={{ color: accent }}>{icon}</div>
      <div className="stat-value sm" style={{ color: accent }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Observability() {
  const [summary, setSummary] = useState<ObsSummary | null>(null);
  const [logs, setLogs] = useState<ObsLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [sum, logRes] = await Promise.all([
        api<ObsSummary>("/api/admin/observability/summary"),
        api<ObsLogsResponse>("/api/admin/observability/logs?level=error&limit=20"),
      ]);
      if (!mountedRef.current) return;
      if (sum) setSummary(sum);
      if (logRes?.logs) setLogs(logRes.logs);
    } catch {
      // silently handle
    }
    if (!mountedRef.current) return;
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fmt = (n: number) => (loading ? "—" : n.toLocaleString());

  const totalSync = summary
    ? summary.sync.products + summary.sync.orders + summary.sync.customers
    : 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h1 className="page-title">可观测面板</h1>
        <button
          className="btn"
          onClick={fetchData}
          disabled={refreshing}
          style={{ opacity: refreshing ? 0.6 : 1 }}
        >
          {refreshing ? "⟳ 刷新中..." : "⟳ 刷新"}
        </button>
      </div>
      <p className="page-subtitle">实时监控您的服务运行状态 — Sync Events / AI 调用 / 错误日志</p>

      {/* KPI Cards */}
      <div className="kpi-grid reveal-1">
        <KpiCard
          icon="☷"
          accent="var(--sky)"
          label="Sync Events"
          value={loading ? <Skeleton h={24} w="60%" /> : fmt(totalSync)}
          sub={`Products: ${fmt(summary?.sync.products ?? 0)} · Orders: ${fmt(summary?.sync.orders ?? 0)} · Customers: ${fmt(summary?.sync.customers ?? 0)}`}
        />
        <KpiCard
          icon="◇"
          accent="var(--violet)"
          label="AI Calls"
          value={loading ? <Skeleton h={24} w="60%" /> : fmt(summary?.ai.calls ?? 0)}
          sub={`Tokens: ${fmt(summary?.ai.tokens ?? 0)}`}
        />
        <KpiCard
          icon="⚠"
          accent="var(--rose)"
          label="Errors"
          value={loading ? <Skeleton h={24} w="60%" /> : fmt(summary?.errors.length ?? 0)}
          sub={`Uptime: ${summary?.uptime ?? "—"}`}
        />
      </div>

      {/* Error Log Table */}
      <div className="card reveal-2" style={{ marginTop: 28 }}>
        <h3 className="section-title">
          最近错误日志
          <span className="faint" style={{ fontSize: 13, fontWeight: 400, marginLeft: 8 }}>
            — 过去24小时
          </span>
        </h3>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton h={32} />
            <Skeleton h={32} />
            <Skeleton h={32} />
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 20px" }}>
            <div className="empty-icon">✓</div>
            <div className="empty-title">暂无错误日志</div>
            <div className="empty-desc">过去24小时内未发现错误日志，系统运行正常。</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    时间
                  </th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    模块
                  </th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    级别
                  </th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    消息
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((entry, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-raised)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span className="badge badge-amber">{entry.module || "unknown"}</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        className="badge"
                        style={{
                          background: entry.level === "error" ? "var(--rose-soft)" : "var(--amber-soft)",
                          color: entry.level === "error" ? "var(--rose)" : "var(--amber)",
                          border: entry.level === "error" ? "1px solid rgba(216,92,110,0.15)" : "1px solid var(--amber-border)",
                        }}
                      >
                        {entry.level || "info"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--text-primary)", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.message || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="faint" style={{ marginTop: 12, fontSize: 12, textAlign: "right" }}>
              共 {logs.length} 条记录
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
