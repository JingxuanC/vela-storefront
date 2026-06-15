import { useState, useEffect } from "react";
import { api } from "~/api";

// ── Types ────────────────────────────────────────────────────────────────────

interface AttrChannel {
  channel: string;
  attributed_revenue: number;
  percentage: number;
  touchpoint_count: number;
}

interface ChannelAttr {
  channel: string;
  attributed_orders: number;
  attributed_revenue: number;
  shared_revenue: number;
}

interface OverlapPair {
  pair: string;
  orders: number;
  revenue: number;
}

interface UnifiedAttrData {
  success: boolean;
  total_actual_revenue: number;
  total_attributed_revenue: number;
  overlap_rate: number;
  channels: ChannelAttr[];
  overlap_matrix: OverlapPair[];
}

interface DashboardMetric {
  label: string;
  value: number;
  change: number;
  trend: string; // up, down, flat
  unit: string;
}

interface SalesTrendPoint {
  date: string;
  sales: number;
  orders: number;
}

interface DashboardData {
  success: boolean;
  return_rate: number;
  return_rate_change: number;
  total_inventory: number;
  low_stock_items: number;
  out_of_stock_items: number;
  sales_trend: SalesTrendPoint[];
  metrics: DashboardMetric[];
  period: string;
  inventory_breakdown: {
    product_id: string;
    product_name: string;
    stock_level: number;
    reorder_at: number;
    status: string;
  }[];
}

interface FunnelData {
  product_views: number;
  tryon_starts: number;
  tryon_completes: number;
  add_to_cart: number;
  checkouts: number;
  purchases: number;
}

interface ProductItem {
  id: string;
  title: string;
  status: string;
  image: string;
}

interface ProductsData {
  products: ProductItem[];
  total: number;
}

interface CartRecoveryOverview {
  revenue_recovered: number;
  orders_recovered: number;
  emails_sent: number;
  recovery_rate: number;
  total_abandoned: number;
}

interface AISummaryData {
  summary: string;
  highlights: string[];
  action_items: string[];
}

// ── Content Types ─────────────────────────────────────────────────────────

interface ContentTypeRevenue {
  content_type: string;
  revenue: number;
}

interface ContentTopItem {
  title: string;
  content_type: string;
  platform?: string;
  revenue: number;
  orders: number;
}

interface ContentPerformanceData {
  success: boolean;
  total_revenue: number;
  total_orders: number;
  generated_count: number;
  published_count: number;
  by_type: ContentTypeRevenue[];
  top_content: ContentTopItem[];
  days: number;
}

interface TopContentItem {
  piece_id: string;
  short_id: string;
  content_type: string;
  title: string;
  attributed_revenue: number;
  attributed_orders: number;
  total_clicks: number;
  status: string;
  created_at: string;
}

// ── Supply Chain Types ────────────────────────────────────────────────────

interface StockPrediction {
  product_name: string;
  current_stock: number;
  daily_sales: number;
  days_until_stockout: number;
  status: string; // healthy | warning | critical | out_of_stock
  suggested_restock: number;
}

interface ReturnAnomaly {
  product_name: string;
  return_rate: number;
  store_avg: number;
  deviation: number;
  status: string;
}

interface TrendMatch {
  keyword: string;
  search_change_pct: number;
  has_in_store: boolean;
  suggestion: string;
}

// ── Reviews Types ─────────────────────────────────────────────────────────

interface ReviewInvitationStats {
  success: boolean;
  sent_count: number;
  conversion_rate: number;
  review_count: number;
  avg_rating: number;
  attributed_revenue: number;
  attributed_orders: number;
}

interface ReviewInvitation {
  id: string;
  customer_email: string;
  customer_name: string;
  product_title: string;
  status: string; // pending/sent/converted/expired
  send_at: string;
  sent_at: string;
}

interface RecStats {
  fbt_impressions: number;
  fbt_clicks: number;
  fbt_ctr: number;
  trending_impressions: number;
  trending_clicks: number;
  trending_ctr: number;
  top_products: { product_id: string; title: string; rec_revenue: number }[];
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ w = "100%", h = 20 }: { w?: string; h?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        background: "var(--border)",
        opacity: 0.5,
      }}
    />
  );
}

// ── SVG Trend Chart ───────────────────────────────────────────────────────────

function TrendChart({ data }: { data: SalesTrendPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="faint" style={{ textAlign: "center", padding: 32 }}>
        No trend data yet
      </div>
    );
  }

  const W = 600;
  const H = 200;
  const pad = { top: 16, right: 16, bottom: 28, left: 56 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const values = data.map((d) => d.sales);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const xScale = (i: number) => pad.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const yScale = (v: number) =>
    pad.top + chartH - ((v - minVal) / (maxVal - minVal || 1)) * chartH;

  const points = data.map((d, i) => `${xScale(i)},${yScale(d.sales)}`).join(" ");
  const areaPoints = `${xScale(0)},${pad.top + chartH} ${points} ${xScale(data.length - 1)},${pad.top + chartH}`;

  // Y-axis ticks
  const yTicks = [0, Math.round(maxVal * 0.5), Math.round(maxVal)];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", fontFamily: "var(--font-mono)", fontSize: 10 }}>
      {/* Grid lines */}
      {yTicks.map((t) => (
        <line
          key={t}
          x1={pad.left}
          y1={yScale(t)}
          x2={W - pad.right}
          y2={yScale(t)}
          stroke="var(--border-subtle)"
          strokeDasharray="3 3"
        />
      ))}
      {/* Y-axis labels */}
      {yTicks.map((t) => (
        <text key={`y-${t}`} x={pad.left - 8} y={yScale(t) + 4} textAnchor="end" fill="var(--text-tertiary)">
          ${t.toLocaleString()}
        </text>
      ))}
      {/* Area fill */}
      <polygon points={areaPoints} fill="var(--amber-soft)" />
      {/* Line */}
      <polyline points={points} fill="none" stroke="var(--amber)" strokeWidth={2} strokeLinejoin="round" />
      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={xScale(i)} cy={yScale(d.sales)} r={3} fill="var(--amber)" />
      ))}
      {/* X-axis labels (show every ~7th label) */}
      {data.map((d, i) => {
        const step = Math.max(1, Math.floor(data.length / 7));
        if (i % step !== 0 && i !== data.length - 1) return null;
        return (
          <text
            key={`x-${i}`}
            x={xScale(i)}
            y={H - 6}
            textAnchor="middle"
            fill="var(--text-tertiary)"
            fontSize={9}
          >
            {d.date.slice(5)}
          </text>
        );
      })}
    </svg>
  );
}

// ── Funnel Bar Chart ──────────────────────────────────────────────────────────

