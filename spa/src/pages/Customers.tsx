import { useState, useEffect } from "react";
import { api } from "~/api";

interface SegmentStat {
  segment: string;
  count: number;
  percentage: number;
}

interface CustomerItem {
  email: string;
  name: string;
  orders: number;
  total_spent: number;
  last_order: string;
}

interface LTVStats {
  total_customers: number;
  total_predicted_ltv: number;
  avg_ltv: number;
  churn_risk_distribution: { low: number; medium: number; high: number };
}

interface CustomerInsightItem {
  customer_email: string;
  customer_name: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string;
  predicted_ltv: number;
  churn_risk_score: number;
  churn_risk_level: string;
  confidence: string;
}

const SEGMENTS = ["vip", "active", "dormant", "lost", "new"] as const;
type Segment = typeof SEGMENTS[number];

const COLORS: Record<Segment, { main: string; soft: string; border: string }> = {
  vip:    { main: "var(--rose)",          soft: "var(--rose-soft)",          border: "rgba(216,92,110,0.15)" },
  active: { main: "var(--mint)",          soft: "var(--mint-soft)",          border: "var(--mint-border)" },
  dormant:{ main: "var(--amber)",         soft: "var(--amber-soft)",         border: "var(--amber-border)" },
  lost:   { main: "var(--text-tertiary)", soft: "rgba(154,160,176,0.08)",    border: "rgba(154,160,176,0.15)" },
  new:    { main: "var(--sky)",           soft: "var(--sky-soft)",           border: "rgba(59,138,217,0.15)" },
};

const NAMES: Record<Segment, string> = {
  vip: "VIP", active: "活跃", dormant: "沉睡", lost: "流失", new: "新客",
};

const DESCS: Record<Segment, string> = {
  vip: "高价值客户 · 专属折扣", active: "近期活跃 · 新品推荐", dormant: "30-90天未购 · 折扣唤醒",
  lost: "90天+流失 · 大力度挽回", new: "新注册 · Welcome系列",
};

function Skeleton({ w = "100%", h = 20 }: { w?: string; h?: number }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: "var(--bg-raised)", opacity: .5 }} />;
}

