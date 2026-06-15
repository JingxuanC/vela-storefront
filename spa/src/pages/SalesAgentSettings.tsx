// ============================================================================
// SalesAgentSettings — standalone settings page for Sales Agent configuration
// Route: /sales-agent-settings
// API: GET /api/shop/sales-agent/config, PUT /api/shop/sales-agent/config
// ============================================================================
import { useState, useEffect } from "react";
import { api } from "~/api";

interface SAConfig {
  enabled: boolean;
  welcome_message: string;
  brand_voice: string;
}

const VOICES = [
  { v: "friendly", l: "😊 Friendly", desc: "Warm, casual tone" },
  { v: "professional", l: "💼 Professional", desc: "Polished, business-like" },
  { v: "luxury", l: "✨ Luxury", desc: "Exclusive, sophisticated" },
  { v: "playful", l: "🎉 Playful", desc: "Fun, energetic" },
];

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

function Toggle({
  label,
  checked,
  onChange,
  desc,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  desc?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
          {label}
        </div>
        {desc && (
          <div className="faint" style={{ fontSize: 11, marginTop: 2 }}>
            {desc}
          </div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 46,
          height: 26,
          borderRadius: 13,
          border: "none",
          cursor: "pointer",
          background: checked ? "var(--mint)" : "var(--border-strong)",
          position: "relative",
          padding: 0,
          transition: "background .2s var(--ease)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: "block",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: checked
              ? "0 1px 4px rgba(14,168,122,.3)"
              : "0 1px 3px rgba(0,0,0,.08)",
            transition: "transform .25s var(--ease)",
            transform: checked ? "translateX(22px)" : "translateX(2px)",
            marginTop: 2,
          }}
        />
      </button>
    </div>
  );
}

export default function SalesAgentSettings() {
  const [cfg, setCfg] = useState<SAConfig | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [brandVoice, setBrandVoice] = useState("friendly");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ t: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    api<SAConfig & { success: boolean }>("/api/shop/sales-agent/config")
      .then((data) => {
        if (data) {
          setCfg(data);
          setEnabled(data.enabled ?? true);
          setWelcomeMessage(data.welcome_message || "");
          setBrandVoice(data.brand_voice || "friendly");
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setMsg({ t: "error", text: "Failed to load settings. Check your connection." });
      });
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    const r = await api<{ success: boolean }>("/api/shop/sales-agent/config", {
      method: "PUT",
      body: JSON.stringify({
        enabled,
        welcome_message: welcomeMessage,
        brand_voice: brandVoice,
      }),
    });
    setSaving(false);
    if (r?.success) {
      setMsg({ t: "success", text: "Sales Agent settings saved" });
    } else {
      setMsg({ t: "error", text: "Failed to save — please try again" });
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 720 }}>
        <h1 className="page-title">Sales Agent Settings</h1>
        <p className="page-subtitle">Loading your configuration...</p>
        <div className="card">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 4 }}>
            <Skeleton h={16} w="25%" />
            <Skeleton h={38} />
            <Skeleton h={16} w="25%" />
            <Skeleton h={90} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 className="page-title">Sales Agent Settings</h1>
      <p className="page-subtitle">
        Configure the AI assistant that appears on your storefront
      </p>

      {msg && (
        <div className={`banner banner-${msg.t === "success" ? "success" : "error"}`}>
          {msg.t === "success" ? "✓" : "⚠"} {msg.text}
        </div>
      )}

      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--violet-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            💬
          </div>
          <div>
            <h3 className="section-title" style={{ marginBottom: 2 }}>
              Storefront Assistant
            </h3>
            <div className="faint" style={{ fontSize: 12 }}>
              Control how the Sales Agent appears and communicates on your store
            </div>
          </div>
        </div>

        <Toggle
          label="Enable Sales Agent"
          desc="Show the AI assistant widget on your storefront"
          checked={enabled}
          onChange={setEnabled}
        />

        {enabled && (
          <>
            <div className="form-group" style={{ marginTop: 18 }}>
              <label className="form-label">
                Welcome Message{" "}
                <span className="faint">
                  — first message customers see
                </span>
              </label>
              <textarea
                className="form-input"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                maxLength={200}
                rows={3}
                style={{ resize: "vertical" }}
                placeholder="Hi! Welcome to our store. What are you looking for today? 👋"
              />
              <div className="faint" style={{ fontSize: 10, marginTop: 4 }}>
                {welcomeMessage.length}/200
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Brand Voice</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {VOICES.map((v) => (
                  <div
                    key={v.v}
                    onClick={() => setBrandVoice(v.v)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 8,
                      border: `1px solid ${
                        brandVoice === v.v
                          ? "var(--amber-border)"
                          : "var(--border)"
                      }`,
                      background:
                        brandVoice === v.v
                          ? "var(--amber-soft)"
                          : "var(--bg-deep)",
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600 }}>
                      {v.l}
                    </div>
                    <div className="faint" style={{ fontSize: 10 }}>
                      {v.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div
          style={{
            marginTop: 20,
            paddingTop: 18,
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
