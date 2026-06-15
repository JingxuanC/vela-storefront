import { useState, useEffect } from "react";
import { api } from "~/api";

interface UsageInfo {
  plan: string;
  monthly_credits_used: number;
  monthly_credits_total: number;
}

interface SubscribeResponse {
  confirmation_url: string;
}

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    desc: "Getting started",
    features: [
      "AI Shopping Assistant (50/day)",
      "AI Operations Assistant (20/day)",
      "Content Factory (5/day)",
      "Returns & Exchange",
      "Basic Dashboard & Analytics",
    ],
    c: "var(--text-tertiary)",
  },
  {
    key: "growth",
    name: "Growth",
    price: "$29",
    desc: "For growing brands",
    features: [
      "Everything in Free",
      "Content Factory (50/day)",
      "Auto Reply to Reviews",
      "Virtual Try-On (20/day)",
      "Cart Recovery Campaigns",
      "Priority Support",
    ],
    c: "var(--amber)",
  },
  {
    key: "pro",
    name: "Pro",
    price: "$99",
    desc: "Professional stores",
    features: [
      "Everything in Growth",
      "Unlimited AI usage",
      "AI Visibility Suite (GEO+SEO+UCP)",
      "Multi-store Management",
      "API Access",
      "Dedicated Support",
    ],
    c: "var(--sky)",
  },
];

export default function Plans() {
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<UsageInfo>("/api/shop/usage").then((d) => {
      if (d) setUsage(d);
    });
  }, []);

  const currentPlan = usage?.plan?.toLowerCase() || "free";
  const used = usage?.monthly_credits_used || 0;
  const total = usage?.monthly_credits_total || 2500;
  const pct = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;

  async function handleSubscribe(planKey: string) {
    setError(null);
    setLoading(planKey);
    try {
      const res = await api<SubscribeResponse>("/api/shop/subscribe", {
        method: "POST",
        body: JSON.stringify({ plan: planKey }),
      });
      if (res?.confirmation_url) {
        window.location.href = res.confirmation_url;
      } else {
        setError("无法获取 Shopify 确认页面，请稍后重试。");
      }
    } catch {
      setError("订阅请求失败，请稍后重试。");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <h1 className="page-title">Plans & Billing</h1>
      <p className="page-subtitle">Choose the right plan for your store</p>

      {error && (
        <div className="banner banner-error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="kpi-grid" style={{ marginTop: 0, marginBottom: 28 }}>
        <div className="card kpi-card">
          <div
            className="kpi-accent-line"
            style={{ background: "var(--amber)" }}
          />
          <div className="kpi-icon">$</div>
          <div className="stat-value sm" style={{ color: "var(--amber)" }}>
            {usage?.plan || "Free"}
          </div>
          <div className="stat-label">Current Plan</div>
          <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>
            billed monthly
          </div>
        </div>
        <div className="card kpi-card">
          <div
            className="kpi-accent-line"
            style={{ background: "var(--mint)" }}
          />
          <div className="kpi-icon">⚡</div>
          <div className="stat-value sm" style={{ color: "var(--mint)" }}>
            {used.toLocaleString()}
          </div>
          <div className="stat-label">Credits Used</div>
          <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>
            of {total.toLocaleString()} ({pct}%)
          </div>
        </div>
        <div className="card kpi-card">
          <div
            className="kpi-accent-line"
            style={{ background: "var(--sky)" }}
          />
          <div className="kpi-icon">📅</div>
          <div className="stat-value sm" style={{ color: "var(--sky)" }}>
            —
          </div>
          <div className="stat-label">Billing Cycle</div>
          <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>
            monthly
          </div>
        </div>
        <div className="card kpi-card">
          <div
            className="kpi-accent-line"
            style={{ background: "var(--violet)" }}
          />
          <div className="kpi-icon">🧾</div>
          <div className="stat-value sm" style={{ color: "var(--violet)" }}>
            —
          </div>
          <div className="stat-label">Next Invoice</div>
          <div className="faint" style={{ fontSize: 11, marginTop: 4 }}>
            {usage ? `${total - used} credits remaining` : "loading..."}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {PLANS.map((p) => {
          const isCurrent = currentPlan === p.key;
          return (
            <div
              className="card"
              key={p.key}
              style={
                isCurrent
                  ? {
                      borderColor: "var(--amber-border)",
                      boxShadow: "0 4px 20px rgba(212,128,24,.08)",
                    }
                  : {}
              }
            >
              {isCurrent && (
                <span className="badge badge-amber" style={{ marginBottom: 12 }}>
                  Current Plan
                </span>
              )}
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>
                {p.name}
              </h3>
              <p className="faint" style={{ marginBottom: 12 }}>
                {p.desc}
              </p>
              <div
                className="stat-value"
                style={{ fontSize: 32, color: p.c, marginBottom: 16 }}
              >
                {p.price}
                <span
                  style={{
                    fontSize: 14,
                    fontFamily: "var(--font-body)",
                    color: "var(--text-tertiary)",
                  }}
                >
                  /mo
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                {p.features.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: p.c, fontWeight: 700 }}>✓</span>
                    <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                className={`btn ${isCurrent ? "" : "btn-primary"}`}
                style={{ width: "100%", justifyContent: "center" }}
                disabled={isCurrent || loading === p.key}
                onClick={() => {
                  if (!isCurrent) handleSubscribe(p.key);
                }}
              >
                {loading === p.key
                  ? "Redirecting..."
                  : isCurrent
                  ? "Current Plan"
                  : `Upgrade to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3 className="section-title">Billing History</h3>
        {[
          {
            date: "Jun 1, 2026",
            desc: "Growth Plan — Monthly",
            amount: "$29.00",
            status: "paid",
          },
          {
            date: "May 1, 2026",
            desc: "Growth Plan — Monthly",
            amount: "$29.00",
            status: "paid",
          },
          {
            date: "Apr 1, 2026",
            desc: "Growth Plan — Monthly",
            amount: "$29.00",
            status: "paid",
          },
        ].map((inv, i) => (
          <div className="metric-row" key={i}>
            <span className="metric-key">
              {inv.date} — {inv.desc}
            </span>
            <span
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <span className="metric-val">{inv.amount}</span>
              <span className="badge badge-mint">Paid</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