export default function Customers() {
  const [stats, setStats] = useState<SegmentStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState<Segment | null>(null);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  // LTV & Churn insight states
  const [ltvStats, setLtvStats] = useState<LTVStats | null>(null);
  const [ltvLoading, setLtvLoading] = useState(false);
  const [insightMap, setInsightMap] = useState<Map<string, CustomerInsightItem>>(new Map());
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    api<{ success: boolean; segments: SegmentStat[] }>("/api/customers/segments").then(d => {
      if (d?.segments) setStats(d.segments);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Fetch LTV insights & stats on page load
  useEffect(() => {
    setLtvLoading(true);
    Promise.all([
      api<LTVStats>("/api/customers/insights/stats"),
      api<{ insights: CustomerInsightItem[] }>("/api/customers/insights?sort=ltv&limit=50"),
    ]).then(([statsData, insightsData]) => {
      if (statsData) setLtvStats(statsData);
      if (insightsData?.insights) {
        const map = new Map<string, CustomerInsightItem>();
        insightsData.insights.forEach(item => map.set(item.customer_email, item));
        setInsightMap(map);
      }
      setLtvLoading(false);
    }).catch(() => setLtvLoading(false));
  }, []);

  useEffect(() => {
    if (!activeSegment) { setCustomers([]); return; }
    setListLoading(true);
    setListError("");
    api<{ success: boolean; customers: CustomerItem[] }>(`/api/customers/segments/${activeSegment}`).then(d => {
      if (d?.customers) setCustomers(d.customers);
      else setListError("No customer data returned");
      setListLoading(false);
    }).catch(() => { setListError("Failed to load customers"); setListLoading(false); });
  }, [activeSegment]);

  const total = stats.reduce((s, x) => s + x.count, 0);

  // Lookup LTV insight for a customer by email
  const getInsight = (email: string): CustomerInsightItem | undefined => insightMap.get(email);

  // Get churn risk color
  const churnColor = (level: string) =>
    level === "high" ? "var(--rose)" : level === "medium" ? "var(--amber)" : "var(--mint)";

  // Get churn risk dot
  const churnDot = (level: string) =>
    level === "high" ? "🔴" : level === "medium" ? "🟡" : "🟢";

  // Handle row click → fetch AI explanation
  const handleRowClick = async (email: string) => {
    if (expandedEmail === email) { setExpandedEmail(null); setAiExplanation(""); return; }
    setExpandedEmail(email);
    setAiExplanation("");
    setAiLoading(true);
    const data = await api<{ explanation: string }>(`/api/customers/insights/${encodeURIComponent(email)}/explain`);
    if (data?.explanation) setAiExplanation(data.explanation);
    else setAiExplanation("AI 解读暂不可用，请稍后重试。");
    setAiLoading(false);
  };

  return (
    <div>
      <h1 className="page-title">客户运营</h1>
      <p className="page-subtitle">RFM 客户分层 — 基于购买行为的智能分层与精准营销</p>

      {/* LTV & Churn Overview Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        marginBottom: 24,
      }}>
        {/* Total Customers */}
        <div className="card" style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10,
          padding: "20px 24px", textAlign: "center",
        }}>
          <div className="kpi-accent-line" style={{ background: "var(--sky)" }} />
          <div className="stat-value sm" style={{ color: "var(--sky)", fontSize: 30, marginBottom: 4 }}>
            {ltvLoading ? <Skeleton w="60%" h={28} /> : (ltvStats?.total_customers ?? "—").toLocaleString()}
          </div>
          <div className="stat-label">总客户数</div>
        </div>

        {/* Total Predicted LTV */}
        <div className="card" style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10,
          padding: "20px 24px", textAlign: "center",
        }}>
          <div className="kpi-accent-line" style={{ background: "var(--mint)" }} />
          <div className="stat-value sm" style={{ color: "var(--mint)", fontSize: 30, marginBottom: 4 }}>
            {ltvLoading ? <Skeleton w="60%" h={28} /> : `$${(ltvStats?.total_predicted_ltv ?? 0).toLocaleString()}`}
          </div>
          <div className="stat-label">总预测 LTV</div>
        </div>

        {/* Average LTV */}
        <div className="card" style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10,
          padding: "20px 24px", textAlign: "center",
        }}>
          <div className="kpi-accent-line" style={{ background: "var(--amber)" }} />
          <div className="stat-value sm" style={{ color: "var(--amber)", fontSize: 30, marginBottom: 4 }}>
            {ltvLoading ? <Skeleton w="60%" h={28} /> : `$${(ltvStats?.avg_ltv ?? 0).toLocaleString()}`}
          </div>
          <div className="stat-label">平均 LTV</div>
        </div>

        {/* High Churn Risk */}
        <div className="card" style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10,
          padding: "20px 24px", textAlign: "center",
        }}>
          <div className="kpi-accent-line" style={{ background: "var(--rose)" }} />
          <div className="stat-value sm" style={{ color: "var(--rose)", fontSize: 30, marginBottom: 4 }}>
            {ltvLoading ? <Skeleton w="60%" h={28} /> : (ltvStats?.churn_risk_distribution?.high ?? "—").toLocaleString()}
          </div>
          <div className="stat-label">高风险客户</div>
        </div>
      </div>

      {/* Segment Cards */}
      <div className="kpi-grid" style={{ marginTop: 0, marginBottom: 28 }}>
        {loading
          ? SEGMENTS.map(s => (
              <div className="card kpi-card" key={s} style={{ cursor: "default", opacity: 0.6 }}>
                <div className="kpi-icon"><Skeleton w={44} h={22} /></div>
                <div style={{ marginTop: 8 }}><Skeleton w="60%" h={28} /></div>
                <div style={{ marginTop: 6 }}><Skeleton w="40%" h={14} /></div>
              </div>
            ))
          : stats.map(stat => {
              const seg = stat.segment as Segment;
              const c = COLORS[seg] || COLORS.lost;
              const isActive = activeSegment === seg;
              return (
                <div
                  className="card kpi-card"
                  key={seg}
                  onClick={() => setActiveSegment(isActive ? null : seg)}
                  style={{
                    cursor: "pointer",
                    borderColor: isActive ? c.main : undefined,
                    boxShadow: isActive ? `0 0 0 2px ${c.main}` : undefined,
                    transition: "all .2s var(--ease)",
                  }}
                >
                  <div className="kpi-accent-line" style={{ background: c.main }} />
                  <div className="kpi-icon" style={{ color: c.main }}>{NAMES[seg] === "VIP" ? "◆" : NAMES[seg] === "活跃" ? "◇" : NAMES[seg] === "沉睡" ? "○" : NAMES[seg] === "流失" ? "◎" : "✦"}</div>
                  <div className="stat-value sm" style={{ color: c.main }}>
                    {stat.count.toLocaleString()}
                  </div>
                  <div className="stat-label">{NAMES[seg]}</div>
                  <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>
                    {stat.percentage.toFixed(1)}% · {DESCS[seg]}
                  </div>
                  <div className="attr-bar-bg" style={{ marginTop: 10 }}>
                    <div
                      className="attr-bar-fill"
                      style={{ width: `${Math.max(stat.percentage, 2)}%`, background: c.main }}
                    />
                  </div>
                </div>
              );
            })}
      </div>

      {/* Customer Table */}
      {activeSegment && (
        <div className="card reveal-1">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>
              {NAMES[activeSegment]} 客户列表
            </h3>
            <button
              className="btn"
              onClick={() => { setActiveSegment(null); setCustomers([]); }}
              style={{ fontSize: 12 }}
            >
              ✕ 关闭
            </button>
          </div>

          {listLoading ? (
            <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 12 }}>
              <Skeleton h={14} />
              <Skeleton h={14} w="80%" />
              <Skeleton h={14} w="60%" />
              <Skeleton h={14} />
              <Skeleton h={14} w="70%" />
            </div>
          ) : listError ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">⚠</div>
              <div className="empty-title">加载失败</div>
              <div className="empty-desc">{listError}</div>
              <button className="btn" onClick={() => setActiveSegment(activeSegment)}>重试</button>
            </div>
          ) : customers.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">◎</div>
              <div className="empty-title">暂无客户</div>
              <div className="empty-desc">该分层暂无客户数据，同步订单后会自动更新</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    {["姓名", "订单", "消费", "上次购买", "LTV", "流失风险"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "var(--text-tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => {
                    const insight = getInsight(c.email);
                    const riskLevel = insight?.churn_risk_level || "low";
                    const riskScore = insight?.churn_risk_score ?? 0;
                    const isExpanded = expandedEmail === c.email;
                    return (
                      <>
                        <tr
                          key={c.email || i}
                          onClick={() => insight ? handleRowClick(c.email) : undefined}
                          style={{
                            borderBottom: "1px solid var(--border-subtle)",
                            cursor: insight ? "pointer" : "default",
                            transition: "background .15s",
                            background: isExpanded ? "var(--bg-raised)" : undefined,
                          }}
                          onMouseEnter={e => { if (insight) (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)"; }}
                          onMouseLeave={e => { if (insight && !isExpanded) (e.currentTarget as HTMLElement).style.background = ""; }}
                        >
                          <td style={{ padding: "10px 12px", fontWeight: 500 }}>{c.name || c.email || "—"}</td>
                          <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)" }}>{c.orders}</td>
                          <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", color: c.total_spent > 0 ? "var(--mint)" : "var(--text-tertiary)" }}>
                            {c.total_spent > 0 ? `$${c.total_spent.toLocaleString()}` : "—"}
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-secondary)" }}>
                            {c.last_order ? new Date(c.last_order).toLocaleDateString("zh-CN") : "—"}
                          </td>
                          <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", fontWeight: 600, color: insight ? "var(--mint)" : "var(--text-tertiary)" }}>
                            {insight ? `$${insight.predicted_ltv.toLocaleString()}` : "—"}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {insight ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <span>{churnDot(riskLevel)}</span>
                                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: churnColor(riskLevel) }}>
                                  {Math.round(riskScore)}%
                                </span>
                              </span>
                            ) : "—"}
                          </td>
                        </tr>
                        {/* AI Explanation expandable row */}
                        {isExpanded && (
                          <tr key={`${c.email}-explain`}>
                            <td colSpan={6} style={{ padding: "12px 16px", background: "var(--bg-raised)", borderBottom: "1px solid var(--border)" }}>
                              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                <span style={{ fontWeight: 600, color: "var(--sky)", marginRight: 8 }}>🤖 AI 解读</span>
                                {aiLoading ? (
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                    <Skeleton w="80%" h={16} />
                                  </span>
                                ) : (
                                  <span>{aiExplanation}</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Initial state hint */}
      {!activeSegment && !loading && stats.length > 0 && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-tertiary)", fontSize: 13 }}>
          点击上方卡片查看该分层客户详情
        </div>
      )}
    </div>
  );
}
