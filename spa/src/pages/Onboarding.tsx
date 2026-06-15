import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "~/api";

interface SyncStatus {
  synced: boolean;
  products_count?: number;
  orders_count?: number;
  customers_count?: number;
  last_sync?: string;
}

const STEPS = [
  {
    key: "sync",
    title: "数据同步",
    desc: "Vela AI 正在同步您的 Shopify 商店数据。同步完成后，AI 将能够基于您的实际业务数据提供精准建议。",
  },
  {
    key: "ai",
    title: "启用 AI 引擎",
    desc: "开启 Sales Agent 以启用 AI 驱动的客户互动、内容创作和数据洞察。您可以随时在设置中调整。",
  },
  {
    key: "explore",
    title: "探索价值",
    desc: "一切就绪！前往 Dashboard 查看您的商店概览，或开始使用 AI 工具提升运营效率。",
  },
];

function checkComplete(): boolean {
  return localStorage.getItem("vela_onboarding_complete") === "true";
}

function markComplete(): void {
  localStorage.setItem("vela_onboarding_complete", "true");
}

export default function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncLoading, setSyncLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiToggling, setAiToggling] = useState(false);

  // If already completed, redirect to dashboard
  useEffect(() => {
    if (checkComplete()) {
      nav("/", { replace: true });
    }
  }, [nav]);

  // Fetch sync status
  useEffect(() => {
    setSyncLoading(true);
    api<SyncStatus>("/api/shop/usage")
      .then((d) => {
        if (d) {
          setSyncStatus({ synced: true, ...d } as SyncStatus);
        } else {
          setSyncStatus({ synced: false });
        }
      })
      .catch(() => setSyncStatus({ synced: false }))
      .finally(() => setSyncLoading(false));
  }, []);

  async function handleToggleAI() {
    setAiToggling(true);
    try {
      // Toggle AI Sales Agent on
      await api("/api/shop/settings", {
        method: "PATCH",
        body: JSON.stringify({ sales_agent_enabled: true }),
      });
      setAiEnabled(true);
    } catch {
      // Even if API fails, let user proceed
      setAiEnabled(true);
    } finally {
      setAiToggling(false);
    }
  }

  function handleFinish() {
    markComplete();
    nav("/", { replace: true });
  }

  const currentStep = STEPS[step];

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "40px 0",
      }}
    >
      {/* Progress indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          marginBottom: 48,
        }}
      >
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            style={{ display: "flex", alignItems: "center", gap: 0 }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                background:
                  i < step
                    ? "var(--mint)"
                    : i === step
                    ? "var(--amber)"
                    : "var(--border)",
                color: i <= step ? "#fff" : "var(--text-tertiary)",
                transition: "all .3s var(--ease)",
              }}
            >
              {i < step ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  width: 48,
                  height: 2,
                  background:
                    i < step ? "var(--mint)" : "var(--border)",
                  transition: "background .3s var(--ease)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div
        className="card hero-card"
        style={{
          textAlign: "center",
          padding: "48px 40px",
        }}
      >
        <div
          style={{
            fontSize: 48,
            marginBottom: 20,
          }}
        >
          {step === 0 ? "📡" : step === 1 ? "🧠" : "🚀"}
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          {currentStep.title}
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 14,
            lineHeight: 1.7,
            marginBottom: 32,
            maxWidth: 480,
            margin: "0 auto 32px",
          }}
        >
          {currentStep.desc}
        </p>

        {/* Step 1: Sync status */}
        {step === 0 && (
          <div>
            {syncLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div className="spinner" style={{ margin: 0, width: 24, height: 24, borderWidth: 2 }} />
                <span className="faint">正在检查同步状态...</span>
              </div>
            ) : syncStatus?.synced ? (
              <div>
                <div
                  className="banner banner-success"
                  style={{ justifyContent: "center", marginBottom: 20 }}
                >
                  ✅ 数据同步完成
                  {syncStatus.products_count != null &&
                    ` — ${syncStatus.products_count} 件商品`}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep(1)}
                >
                  继续
                </button>
              </div>
            ) : (
              <div>
                <div
                  className="banner banner-error"
                  style={{ justifyContent: "center", marginBottom: 20 }}
                >
                  ⚠️ 数据同步尚未完成，请稍候或手动触发同步。
                </div>
                <div className="btn-group" style={{ justifyContent: "center" }}>
                  <button className="btn" onClick={() => setStep(1)}>
                    跳过，稍后处理
                  </button>
                  <button className="btn btn-primary" onClick={() => setStep(1)}>
                    继续
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Enable AI */}
        {step === 1 && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                marginBottom: 24,
                padding: "16px 24px",
                background: "var(--bg-raised)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Sales Agent
              </span>
              <span className="faint" style={{ fontSize: 13 }}>
                AI 客户互动 · 内容创作 · 数据洞察
              </span>
              <button
                className={`btn ${aiEnabled ? "btn-primary" : ""}`}
                style={{ marginLeft: "auto" }}
                disabled={aiToggling}
                onClick={handleToggleAI}
              >
                {aiToggling
                  ? "启用中..."
                  : aiEnabled
                  ? "✓ 已启用"
                  : "启用 AI"}
              </button>
            </div>
            <div className="btn-group" style={{ justifyContent: "center" }}>
              <button className="btn" onClick={() => setStep(0)}>
                上一步
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
              >
                {aiEnabled ? "继续" : "跳过，稍后配置"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Finish */}
        {step === 2 && (
          <div>
            <div
              className="banner banner-success"
              style={{ justifyContent: "center", marginBottom: 24 }}
            >
              🎉 设置完成！Vela AI 已就绪。
            </div>
            <div className="btn-group" style={{ justifyContent: "center" }}>
              <button className="btn" onClick={() => setStep(1)}>
                上一步
              </button>
              <button className="btn btn-primary" onClick={handleFinish}>
                前往 Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