function FunnelChart({ data }: { data: FunnelData }) {
  const stages = [
    { label: "Product Views", value: data.product_views, color: "var(--violet)" },
    { label: "Add to Cart", value: data.add_to_cart, color: "var(--sky)" },
    { label: "Checkouts", value: data.checkouts, color: "var(--amber)" },
    { label: "Purchases", value: data.purchases, color: "var(--mint)" },
  ];

  const maxVal = Math.max(...stages.map((s) => s.value), 1);

  if (maxVal === 0) {
    return (
      <div className="faint" style={{ textAlign: "center", padding: 32 }}>
        No funnel data yet
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {stages.map((s, i) => {
        const pct = Math.round((s.value / maxVal) * 100);
        const drop = i > 0 ? Math.round(((stages[i - 1].value - s.value) / Math.max(stages[i - 1].value, 1)) * 100) : 0;
        return (
          <div key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
              <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{s.label}</span>
              <span className="mono" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {s.value.toLocaleString()}
                {drop > 0 && (
                  <span style={{ color: "var(--rose)", fontSize: 11, marginLeft: 8 }}>
                    ↓{drop}%
                  </span>
                )}
              </span>
            </div>
            <div style={{ height: 22, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: s.color,
                  borderRadius: 6,
                  transition: "width 1s var(--ease-spring)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: pct > 15 ? 10 : 0,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  minWidth: pct > 0 ? 40 : 0,
                }}
              >
                {pct > 12 ? `${pct}%` : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  change,
  trend,
  prefix = "",
  suffix = "",
  accent = "var(--amber)",
  loading,
}: {
  label: string;
  value: string;
  change?: number;
  trend?: string;
  prefix?: string;
  suffix?: string;
  accent?: string;
  loading?: boolean;
}) {
  const arrow =
    trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const changeColor =
    trend === "up"
      ? "var(--mint)"
      : trend === "down"
        ? "var(--rose)"
        : "var(--text-tertiary)";

  return (
    <div className="card kpi-card" style={{ textAlign: "center" }}>
      <div className="kpi-accent-line" style={{ background: accent }} />
      <div
        className="stat-value"
        style={{ color: accent, fontSize: 36, marginBottom: 6 }}
      >
        {loading ? (
          <Skeleton h={36} w="60%" />
        ) : (
          `${prefix}${value}${suffix}`
        )}
      </div>
      <div className="stat-label" style={{ marginBottom: 4 }}>
        {label}
      </div>
      {change !== undefined && !loading && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: changeColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <span>{arrow}</span>
          <span>{Math.abs(change).toFixed(1)}% vs previous</span>
        </div>
      )}
      {loading && change !== undefined && (
        <Skeleton h={14} w="40%" />
      )}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

type Tab = "overview" | "content" | "fulfillment" | "supply_chain" | "reviews" | "recommendations";

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "content", label: "Content" },
    { key: "fulfillment", label: "Fulfillment" },
    { key: "supply_chain", label: "Supply Chain" },
    { key: "reviews", label: "Reviews" },
    { key: "recommendations", label: "Recommendations" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        marginBottom: 28,
        background: "var(--bg-raised)",
        borderRadius: 10,
        padding: 4,
        width: "fit-content",
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            background: active === t.key ? "var(--bg-card)" : "transparent",
            color: active === t.key ? "var(--text-primary)" : "var(--text-tertiary)",
            fontWeight: active === t.key ? 600 : 500,
            fontSize: 13,
            cursor: "pointer",
            transition: "all .15s var(--ease)",
            boxShadow: active === t.key ? "var(--shadow-sm)" : "none",
            fontFamily: "var(--font-body)",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Analytics() {
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Data from APIs
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [attribution, setAttribution] = useState<{
    total_revenue: number;
    total_orders: number;
    channel_summary: AttrChannel[];
  } | null>(null);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [products, setProducts] = useState<ProductsData | null>(null);
  const [cartOverview, setCartOverview] = useState<CartRecoveryOverview | null>(null);
  const [aiSummary, setAiSummary] = useState<AISummaryData | null>(null);
  const [insights, setInsights] = useState<{
    anomalies: { description: string }[];
    recommendations: { description: string }[];
  } | null>(null);
  const [stockPredictions, setStockPredictions] = useState<StockPrediction[]>([]);
  const [returnAnomalies, setReturnAnomalies] = useState<ReturnAnomaly[]>([]);
  const [trendMatches, setTrendMatches] = useState<TrendMatch[]>([]);
  const [supplyLoading, setSupplyLoading] = useState(false);
  const [supplyError, setSupplyError] = useState(false);
  const [supplyRetryKey, setSupplyRetryKey] = useState(0);

  // Content tab data (lazy-loaded)
  const [contentPerf, setContentPerf] = useState<ContentPerformanceData | null>(null);
  const [topContent, setTopContent] = useState<TopContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [contentRetryKey, setContentRetryKey] = useState(0);

  // Reviews tab data (lazy-loaded)
  const [reviewInvitations, setReviewInvitations] = useState<ReviewInvitationStats | null>(null);
  const [reviewList, setReviewList] = useState<ReviewInvitation[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(false);
  const [reviewRetryKey, setReviewRetryKey] = useState(0);

  // Recommendations tab data (placeholder — backend stats API not yet implemented)
  const [recStats, setRecStats] = useState<RecStats | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(false);
  const [recRetryKey, setRecRetryKey] = useState(0);

  // Unified attribution overview
  const [unifiedAttr, setUnifiedAttr] = useState<UnifiedAttrData | null>(null);
  const [unifiedLoading, setUnifiedLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      // 1. Dashboard KPI + trend
      api<DashboardData>("/api/analytics/dashboard"),
      // 2. Channel attribution (existing)
      api<{
        total_revenue: number;
        total_orders: number;
        channel_summary: AttrChannel[];
      }>("/api/analytics/attribution?days=30"),
      // 3. Conversion funnel
      api<FunnelData>("/api/shop/funnel"),
      // 4. Products list
      api<ProductsData>("/api/shop/products?limit=10"),
      // 5. Cart recovery overview
      api<CartRecoveryOverview>("/api/cart-recovery/analytics/overview"),
      // 6. AI summary metrics
      api<{ success: boolean; summary: AISummaryData }>(
        "/api/analytics/ai-summary?days=30"
      ),
      // 7. Insights (POST - recommendations/text)
      api<{
        success: boolean;
        recommendations: { description: string }[];
        anomalies: { description: string }[];
      }>("/api/insights/shop", {
        method: "POST",
        body: JSON.stringify({ period: "30d" }),
      }),
    ])
      .then(
        ([
          dash,
          attr,
          fun,
          prods,
          cart,
          ai,
          ins,
        ]) => {
          if (dash) setDashboard(dash);
          if (attr) setAttribution(attr);
          if (fun) setFunnel(fun);
          if (prods) setProducts(prods);
          if (cart) setCartOverview(cart);
          if (ai?.summary) setAiSummary(ai.summary);
          if (ins) setInsights(ins);
          setLoading(false);
        }
      )
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // Fetch unified attribution overview (independent from main loading)
  useEffect(() => {
    api<UnifiedAttrData>("/api/analytics/attribution/unified?days=30")
      .then((data) => {
        if (data?.success) {
          setUnifiedAttr(data);
        }
        setUnifiedLoading(false);
      })
      .catch(() => {
        setUnifiedLoading(false);
      });
  }, []);

  // Fetch supply chain data when tab is selected
  useEffect(() => {
    if (tab !== "supply_chain") return;

    setSupplyLoading(true);
    setSupplyError(false);

    Promise.all([
      api<StockPrediction[]>("/api/supply/stock-prediction"),
      api<ReturnAnomaly[]>("/api/supply/return-anomalies"),
      api<TrendMatch[]>("/api/supply/trend-match"),
    ])
      .then(([sp, ra, tm]) => {
        if (sp) setStockPredictions(sp);
        if (ra) setReturnAnomalies(ra);
        if (tm) setTrendMatches(tm);
        setSupplyLoading(false);
      })
      .catch(() => {
        setSupplyError(true);
        setSupplyLoading(false);
      });
  }, [tab, supplyRetryKey]);

  // Fetch content performance data when tab is selected
  useEffect(() => {
    if (tab !== "content") return;

    setContentLoading(true);
    setContentError(false);

    Promise.all([
      api<ContentPerformanceData>("/api/analytics/content-performance?days=30"),
      api<{ success: boolean; top: TopContentItem[]; days: number }>(
        "/api/analytics/content/top?limit=10&days=30"
      ),
    ])
      .then(([cp, tc]) => {
        if (cp) setContentPerf(cp);
        if (tc?.top) setTopContent(tc.top);
        setContentLoading(false);
      })
      .catch(() => {
        setContentError(true);
        setContentLoading(false);
      });
  }, [tab, contentRetryKey]);

  // Fetch reviews data when tab is selected
  useEffect(() => {
    if (tab !== "reviews") return;

    setReviewLoading(true);
    setReviewError(false);

    Promise.all([
      api<ReviewInvitationStats>("/api/reviews/invitations/stats"),
      api<{ success: boolean; invitations: ReviewInvitation[] }>(
        "/api/reviews/invitations?days=30"
      ),
    ])
      .then(([stats, list]) => {
        if (stats) setReviewInvitations(stats);
        if (list?.invitations) setReviewList(list.invitations);
        setReviewLoading(false);
      })
      .catch(() => {
        setReviewError(true);
        setReviewLoading(false);
      });
  }, [tab, reviewRetryKey]);

  // Fetch recommendations stats when tab is selected
  useEffect(() => {
    if (tab !== "recommendations") return;

    setRecLoading(true);
    setRecError(false);

    // Phase 3c: GET /api/recommendations/stats (backend not yet implemented)
    // For now, try fetching trending data as a sample demo
    api<RecStats>("/api/recommendations/stats")
      .then((stats) => {
        if (stats) setRecStats(stats);
        setRecLoading(false);
      })
      .catch(() => {
        // Backend stats API not ready — show trending products with placeholder stats
        api<{ success: boolean; recommendations: { product_id: string; title: string; price: string; image_url: string }[] }>(
          "/api/recommendations/trending?limit=5"
        )
          .then((data) => {
            if (data?.recommendations?.length) {
              setRecStats({
                fbt_impressions: 0,
                fbt_clicks: 0,
                fbt_ctr: 0,
                trending_impressions: 0,
                trending_clicks: 0,
                trending_ctr: 0,
                top_products: data.recommendations.map((r) => ({
                  product_id: r.product_id,
                  title: r.title,
                  rec_revenue: 0,
                })),
              });
            }
            setRecLoading(false);
          })
          .catch(() => {
            setRecError(true);
            setRecLoading(false);
          });
      });
  }, [tab, recRetryKey]);

  // Derived values
  const totalRevenue =
    attribution?.total_revenue ||
    dashboard?.metrics?.find((m) => m.label.includes("Revenue"))?.value ||
    0;

  const totalOrders =
    attribution?.total_orders ||
    dashboard?.metrics?.find((m) => m.label.includes("Orders"))?.value ||
    0;

  const returnRate = dashboard?.return_rate ?? 0;
  const returnRateChange = dashboard?.return_rate_change ?? 0;

  const avgOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // ── Error State ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">
          Business intelligence dashboard — 30 day view
        </p>
        <div className="empty-state">
          <div className="empty-icon">⚠</div>
          <div className="empty-title">Unable to load analytics</div>
          <div className="empty-desc">
            Analytics data is currently unavailable. Please try again later.
          </div>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Loading State ─────────────────────────────────────────────────────────
  const ld = loading;

  return (
    <div>
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle">
        Business intelligence dashboard — 30 day view
      </p>

      <TabBar active={tab} onChange={setTab} />

      {/* ═══ Overview Tab ═══ */}
      {tab === "overview" && (
        <>
          {/* ── Row 1: KPI Cards ── */}
          <div className="kpi-grid" style={{ marginTop: 0 }}>
            <KpiCard
              label="Total Revenue"
              value={ld ? "—" : totalRevenue.toLocaleString()}
              prefix="$"
              change={
                dashboard?.metrics?.find((m) => m.label.includes("Revenue"))
                  ?.change
              }
              trend={
                dashboard?.metrics?.find((m) => m.label.includes("Revenue"))
                  ?.trend
              }
              accent="var(--amber)"
              loading={ld}
            />
            <KpiCard
              label="Total Orders"
              value={ld ? "—" : totalOrders.toLocaleString()}
              accent="var(--sky)"
              loading={ld}
            />
            <KpiCard
              label="Return Rate"
              value={ld ? "—" : returnRate.toFixed(1)}
              suffix="%"
              change={returnRateChange}
              trend={
                returnRateChange > 5
                  ? "up"
                  : returnRateChange < -5
                    ? "down"
                    : "flat"
              }
              accent="var(--rose)"
              loading={ld}
            />
            <KpiCard
              label="Avg Order Value"
              value={ld ? "—" : avgOrderValue.toLocaleString()}
              prefix="$"
              accent="var(--mint)"
              loading={ld}
            />
          </div>

          {/* ── Row 2: Trend + Funnel ── */}
          <div className="detail-grid" style={{ marginTop: 20 }}>
            <div className="card">
              <h3 className="section-title">
                Revenue Trend{" "}
                <span
                  className="faint"
                  style={{ fontSize: 13, fontWeight: 400 }}
                >
                  — 30 days
                </span>
              </h3>
              {ld ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <Skeleton h={160} />
                </div>
              ) : (
                <TrendChart data={dashboard?.sales_trend || []} />
              )}
            </div>

            <div className="card">
              <h3 className="section-title">
                Conversion Funnel{" "}
                <span
                  className="faint"
                  style={{ fontSize: 13, fontWeight: 400 }}
                >
                  — all time
                </span>
              </h3>
              {ld ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <Skeleton h={200} />
                </div>
              ) : (
                <FunnelChart
                  data={
                    funnel || {
                      product_views: 0,
                      tryon_starts: 0,
                      tryon_completes: 0,
                      add_to_cart: 0,
                      checkouts: 0,
                      purchases: 0,
                    }
                  }
                />
              )}
            </div>
          </div>

          {/* ── Row 3: Products + Cart Recovery ── */}
          <div className="detail-grid" style={{ marginTop: 20 }}>
            {/* Products */}
            <div className="card">
              <h3 className="section-title">
                Top Products{" "}
                <span
                  className="faint"
                  style={{ fontSize: 13, fontWeight: 400 }}
                >
                  — {products?.total || 0} total
                </span>
              </h3>
              {ld ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <Skeleton h={40} />
                  <Skeleton h={40} />
                  <Skeleton h={40} />
                  <Skeleton h={40} />
                  <Skeleton h={40} />
                </div>
              ) : products?.products?.length ? (
                <div>
                  {products.products.slice(0, 10).map((p, i) => (
                    <div
                      key={p.id}
                      className="metric-row"
                      style={{ padding: "10px 0" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.title}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              objectFit: "cover",
                              background: "var(--bg-raised)",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              background: "var(--bg-raised)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              color: "var(--text-tertiary)",
                            }}
                          >
                            ☷
                          </div>
                        )}
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.title}
                        </span>
                      </div>
                      <span
                        className={`badge ${
                          p.status === "active"
                            ? "badge-mint"
                            : "badge-amber"
                        }`}
                        style={{ flexShrink: 0 }}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="faint"
                  style={{ textAlign: "center", padding: 24 }}
                >
                  Products will appear after sync
                </div>
              )}
            </div>

            {/* Cart Recovery */}
            <div className="card">
              <h3 className="section-title">
                Cart Recovery{" "}
                <span
                  className="faint"
                  style={{ fontSize: 13, fontWeight: 400 }}
                >
                  — 30 days
                </span>
              </h3>
              {ld ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <Skeleton h={40} />
                  <Skeleton h={40} />
                  <Skeleton h={40} />
                  <Skeleton h={40} />
                </div>
              ) : cartOverview ? (
                <div>
                  <div className="metric-row">
                    <span className="metric-key">✉ Emails Sent</span>
                    <span className="metric-val">
                      {cartOverview.emails_sent.toLocaleString()}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-key">↩ Orders Recovered</span>
                    <span className="metric-val">
                      {cartOverview.orders_recovered.toLocaleString()}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-key">📊 Recovery Rate</span>
                    <span className="metric-val">
                      {cartOverview.recovery_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-key">💰 Revenue Recovered</span>
                    <span className="metric-val" style={{ color: "var(--mint)" }}>
                      ${cartOverview.revenue_recovered.toLocaleString()}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-key">🛒 Abandoned Carts</span>
                    <span className="metric-val">
                      {cartOverview.total_abandoned.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="faint"
                  style={{ textAlign: "center", padding: 24 }}
                >
                  Cart recovery data will appear after campaigns are set up
                </div>
              )}
            </div>
          </div>

          {/* ── Row 4: AI Summary + Channel Attribution ── */}
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* AI Summary */}
            <div className="card" style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, var(--violet) 0%, #5a4bd1 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(108,92,231,0.2)",
                    flexShrink: 0,
                  }}
                >
                  ◇
                </div>
                <div>
                  <h3 className="section-title" style={{ marginBottom: 0 }}>
                    AI Insights
                  </h3>
                  <div className="faint" style={{ fontSize: 12 }}>
                    AI-generated business summary
                  </div>
                </div>
              </div>

              {ld ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Skeleton h={20} w="80%" />
                  <Skeleton h={20} w="60%" />
                  <Skeleton h={20} w="70%" />
                </div>
              ) : insights?.recommendations?.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {insights.recommendations.slice(0, 5).map((rec, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 14px",
                        background: "var(--bg-raised)",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        lineHeight: 1.6,
                      }}
                    >
                      <span style={{ color: "var(--violet)", fontWeight: 700, flexShrink: 0 }}>
                        •
                      </span>
                      <span>{rec.description}</span>
                    </div>
                  ))}
                  {insights.anomalies?.length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                          color: "var(--text-tertiary)",
                          marginBottom: 8,
                        }}
                      >
                        Anomalies Detected
                      </div>
                      {insights.anomalies.slice(0, 3).map((a, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "8px 14px",
                            background: "var(--rose-soft)",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "var(--rose)",
                            marginBottom: 6,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                          }}
                        >
                          <span style={{ flexShrink: 0 }}>⚠</span>
                          <span>{a.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="faint" style={{ textAlign: "center", padding: 16 }}>
                  AI insights will be generated as your store accumulates data
                </div>
              )}
            </div>

            {/* Channel Attribution (existing, retained) */}
            <div className="card">
              <h3 className="section-title">
                Revenue by Channel{" "}
                <span className="faint" style={{ fontSize: 13, fontWeight: 400 }}>
                  — 30 days
                </span>
              </h3>
              {ld ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Skeleton h={40} />
                  <Skeleton h={40} />
                  <Skeleton h={40} />
                </div>
              ) : attribution?.channel_summary?.length ? (
                <>
                  {attribution.channel_summary.map((ch, i) => (
                    <div
                      key={ch.channel}
                      style={{
                        padding: "16px 0",
                        borderBottom:
                          i < attribution.channel_summary.length - 1
                            ? "1px solid var(--border-subtle)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                          marginBottom: 10,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          >
                            {ch.channel}
                          </div>
                          <div className="faint" style={{ fontSize: 12 }}>
                            {ch.touchpoint_count} touchpoints
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="stat-value sm">
                            ${ch.attributed_revenue.toLocaleString()}
                          </div>
                          <div className="faint" style={{ fontSize: 12 }}>
                            {ch.percentage}%
                          </div>
                        </div>
                      </div>
                      <div className="attr-bar-bg">
                        <div
                          className="attr-bar-fill"
                          style={{
                            width: `${ch.percentage}%`,
                            background: [
                              "var(--amber)",
                              "var(--sky)",
                              "var(--mint)",
                              "var(--violet)",
                              "var(--rose)",
                            ][i % 5],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="faint" style={{ fontSize: 12, marginTop: 12 }}>
                    Total: ${attribution.total_revenue?.toLocaleString()} from{" "}
                    {attribution.total_orders} orders
                  </div>
                </>
              ) : (
                <div
                  className="faint"
                  style={{ textAlign: "center", padding: 24 }}
                >
                  Channel data will appear after orders are synced
                </div>
              )}
            </div>
          </div>

          {/* ── Attribution Overview (unified) ── */}
          {!unifiedLoading && unifiedAttr?.channels?.length ? (
            <div className="card" style={{ marginTop: 20 }}>
              <h3 className="section-title">
                Attribution Overview{" "}
                <span className="faint" style={{ fontSize: 13, fontWeight: 400 }}>
                  — 30 days
                </span>
              </h3>

              {/* Channel progress bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                {unifiedAttr.channels.map((ch) => {
                  const maxRev = Math.max(...unifiedAttr.channels.map((c) => c.attributed_revenue), 1);
                  const pct = Math.round((ch.attributed_revenue / maxRev) * 100);
                  const channelLabel =
                    ch.channel === "cart_recovery"
                      ? "🛒 Cart Recovery"
                      : ch.channel === "content"
                        ? "📝 Content"
                        : ch.channel === "review"
                          ? "⭐ Review"
                          : ch.channel;
                  const barColor =
                    ch.channel === "cart_recovery"
                      ? "var(--amber)"
                      : ch.channel === "content"
                        ? "var(--sky)"
                        : "var(--mint)";

                  return (
                    <div key={ch.channel}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                        <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>
                          {channelLabel}
                        </span>
                        <span className="mono" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                          {ch.attributed_orders} orders{"  "}
                          <span style={{ color: barColor }}>
                            ${ch.attributed_revenue.toLocaleString()}
                          </span>
                        </span>
                      </div>
                      <div style={{ height: 20, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: barColor,
                            borderRadius: 6,
                            transition: "width 0.8s var(--ease-spring)",
                            minWidth: pct > 0 ? 4 : 0,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overlap rate */}
              {unifiedAttr.overlap_rate > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "10px 14px",
                    background: "var(--amber-soft)",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "var(--amber)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>⚠</span>
                  <span>
                    {unifiedAttr.overlap_rate.toFixed(1)}% of attributed revenue is shared
                    across multiple channels
                  </span>
                </div>
              )}

              {/* Overlap details (collapsible) */}
              {unifiedAttr.overlap_matrix?.length > 0 && (
                <details style={{ marginTop: 14 }}>
                  <summary
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      padding: "8px 0",
                    }}
                  >
                    Overlap details
                  </summary>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                    {unifiedAttr.overlap_matrix.map((pair) => (
                      <div
                        key={pair.pair}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 12px",
                          background: "var(--bg-raised)",
                          borderRadius: 6,
                          fontSize: 12,
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>
                          {pair.pair
                            .replace("cart_recovery", "Cart")
                            .replace("content", "Content")
                            .replace("review", "Review")
                            .replace(" + ", " + ")
                            .replace("all three", "All three")}
                        </span>
                        <span className="mono">
                          {pair.orders} orders, ${pair.revenue.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ) : unifiedLoading ? (
            <div className="card" style={{ marginTop: 20 }}>
              <h3 className="section-title">
                Attribution Overview{" "}
                <span className="faint" style={{ fontSize: 13, fontWeight: 400 }}>
                  — 30 days
                </span>
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
                <Skeleton h={36} />
                <Skeleton h={36} />
                <Skeleton h={36} />
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* ═══ Content Tab ═══ */}
      {tab === "content" && (
        <>
          {contentError ? (
            <div className="card">
              <h3 className="section-title">Content Performance</h3>
              <div className="empty-state">
                <div className="empty-icon">⚠</div>
                <div className="empty-title">Unable to load content data</div>
                <div className="empty-desc">
                  Content analytics data is currently unavailable. Please try again later.
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setContentRetryKey(k => k + 1)}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {!contentLoading &&
              !contentPerf?.by_type?.length &&
              topContent.length === 0 ? (
                <div className="card">
                  <h3 className="section-title">Content Performance</h3>
                  <div className="empty-state" style={{ padding: "40px 20px" }}>
                    <div className="empty-icon">📝</div>
                    <div className="empty-title">No content data yet</div>
                    <div className="empty-desc">
                      Content attribution data will appear after content drives
                      orders. Generate content in Content Factory to get started.
                    </div>
                  </div>
                </div>
              ) : (
                <>
              {/* ── Row 1: KPI Cards ── */}
              <div className="kpi-grid" style={{ marginTop: 0 }}>
                <KpiCard
                  label="Content Revenue"
                  value={
                    contentLoading
                      ? "—"
                      : `$${(contentPerf?.total_revenue || 0).toLocaleString()}`
                  }
                  accent="var(--amber)"
                  loading={contentLoading}
                />
                <KpiCard
                  label="Attributed Orders"
                  value={
                    contentLoading
                      ? "—"
                      : (contentPerf?.total_orders || 0).toLocaleString()
                  }
                  accent="var(--sky)"
                  loading={contentLoading}
                />
                <KpiCard
                  label="Published Pieces"
                  value={
                    contentLoading
                      ? "—"
                      : (contentPerf?.published_count || 0).toLocaleString()
                  }
                  accent="var(--mint)"
                  loading={contentLoading}
                />
                <KpiCard
                  label="Generated Pieces"
                  value={
                    contentLoading
                      ? "—"
                      : (contentPerf?.generated_count || 0).toLocaleString()
                  }
                  accent="var(--violet)"
                  loading={contentLoading}
                />
              </div>

              {/* ── Row 2: Revenue by Content Type + Top Content Table ── */}
              <div className="detail-grid">
                {/* Content Type Revenue Distribution */}
                <div className="card">
                  <h3 className="section-title">
                    Revenue by Content Type{" "}
                    <span className="faint" style={{ fontSize: 13, fontWeight: 400 }}>
                      — 30 days
                    </span>
                  </h3>
                  {contentLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <Skeleton h={40} />
                      <Skeleton h={40} />
                      <Skeleton h={40} />
                      <Skeleton h={40} />
                    </div>
                  ) : contentPerf?.by_type?.length ? (
                    <>
                      {contentPerf.by_type
                        .sort((a, b) => b.revenue - a.revenue)
                        .map((ct, i) => {
                          const maxRev = Math.max(
                            ...contentPerf.by_type.map((t) => t.revenue),
                            1
                          );
                          const pct = Math.round((ct.revenue / maxRev) * 100);
                          const totalRev = contentPerf.by_type.reduce(
                            (s, t) => s + t.revenue,
                            0
                          );
                          const sharePct =
                            totalRev > 0
                              ? Math.round((ct.revenue / totalRev) * 100)
                              : 0;
                          const colors = [
                            "var(--amber)",
                            "var(--sky)",
                            "var(--mint)",
                            "var(--violet)",
                            "var(--rose)",
                          ];
                          const label =
                            ct.content_type === "blog"
                              ? "Blog Post"
                              : ct.content_type === "product_description"
                                ? "Product Description"
                                : ct.content_type === "social_post"
                                  ? "Social Post"
                                  : ct.content_type === "email"
                                    ? "Email"
                                    : ct.content_type;
                          return (
                            <div
                              key={ct.content_type}
                              style={{
                                padding: "16px 0",
                                borderBottom:
                                  i < contentPerf.by_type.length - 1
                                    ? "1px solid var(--border-subtle)"
                                    : "none",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-end",
                                  marginBottom: 10,
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontSize: 14,
                                      fontWeight: 600,
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {label}
                                  </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <div className="stat-value sm">
                                    ${ct.revenue.toLocaleString()}
                                  </div>
                                  <div className="faint" style={{ fontSize: 12 }}>
                                    {sharePct}%
                                  </div>
                                </div>
                              </div>
                              <div className="attr-bar-bg">
                                <div
                                  className="attr-bar-fill"
                                  style={{
                                    width: `${pct}%`,
                                    background: colors[i % colors.length],
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </>
                  ) : (
                    <div
                      className="faint"
                      style={{ textAlign: "center", padding: 24 }}
                    >
                      No content type data yet
                    </div>
                  )}
                </div>

                {/* Top Content Ranking */}
                <div className="card">
                  <h3 className="section-title">
                    Top Content{" "}
                    <span className="faint" style={{ fontSize: 13, fontWeight: 400 }}>
                      — by revenue
                    </span>
                  </h3>
                  {contentLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <Skeleton h={32} />
                      <Skeleton h={32} />
                      <Skeleton h={32} />
                      <Skeleton h={32} />
                      <Skeleton h={32} />
                    </div>
                  ) : topContent.length > 0 ? (
                    <div>
                      {/* Table header */}
                      <div
                        className="metric-row"
                        style={{
                          padding: "8px 0",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <div className="metric-key" style={{ flex: 2 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text-tertiary)" }}>
                            Title
                          </span>
                        </div>
                        <div
                          className="metric-key"
                          style={{ flex: 1, justifyContent: "center" }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text-tertiary)" }}>
                            Type
                          </span>
                        </div>
                        <div
                          className="metric-key"
                          style={{ flex: 1, justifyContent: "flex-end" }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text-tertiary)" }}>
                            Revenue
                          </span>
                        </div>
                        <div
                          className="metric-key"
                          style={{ flex: 1, justifyContent: "flex-end" }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text-tertiary)" }}>
                            Orders
                          </span>
                        </div>
                      </div>
                      {topContent
                        .sort((a, b) => b.attributed_revenue - a.attributed_revenue)
                        .map((item, i) => {
                          const typeLabel =
                            item.content_type === "blog"
                              ? "Blog"
                              : item.content_type === "product_description"
                                ? "Product Desc"
                                : item.content_type === "social_post"
                                  ? "Social"
                                  : item.content_type === "email"
                                    ? "Email"
                                    : item.content_type;
                          return (
                            <div key={item.piece_id || i} className="metric-row">
                              <div
                                className="metric-key"
                                style={{ flex: 2, overflow: "hidden" }}
                              >
                                <span
                                  style={{
                                    fontSize: 13,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={item.title}
                                >
                                  {item.title}
                                </span>
                              </div>
                              <div
                                className="metric-key"
                                style={{ flex: 1, justifyContent: "center" }}
                              >
                                <span
                                  className="badge"
                                  style={{
                                    background:
                                      item.content_type === "blog"
                                        ? "var(--amber-soft)"
                                        : item.content_type === "product_description"
                                          ? "var(--sky-soft)"
                                          : item.content_type === "social_post"
                                            ? "var(--mint-soft)"
                                            : item.content_type === "email"
                                              ? "var(--violet-soft)"
                                              : "var(--border)",
                                    color:
                                      item.content_type === "blog"
                                        ? "var(--amber)"
                                        : item.content_type === "product_description"
                                          ? "var(--sky)"
                                          : item.content_type === "social_post"
                                            ? "var(--mint)"
                                            : item.content_type === "email"
                                              ? "var(--violet)"
                                              : "var(--text-tertiary)",
                                    border:
                                      item.content_type === "blog"
                                        ? "1px solid var(--amber-border)"
                                        : item.content_type === "product_description"
                                          ? "1px solid rgba(59,130,246,0.20)"
                                          : item.content_type === "social_post"
                                            ? "1px solid var(--mint-border)"
                                            : item.content_type === "email"
                                              ? "1px solid rgba(139,92,246,0.18)"
                                              : "1px solid var(--border-strong)",
                                  }}
                                >
                                  {typeLabel}
                                </span>
                              </div>
                              <div
                                className="metric-val"
                                style={{ flex: 1, textAlign: "right" }}
                              >
                                ${item.attributed_revenue.toLocaleString()}
                              </div>
                              <div
                                className="metric-val"
                                style={{ flex: 1, textAlign: "right" }}
                              >
                                {item.attributed_orders}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div
                      className="faint"
                      style={{ textAlign: "center", padding: 24 }}
                    >
                      Content attribution data will appear after content drives orders.
                      Generate content in Content Factory to get started.
                    </div>
                  )}
                </div>
              </div>

                </>
              )}
            </>
          )}
        </>
      )}

      {/* ═══ Reviews Tab ═══ */}
      {tab === "reviews" && (
        <>
          {reviewError ? (
            <div className="card">
              <h3 className="section-title">Review Invitations</h3>
              <div className="empty-state">
                <div className="empty-icon">⚠</div>
                <div className="empty-title">Unable to load review data</div>
                <div className="empty-desc">
                  Review analytics data is currently unavailable. Please try again later.
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setReviewRetryKey(k => k + 1)}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {!reviewLoading &&
              !reviewInvitations?.sent_count &&
              reviewList.length === 0 ? (
                <div className="card">
                  <h3 className="section-title">Review Invitations</h3>
                  <div className="empty-state" style={{ padding: "40px 20px" }}>
                    <div className="empty-icon">⭐</div>
                    <div className="empty-title">No review invitations yet</div>
                    <div className="empty-desc">
                      They will appear after customer orders are fulfilled.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── Row 1: KPI Cards ── */}
                  <div className="kpi-grid" style={{ marginTop: 0 }}>
                    <KpiCard
                      label="Invitations Sent"
                      value={
                        reviewLoading
                          ? "—"
                          : (reviewInvitations?.sent_count || 0).toLocaleString()
                      }
                      accent="var(--sky)"
                      loading={reviewLoading}
                    />
                    <KpiCard
                      label="Conversion Rate"
                      value={
                        reviewLoading
                          ? "—"
                          : (reviewInvitations?.conversion_rate || 0).toFixed(1)
                      }
                      suffix="%"
                      accent="var(--mint)"
                      loading={reviewLoading}
                    />
                    <KpiCard
                      label="Reviews Received"
                      value={
                        reviewLoading
                          ? "—"
                          : (reviewInvitations?.review_count || 0).toLocaleString()
                      }
                      accent="var(--amber)"
                      loading={reviewLoading}
                    />
                    <KpiCard
                      label="Average Rating"
                      value={
                        reviewLoading
                          ? "—"
                          : (reviewInvitations?.avg_rating || 0).toFixed(1)
                      }
                      suffix="/5"
                      accent="var(--violet)"
                      loading={reviewLoading}
                    />
                    <KpiCard
                      label="Attributed Revenue"
                      value={
                        reviewLoading
                          ? "—"
                          : `$${(reviewInvitations?.attributed_revenue || 0).toLocaleString()}`
                      }
                      accent="var(--rose)"
                      loading={reviewLoading}
                    />
                    <KpiCard
                      label="Attributed Orders"
                      value={
                        reviewLoading
                          ? "—"
                          : (reviewInvitations?.attributed_orders || 0).toLocaleString()
                      }
                      accent="var(--sky)"
                      loading={reviewLoading}
                    />
                  </div>

                  {/* ── Row 2: Recent Invitations Table ── */}
                  <div className="card" style={{ marginTop: 20 }}>
                    <h3 className="section-title">
                      Recent Invitations{" "}
                      <span className="faint" style={{ fontSize: 13, fontWeight: 400 }}>
                        — 30 days
                      </span>
                    </h3>
                    {reviewLoading ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <Skeleton h={32} />
                        <Skeleton h={32} />
                        <Skeleton h={32} />
                        <Skeleton h={32} />
                        <Skeleton h={32} />
                      </div>
                    ) : reviewList.length > 0 ? (
                      <div>
                        {/* Table header */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 2fr 1fr 1fr",
                            gap: 16,
                            padding: "8px 0",
                            borderBottom: "1px solid var(--border)",
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 0.6,
                            color: "var(--text-tertiary)",
                          }}
                        >
                          <span>Customer</span>
                          <span>Product</span>
                          <span>Status</span>
                          <span>Sent At</span>
                        </div>
                        {reviewList.map((item, i) => {
                          const statusConfig: Record<string, { bg: string; color: string; border: string; label: string }> = {
                            pending: {
                              bg: "var(--amber-soft)",
                              color: "var(--amber)",
                              border: "1px solid rgba(212,128,24,0.15)",
                              label: "Pending",
                            },
                            sent: {
                              bg: "var(--sky-soft)",
                              color: "var(--sky)",
                              border: "1px solid rgba(59,130,246,0.20)",
                              label: "Sent",
                            },
                            converted: {
                              bg: "var(--mint-soft)",
                              color: "var(--mint)",
                              border: "1px solid rgba(14,168,122,0.15)",
                              label: "Converted",
                            },
                            expired: {
                              bg: "var(--rose-soft)",
                              color: "var(--rose)",
                              border: "1px solid rgba(216,92,110,0.15)",
                              label: "Expired",
                            },
                          };
                          const sc = statusConfig[item.status] || statusConfig.pending;
                          return (
                            <div
                              key={item.id || i}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 2fr 1fr 1fr",
                                gap: 16,
                                padding: "12px 0",
                                borderBottom:
                                  i < reviewList.length - 1
                                    ? "1px solid var(--border-subtle)"
                                    : "none",
                              }}
                            >
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>
                                  {item.customer_name}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                                  {item.customer_email}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: 13,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={item.product_title}
                              >
                                {item.product_title}
                              </span>
                              <span
                                className="badge"
                                style={{
                                  background: sc.bg,
                                  color: sc.color,
                                  border: sc.border,
                                  width: "fit-content",
                                }}
                              >
                                {sc.label}
                              </span>
                              <span
                                className="mono"
                                style={{ fontSize: 12, color: "var(--text-secondary)" }}
                              >
                                {item.sent_at
                                  ? new Date(item.sent_at).toLocaleDateString()
                                  : item.send_at
                                    ? new Date(item.send_at).toLocaleDateString()
                                    : "—"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        className="faint"
                        style={{ textAlign: "center", padding: 24 }}
                      >
                        No invitation data available yet
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {/* ═══ Fulfillment Tab ═══ */}
      {tab === "fulfillment" && (
        <div>
          <div className="kpi-grid" style={{ marginTop: 0 }}>
            <KpiCard
              label="Total Inventory"
              value={
                ld
                  ? "—"
                  : (dashboard?.total_inventory || 0).toLocaleString()
              }
              accent="var(--sky)"
              loading={ld}
            />
            <KpiCard
              label="Low Stock Items"
              value={
                ld ? "—" : (dashboard?.low_stock_items || 0).toLocaleString()
              }
              accent="var(--amber)"
              loading={ld}
            />
            <KpiCard
              label="Out of Stock"
              value={
                ld
                  ? "—"
                  : (dashboard?.out_of_stock_items || 0).toLocaleString()
              }
              accent="var(--rose)"
              loading={ld}
            />
            <KpiCard
              label="Return Rate"
              value={ld ? "—" : returnRate.toFixed(1)}
              suffix="%"
              change={returnRateChange}
              trend={
                returnRateChange > 5
                  ? "up"
                  : returnRateChange < -5
                    ? "down"
                    : "flat"
              }
              accent="var(--violet)"
              loading={ld}
            />
          </div>

          {ld ? (
            <div
              className="card"
              style={{ marginTop: 20 }}
            >
              <Skeleton h={200} />
            </div>
          ) : dashboard?.inventory_breakdown?.length ? (
            <div className="card" style={{ marginTop: 20 }}>
              <h3 className="section-title">Inventory Breakdown</h3>
              <div>
                {dashboard.inventory_breakdown.slice(0, 15).map((item) => (
                  <div
                    key={item.product_id}
                    className="metric-row"
                    style={{ padding: "10px 0" }}
                  >
                    <span className="metric-key">{item.product_name}</span>
                    <span
                      className={`badge ${
                        item.status === "healthy"
                          ? "badge-mint"
                          : item.status === "low"
                            ? "badge-amber"
                            : ""
                      }`}
                      style={
                        item.status === "out_of_stock"
                          ? {
                              background: "var(--rose-soft)",
                              color: "var(--rose)",
                              border: "1px solid rgba(216,92,110,0.15)",
                            }
                          : {}
                      }
                    >
                      {item.status.replace("_", " ")} · {item.stock_level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="card"
              style={{ marginTop: 20, textAlign: "center" }}
            >
              <div className="faint" style={{ padding: 24 }}>
                Inventory data will appear after products are synced
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Supply Chain Tab ═══ */}
      {tab === "supply_chain" && (
        <>
          {supplyError ? (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>⚠</div>
              <div className="section-title" style={{ marginBottom: 8 }}>Unable to load supply chain data</div>
              <div className="faint" style={{ marginBottom: 16 }}>Supply chain analytics are currently unavailable.</div>
              <button className="btn btn-primary" onClick={() => { setSupplyError(false); setSupplyRetryKey(k => k + 1); }}>
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* ── Row 1: 库存预警 (2列) ── */}
              <div className="detail-grid" style={{ marginTop: 0 }}>
                {/* 左: 库存概况 KPI 卡片 */}
                <div className="card">
                  <h3 className="section-title">库存概况</h3>
                  {supplyLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <Skeleton h={36} w="50%" />
                      <Skeleton h={36} w="50%" />
                      <Skeleton h={36} w="50%" />
                    </div>
                  ) : stockPredictions.length === 0 ? (
                    <div className="faint" style={{ textAlign: "center", padding: 24 }}>
                      No stock data available yet
                    </div>
                  ) : (
                    <div>
                      {(() => {
                        const totalStock = stockPredictions.reduce((s, p) => s + p.current_stock, 0);
                        const lowStock = stockPredictions.filter(p => p.status === "warning" || p.status === "critical").length;
                        const outOfStock = stockPredictions.filter(p => p.status === "out_of_stock").length;
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span className="metric-key">📦 总库存数量</span>
                              <span className="metric-val" style={{ color: "var(--sky)", fontSize: 22 }}>{totalStock.toLocaleString()}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span className="metric-key">⚠ 低库存产品</span>
                              <span className="metric-val" style={{ color: "var(--amber)", fontSize: 22 }}>{lowStock}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span className="metric-key">❌ 缺货产品</span>
                              <span className="metric-val" style={{ color: "var(--rose)", fontSize: 22 }}>{outOfStock}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* 右: 库存预测列表 */}
                <div className="card">
                  <h3 className="section-title">库存预测</h3>
                  {supplyLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {[1,2,3,4,5].map(i => <Skeleton key={i} h={36} />)}
                    </div>
                  ) : stockPredictions.length === 0 ? (
                    <div className="faint" style={{ textAlign: "center", padding: 24 }}>
                      No stock predictions yet
                    </div>
                  ) : (
                    <div>
                      {stockPredictions.map((item, i) => {
                        const statusColor =
                          item.status === "healthy" ? "var(--mint)" :
                          item.status === "warning" ? "var(--amber)" :
                          item.status === "critical" ? "var(--rose)" :
                          "var(--text-tertiary)";
                        const statusBg =
                          item.status === "healthy" ? "var(--mint-soft)" :
                          item.status === "warning" ? "var(--amber-soft)" :
                          item.status === "critical" ? "var(--rose-soft)" :
                          "var(--bg-raised)";
                        const statusLabel =
                          item.status === "out_of_stock" ? "缺货" :
                          item.status === "critical" ? "紧急" :
                          item.status === "warning" ? "预警" : "正常";
                        return (
                          <div
                            key={i}
                            className="metric-row"
                            style={{
                              padding: "10px 0",
                              background: statusBg,
                              margin: "0 -16px",
                              paddingLeft: 16,
                              paddingRight: 16,
                              borderRadius: 6,
                              marginBottom: i < stockPredictions.length - 1 ? 4 : 0,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {item.product_name}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--text-tertiary)", display: "flex", gap: 12, marginTop: 2 }}>
                                <span>库存: {item.current_stock}</span>
                                <span>日均: {item.daily_sales}</span>
                                <span>预计: {item.days_until_stockout}天</span>
                              </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                              <span
                                className="badge"
                                style={{
                                  background: statusBg,
                                  color: statusColor,
                                  border: `1px solid ${statusColor}20`,
                                  marginBottom: 3,
                                }}
                              >
                                {statusLabel}
                              </span>
                              {item.suggested_restock > 0 && (
                                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                                  建议补货: {item.suggested_restock}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Row 2: 退货异常 (全宽) ── */}
              <div className="card" style={{ marginTop: 20 }}>
                <h3 className="section-title">退货异常检测</h3>
                {supplyLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[1,2,3,4].map(i => <Skeleton key={i} h={40} />)}
                  </div>
                ) : returnAnomalies.length === 0 ? (
                  <div className="faint" style={{ textAlign: "center", padding: 24 }}>
                    No return anomalies detected — all products within normal range
                  </div>
                ) : (
                  <div>
                    {/* Table header */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                        gap: 16,
                        padding: "8px 0",
                        borderBottom: "1px solid var(--border)",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <span>Product</span>
                      <span>Return Rate</span>
                      <span>Store Avg</span>
                      <span>Deviation</span>
                      <span>Status</span>
                    </div>
                    {returnAnomalies.map((item, i) => {
                      const isAnomaly = item.deviation > 10;
                      return (
                        <div
                          key={i}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                            gap: 16,
                            padding: "12px 0",
                            borderBottom: i < returnAnomalies.length - 1 ? "1px solid var(--border-subtle)" : "none",
                            background: isAnomaly ? "rgba(216,92,110,0.06)" : "transparent",
                            margin: isAnomaly ? "0 -16px" : "0",
                            paddingLeft: isAnomaly ? 16 : 0,
                            paddingRight: isAnomaly ? 16 : 0,
                            borderRadius: isAnomaly ? 6 : 0,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.product_name}
                          </span>
                          <span className="mono" style={{ fontSize: 13, color: "var(--text-primary)" }}>
                            {item.return_rate.toFixed(1)}%
                          </span>
                          <span className="mono" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                            {item.store_avg.toFixed(1)}%
                          </span>
                          <span className="mono" style={{ fontSize: 13, color: isAnomaly ? "var(--rose)" : "var(--text-primary)", fontWeight: isAnomaly ? 600 : 500 }}>
                            {item.deviation > 0 ? "+" : ""}{item.deviation.toFixed(1)}%
                          </span>
                          <span
                            className="badge"
                            style={{
                              background: isAnomaly ? "var(--rose-soft)" : "var(--mint-soft)",
                              color: isAnomaly ? "var(--rose)" : "var(--mint)",
                              border: `1px solid ${isAnomaly ? "rgba(216,92,110,0.15)" : "rgba(14,168,122,0.15)"}`,
                            }}
                          >
                            {isAnomaly ? "异常" : "正常"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Row 3: 趋势机会 (全宽) ── */}
              <div className="card" style={{ marginTop: 20 }}>
                <h3 className="section-title">趋势机会发现</h3>
                {supplyLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[1,2,3,4].map(i => <Skeleton key={i} h={40} />)}
                  </div>
                ) : trendMatches.length === 0 ? (
                  <div className="faint" style={{ textAlign: "center", padding: 24 }}>
                    No trending opportunities detected yet
                  </div>
                ) : (
                  <div>
                    {trendMatches.map((item, i) => (
                      <div
                        key={i}
                        className="metric-row"
                        style={{ padding: "12px 0" }}
                      >
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>{item.keyword}</span>
                          <span style={{
                            marginLeft: 10,
                            fontSize: 13,
                            fontWeight: 600,
                            color: item.search_change_pct > 0 ? "var(--mint)" : "var(--rose)",
                          }}>
                            {item.search_change_pct > 0 ? "↑" : "↓"} {Math.abs(item.search_change_pct).toFixed(1)}%
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span
                            className="badge"
                            style={{
                              background: item.has_in_store ? "var(--mint-soft)" : "var(--amber-soft)",
                              color: item.has_in_store ? "var(--mint)" : "var(--amber)",
                              border: `1px solid ${item.has_in_store ? "rgba(14,168,122,0.15)" : "rgba(212,128,24,0.15)"}`,
                            }}
                          >
                            {item.has_in_store ? "已上架" : "未上架"}
                          </span>
                          {!item.has_in_store && (
                            <span style={{ fontSize: 12, color: "var(--amber)", fontWeight: 500 }}>
                              💡 机会: 建议上架 {item.keyword}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ Recommendations Tab ═══ */}
      {tab === "recommendations" && (
        <>
          {recError ? (
            <div className="card">
              <h3 className="section-title">Recommendations Analytics</h3>
              <div className="empty-state">
                <div className="empty-icon">⚠</div>
                <div className="empty-title">Unable to load recommendations data</div>
                <div className="empty-desc">
                  Recommendations analytics data is currently unavailable. Please try again later.
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => { setRecError(false); setRecRetryKey(k => k + 1); }}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : !recLoading && !recStats ? (
            <div className="card">
              <h3 className="section-title">Recommendations</h3>
              <div className="empty-state" style={{ padding: "40px 20px" }}>
                <div className="empty-icon">🎯</div>
                <div className="empty-title">Product Recommendations</div>
                <div className="empty-desc" style={{ maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
                  Product recommendations powered by purchase data.{" "}
                  <strong>Frequently Bought Together</strong> appears on product pages,{" "}
                  <strong>Trending Now</strong> appears on the homepage.
                  <br /><br />
                  Stats will appear here once the recommendations engine starts serving traffic.
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ── Row 1: KPI Cards ── */}
              <div className="kpi-grid" style={{ marginTop: 0 }}>
                <KpiCard
                  label="FBT Impressions"
                  value={
                    recLoading
                      ? "—"
                      : (recStats?.fbt_impressions || 0).toLocaleString()
                  }
                  accent="var(--sky)"
                  loading={recLoading}
                />
                <KpiCard
                  label="FBT CTR"
                  value={
                    recLoading
                      ? "—"
                      : (recStats?.fbt_ctr || 0).toFixed(1)
                  }
                  suffix="%"
                  accent="var(--violet)"
                  loading={recLoading}
                />
                <KpiCard
                  label="Trending Impressions"
                  value={
                    recLoading
                      ? "—"
                      : (recStats?.trending_impressions || 0).toLocaleString()
                  }
                  accent="var(--amber)"
                  loading={recLoading}
                />
                <KpiCard
                  label="Trending CTR"
                  value={
                    recLoading
                      ? "—"
                      : (recStats?.trending_ctr || 0).toFixed(1)
                  }
                  suffix="%"
                  accent="var(--mint)"
                  loading={recLoading}
                />
              </div>

              {/* ── Row 2: Description + Top Products ── */}
              <div className="detail-grid" style={{ marginTop: 20 }}>
                <div className="card">
                  <h3 className="section-title">
                    How It Works
                  </h3>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    <p style={{ marginBottom: 12 }}>
                      <strong>📦 Frequently Bought Together (FBT)</strong><br />
                      Analyzes purchase patterns across all orders. When customers view a product,
                      the widget shows other items frequently purchased in the same order.
                      Powered by co-purchase pair analysis of the last 90 days.
                    </p>
                    <p>
                      <strong>🔥 Trending Now</strong><br />
                      Ranks products by recent order velocity (last 7 days). Appears on the homepage
                      to surface what's hot right now. Cold-start fallback uses same-category top sellers.
                    </p>
                  </div>
                </div>

                <div className="card">
                  <h3 className="section-title">
                    Top Products{" "}
                    <span className="faint" style={{ fontSize: 13, fontWeight: 400 }}>
                      — by rec revenue
                    </span>
                  </h3>
                  {recLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <Skeleton h={32} />
                      <Skeleton h={32} />
                      <Skeleton h={32} />
                      <Skeleton h={32} />
                      <Skeleton h={32} />
                    </div>
                  ) : recStats?.top_products?.length ? (
                    <div>
                      {recStats.top_products.map((p, i) => (
                        <div
                          key={p.product_id || i}
                          className="metric-row"
                          style={{
                            padding: "12px 0",
                            borderBottom:
                              i < recStats.top_products.length - 1
                                ? "1px solid var(--border-subtle)"
                                : "none",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={p.title}
                          >
                            {p.title}
                          </span>
                          <span
                            className="mono"
                            style={{ fontSize: 12, color: "var(--text-secondary)" }}
                          >
                            {p.rec_revenue > 0
                              ? `$${p.rec_revenue.toLocaleString()}`
                              : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="faint"
                      style={{ textAlign: "center", padding: 24 }}
                    >
                      Revenue data will populate once recommendations drive sales
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

    </div>
  );
}